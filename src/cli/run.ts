import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';
import { column, inline, section, setCtx, txt } from '../utils/common.js';
import { getMaxExecLabel, STACK_RESOLVES } from '../core/package.js';
import { library, selectPackages } from '../core/index.js';
import { darkGrey } from '../utils/color.js';

export const runCmd = new Command()
  .configureHelp(configs)
  .command('run <scripts...>')
  .description('Run scripts in packages.')
  .option('-b, --before-run <scripts...>', 'Run scripts before the main script.')
  .option('-s, --strict', 'Wait for the dependencies to be resolved before running the script.')
  .option('--standalone', 'Run scripts in standalone mode without resolving dependencies.')
  .option('--sequential', 'Run scripts sequentially.')
  .action(async (scripts: string[] = []) => {
    const { beforeRun = [], sequential, dry, strict, standalone } = runCmd.opts();

    caption.welcome('script runner!', dry);

    inline.print([
      txt(`Running in ${sequential ? 'sequential' : 'parallel'} mode.`)
        .darkGrey()
        .tree(),
    ]);

    if (beforeRun?.length) {
      section.print([
        txt('').lineTree(),
        txt('Running the following before-run scripts:').grey().bullet(),
        ...beforeRun.map((s: string) => txt(`▣ ${s}`).green().tree()),
      ]);
    }

    section.print([
      txt('').lineTree(),
      txt('Running the following scripts:').grey().bullet(),
      ...scripts.map((s: string) => txt(`▣ ${s}`).green().tree()),
    ]);

    const packages = await selectPackages(library, {
      ...runCmd.opts(),
      subTitle: 'run the scripts in',
      cancelMessage: 'Script execution cancelled.',
      isExcluded: (pkg) => !pkg.hasScript(...scripts),
    });

    if (!packages?.length) {
      return;
    }

    if (beforeRun?.length) {
      const beforeStacks = packages.map((pkg) => pkg.runStacks(beforeRun)).flat();
      setCtx('max-space', getMaxExecLabel(beforeStacks));

      section.print([
        txt('').lineTree(),
        column([
          txt('Running before-run scripts').blue().exec(),
          darkGrey(`(${sequential ? 'Sequentially' : 'Parallel'}).`),
        ]),
        txt('').lineTree(),
      ]);

      if (sequential) {
        for (const pkg of packages) {
          await pkg.run(beforeRun, { sequential, strict, standalone, dry });
        }
      } else {
        await Promise.all(packages.map((pkg) => pkg.run(beforeRun, { sequential, strict, standalone, dry })));
      }

      section.print([txt('').lineTree(), txt(' Before-run script execution completed. ').black().fillGreen().done()]);
    }

    STACK_RESOLVES.clear();

    const stacks = packages.map((pkg) => pkg.runStacks(scripts)).flat();
    setCtx('max-space', getMaxExecLabel(stacks));

    section.print([
      txt('').lineTree(),
      column([txt('Running scripts').blue().exec(), darkGrey(`(${sequential ? 'Sequentially' : 'Parallel'}).`)]),
      txt('').lineTree(),
    ]);

    if (sequential) {
      for (const pkg of packages) {
        await pkg.run(scripts, { sequential, strict, standalone, dry });
      }
    } else {
      await Promise.all(packages.map((pkg) => pkg.run(scripts, { sequential, strict, standalone, dry })));
    }

    caption.success('Script execution completed.');
  });

addSharedOptions(runCmd);
