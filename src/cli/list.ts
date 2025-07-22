import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';
import { printPkgInfo } from './info.js';
import { column, icon, inline, Spacer, TreeSign, txt } from '../utils/common.js';
import { library } from '../core/index.js';
import { join } from 'node:path';
import { search } from '../utils/search.js';

export const listCmd = new Command()
  .configureHelp(configs)
  .command('list')
  .description('List packages.')
  .option('--public', 'Only list public packages.')
  .option('--private', 'Only list private packages.')
  .option('--restricted', 'Only list restricted packages.')
  .option('--publishable', 'Only list publishable packages.')
  .option('--usage', "Show the package's dependents.")
  .option('--reference', "Show the package's usage in files.")
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

      if (!workspace.packages.length && options.filter) {
        continue;
      }

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
            inline([txt('v').darkGrey(), txt(pkg.version).yellow()]),
          ]);

          if (options.usage && pkg.dependents.length) {
            column.print([txt(TreeSign.BEGIN).darkGrey().tree(1), txt('Dependents:').darkGrey()]);

            for (let i = 0; i < pkg.dependents.length; ++i) {
              const { package: subPkg, scope } = pkg.dependents[i];
              const isLast = i >= pkg.dependents.length - 1;
              let files: Record<string, unknown>[] = [];

              if (options.reference) {
                const cwd = join(library.path, subPkg.path);
                files = search(pkg.name, {
                  cwd: join(library.path, subPkg.path),
                }).map((f) => {
                  return {
                    ...f,
                    path: f.file.replace(cwd, '').replace(/\\/g, '/').replace(/^\//, ''),
                  };
                });
              }

              column.print([
                txt(isLast && !files.length ? TreeSign.END : TreeSign.MIDDLE)
                  .darkGrey()
                  .tree(1),
                inline([
                  txt(subPkg.workspace.name).color(subPkg.workspace.color),
                  txt('/').darkGrey(),
                  txt(subPkg.base).color(subPkg.color),
                ]),
                txt(subPkg.name).cyan(),
                inline([txt('v').darkGrey(), txt(subPkg.version).yellow()]),
                column([txt('as').darkGrey(), txt(scope).green()]),
              ]);

              files.forEach((file, i) => {
                const isLastFile = i >= files.length - 1;
                column.print([
                  txt(isLast && isLastFile ? TreeSign.END : TreeSign.MIDDLE)
                    .darkGrey()
                    .tree(1),
                  txt(Spacer.BULLET + ' ' + file.path).darkGrey(),
                ]);
              });
            }
          }
        }
      }

      if (!isEnd) {
        inline.print(txt('').lineTree());
      }
    }

    caption.success('Listing complete!');
  });

addSharedOptions(listCmd);
