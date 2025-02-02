import { Command } from 'commander';
import { addSharedOptions, configs } from './config.js';
import { printPkgInfo } from './info.js';
import { icon, render, renderCol, txt } from '../utils/common.js';
import { library } from '../core/index.js';

export const listCmd = new Command()
  .configureHelp(configs)
  .command('list')
  .description('List packages')
  .option('--public', 'Only list public packages')
  .option('--private', 'Only list private packages')
  .option('--restricted', 'Only list restricted packages')
  .option('--publishable', 'Only list publishable packages')
  .option('-I, --info <keys...>', 'Print package information')
  .action(async () => {
    const options = listCmd.opts();
    const workspaces = library.query(options, !options?.info?.length);

    render([
      txt(icon(library.name)).green().beginTree(0),
      txt('[').darkGrey(),
      txt('v' + library.version).yellow(),
      txt(']').darkGrey(),
    ]);

    if (!workspaces.length) {
      render([txt('<empty>').endTree(0).darkGrey()]);
    }

    for (const workspace of workspaces) {
      const isEnd = workspaces.indexOf(workspace) === workspaces.length - 1;

      render([txt(icon(workspace.name)).tree(0).color(workspace.color), txt(':').darkGrey()]);

      if (!workspace.packages.length) {
        render([txt('<empty>')[isEnd ? 'endTree' : 'tree'](1).darkGrey()]);
      }

      for (const pkg of workspace.packages) {
        const isLast = workspace.packages.indexOf(pkg) === workspace.packages.length - 1;

        if (Array.isArray(options.info)) {
          printPkgInfo(pkg, options.info, 0, isEnd && isLast);

          if (!isLast) {
            render(txt('').lineTree());
          }
        } else {
          renderCol([
            txt(pkg.base).color(pkg.color)[isEnd && isLast ? 'endTree' : 'tree'](1),
            txt(pkg.name).cyan(),
            txt(pkg.version).yellow(),
            txt(`(${pkg.path})`).grey(),
          ]);
        }
      }

      if (!isEnd) {
        render(txt('').lineTree());
      }
    }
  });

addSharedOptions(listCmd);
