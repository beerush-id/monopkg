import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';

import { column, section, txt } from '../utils/common.js';
import { confirm, isCancel, select, tasks } from '@clack/prompts';
import { grey, yellow } from '../utils/color.js';
import { library, selectPackages } from '../core/index.js';
import { type PackageMeta, writeMeta } from '../core/meta.js';

export const versionCmd = new Command()
  .configureHelp(configs)
  .command('version [version]')
  .description('Bump or set package version (default: patch)')
  .option('-a, --all', 'Update everything including the root package')
  .action(async (version: string = 'patch') => {
    const { dry, all } = versionCmd.opts();
    caption.welcome('version wizard!', dry);

    section.print([txt('').lineTree(), txt('Updating package versions.').grey().bullet()]);

    const confirmRoot = all
      ? true
      : await confirm({
          message: 'Update root package?',
          initialValue: true,
        });
    const updateRoot = !isCancel(confirmRoot) && confirmRoot;

    if (updateRoot) {
      await tasks([
        {
          title: column([grey('Updating'), txt('root').cyan()]),
          task: async () => {
            library.meta.version = bumpVersion(library.meta, version);

            if (!dry) {
              library.write();
            }

            return column([
              grey('Root'),
              txt('package').cyan(),
              grey('version updated to'),
              yellow(library.meta.version),
            ]);
          },
        },
      ]);
    }

    const packages = all
      ? library.packages
      : await selectPackages(library, {
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
            pkg.meta.version = bumpVersion(pkg.meta, version);

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

function bumpVersion(meta: PackageMeta, version: string = '') {
  if (['major', 'minor', 'patch'].includes(version)) {
    const [, major = '0', minor = '0'] = (meta.version ?? '0.0.1').match(/(\d+)\.(\d+)\.(\d+)/) ?? ['0', '0', '1'];
    const [patch] = meta.version.match(/\d+$/) ?? '1';

    let nextMajor = major;
    let nextMinor = minor;
    let nextPatch = patch;

    if (version === 'major') {
      nextMajor = (+major + 1).toString();
      nextMinor = '0';
      nextPatch = '0';
    } else if (version === 'minor') {
      nextMinor = (+minor + 1).toString();
      nextPatch = '0';
    } else if (version === 'patch') {
      nextPatch = (+patch + 1).toString();
    }

    if (version === 'major' || version === 'minor') {
      return `${nextMajor}.${nextMinor}.${nextPatch}`;
    }

    return meta.version.replace(`${major}.${minor}.${patch}`, `${nextMajor}.${nextMinor}.${nextPatch}`);
  } else {
    return version || '0.0.1';
  }
}

addSharedOptions(versionCmd);
