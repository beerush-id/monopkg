import { Command } from 'commander';
import { addOverrides, caption, configs, exec, runTask } from './program.js';
import { existsSync, mkdirSync, renameSync } from 'node:fs';
import { column, Icon, icon, inline, newLine, section, txt } from '../utils/common.js';
import { shell } from '../utils/shell.js';
import { listPointers, type PackageMeta, readMeta, writeMeta } from '../core/meta.js';
import { library, selectPackages, Workspace } from '../core/index.js';
import { join } from 'node:path';
import { blue, cyan, darkGrey, green, grey, red, yellow } from '../utils/color.js';
import { confirm, isCancel, select, text } from '@clack/prompts';
import { APP_TEMPLATES, setupPackage, TEMPLATE_CATEGORIES } from '../core/template.js';
import { searchAndReplace } from '../utils/search.js';

const colorMap = [yellow, cyan, green, blue, cyan, cyan, cyan, cyan, cyan, cyan, cyan];

export const createCmd = new Command()
  .configureHelp(configs)
  .command('create [template]')
  .summary('Create package in a workspace from template.')
  .description(
    section([
      'Create a new package in a workspace from a template.',
      'If no template is provided, a list of available templates will be shown.',
    ])
  )
  .usage('[template]')
  .option('-l, --list', 'List available templates.')
  .option('-n, --name <name>', 'Package name.')
  .option('-o, --out-path <path>', 'Package location.')
  .option('-c, --cwd-path <path>', 'Working directory and package location.')
  .option('-w, --workspace <workspace>', 'Set the workspace scope.')
  .action(async (template: string) => {
    const options = createCmd.opts();

    if (options.list) {
      caption.welcome('template listing!');

      txt('').lineTree().print();

      for (const g of TEMPLATE_CATEGORIES) {
        column.print(
          txt(g.label + ':')
            .blue()
            .tree()
        );

        const templates = APP_TEMPLATES.filter((t) => t.category === g.name).sort((a, b) =>
          a.name.localeCompare(b.name)
        );

        for (const tpl of templates) {
          column.print([txt(tpl.name).green().tree(1), cyan(`- ${tpl.label}`)]);
        }
      }

      return caption.success('Template listing complete.');
    }

    if (!library.workspaces.length) return;

    caption.welcome('package setup wizard!', options.dry);

    let { workspace: root } = createCmd.opts();
    if (typeof root === 'string') {
      root = [root];
    }

    if (options.yes && !root?.length) {
      root = [library.workspace.name];
    }

    if (!root?.length) {
      const result = (await select({
        message: grey('Which workspace to use?'),
        initialValue: library.workspace.name,
        options: library.workspaces.map((space) => ({
          value: space.name,
          label: txt(icon(space.name)).color(space.color).text(),
        })),
      })) as string;

      if (isCancel(result)) {
        return;
      }

      root = [result];
    }

    const space: Workspace = library.getSpace({ workspace: root }) as Workspace;

    if (root && !space) {
      column.print([red('ERROR_ROOT: Workspace'), green(root), red('not found.')]);

      inline.print(grey('Available workspaces:'));

      library.workspaces.forEach((space, i) => {
        const label = txt(icon(space.name)).color(space.color);

        if (i === library.workspaces.length - 1) {
          inline.print(label.endTree(0));
        } else {
          inline.print(label.tree(0));
        }
      });

      return;
    }

    const { name = '', outPath: path, cwdPath: cwd } = createCmd.opts();
    const setup = await setupPackage({
      template,
      name,
      path: cwd ?? path,
    });

    if (!setup) {
      return;
    }

    const outPath = setup.path;
    const outName = setup.name;
    const version = '0.0.1';
    const workDir = cwd ? join(library.path, space.path, outPath) : join(library.path, space.path);

    const existing = library.get(outName) ?? library.get(outPath);

    if (existing) {
      column.print([red('ERROR_EXIST: Package'), green(outName), red('already exists:')]);
      column.print([txt('Name').green().tree(0), darkGrey(':'), green(existing.name)]);
      column.print([txt('Version').green().tree(0), darkGrey(':'), yellow(`v${existing.version}`)]);
      column.print([txt('Location').green().endTree(0), darkGrey(':'), cyan(existing.path)]);

      return;
    }

    caption.success('Preparation complete.');

    inline.print([
      txt(icon(space.name)).color(space.color),
      darkGrey('/'),
      cyan(`${outPath}`),
      darkGrey('['),
      green(outName),
      darkGrey('v'),
      yellow(version),
      darkGrey(']'),
    ]);

    if (cwd) {
      column.print([grey('- If prompted, use this as location:'), green('.')]);

      if (!options.dry) {
        mkdirSync(workDir, { recursive: true });
      }
    }

    const pointers = listPointers(join(library.path, space.path));

    newLine();
    inline.print(
      [setup.command, ...setup.args].map((arg, i) => {
        if (arg.startsWith('--')) {
          return grey(arg);
        }

        return colorMap[i % colorMap.length](arg);
      }),
      ' '
    );

    if (options.dry) {
      return caption.success('Dry run complete.');
    }

    try {
      if (typeof setup.action === 'function') {
        const result = await setup.action({ ...setup, cwd: workDir });

        if (!result) {
          return inline.print([red('Cancelled.')]);
        }
      } else {
        await shell(setup.command, setup.args, { cwd: workDir });
      }
    } catch (err) {
      if (err instanceof Error) {
        inline.print([red('Cancelled.')]);
      }
    }

    try {
      const [pointer] = listPointers(join(library.path, space.path)).filter((p) => {
        return !pointers.find((d) => d.file === p.file);
      });

      if (!pointer) {
        return;
      }

      if (outPath !== 'new' && outPath !== pointer.base) {
        const origin = pointer.path;

        pointer.path = pointer.path.replace(pointer.base, outPath);
        pointer.file = pointer.file.replace(pointer.base, outPath);
        pointer.base = outPath;

        renameSync(origin, pointer.path);
      }

      const meta = readMeta(pointer.path) as PackageMeta;

      if (outName !== 'new') {
        meta.name = outName;
        writeMeta(pointer.path, meta);
      }

      if (version || !meta.version) {
        meta.version = version ?? '0.0.1';
        writeMeta(pointer.path, meta);
      }

      inline.print([
        txt(icon(space.name)).color(space.color),
        darkGrey('/'),
        cyan(`${pointer.base}`),
        darkGrey('['),
        green(outName),
        darkGrey('v'),
        yellow(meta.version),
        darkGrey(']'),
      ]);

      inline.print(green('Package created. Installing dependencies...'));
      newLine();

      await shell(library.pm, ['install'], { cwd: library.path });
    } catch (error) {
      if ((error as Record<string, string>).code !== 'ENOENT') {
        console.error(error);
      }
    }
  });

addOverrides(createCmd);

export const moveCmd = new Command()
  .configureHelp(configs)
  .command('move [packages...]')
  .summary('Move package to a different workspace.')
  .option('-r, --rename', 'Rename the package to move.')
  .option('--name <newName>', 'New package name.')
  .option('--path <newPath>', 'New package path (relative to the workspace).')
  .option('-w, --workspace <workspace>', 'Set the target workspace.')
  .option('--verbose', 'Print more information to the console.')
  .action(async (packages: string[]) => {
    const options = moveCmd.opts();

    if (options.name) {
      options.rename = true;
    }

    caption.welcome('package moving wizard!', options.dry);

    const targets = await selectPackages(library, {
      filter: packages,
      subTitle: 'move from',
      cancelMessage: 'Moving packages cancelled.',
    });

    if (!targets || !targets.length) {
      return;
    }

    if (options.rename) {
      const hasDependents = targets.filter((pkg) => pkg.dependents.length);

      if (hasDependents.length) {
        section.print([txt('').lineTree(), txt(' Renaming packages with dependents: ').fillYellow().black().bullet()]);

        hasDependents.forEach((pkg) => {
          const dependents = pkg.dependents;

          if (dependents.length) {
            column.print([
              txt(Icon.CHECKED).green().tree(),
              txt('Package').yellow(),
              txt(pkg.base).color(pkg.color),
              txt(`has`),
              txt(`${dependents.length}`).red(),
              txt('dependents.'),
            ]);
          }
        });

        if (!options.yes) {
          const proceed = await confirm({
            message: yellow('Are you sure want to rename these packages?'),
            initialValue: false,
          });

          if (isCancel(proceed) || !proceed) {
            return caption.cancel('Rename packages cancelled.');
          }
        }
      }
    }

    const keys = targets.map((pkg) => pkg.base);

    section.print([
      txt('').lineTree(),
      column([
        txt(`${options.rename ? 'Renaming' : 'Moving'} the following packages:`)
          .grey()
          .bullet(),
      ]),
      ...targets.map((pkg) => {
        return column([
          txt(Icon.CHECKED).green().tree(),
          txt(pkg.base).color(pkg.color).align(keys),
          txt('from').grey(),
          txt(library.workspace.name).color(library.workspace.color),
        ]);
      }),
    ]);

    for (const pkg of targets) {
      if (options.rename) {
        if (typeof options.name === 'string' && targets.length === 1 && options.name !== pkg.name) {
          pkg.newName = options.name;
        }

        if (!pkg.newName) {
          const newName = await text({
            message: `New name for the package: ${txt(pkg.base).color(pkg.color).text()}`,
            initialValue: pkg.name,
          });

          if (isCancel(newName)) {
            return caption.cancel('Rename packages cancelled.');
          }

          if (newName !== pkg.name) {
            pkg.newName = newName as string;
          }
        }
      }

      if (options.rename && pkg.newName) {
        if (typeof options.path === 'string' && targets.length === 1 && options.path !== pkg.path) {
          pkg.newPath = options.path;
        }

        if (!pkg.newPath && !options.path && !options.yes) {
          const newPath = await text({
            message: `New path for the package: ${txt(pkg.base).color(pkg.color).text()}`,
            initialValue: pkg.base,
          });

          if (isCancel(newPath)) {
            return caption.cancel('Rename packages cancelled.');
          }

          if (newPath !== pkg.base) {
            pkg.newPath = newPath as string;
          }
        }
      }
    }

    if (options.yes) {
      options.workspace = targets[0].workspace.name;
    }

    if (!options.workspace) {
      const workspaces = library.workspaces
        .filter((space) => {
          if (!options.rename) {
            return targets.every((pkg) => pkg.workspace.name !== space.name);
          }

          return true;
        })
        .map((space) => ({
          value: space.name,
          label: txt(icon(space.name)).color(space.color).text(),
        }));

      const result = await select({
        message: grey('Which workspace to move the packages to?'),
        options: workspaces,
        initialValue: options.rename ? targets[0]?.workspace.name : workspaces[0]?.value,
      });

      if (isCancel(result)) {
        return caption.cancel('Moving packages cancelled.');
      }

      options.workspace = result as never;
    }

    const workspace = library.getSpace(options.workspace);

    if (!workspace) {
      section.print([
        txt('').lineTree(),
        column([
          txt('ERROR_ROOT: Workspace').red().tree(),
          txt(options.workspace).green(),
          txt('can not be found!').red(),
        ]),
        txt('').lineTree(),
      ]);

      inline.print(txt('Available workspaces:').grey().tree());

      library.workspaces.forEach((space, i) => {
        const label = txt(icon(space.name)).color(space.color);

        if (i === library.workspaces.length - 1) {
          inline.print(label.endTree(0));
        } else {
          inline.print(label.tree(0));
        }
      });

      return;
    }

    section.print([
      txt('').lineTree(),
      column([txt('To workspace').grey().tree(), txt(workspace.name).color(workspace.color)]),
    ]);

    if (!options.yes) {
      const proceed = await confirm({
        message: yellow('Are you sure you want to move these packages?'),
        initialValue: false,
      });

      if (isCancel(proceed) || !proceed) {
        return caption.cancel('Moving packages cancelled.');
      }
    }

    const moved: string[] = [];

    await runTask(
      targets.map((pkg) => {
        return {
          title: column([
            txt('Moving package').grey(),
            txt(pkg.base).color(pkg.color),
            txt('from').grey(),
            txt(pkg.workspace.name).color(pkg.workspace.color),
            txt('to').grey(),
            txt(workspace.name).color(workspace.color),
            txt('...').grey(),
          ]),
          task: async () => {
            const origin = join(library.path, pkg.path);
            const originPath = origin.replace(library.path, '').replace(/^\\/, '').replace(/\\/g, '/');
            const destination = join(library.path, workspace.path, pkg.newPath ?? pkg.base);
            const destinationPath = destination.replace(library.path, '').replace(/^\\/, '').replace(/\\/g, '/');
            const exist = existsSync(destination);

            if (!pkg.newName && originPath === destinationPath) {
              return section([txt(' No changes were made. ').fillWhite().black()]);
            }

            if (pkg.newName) {
              for (const { package: dep } of pkg.dependents) {
                column.print([
                  txt('Applying new name to its dependent:').grey().bullet(),
                  inline([
                    txt(dep.workspace.name).color(dep.workspace.color),
                    txt('/').darkGrey(),
                    txt(dep.base).color(dep.color),
                  ]),
                ]);

                searchAndReplace(pkg.name, pkg.newName, {
                  cwd: join(library.path, dep.path),
                  dry: options.dry,
                  verbose: options.verbose,
                });

                column.print([
                  txt('New name applied to its dependent:').grey().done(),
                  inline([
                    txt(dep.workspace.name).color(dep.workspace.color),
                    txt('/').darkGrey(),
                    txt(dep.base).color(dep.color),
                  ]),
                ]);
              }

              column.print([txt('Applying new name...').grey().bullet()]);

              const oldName = pkg.name;
              if (options.dry) {
                pkg.set('name', pkg.newName);
              } else {
                pkg.set('name', pkg.newName, true);
              }

              column.print([txt(oldName).red().strike().tree(), txt('->').green(), txt(pkg.name).green()]);
              column.print([txt('New name applied.').grey().done()]);
            }

            if (exist && !options.rename) {
              return new Error(
                column([
                  txt('Package').red(),
                  txt(pkg.base).color(pkg.color),
                  txt('already exists in workspace').red(),
                  txt(workspace.name).color(workspace.color),
                ])
              );
            }

            if (!options.dry && origin !== destination) {
              renameSync(origin, destination);
            }

            if (pkg.newName || originPath !== destinationPath) {
              moved.push(pkg.newPath ?? pkg.base);
            }

            if (originPath !== destinationPath) {
              return section([
                column([
                  txt('Package').grey(),
                  txt(pkg.base).color(pkg.color),
                  txt('moved to').grey(),
                  txt(workspace.name).color(workspace.color),
                ]),
                column([txt(originPath).red().strike(), txt('->').grey(), txt(destinationPath).cyan()]),
              ]);
            }
          },
        };
      })
    );

    if (moved.length) {
      await runTask({
        title: grey('Propagating changes...'),
        task: async () => {
          if (!options.dry) {
            await exec(library.pm, ['install'], { cwd: library.path });
          }

          return green('Changes propagated.');
        },
      });
    }

    caption.success('Moving packages complete.');
  });

addOverrides(moveCmd);
