import { Command } from 'commander';
import { addSharedOptions, caption, configs } from './program.js';
import { column, inline, section, setCtx, txt } from '../utils/common.js';
import { getMaxExecLabel } from '../core/package.js';
import { library, selectPackages } from '../core/index.js';
import { darkGrey } from '../utils/color.js';

export const runCmd = new Command()
  .configureHelp(configs)
  .command('run <scripts...>')
  .description('Run scripts in packages.')
  .option('-s, --sequential', 'Run scripts sequentially.')
  .option('-b, --before-run <scripts...>', 'Run scripts before the main script.')
  .action(async (scripts: string[] = []) => {
    const { beforeRun = [], sequential } = runCmd.opts();

    caption.welcome('script runner');

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
      isHidden: (pkg) => !pkg.hasScript(...scripts),
    });

    if (!packages?.length) {
      return;
    }

    const clearSpace = setCtx('max-space', getMaxExecLabel(packages));

    if (beforeRun?.length) {
      section.print([
        txt('').lineTree(),
        column([
          txt('Running before-run scripts').blue().tree(),
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

      section.print([txt('').lineTree(), txt(' Before-run scripts completed.').green().bullet()]);
    }

    section.print([
      txt('').lineTree(),
      column([txt('Running scripts').blue().bullet(), darkGrey(`(${sequential ? 'Sequentially' : 'In parallel'}).`)]),
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

    caption.success('Script execution completed.');
  });

addSharedOptions(runCmd);
