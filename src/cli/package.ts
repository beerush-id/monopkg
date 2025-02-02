import { Command } from 'commander';
import { configs } from './config.js';
import { mkdirSync, renameSync } from 'node:fs';
import { column, icon, newLine, render, renderCol, txt } from '../utils/common.js';
import { shell } from '../utils/shell.js';
import { listPointers, type PackageMeta, readMeta, writeMeta } from '../core/meta.js';
import { library, Workspace } from '../core/index.js';
import { join } from 'node:path';
import { blue, cyan, darkGrey, green, grey, red, yellow } from '../utils/color.js';
import { intro, isCancel, outro, select } from '@clack/prompts';
import { setupPackage } from '../core/template.js';

const colorMap = [yellow, cyan, green, blue, cyan, cyan, cyan, cyan, cyan, cyan, cyan];

export const createCmd = new Command()
  .configureHelp(configs)
  .command('create [template]')
  .description('Create package in a workspace from template.')
  .usage('[template]')
  .option('-n, --name <name>', 'Package name.')
  .option('-o, --out-path <path>', 'Package location.')
  .option('-c, --cwd-path <path>', 'Working directory and package location.')
  .option('-r, --root <root>', 'Root workspace.')
  .action(async (template: string) => {
    if (!library.workspaces.length) return;

    intro(column([grey('Welcome to the'), txt('MonoPKG').pink(), grey('package setup wizard!')]));

    let { root } = createCmd.opts();
    if (typeof root === 'string') {
      root = [root];
    }

    if (!root) {
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

    const space: Workspace = library.getSpace({ root }) as Workspace;

    if (root && !space) {
      renderCol([red('ERROR_ROOT: Workspace'), green(root), red('not found.')]);

      render(grey('Available workspaces:'));

      library.workspaces.forEach((space, i) => {
        const label = txt(icon(space.name)).color(space.color);

        if (i === library.workspaces.length - 1) {
          render(label.endTree(0));
        } else {
          render(label.tree(0));
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
      return outro(green('All set!'));
    }

    const outPath = result.path;
    const outName = result.name;
    const version = '0.0.1';
    const workDir = cwd ? join(library.path, space.path, outPath) : join(library.path, space.path);

    const existing = library.get(outName) ?? library.get(outPath);

    if (existing) {
      renderCol([red('ERROR_EXIST: Package'), green(outName), red('already exists:')]);
      renderCol([txt('Name').green().tree(0), darkGrey(':'), green(existing.name)]);
      renderCol([txt('Version').green().tree(0), darkGrey(':'), yellow(`v${existing.version}`)]);
      renderCol([txt('Location').green().endTree(0), darkGrey(':'), cyan(existing.path)]);

      return;
    }

    outro(green('Preparation complete. Creating package...'));

    render([
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
      renderCol([grey('- If prompted, use this as location:'), green('.')]);

      mkdirSync(workDir, { recursive: true });
    }

    const pointers = listPointers(join(library.path, space.path));

    newLine();
    render(
      [result.command, ...result.args].map((arg, i) => {
        if (arg.startsWith('--')) {
          return grey(arg);
        }

        return colorMap[i % colorMap.length](arg);
      }),
      ' '
    );

    try {
      await shell(result.command, result.args, { cwd: workDir });
    } catch (err) {
      if (err instanceof Error) {
        render([red('Cancelled.')]);
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

      render([
        txt(icon(space.name)).color(space.color),
        darkGrey('/'),
        cyan(`${pointer.base}`),
        darkGrey('['),
        green(outName),
        darkGrey('v'),
        yellow(meta.version),
        darkGrey(']'),
      ]);

      render(green('Package created. Installing dependencies...'));
      newLine();

      await shell(library.pm, ['install'], { cwd: library.path });
    } catch (error) {
      if ((error as Record<string, string>).code !== 'ENOENT') {
        console.error(error);
      }
    }
  });
