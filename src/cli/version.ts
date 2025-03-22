import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';

import { column, section, txt } from '../utils/common.js';
import { isCancel, select, tasks } from '@clack/prompts';
import { grey, yellow } from '../utils/color.js';
import { library, selectPackages } from '../core/index.js';
import { writeMeta } from '../core/meta.js';

export const versionCmd = new Command()
  .configureHelp(configs)
  .command('version [version]')
  .description('Bump or set package version (default: patch)')
  .action(async (version: string) => {
    const { dry } = versionCmd.opts();
    caption.welcome('version wizard!', dry);

    section.print([txt('').lineTree(), txt('Updating package versions.').grey().bullet()]);

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
        return caption.cancel('Version update cancelled.');
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

            if (!dry) {
              writeMeta(pkg.pointer.file, pkg.meta);
            }

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

    caption.success('Version update complete!');
  });

addSharedOptions(versionCmd);
