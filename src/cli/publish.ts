import { Command } from 'commander';
import { addSharedOptions, caption, exec } from './program.js';
import { column, section, txt } from '../utils/common.js';
import { library, selectPackages } from '../core/index.js';
import { tasks } from '@clack/prompts';
import { green, grey } from '../utils/color.js';
import { join } from 'node:path';

export const publishCmd = new Command()
  .command('publish')
  .description('Publish packages')
  .action(async () => {
    const { dry } = publishCmd.opts();
    caption.welcome('package publisher!', dry);

    section.print([txt('').lineTree(), txt('Publishing packages.').grey().bullet()]);

    const packages = await selectPackages(library, {
      ...publishCmd.opts(),
      subTitle: 'publish from',
      cancelMessage: 'Publishing packages cancelled.',
    });

    if (!packages?.length) {
      return;
    }

    await tasks([
      ...packages.map((pkg) => {
        return {
          title: column([grey('Publishing package'), txt(pkg.base).color(pkg.color)]),
          task: async () => {
            const cwd = join(library.path, pkg.path);

            if (!dry) {
              await exec(library.pm, ['publish'], { cwd });
            } else if (library.dryCmd) {
              await exec(library.pm, ['publish', library.dryCmd], { cwd });
            } else {
              column.print([txt(library.pm).cyan().tree(), txt('publish').yellow()]);
            }

            txt('').lineTree().print();
            return column([green('Package'), txt(pkg.base).color(pkg.color), green('published successfully!')]);
          },
        };
      }),
    ]);

    caption.success('All packages published successfully!');
  });

addSharedOptions(publishCmd);
