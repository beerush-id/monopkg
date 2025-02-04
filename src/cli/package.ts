import { Command } from 'commander';
import { addOverrides, caption, configs } from './program.js';
import { mkdirSync, renameSync } from 'node:fs';
import { column, icon, inline, newLine, section, txt } from '../utils/common.js';
import { shell } from '../utils/shell.js';
import { listPointers, type PackageMeta, readMeta, writeMeta } from '../core/meta.js';
import { library, Workspace } from '../core/index.js';
import { join } from 'node:path';
import { blue, cyan, darkGrey, green, grey, red, yellow } from '../utils/color.js';
import { isCancel, select } from '@clack/prompts';
import { APP_TEMPLATES, setupPackage, TEMPLATE_CATEGORIES } from '../core/template.js';

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
    const result = await setupPackage({
      template,
      name,
      path: cwd ?? path,
    });

    if (!result) {
      return;
    }

    const outPath = result.path;
    const outName = result.name;
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
      [result.command, ...result.args].map((arg, i) => {
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
      await shell(result.command, result.args, { cwd: workDir });
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
