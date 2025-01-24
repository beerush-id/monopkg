import { Command } from 'commander';
import { configs, listAllPackages, listPackages, options, pm, textStyle } from './core.js';
import { spawnSync } from 'node:child_process';

export const linkCmd = new Command()
  .configureHelp(configs)
  .command('link [dependencies...]')
  .description('Link dependencies to packages')
  .option('-s, --save', 'Link as dependencies')
  .option('-d, --dev', 'Link as devDependencies')
  .option('-p, --peer', 'Link as peerDependencies')
  .action((dependencies) => {
    const { root, include, exclude } = options;

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    for (const pkg of targetPackages) {
      try {
        const args = [...dependencies];
        const cwd = pkg.path;

        console.log(
          textStyle.blue(cwd, '⚡'),
          textStyle.grey('>'),
          textStyle.cyan(pm),
          textStyle.yellow('link'),
          textStyle.green(args.join(' '))
        );

        spawnSync(pm, ['link', ...args], { cwd, stdio: 'inherit' });
      } catch (error) {
        // Ignore
      }
    }
  });

export const unlinkCmd = new Command()
  .configureHelp(configs)
  .command('unlink <dependencies...>')
  .description('Unlink dependencies from packages')
  .option('-s, --save', 'Unlink as dependencies')
  .option('-d, --dev', 'Unlink as devDependencies')
  .option('-p, --peer', 'Unlink as peerDependencies')
  .action((dependencies) => {
    const { root, include, exclude } = options;

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    for (const pkg of targetPackages) {
      try {
        const args = [...dependencies];
        const cwd = pkg.path;

        console.log(
          textStyle.blue(cwd, '⚡'),
          textStyle.grey('>'),
          textStyle.cyan(pm),
          textStyle.yellow('unlink'),
          textStyle.green(args.join(' '))
        );

        spawnSync(pm, ['unlink', ...args], { cwd, stdio: 'inherit' });
      } catch (error) {
        // Ignore
      }
    }
  });
