import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';
import { printPkgInfo } from './info.js';
import { column, icon, inline, txt } from '../utils/common.js';
import { library } from '../core/index.js';

export const listCmd = new Command()
  .configureHelp(configs)
  .command('list')
  .description('List packages.')
  .option('--public', 'Only list public packages.')
  .option('--private', 'Only list private packages.')
  .option('--restricted', 'Only list restricted packages.')
  .option('--publishable', 'Only list publishable packages.')
  .option('-i, --info <keys...>', 'Print package information.')
  .action(async () => {
    const options = listCmd.opts();
    const workspaces = library.query(options, !options?.info?.length);

    caption.welcome('package listing!');

    txt('').lineTree().print();

    inline.print([
      txt(icon(library.name)).green().tree(0),
      txt('[').darkGrey(),
      txt('v' + library.version).yellow(),
      txt(']').darkGrey(),
    ]);

    if (!workspaces.length) {
      inline.print([txt('<empty>').endTree(0).darkGrey()]);
    }

    for (const workspace of workspaces) {
      const isEnd = workspaces.indexOf(workspace) === workspaces.length - 1;

      inline.print([txt(icon(workspace.name)).tree(0).color(workspace.color), txt(':').darkGrey()]);

      if (!workspace.packages.length) {
        inline.print([txt('<empty>').tree(1).darkGrey()]);
      }

      for (const pkg of workspace.packages) {
        const isLast = workspace.packages.indexOf(pkg) === workspace.packages.length - 1;

        if (Array.isArray(options.info)) {
          printPkgInfo(pkg, options.info, 0, isEnd && isLast);

          if (!isLast) {
            inline.print(txt('').lineTree());
          }
        } else {
          column.print([
            txt(pkg.base).color(pkg.color).tree(1),
            txt(pkg.name).cyan(),
            txt(pkg.version).yellow(),
            txt(`(${pkg.path})`).grey(),
          ]);
        }
      }

      if (!isEnd) {
        inline.print(txt('').lineTree());
      }
    }

    caption.success('Listing complete!');
  });

addSharedOptions(listCmd);
