import { program } from 'commander';
import * as process from 'node:process';
import { configs } from './core.js';
import { versionCmd } from './version.js';
import { initCmd } from './init.js';
import { addCmd, removeCmd } from './add.js';
import { linkCmd, unlinkCmd } from './link.js';
import { listCmd } from './list.js';
import { useCmd } from './use.js';
import { runCmd } from './run.js';
import { createCmd } from './create.js';
import { addScriptCmd, removeScriptCmd } from './add-script.js';

program
  .configureHelp(configs)
  .name('monopkg')
  .version('0.0.1')
  .description('A simple, yet useful package manager for monorepos.')
  .option('-r, --root <root>', 'Root workspace (default: all workspaces)')
  .option('-i, --include <packages...>', 'Included packages (default: all)')
  .option('-e, --exclude <packages...>', 'Excluded packages');

program
  .addCommand(addCmd)
  .addCommand(addScriptCmd)
  .addCommand(createCmd)
  .addCommand(initCmd)
  .addCommand(linkCmd)
  .addCommand(listCmd)
  .addCommand(removeCmd)
  .addCommand(removeScriptCmd)
  .addCommand(runCmd)
  .addCommand(useCmd)
  .addCommand(unlinkCmd)
  .addCommand(versionCmd)
  .parse(process.argv);
