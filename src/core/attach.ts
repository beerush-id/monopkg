import { Command } from 'commander';
import { addSharedOptions, configs } from '../cli/config.js';

import { column, renderLine, section, txt } from '../utils/common.js';
import { intro, isCancel, outro, select, tasks } from '@clack/prompts';
import { green, grey, pink, red } from '../utils/color.js';
import { library, type QueryOptions, selectPackages } from './index.js';
import { actionLabelMaps, type DependencyScope } from './meta.js';

export const attachCmd = new Command()
  .configureHelp(configs)
  .command('attach [packages...]')
  .description("Link internal packages within the project's scope.")
  .option('-s, --save', 'Link as dependencies.')
  .option('-d, --dev', 'Link devDependencies.')
  .option('-p, --peer', 'Link peerDependencies.')
  .option('-o, --optional', 'Link optionalDependencies.')
  .action(async (packages: string[]) => {
    await attachDependencies('link', packages, attachCmd.opts());
  });

addSharedOptions(attachCmd);

export const detachCmd = new Command()
  .configureHelp(configs)
  .command('detach [packages...]')
  .description("Unlink internal packages within the project's scope.")
  .action(async (packages: string[]) => {
    await attachDependencies('unlink', packages, detachCmd.opts());
  });

addSharedOptions(detachCmd);

type AttachOptions = QueryOptions & {
  dev: boolean;
  peer: boolean;
  optional: boolean;
};

export async function attachDependencies(action: 'link' | 'unlink', packages: string[], options: AttachOptions) {
  intro(column([grey('Welcome to the'), pink('MonoPKG'), grey('linking wizard!')]));

  const title = actionLabelMaps.title[action];
  const endTitle = actionLabelMaps.end[action];
  const altTitle = actionLabelMaps.alt[action];

  if (!packages.length) {
    renderLine([txt('').lineTree(), txt(` No source packages to be ${altTitle} from.`).yellow().tree()]);

    const result = await selectPackages(library, {
      subTitle: `be ${altTitle} from`,
      cancelMessage: `Setup cancelled.`,
    });

    if (!result?.length) {
      return;
    }

    packages = result.map((p) => p.base);
  }

  renderLine([
    txt('').lineTree(),
    txt(` ${title} internal packages.`).grey().bullet(),
    ...packages.map((name) => txt(`▣ ${name}`).padding(1).green().tree()),
  ]);

  const { dev, peer, optional } = options;
  let scope: DependencyScope = dev
    ? 'devDependencies'
    : peer
      ? 'peerDependencies'
      : optional
        ? 'optionalDependencies'
        : ('' as DependencyScope);

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
      return outro(red('Setup cancelled.'));
    }
  }
  renderLine([txt('').lineTree(), txt(` Now pick the target packages to be ${altTitle} to.`).grey().tree()]);

  const targets = await selectPackages(library, {
    ...options,
    subTitle: `be ${endTitle}`,
    cancelMessage: 'Setup cancelled.',
    isHidden: (pkg) => {
      if (action === 'link') return false;
      return !pkg.hasDependency(...packages);
    },
  });

  if (!targets?.length) {
    return;
  }

  await tasks([
    ...targets.map((pkg) => {
      return {
        title: column([grey(`${title} packages to`), txt(pkg.base).color(pkg.color)]),
        task: async () => {
          if (action === 'link') {
            pkg.setDependency(scope, ...packages);
          } else {
            pkg.removeDependency(...packages);
          }

          return section([
            column([
              grey('Package'),
              txt(pkg.base).color(pkg.color),
              grey(`now ${action === 'link' ? 'depends on' : endTitle}:`),
            ]),
            ...packages.map((dep) =>
              txt(' ' + dep)
                .green()
                .tree(0)
            ),
          ]);
        },
      };
    }),
  ]);

  outro(green('Setup complete!'));
}
