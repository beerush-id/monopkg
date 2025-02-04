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
import { column, section, txt } from '../utils/common.js';
import { isCancel, select } from '@clack/prompts';
import { green, grey } from '../utils/color.js';
import { library, selectPackages } from '../core/index.js';
import { actionLabelMaps, type DependencyScope } from '../core/meta.js';

export const attachCmd = new Command()
  .configureHelp(configs)
  .command('attach [packages...]')
  .description("Link internal packages within the project's scope.")
  .action(async (packages: string[]) => {
    await updateDependencies('link', packages, attachCmd.opts());
  });

addSharedSaveOptions(attachCmd, 'Link');
addSharedOptions(attachCmd);

export const detachCmd = new Command()
  .configureHelp(configs)
  .command('detach [packages...]')
  .description("Unlink internal packages within the project's scope.")
  .action(async (packages: string[]) => {
    await updateDependencies('unlink', packages, detachCmd.opts());
  });

addSharedOptions(detachCmd);

type AttachOptions = FilterOptions & SaveOptions;

export async function updateDependencies(action: 'link' | 'unlink', packages: string[], options: AttachOptions) {
  caption.welcome('linking wizard!', options.dry);

  const title = actionLabelMaps.title[action];
  const endTitle = actionLabelMaps.end[action];
  const altTitle = actionLabelMaps.alt[action];

  if (!packages.length) {
    section.print([txt('').lineTree(), txt(`No source packages to be ${altTitle} from.`).yellow().tree()]);

    const result = await selectPackages(library, {
      subTitle: `be ${altTitle} from`,
      cancelMessage: `Setup cancelled.`,
    });

    if (!result?.length) {
      return;
    }

    packages = result.map((p) => p.base);
  }

  section.print([
    txt('').lineTree(),
    txt(`${title} internal packages.`).grey().bullet(),
    ...packages.map((name) => txt(`▣ ${name}`).green().tree()),
  ]);

  const { dev, peer, optional } = options;
  let scope: DependencyScope = dev
    ? 'devDependencies'
    : peer
      ? 'peerDependencies'
      : optional
        ? 'optionalDependencies'
        : ('' as DependencyScope);

  if (options.yes && !scope) {
    scope = 'dependencies';
  }

  if (!scope && action === 'link') {
    scope = (await select({
      message: grey('Which dependency scope to use?'),
      options: [
        { value: 'dependencies', label: 'Dependencies' },
        { value: 'devDependencies', label: 'Dev Dependencies' },
        { value: 'peerDependencies', label: 'Peer Dependencies' },
        { value: 'optionalDependencies', label: 'Optional Dependencies' },
      ],
    })) as DependencyScope;

    if (isCancel(scope)) {
      return caption.cancel('Setup cancelled.');
    }
  }

  if (!options.yes && !options?.filter?.length) {
    section.print([txt('').lineTree(), txt(`Now pick the target packages to be ${altTitle} to.`).grey().tree()]);
  }

  const targets = await selectPackages(library, {
    ...options,
    subTitle: `be ${endTitle}`,
    cancelMessage: 'Setup cancelled.',
    isExcluded: (pkg) => {
      if (action === 'link') {
        return packages.includes(pkg.base) || packages.includes(pkg.name);
      }

      return !pkg.hasDependency(...packages);
    },
  });

  if (!targets?.length) {
    return;
  }

  await runTask([
    ...targets.map((pkg) => {
      return {
        title: column([grey(`${title} packages to`), txt(pkg.base).color(pkg.color)]),
        task: async () => {
          if (!options.dry) {
            if (action === 'link') {
              pkg.setDependency(scope, ...packages);
            } else {
              pkg.removeDependency(...packages);
            }
          }

          return section([
            column([
              grey('Package'),
              txt(pkg.base).color(pkg.color),
              grey(`now ${action === 'link' ? 'depends on' : endTitle}:`),
            ]),
            ...packages.map((dep) => txt(dep).green()),
          ]);
        },
      };
    }),
    {
      title: column([txt('Finalizing the setup.').grey()]),
      task: async () => {
        if (!options.dry) {
          await exec(library.pm, ['install'], { cwd: library.path });
        }

        return green('All set!');
      },
    },
  ]);

  caption.success('Setup complete!');
}
