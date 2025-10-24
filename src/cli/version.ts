import { Command } from 'commander';
import { addSharedOptions, caption, configs, runTask } from './program.js';

import { column, inline, section, txt } from '../utils/common.js';
import { confirm, isCancel, select, tasks } from '@clack/prompts';
import { darkGrey, grey, yellow } from '../utils/color.js';
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

    if (!packages) {
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

    await runTask([
      {
        title: column([grey('Bumping package versions:')]),
        task: async () => {
          packages.forEach((pkg) => {
            pkg.meta.version = bumpVersion(pkg.meta, version);

            if (!dry) {
              writeMeta(pkg.pointer.file, pkg.meta);
            }

            column.print([
              txt('Package').darkGrey().tree(),
              txt(pkg.name).color(pkg.color),
              darkGrey('version updated to'),
              yellow(pkg.meta.version),
            ]);
          });

          txt('').lineTree().print();
          return column([grey('Package versions bumped.')]);
        },
      },
    ]);

    caption.success('Version update complete!');
  });

addSharedOptions(versionCmd);

const ejectVersionCmd = new Command()
  .configureHelp(configs)
  .command('eject')
  .description('Eject workspace:* version references to actual versions')
  .option('-a, --all', 'Eject all packages')
  .action(async () => {
    const { dry, all } = versionCmd.opts();
    caption.welcome('version eject!', dry);

    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

    const confirmRoot = all
      ? true
      : await confirm({
          message: 'Update root package?',
          initialValue: false,
        });
    const updateRoot = !isCancel(confirmRoot) && confirmRoot;

    if (updateRoot) {
      await runTask([
        {
          title: column([grey('Updating'), txt('root').cyan()]),
          task: async () => {
            for (const depType of depTypes) {
              if (library.meta[depType]) {
                for (const [name, version] of Object.entries(library.meta[depType])) {
                  if (version === 'workspace:*') {
                    const dependency = library.get(name);

                    if (dependency) {
                      library.meta[depType][name] = `^${dependency.version}`;

                      column.print([
                        txt(`${depType}:`).darkGrey().tree(),
                        inline([txt(name).cyan(), txt('@').darkGrey(), txt('workspace:*').red()]),
                        txt('->').darkGrey(),
                        inline([txt(name).cyan(), txt('@').darkGrey(), txt(`^${dependency.version}`).yellow()]),
                      ]);
                    }
                  }
                }
              }
            }

            if (!dry) {
              library.write();
            }

            txt('').lineTree().print();
            return column([txt('Root').cyan(), darkGrey('package versions ejected')]);
          },
        },
      ]);
    }

    const packages = all
      ? library.packages
      : await selectPackages(library, {
          ...versionCmd.opts(),
          subTitle: 'eject workspace versions from',
          cancelMessage: 'Version eject cancelled.',
        });

    if (!packages) {
      return;
    }

    await runTask([
      ...packages.map((pkg) => {
        return {
          title: column([grey('Ejecting workspace versions for'), txt(pkg.name).color(pkg.color)]),
          task: async () => {
            let updated = false;

            for (const depType of depTypes) {
              if (pkg.meta[depType]) {
                for (const [name, version] of Object.entries(pkg.meta[depType])) {
                  if (version === 'workspace:*') {
                    const dependency = library.get(name);
                    if (dependency) {
                      pkg.meta[depType][name] = `^${dependency.version}`;
                      updated = true;

                      column.print([
                        txt(`${depType}:`).darkGrey().tree(),
                        inline([txt(name).color(pkg.color), txt('@').darkGrey(), txt('workspace:*').red()]),
                        txt('->').darkGrey(),
                        inline([
                          txt(name).color(pkg.color),
                          txt('@').darkGrey(),
                          txt(`^${dependency.version}`).green(),
                        ]),
                      ]);
                    }
                  }
                }
              }
            }

            if (updated && !dry) {
              writeMeta(pkg.pointer.file, pkg.meta);
            }

            if (!updated) {
              return column([grey('No workspace versions found in'), txt(pkg.name).color(pkg.color)]);
            }

            inline.print([txt('').lineTree()]);
            return column([grey('Ejected workspace versions for'), txt(pkg.name).color(pkg.color)]);
          },
        };
      }),
    ]);

    caption.success('Workspace versions ejected successfully!');
  });

addSharedOptions(ejectVersionCmd);

versionCmd.addCommand(ejectVersionCmd);

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
