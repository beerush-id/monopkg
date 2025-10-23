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
import { copyCmd } from './cli/copy.js';
import { xCmd } from './cli/exec.js';
import { existsSync, readFileSync } from 'node:fs';
import { publishCmd } from './cli/publish.js';
import { fileURLToPath } from 'node:url';
import { catalogCmd } from './cli/catalog.js';

declare global {
  interface String {
    print(): void;
  }
}

String.prototype.print = function () {
  console.log(this);
};

const rawMeta = readFileSync(new URL('../package.json', import.meta.url), 'utf-8');
const meta = JSON.parse(rawMeta);

program
  .configureHelp(configs)
  .name(meta.name)
  .description(meta.description)
  .usage('<command> [options]')
  .helpOption('-h, --help', 'Show usage information.')
  .helpCommand('help [command]', 'Display help for a specific command.')
  .version(meta.version, '-v, --version', 'Output the current version.');

program
  .addCommand(addCmd)
  .addCommand(attachCmd)
  .addCommand(catalogCmd)
  .addCommand(copyCmd)
  .addCommand(createCmd)
  .addCommand(detachCmd)
  .addCommand(infoCmd)
  .addCommand(initCmd)
  .addCommand(linkCmd)
  .addCommand(listCmd, { isDefault: true })
  .addCommand(moveCmd)
  .addCommand(removeCmd)
  .addCommand(runCmd)
  .addCommand(publishCmd)
  .addCommand(scriptCmd)
  .addCommand(unlinkCmd)
  .addCommand(versionCmd)
  .addCommand(workspaceCmd)
  .addCommand(xCmd);

export async function main() {
  const templatePath = new URL('./templates', import.meta.url);
  const templateSource = new URL('./templates.tar.tgz', import.meta.url);
  const extractCwd = new URL('.', import.meta.url);
  const isTemplateExists = existsSync(templatePath);

  if (!isTemplateExists) {
    const { extract } = await import('tar');
    await extract({
      f: fileURLToPath(templateSource),
      cwd: fileURLToPath(extractCwd),
    });
  }

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
