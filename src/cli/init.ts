import { Command } from 'commander';
import { configs } from './program.js';
import { setupProject } from '../core/setup.js';

export const initCmd = new Command()
  .configureHelp(configs)
  .command('init [directory]')
  .usage('[directory] [options]')
  .description('Initialize a new project.')
  .option('-n, --name <name>', 'Project name.')
  .option('-w, --workspace <workspaces...>', 'Workspaces to create.')
  .option('-p, --pm <pm>', 'Package manager (bun, npm, yarn, pnpm).')
  .action(async (path) => {
    await setupProject({ path, isInit: true, ...initCmd.opts() });
  });
