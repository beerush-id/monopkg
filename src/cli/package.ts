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
      workspace: space,
    });

    if (!setup) {
      return;
    }

    const outPath = setup.path;
    const outName = setup.name;
    const version = '0.0.1';
    const workDir = cwd ? join(library.path, space.path, outPath) : join(library.path, space.path);

    const existing = library.get(outName) ?? library.get(join(space.name, outPath));

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

    if ((options.name || options.path) && packages.length > 1) {
      section.print([
        txt('').lineTree(),
        column([
          txt('Options').red().lineTree(),
          txt('--name').cyan(),
          txt('and').red(),
          txt('--path').cyan(),
          txt('are only applicable for a single package.').red(),
        ]),
        column([txt('Skipping these options for multiple packages.').grey().lineTree()]),
      ]);

      delete options.name;
      delete options.path;
    }

    const workspaceOptions = library.workspaces.map((space) => ({
      value: space.name,
      label: txt(icon(space.name)).color(space.color).text(),
    }));
    const targetWorkspaces: Record<string, Workspace> = {};
    const targetPackages = await selectPackages(library, {
      filter: packages,
      subTitle: 'move from',
      cancelMessage: 'Moving packages cancelled.',
    });

    if (!targetPackages || !targetPackages.length) {
      return;
    }

    for (const pkg of targetPackages) {
      if (pkg.dependents?.length && options.rename) {
        section.print([
          txt('').lineTree(),
          column([
            txt(Icon.CHECKED).green().tree(),
            txt('Package').grey(),
            txt(pkg.base).color(pkg.color),
            txt(`has`),
            txt(`${pkg.dependents.length}`).red(),
            txt('dependents.'),
          ]),
        ]);

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

      let workspaceName: string = options.workspace;

      if (!workspaceName && pkg.newName && options.yes) {
        workspaceName = pkg.workspace.name;
      }

      if (!workspaceName) {
        workspaceName = (await select({
          message: column([
            txt('Which workspace to move the package').grey(),
            txt(pkg.base).color(pkg.color),
            txt('to?').grey(),
          ]),
          options: workspaceOptions,
          initialValue: pkg.workspace.name,
        })) as string;

        if (isCancel(workspaceName)) {
          return caption.cancel('Moving packages cancelled.');
        }
      }

      const workspace = library.getSpace(workspaceName);

      if (!workspace) {
        section.print([
          txt('').lineTree(),
          column([
            txt('ERROR_ROOT: Workspace').red().tree(),
            txt(workspaceName).green(),
            txt('can not be found!').red(),
          ]),
          txt('').lineTree(),
        ]);

        inline.print(txt('Available workspaces:').grey().tree());

        library.workspaces.forEach((space) => {
          const label = txt(icon(space.name)).color(space.color);
          inline.print(label.tree(0));
        });

        return caption.cancel('Moving packages cancelled.');
      }

      targetWorkspaces[pkg.name] = workspace;

      const [scopeName, name] = pkg.name.split('/');
      const pkgName = name || scopeName;

      let pkgScope = name ? scopeName : (workspace.scope ?? library.name);

      if (pkg.workspace.name !== workspace.name && workspace.scope) {
        pkgScope = workspace.scope;
      }

      if (!pkgScope.startsWith('@')) {
        pkgScope = `@${pkgScope}`;
      }

      if (options.rename) {
        if (typeof options.name === 'string' && targetPackages.length === 1 && options.name !== pkg.name) {
          pkg.newName = options.name;
        }

        if (!pkg.newName) {
          const newName = await text({
            message: `New name for the package: ${txt(pkg.base).color(pkg.color).text()}`,
            initialValue: `${pkgScope}/${pkgName}`,
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
        if (typeof options.path === 'string' && targetPackages.length === 1 && options.path !== pkg.path) {
          pkg.newPath = options.path;
        }

        if (!pkg.newPath && !options.path) {
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

    const changedPackages = targetPackages.filter((pkg) => {
      const workspace = targetWorkspaces[pkg.name];
      return pkg.newName || pkg.workspace.name !== workspace.name || pkg.newPath;
    });

    if (changedPackages.length) {
      section.print([
        txt('').lineTree(),
        column([txt(' Moving the following packages: ').fillYellow().black().bullet()]),
        ...changedPackages.flatMap((pkg) => {
          const columns = [column([txt(Icon.CHECKED).green().tree(), txt(pkg.base).color(pkg.color)])];
          const workspace = targetWorkspaces[pkg.name];

          if (pkg.newName) {
            columns.push(
              column([
                txt('Renaming from').grey().tree(1),
                txt(pkg.name).color(pkg.color),
                txt('to').grey(),
                txt(pkg.newName).green(),
              ])
            );
          }

          if (pkg.workspace.name !== workspace.name || pkg.newPath) {
            columns.push(
              column([
                txt('Moving from').grey().tree(1),
                inline([
                  txt(pkg.workspace.name).color(pkg.workspace.color),
                  txt('/').darkGrey(),
                  txt(pkg.base).color(pkg.color),
                ]),
                txt('to').grey(),
                inline([
                  txt(workspace.name).color(workspace.color),
                  txt('/').darkGrey(),
                  txt(pkg.newPath ?? pkg.base).color(pkg.color),
                ]),
              ])
            );
          }

          return columns;
        }),
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
    } else {
      return caption.cancel('Moving packages cancelled due no changes.');
    }

    const changeList: string[] = [];

    await runTask(
      changedPackages
        .filter((pkg) => pkg.newName)
        .map((pkg) => {
          const workspace = targetWorkspaces[pkg.name];
          const oldName = pkg.name;
          const newName = pkg.newName as string;

          return {
            title: column([
              txt('Renaming').grey(),
              txt(pkg.base).color(pkg.color),
              txt('from').grey(),
              txt(oldName).color(pkg.color),
              txt('to').grey(),
              txt(newName).green(),
              txt('...').grey(),
            ]),
            task: async () => {
              for (const { package: dep } of pkg.dependents) {
                column.print([
                  txt('Applying new name to its dependent:').grey().bullet(),
                  inline([
                    txt(dep.workspace.name).color(dep.workspace.color),
                    txt('/').darkGrey(),
                    txt(dep.base).color(dep.color),
                  ]),
                ]);

                searchAndReplace(pkg.name, newName, {
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
                column.print([txt('').lineTree()]);
              }

              column.print([txt('Applying new name...').grey().bullet()]);

              if (options.dry) {
                pkg.set('name', newName);
              } else {
                pkg.set('name', newName, true);
              }

              targetWorkspaces[pkg.name] = workspace;

              column.print([txt(oldName).red().strike().tree(), txt('->').green(), txt(pkg.name).green()]);
              column.print([txt('New name applied.').grey().done()]);
              column.print([txt('').lineTree()]);

              changeList.push(pkg.name);

              return section([
                column([txt('Package').grey(), txt(pkg.base).color(pkg.color), txt('renamed:').grey()]),
                column([txt(oldName).red().strike(), txt('->').grey(), txt(pkg.name).cyan()]),
              ]);
            },
          };
        })
    );

    await runTask(
      changedPackages
        .filter((pkg) => {
          const workspace = targetWorkspaces[pkg.name];
          return pkg.newPath || pkg.workspace.name !== workspace.name;
        })
        .map((pkg) => {
          const workspace = targetWorkspaces[pkg.name];

          return {
            title: column([
              txt('Moving').grey(),
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

              if (exist) {
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

              if (originPath !== destinationPath) {
                changeList.push(pkg.newPath ?? pkg.base);

                return section([
                  column([txt('Package').grey(), txt(pkg.base).color(pkg.color), txt('moved:').grey()]),
                  column([txt(originPath).red().strike(), txt('->').grey(), txt(destinationPath).cyan()]),
                ]);
              }
            },
          };
        })
    );

    if (changeList.length) {
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
