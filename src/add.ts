import { Command } from 'commander';
import { configs, listAllPackages, listPackages, options, pm, textStyle } from './core.js';
import { spawnSync } from 'node:child_process';

export const addCmd = new Command()
  .configureHelp(configs)
  .command('add <dependencies...>')
  .description('Add dependencies to packages')
  .option('-d, --dev', 'Add dev dependencies')
  .option('-p, --peer', 'Add peer dependencies')
  .action((dependencies) => {
    const { dev } = addCmd.opts();
    const { root, include, exclude } = options;

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    for (const pkg of targetPackages) {
      try {
        const args = [dev ? '-D' : '', ...dependencies];
        const cwd = pkg.path;

        console.log(
          textStyle.blue(cwd, '⚡'),
          textStyle.grey('>'),
          textStyle.cyan(pm),
          textStyle.yellow('add'),
          textStyle.green(args.join(' '))
        );

        spawnSync(pm, [pm === 'npm' ? 'install' : 'add', ...args], { cwd, stdio: 'inherit' });
      } catch (error) {
        console.error(error);
      }
    }
  });

export const removeCmd = new Command()
  .configureHelp(configs)
  .command('remove <dependencies...>')
  .description('Remove dependencies from packages')
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
          textStyle.yellow('remove'),
          textStyle.green(args.join(' '))
        );

        spawnSync(pm, [pm === 'npm' ? 'uninstall' : 'remove', ...args], { cwd, stdio: 'inherit' });
      } catch (error) {
        // Ignore
      }
    }
  });
