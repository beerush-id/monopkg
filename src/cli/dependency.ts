import { Command } from 'commander';
import { addSharedOptions, configs } from './config.js';
import { column, render, renderLine, section, txt } from '../utils/common.js';
import { intro, isCancel, outro, select, tasks } from '@clack/prompts';
import { green, grey, pink, red } from '../utils/color.js';
import { library, Package, type QueryOptions, selectPackages } from '../core/index.js';
import { join } from 'node:path';
import { getPmArgs } from '../core/pm.js';
import { spawnSync } from 'node:child_process';
import { actionLabelMaps } from '../core/meta.js';

export const addCmd = new Command()
  .configureHelp(configs)
  .command('add <dependencies...>')
  .usage('<dependencies...> [options]')
  .summary('Add dependencies to packages')
  .option('-d, --dev', 'Add as dev dependencies')
  .option('-p, --peer', 'Add as peer dependencies')
  .option('-o, --optional', 'Add as optional dependencies')
  .description(
    section([
      grey('Add dependencies to one or more packages. You will be prompted to select:'),
      txt('Dependency scope (Default: dependencies).').grey().list(),
      txt('Packages to add the dependencies to (Default: none).').grey().list(),
    ])
  )
  .action(async (dependencies: string[]) => {
    await runInstaller('add', dependencies, addCmd.opts());
  });

addSharedOptions(addCmd);

export const removeCmd = new Command()
  .configureHelp(configs)
  .command('remove <dependencies...>')
  .usage('<dependencies...> [options]')
  .summary('Remove dependencies from packages')
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

type InstallerOptions = QueryOptions & {
  dev?: boolean;
  peer?: boolean;
  optional?: boolean;
  afterInstall?: (pkg: Package, dependencies: string[], scope: string) => Promise<void> | void;
};

export async function runInstaller(
  action: 'add' | 'remove' | 'link' | 'unlink',
  dependencies: string[],
  options: InstallerOptions
) {
  const pmArgs = getPmArgs(library.pm, action);

  if (!pmArgs) {
    render(txt('Package manager not supported').red().endTree());
    return;
  }

  intro(column([grey('Welcome to the'), pink('MonoPKG'), grey('package installer!')]));

  if (!library.packages.length) {
    return outro(red('No packages available in the project.'));
  }

  const title = actionLabelMaps.title[action];
  const dirTitle = actionLabelMaps.dir[action];
  const subTitle = actionLabelMaps.sub[action];
  const endTitle = actionLabelMaps.end[action];

  renderLine([txt('').lineTree(), txt(` ${title} the following dependencies ${dirTitle} packages:`).grey().bullet()]);

  const cancel = () => render(txt('Cancelled').padding(1).red().endTree());

  for (const dep of dependencies) {
    render(txt(`▣ ${dep}`).padding(1).green().tree());
  }

  const { dev, peer, optional } = options;
  let scope = dev
    ? pmArgs.scopes.devDependencies
    : peer
      ? pmArgs.scopes.peerDependencies
      : optional
        ? pmArgs.scopes.optionalDependencies
        : '';

  if (['add'].includes(action) && !scope) {
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
      return cancel();
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
  await tasks(
    packages.map((pkg) => {
      const cwd = join(library.path, pkg.path);

      return {
        title: column([grey(`${title} dependencies ${dirTitle}`), txt(pkg.base).color(pkg.color)]),
        task: async () => {
          spawnSync(library.pm, args, { cwd, shell: true, stdio: 'inherit' });

          if (typeof options.afterInstall === 'function') {
            await options.afterInstall(pkg, dependencies, scope);
          }

          return column([grey(`Dependencies ${endTitle} the`), txt(pkg.base).color(pkg.color), grey('package.')]);
        },
      };
    })
  );

  outro(green(`Installation completed, dependencies ${endTitle} packages.`));
}
