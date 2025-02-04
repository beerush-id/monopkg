import { Command } from 'commander';
import {
  addSharedOptions,
  addSharedSaveOptions,
  caption,
  configs,
  exec,
  type FilterOptions,
  runTask,
  type SaveOptions,
} from './program.js';
import { column, inline, section, txt } from '../utils/common.js';
import { isCancel, select } from '@clack/prompts';
import { grey, highlight, yellow } from '../utils/color.js';
import { library, Package, selectPackages } from '../core/index.js';
import { join } from 'node:path';
import { getPmArgs } from '../core/pm.js';
import { actionLabelMaps } from '../core/meta.js';

export const addCmd = new Command()
  .configureHelp(configs)
  .command('add <dependencies...>')
  .usage('<dependencies...> [options]')
  .summary('Add dependencies to packages.')
  .description('Add dependencies to one or more packages.')
  .action(async (dependencies: string[]) => {
    await runInstaller('add', dependencies, addCmd.opts());
  });

addSharedSaveOptions(addCmd, 'Add');
addSharedOptions(addCmd);

export const removeCmd = new Command()
  .configureHelp(configs)
  .command('remove <dependencies...>')
  .usage('<dependencies...> [options]')
  .summary('Remove dependencies from packages.')
  .description(
    section([
      grey('Remove dependencies from one or more packages. You will be prompted to select:'),
      txt('Packages to remove the dependencies from (Default: none).').grey().list(),
      txt('If using NPM, dependency scope (Default: dependencies).').grey().list(),
    ])
  )
  .action(async (dependencies: string[]) => {
    await runInstaller('remove', dependencies, removeCmd.opts());
  });

addSharedOptions(removeCmd);

type InstallerOptions = FilterOptions &
  SaveOptions & {
    afterInstall?: (pkg: Package, dependencies: string[], scope: string) => Promise<void> | void;
  };

export async function runInstaller(
  action: 'add' | 'remove' | 'link' | 'unlink',
  dependencies: string[],
  options: InstallerOptions
) {
  const pmArgs = getPmArgs(library.pm, action);

  if (!pmArgs) {
    inline.print(txt('Package manager not supported.').red().endTree());
    return;
  }

  caption.welcome('package installer!', options.dry);

  if (!library.packages.length) {
    caption.cancel('No packages available in the project.');
  }

  const title = actionLabelMaps.title[action];
  const dirTitle = actionLabelMaps.dir[action];
  const subTitle = actionLabelMaps.sub[action];
  const endTitle = actionLabelMaps.end[action];

  section.print([txt('').lineTree(), txt(`${title} the following dependencies ${dirTitle} packages:`).grey().bullet()]);

  for (const dep of dependencies) {
    inline.print(txt(`▣ ${dep}`).green().tree());
  }

  const { dev, peer, optional } = options;
  let scope = dev
    ? pmArgs.scopes.devDependencies
    : peer
      ? pmArgs.scopes.peerDependencies
      : optional
        ? pmArgs.scopes.optionalDependencies
        : '';

  if (!scope && options.yes) {
    scope = pmArgs.scopes.dependencies;
  }

  if (['add'].includes(action) && !scope && !options.yes) {
    scope = (await select({
      message: grey('Which dependency scope to use?'),
      options: [
        { value: pmArgs.scopes.dependencies, label: 'Dependencies' },
        { value: pmArgs.scopes.devDependencies, label: 'Dev Dependencies' },
        { value: pmArgs.scopes.peerDependencies, label: 'Peer Dependencies' },
        { value: pmArgs.scopes.optionalDependencies, label: 'Optional Dependencies' },
      ],
    })) as string;

    if (isCancel(scope)) {
      return caption.cancel(`${title} cancelled.`);
    }
  }

  const packages = await selectPackages(library, {
    ...options,
    subTitle,
    cancelMessage: 'Installer cancelled.',
  });

  if (!packages?.length) {
    return;
  }

  const args = [pmArgs.cmd, scope, ...dependencies].filter((a) => a);
  await runTask(
    packages.map((pkg) => {
      const cwd = join(library.path, pkg.path);

      return {
        title: column([
          grey(`${title} dependencies ${dirTitle} the`),
          txt(pkg.base).color(pkg.color),
          grey('package:'),
        ]),
        message: column([yellow(library.pm), highlight(args.join(' '))]),
        task: async () => {
          if (!options.dry) {
            await exec(library.pm, args, { cwd });

            if (typeof options.afterInstall === 'function') {
              await options.afterInstall(pkg, dependencies, scope);
            }
          }

          return column([grey(`Dependencies ${endTitle} the`), txt(pkg.base).color(pkg.color), grey('package.')]);
        },
      };
    })
  );

  caption.success(`Installation completed.`);
}
