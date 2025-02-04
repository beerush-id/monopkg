import { program } from 'commander';
import { configs } from './cli/program.js';
import { versionCmd } from './cli/version.js';
import { addCmd, removeCmd } from './cli/dependency.js';
import { linkCmd, unlinkCmd } from './cli/link.js';
import { listCmd } from './cli/list.js';
import { attachCmd, detachCmd } from './cli/attach.js';
import { runCmd } from './cli/run.js';
import { createCmd, moveCmd } from './cli/package.js';
import { scriptCmd } from './cli/script.js';
import { infoCmd } from './cli/info.js';
import { workspaceCmd } from './cli/workspace.js';
import { library } from './core/index.js';
import process from 'node:process';
import { initCmd } from './cli/init.js';
import { render, shouldTired } from './utils/common.js';
import { yellow } from './utils/color.js';
import { sleep } from '@beerush/utils';

declare global {
  interface String {
    print(): void;
  }
}

String.prototype.print = function () {
  console.log(this);
};

program
  .configureHelp(configs)
  .name('monopkg')
  .description('A simple, yet useful package manager for monorepos.')
  .usage('<command> [options]')
  .helpOption('-h, --help', 'Show usage information.')
  .helpCommand('help [command]', 'Display help for a specific command.')
  .version(`0.0.1`, '-v, --version', 'Output the current version.');

program
  .addCommand(addCmd)
  .addCommand(attachCmd)
  .addCommand(createCmd)
  .addCommand(detachCmd)
  .addCommand(infoCmd)
  .addCommand(initCmd)
  .addCommand(linkCmd)
  .addCommand(listCmd, { isDefault: true })
  .addCommand(moveCmd)
  .addCommand(removeCmd)
  .addCommand(runCmd)
  .addCommand(scriptCmd)
  .addCommand(unlinkCmd)
  .addCommand(versionCmd)
  .addCommand(workspaceCmd);

export async function main() {
  if (shouldTired()) {
    render(yellow(`I'm not in the mood to work atm. 😴`));
    await sleep(2000);
    render(yellow(`Kidding! 😄\n`));
  }

  if (process.argv.find((arg) => ['-h', '-H', 'help', '--help', '-v', '-V', '--version'].includes(arg))) {
    program.parse();
    return;
  }

  const isInit = process.argv.includes('init');
  if (!isInit) {
    await library.init(isInit);
  } else {
    library.status = 'ready';
  }

  if (library.status === 'ready') {
    library.load();
    program.parse();
  }
}
