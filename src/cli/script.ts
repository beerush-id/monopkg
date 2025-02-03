import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';
import { column, inline, section, txt } from '../utils/common.js';
import { library, selectPackages } from '../core/index.js';
import { outro, tasks } from '@clack/prompts';
import { cyan, darkGrey, green, grey, highlight } from '../utils/color.js';
import { writeMeta } from '../core/meta.js';

export const scriptCmd = new Command()
  .configureHelp(configs)
  .command('script')
  .usage('<command>')
  .description('Manage scripts in packages');

addSharedOptions(scriptCmd);

const addCmd = new Command()
  .configureHelp(configs)
  .command('add <name="script"...>')
  .usage('<name="script"...>')
  .description('Add scripts to packages')
  .option('--delimiter <delimiter>', 'Delimiter for scripts', '=')
  .action(async (scripts: string[]) => {
    const { delimiter = '=' } = scriptCmd.opts();

    scriptIntro();

    section.print([
      txt('').lineTree(),
      txt('Adding the following scripts:').grey().bullet(),
      ...scripts.map((s) => {
        const [name, script] = s.split(delimiter);

        return txt(inline([green(`${name}`), grey(delimiter), cyan(`"${script}"`)])).tree();
      }),
    ]);

    const packages = await selectPackages(library, {
      ...scriptCmd.opts(),
      subTitle: 'add scripts to',
      cancelMessage: 'Script addition cancelled.',
    });
    if (!packages?.length) {
      return;
    }

    await tasks(
      packages.map((pkg) => {
        return {
          title: column([grey('Adding scripts to'), txt(pkg.base).color(pkg.color)]),
          task: async () => {
            if (!pkg.meta.scripts) {
              pkg.meta.scripts = {};
            }

            for (const item of scripts) {
              const [name, script] = item.split(delimiter);
              pkg.meta.scripts[name] = script;
            }

            writeMeta(pkg.pointer.file, pkg.meta);

            return column([grey('Scripts added to'), txt(pkg.base).color(pkg.color)]);
          },
        };
      })
    );

    outro(
      inline([
        txt(' Scripts added to').white().fillDarkGrey(),
        txt(` ${packages.length} `).green().fillDarkGrey(),
        txt('packages. ').white().fillDarkGrey(),
      ])
    );
  });

addSharedOptions(addCmd);

const listCmd = new Command()
  .configureHelp(configs)
  .command('inspect [name...]')
  .usage('[name...]')
  .description('Inspect scripts in packages')
  .action(async (scripts: string[]) => {
    scriptIntro();

    section.print([
      txt('').lineTree(),
      txt('Inspecting the following scripts:').grey().bullet(),
      ...(scripts.length ? scripts : ['All']).map((s) => txt(green(`${s}`)).tree()),
    ]);

    const packages = await selectPackages(library, {
      ...scriptCmd.opts(),
      subTitle: 'inspect scripts in',
      cancelMessage: 'Script inspection cancelled.',
      isHidden: (pkg) => {
        if (!scripts.length) return false;
        return !scripts.some((s) => pkg.meta.scripts?.[s]);
      },
    });

    if (!packages?.length) {
      return;
    }

    for (const pkg of packages) {
      const keys = Object.keys(pkg.meta.scripts || {}).filter((name) =>
        scripts.length ? scripts.includes(name) : true
      );
      const inspected = keys.map((name) => {
        return txt(
          inline([txt(`${name}`).green().align(keys), darkGrey(': '), highlight(`"${pkg.meta.scripts?.[name]}"`)])
        ).tree(1);
      });

      if (inspected.length) {
        section.print([
          txt('').lineTree(),
          txt(column([grey('Scripts in'), inline([txt(pkg.base).color(pkg.color), darkGrey(':')])])).tree(),
          ...inspected,
        ]);
      }
    }

    outro(
      inline([
        txt(' Inspected scripts in').white().fillDarkGrey(),
        txt(` ${packages.length} `).green().fillDarkGrey(),
        txt('packages. ').white().fillDarkGrey(),
      ])
    );
  });

addSharedOptions(listCmd);

const remCmd = new Command()
  .configureHelp(configs)
  .command('remove <name...>')
  .usage('<name...>')
  .description('Remove scripts from packages')
  .action(async (scripts: string[]) => {
    scriptIntro();

    section.print([
      txt('').lineTree(),
      txt(' Removing the following scripts:').grey().bullet(),
      ...scripts.map((s) => txt(green(` ${s}`)).tree()),
    ]);

    const packages = await selectPackages(library, {
      ...scriptCmd.opts(),
      subTitle: 'remove scripts from',
      cancelMessage: 'Script removal cancelled.',
      isHidden: (pkg) => {
        return !scripts.some((s) => pkg.meta.scripts?.[s]);
      },
    });
    if (!packages?.length) {
      return;
    }

    await tasks(
      packages.map((pkg) => {
        return {
          title: column([grey('Removing scripts from'), txt(pkg.base).color(pkg.color)]),
          task: async () => {
            if (!pkg.meta.scripts) {
              pkg.meta.scripts = {};
            }

            for (const item of scripts) {
              delete pkg.meta.scripts?.[item];
            }

            writeMeta(pkg.pointer.file, pkg.meta);

            return column([grey('Scripts removed from'), txt(pkg.base).color(pkg.color)]);
          },
        };
      })
    );

    outro(
      inline([
        txt(' Scripts removed from').white().fillDarkGrey(),
        txt(` ${packages.length} `).green().fillDarkGrey(),
        txt('packages. ').white().fillDarkGrey(),
      ])
    );
  });

addSharedOptions(remCmd);

scriptCmd.addCommand(addCmd);
scriptCmd.addCommand(listCmd);
scriptCmd.addCommand(remCmd);

function scriptIntro() {
  caption.welcome('script manager!');
}
