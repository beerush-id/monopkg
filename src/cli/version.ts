import { Command } from 'commander';
import { addSharedOptions, configs } from './config.js';

import { column, renderLine, txt } from '../utils/common.js';
import { intro, isCancel, outro, select, tasks } from '@clack/prompts';
import { green, grey, pink, red, yellow } from '../utils/color.js';
import { library, selectPackages } from '../core/index.js';
import { writeMeta } from '../core/meta.js';

export const versionCmd = new Command()
  .configureHelp(configs)
  .command('version [version]')
  .description('Bump or set package version (default: patch)')
  .action(async (version: string) => {
    intro(column([grey('Welcome to the'), pink('MonoPKG'), grey('version wizard!')]));

    renderLine([txt('').lineTree(), txt(' Updating package versions.').grey().bullet()]);

    const packages = await selectPackages(library, {
      ...versionCmd.opts(),
      subTitle: 'update version to',
      cancelMessage: 'Version update cancelled.',
    });

    if (!packages?.length) {
      return;
    }

    if (!version) {
      version = (await select({
        message: grey('Which version to bump to?'),
        options: [
          { value: 'major', label: 'Major' },
          { value: 'minor', label: 'Minor' },
          { value: 'patch', label: 'Patch' },
        ],
      })) as string;

      if (isCancel(version)) {
        return outro(red('Version update cancelled.'));
      }
    }

    await tasks([
      ...packages.map((pkg) => {
        return {
          title: column([grey('Bumping version for'), txt(pkg.base).color(pkg.color)]),
          task: async () => {
            let [major = '0', minor = '0', patch = '1'] = (pkg.version ?? '0.0.1').split('.');

            if (version === 'major') {
              major = (+major + 1).toString();
              minor = '0';
              patch = '0';
            } else if (version === 'minor') {
              minor = (+minor + 1).toString();
              patch = '0';
            } else if (version === 'patch') {
              patch = (+patch + 1).toString();
            } else if (version.match(/^\d+\.\d+\.\d+$/)) {
              [major, minor, patch] = version.split('.');
            }

            pkg.meta.version = `${major}.${minor}.${patch}`;

            writeMeta(pkg.pointer.file, pkg.meta);

            return column([
              grey('Package'),
              txt(pkg.base).color(pkg.color),
              grey('version updated to'),
              yellow(pkg.meta.version),
            ]);
          },
        };
      }),
    ]);

    outro(green('Version update complete!'));
  });

addSharedOptions(versionCmd);
