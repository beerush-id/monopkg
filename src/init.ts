import { Command } from 'commander';
import { configs, defaultRoot, options, textStyle } from './core.js';
import { dirname, join } from 'node:path';
import { mkdirSync, writeFileSync } from 'node:fs';

export const initCmd = new Command()
  .configureHelp(configs)
  .command('init <package>')
  .description('Initialize a new package')
  .option('-n, --name <name>', 'Package name (default: folder name)')
  .option('-s, --scope <scope>', 'Scope name (e.g. beerush)')
  .option('-v, --version <version>', 'Package version (default: 0.0.1)')
  .option('-m, --main <main>', 'Main file (default: src/index.ts)')
  .action((pkg: string) => {
    const { scope, name, version, main = 'src/index.ts' } = initCmd.opts();

    const mainDir = dirname(main);
    const pkgName = `${scope ? `@${scope}/` : ''}${name ?? pkg}`;
    const rootDir = options.root ?? defaultRoot;
    const pkgPath = join(rootDir, pkg);

    mkdirSync(join(pkgPath, mainDir), { recursive: true });
    writeFileSync(
      join(pkgPath, 'package.json'),
      JSON.stringify(
        {
          type: 'module',
          name: pkgName,
          version: version ?? '0.0.1',
          module: main,
          scripts: {
            test: 'echo "Error: no test specified" && exit 1'
          }
        },
        null,
        2
      ),
      'utf-8'
    );
    writeFileSync(join(pkgPath, main), `console.log('Hello, world!');`, 'utf-8');
    console.log(`Package created: ${textStyle.green(pkgName)} at ${textStyle.cyan(pkgPath)}`);
  });
