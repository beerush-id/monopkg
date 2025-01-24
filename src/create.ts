import { Command } from 'commander';
import { configs, defaultRoot, getPkgInfo, options, pm, setPkgInfo, textStyle } from './core.js';
import { join } from 'node:path';
import { mkdirSync, readdirSync } from 'node:fs';
import process from 'node:process';
import { spawnSync } from 'node:child_process';

const colorMap = [
  textStyle.yellow,
  textStyle.cyan,
  textStyle.green,
  textStyle.blue,
  textStyle.cyan,
  textStyle.cyan,
  textStyle.cyan,
  textStyle.cyan,
  textStyle.cyan,
  textStyle.cyan,
  textStyle.cyan
];

export const createCmd = new Command()
  .configureHelp(configs)
  .command('create <template>')
  .description('Create a package from template')
  .option('-n, --name <name>', 'Package name (default: folder name)')
  .option('-p, --path <path>', 'Package location')
  .option('-v, --version <version>', 'Initial version (default: 0.0.1)')
  .action((template: string) => {
    const { scope, name, version, commands, path } = createCmd.opts();
    const { root = defaultRoot } = options;

    const pkgPath = join(root, path ?? '');
    const pkgName = `${scope ? `@${scope}/` : ''}${name ?? path ?? 'new'}`;
    const cwd = path ? pkgPath : root;

    let args = pm === 'npm' ? [`create-${template}`] : ['create', template];
    let pmx = commands ? commands.join(' ') : pm === 'npm' ? 'npx' : pm;

    if (template.endsWith('-create')) {
      args = template.split('-');

      if (pm === 'bun') {
        args.splice(0, 0, 'x');
      }

      pmx = pm === 'npm' ? 'npx' : pm === 'bun' ? 'bun' : pm;
    }

    console.log(
      textStyle.blue(pkgPath, '⚡'),
      textStyle.cyan(`(${pkgName})`),
      textStyle.grey('>'),
      ...[pmx, ...args].map((arg, i) => colorMap[i % colorMap.length](arg))
    );

    const currentDirs = readdirSync(join(process.cwd(), root));

    if (path) {
      mkdirSync(pkgPath, { recursive: true });
    }

    spawnSync(pmx, args, {
      cwd,
      stdio: 'inherit',
      shell: true
    });

    try {
      const newDirs = readdirSync(join(process.cwd(), root)).filter(
        (dir) => !currentDirs.includes(dir)
      );
      const newPath = path ? pkgPath : join(root, newDirs[0] ?? '');
      const pkgMeta = getPkgInfo(newPath);

      if (pkgName !== 'new') {
        pkgMeta.name = pkgName;
        setPkgInfo(newPath, pkgMeta);
      }

      if (version || !pkgMeta.version) {
        pkgMeta.version = version ?? '0.0.1';
        setPkgInfo(newPath, pkgMeta);
      }

      console.log(
        textStyle.blue(newPath, '⚡'),
        textStyle.grey('>'),
        textStyle.green(`(${pkgMeta.name}@${pkgMeta.version ?? '0.0.0'})`),
        'created'
      );
    } catch (error) {
      if ((error as Record<string, string>).code !== 'ENOENT') {
        console.error(error);
      }
    }
  });
