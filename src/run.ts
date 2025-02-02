import { Command } from 'commander';
import { addSharedOptions, configs, options } from './cli/config.js';
import { column, fgn, render, renderLine, setCtx, txt } from './utils/common.js';
import { Package, type ScriptBlock } from './core/package.js';
import { library, selectPackages, Workspace } from './core/index.js';
import type { QueryOptions } from './core/shared.js';
import { intro, outro } from '@clack/prompts';
import { darkGrey, green, grey, pink } from './utils/color.js';

export type ExecScope = {
  package: Package;
  scripts: ScriptBlock[];
};

export type ExecGroup = {
  space: Workspace;
  packages: ExecScope[];
};

export const runCmd = new Command()
  .configureHelp(configs)
  .command('run <scripts...>')
  .description('Run a script in packages.')
  .option('-s, --sequential', 'Run scripts sequentially.')
  .option('-b, --before-run <scripts...>', 'Run scripts before the main script.')
  .action(async (scripts: string[] = []) => {
    const { beforeRun = [], sequential } = runCmd.opts();

    intro(column([grey('Welcome to the'), pink('MonoPKG'), grey('script runner!')]));

    render([
      txt(` Running in ${sequential ? 'sequential' : 'parallel'} mode.`)
        .darkGrey()
        .tree(),
    ]);

    if (beforeRun?.length) {
      renderLine([
        txt('').lineTree(),
        txt(' Running the following before-run scripts:').grey().bullet(),
        ...beforeRun.map((s: string) => txt(` ▣ ${s}`).green().tree()),
      ]);
    }

    renderLine([
      txt('').lineTree(),
      txt(' Running the following scripts:').grey().bullet(),
      ...scripts.map((s: string) => txt(` ▣ ${s}`).green().tree()),
    ]);

    const packages = await selectPackages(library, {
      ...runCmd.opts(),
      subTitle: 'run the scripts in',
      cancelMessage: 'Script execution cancelled.',
      isHidden: (pkg) => !pkg.hasScript(...scripts),
    });

    if (!packages?.length) {
      return;
    }

    const maxSpace = packages.reduce((max, pkg) => {
      return Math.max(max, pkg.workspace.name.length);
    }, 0);
    const maxPackage = packages.reduce((max, pkg) => {
      return Math.max(max, pkg.base.length);
    }, 0);

    const clearSpace = setCtx('max-space', maxSpace + 1);
    const clearPackage = setCtx('max-package', maxPackage + 1);

    if (beforeRun?.length) {
      renderLine([
        txt('').lineTree(),
        column([
          txt(' Running before-run scripts').blue().tree(),
          darkGrey(`(${sequential ? 'Sequentially' : 'In parallel'}).`),
        ]),
        txt('').lineTree(),
      ]);

      if (sequential) {
        for (const pkg of packages) {
          await pkg.run(beforeRun, true);
        }
      } else {
        await Promise.all(packages.map((pkg) => pkg.run(beforeRun, true)));
      }

      renderLine([txt('').lineTree(), txt(' Before-run scripts completed.').green().bullet()]);
    }

    renderLine([
      txt('').lineTree(),
      column([txt(' Running scripts').blue().bullet(), darkGrey(`(${sequential ? 'Sequentially' : 'In parallel'}).`)]),
      txt('').lineTree(),
    ]);

    if (sequential) {
      for (const pkg of packages) {
        await pkg.run(scripts, true);
      }
    } else {
      await Promise.all(packages.map((pkg) => pkg.run(scripts)));
    }

    clearSpace();
    clearPackage();

    outro(green('Script execution completed.'));
  });

addSharedOptions(runCmd);

export const runCheckCmd = new Command()
  .configureHelp(configs)
  .command('check <scripts...>')
  .description('Check if a script exists in packages')
  .option('-b, --before-run <scripts...>', 'Run scripts before the main script')
  .action(async (scripts) => {
    const { beforeRun = [] } = runCmd.opts();
    const { beforeExecScopes, execScopes } = buildExecScopes(scripts, beforeRun, options);

    const logGroupScopes = (name: string, groups: ExecGroup[]) => {
      console.log(fgn.cyan(name, '- ⚡'));

      for (const group of groups) {
        console.log(group.space.style(group.space.name, '  - ⚡'));

        for (const scope of group.packages) {
          console.log(scope.package.style(scope.package.base, '    - ') + fgn.grey(':'));

          for (const ctx of scope.scripts) {
            const command = ctx.commands
              .map((c) => {
                return [fgn.blue(c.cmd), c.args.map((a) => fgn.lightGrey(a)).join(' ')].filter((s) => s).join(' ');
              })
              .join(fgn.grey(' && '));

            console.log(fgn.grey('      -'), fgn.green(ctx.name), fgn.grey('->'), command);
          }
        }

        console.log('');
      }
    };

    if (beforeExecScopes.length) logGroupScopes('Before run scripts:', beforeExecScopes);
    if (execScopes.length) logGroupScopes('Run scripts:', execScopes);
  });

addSharedOptions(runCheckCmd);
runCmd.addCommand(runCheckCmd);

function createExecContext(pkg: Package, scripts: string[]) {
  const scope = { package: pkg, scripts: [] } as ExecScope;

  for (const script of scripts) {
    const block = pkg.script(script);

    if (block) {
      scope.scripts.push(block);
    }
  }

  return scope;
}

export function buildExecScopes(scripts: string[] = [], beforeScripts: string[] = [], options: QueryOptions = {}) {
  const beforeExecScopes: ExecGroup[] = [] as ExecGroup[];
  const execScopes: ExecGroup[] = [] as ExecGroup[];

  for (const space of library.query(options)) {
    const rootBeforeScope: ExecGroup = {
      space,
      packages: [],
    };

    const rootScope: ExecGroup = {
      space,
      packages: [],
    };

    for (const pkg of space.packages) {
      const scope = createExecContext(pkg, scripts);
      const beforeScope = createExecContext(pkg, beforeScripts);

      if (beforeScope.scripts.length) rootBeforeScope.packages.push(beforeScope);
      if (scope.scripts.length) rootScope.packages.push(scope);
    }

    if (rootBeforeScope.packages.length) beforeExecScopes.push(rootBeforeScope);
    if (rootScope.packages.length) execScopes.push(rootScope);
  }

  return { beforeExecScopes, execScopes };
}
