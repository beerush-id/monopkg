import { Command } from 'commander';
import { configs } from './core.js';

export const useCmd = new Command()
  .configureHelp(configs)
  .command('use <packages...>')
  .description('Link internal packages')
  .option('-d, --dev', 'Link dev dependencies')
  .option('-p, --peer', 'Link peer dependencies')
  .option('-t, --target <target>', 'Target packages')
  .action((packages) => {
    console.log(packages);
  });
