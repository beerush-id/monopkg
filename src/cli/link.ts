import { Command } from 'commander';
import { addSharedOptions, configs } from './program.js';
import { runInstaller } from './dependency.js';

export const linkCmd = new Command()
  .configureHelp(configs)
  .command('link <dependencies...>')
  .usage('<dependencies...>')
  .description('Link local dependencies to packages.')
  .action(async (dependencies) => {
    await runInstaller('link', dependencies, linkCmd.opts());
  });

addSharedOptions(linkCmd);

export const unlinkCmd = new Command()
  .configureHelp(configs)
  .command('unlink <dependencies...>')
  .description('Unlink dependencies from packages.')
  .action(async (dependencies) => {
    await runInstaller('unlink', dependencies, unlinkCmd.opts());
  });
