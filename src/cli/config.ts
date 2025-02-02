import { type Command, type HelpConfiguration, program } from 'commander';

import { fgn } from '../utils/common.js';

export const configs: HelpConfiguration = {
  styleTitle: (str) => fgn.bold(str),
  styleCommandText: (str) => fgn.cyan(str),
  styleSubcommandText: (str) => fgn.yellow(str),
  styleOptionText: (str: string) => fgn.blue(str),
  styleArgumentText: (str: string) => fgn.green(str),
  styleDescriptionText: (str: string) => fgn.lightGrey(str.replace(/^[a-z]/, (c) => c.toUpperCase())),
};
export const options = program.opts();

export function addSharedOptions(cmd: Command, multi = true) {
  if (multi) {
    cmd.option('-r, --root <roots...>', 'Root workspaces (default: none).');
  } else {
    cmd.option('-r, --root <root>', 'Root workspace.');
  }

  cmd.option('-f, --filter <packages...>', 'Filter packages to be included (default: none).');
  cmd.option('-e, --exclude <packages...>', 'Excluded packages (default: none).');
}
