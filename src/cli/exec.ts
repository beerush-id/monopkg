import { Command } from 'commander';
import { addSharedOptions, caption, configs, exec, type FilterOptions, runTask } from './program.js';
import { library, selectPackages } from '../core/index.js';
import { column, section, txt } from '../utils/common.js';
import { green, grey, highlight } from '../utils/color.js';
import { getExeCommand } from '../core/pm.js';
import { join } from 'node:path';

export const xCmd = new Command()
  .configureHelp(configs)
  .command('x <command>')
  .summary('Auto-install and run packages from npm.')
  .description('Auto-install and run packages from npm.')
  .action(async (command: string) => {
    const options = xCmd.opts<FilterOptions>();

    caption.welcome('npm package runner!', options.dry);

    section.print([
      txt('').lineTree(),
      txt('Executing the following command:').grey().bullet(),
      txt(highlight(command)).tree(),
    ]);

    const packages = await selectPackages(library, {
      ...options,
      subTitle: 'run the command in',
      cancelMessage: 'Command execution cancelled!',
    });

    if (!packages) {
      return;
    }

    const cmArgs = command.split(' ');
    const pmArgs = getExeCommand(library.pm);
    const args = [...(pmArgs?.arg ?? []), ...cmArgs];

    await runTask([
      ...packages.map((pkg) => {
        return {
          title: section([
            column([grey('Running command in'), txt(pkg.base).color(pkg.color), grey('package.')]),
            txt(highlight([pmArgs?.cmd, ...args].join(' '))),
          ]),
          task: async () => {
            const cwd = join(library.path, pkg.path);

            if (!options.dry) {
              await exec(pmArgs?.cmd ?? library.pm, args, { cwd });
            }

            return column([green('Command executed in'), txt(pkg.base).color(pkg.color), grey('package!')]);
          },
        };
      }),
    ]);

    caption.success('Command execution completed!');
  });

addSharedOptions(xCmd);
