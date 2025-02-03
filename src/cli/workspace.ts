import { Command } from 'commander';
import { caption, configs } from './program.js';
import { column, icon, inline, section, txt } from '../utils/common.js';
import { isCancel, multiselect, tasks, text } from '@clack/prompts';
import { cyan, green, grey } from '../utils/color.js';
import { library } from '../core/index.js';

export const workspaceCmd = new Command()
  .configureHelp(configs)
  .command('workspace')
  .usage('<command>')
  .description('Manage workspaces in the project.');

const addCmd = new Command()
  .configureHelp(configs)
  .command('add [workspaces...]')
  .description('Add workspaces to the project.')
  .option('--cold', 'Skip creating new directories')
  .action(async (workspaces: string[] = []) => {
    const { cold } = workspaceCmd.opts();

    workspaceIntro();

    section.print([txt('').lineTree(), txt('Add workspaces to the project.').grey().bullet()]);

    const addSpace = async () => {
      const name = await text({
        message: 'What is the name of the workspace?',
        validate: (name: string) => {
          if (workspaces.includes(name)) {
            return 'Workspace already added.';
          }

          if (library.getSpace(name)) {
            return 'Workspace already exists.';
          }
        },
      });

      if (isCancel(name)) {
        return;
      }

      if (name) {
        workspaces.push(name);
        await addSpace();
      } else {
        return;
      }
    };

    if (!workspaces.length) {
      inline.print(txt('Press Enter without value when finished.').darkGrey().lineTree());
      await addSpace();
    }

    if (!workspaces.length) {
      return caption.cancel('No workspaces added.');
    }

    await tasks([
      {
        title: grey('Adding workspaces to the project...'),
        task: async () => {
          library.add(workspaces, !cold);

          return green('Workspaces added to the project.');
        },
      },
    ]);

    const newSpaces = library.findSpace(...workspaces);
    for (const space of newSpaces) {
      inline.print(
        column([
          txt(` ${icon(space.name)}`)
            .color(space.color)
            .tree(),
          grey('added.'),
        ])
      );
    }

    caption.success('Workspaces added to the project.');
  });

workspaceCmd.addCommand(addCmd);

const listCmd = new Command()
  .configureHelp(configs)
  .command('list')
  .description('List all workspaces in the project.')
  .option('-r, --recursive', `Includes its packages.`)
  .action(() => {
    const { recursive } = listCmd.opts();
    workspaceIntro();

    section.print([txt('').lineTree(), txt('Workspaces in the project:').grey().bullet()]);

    for (const space of library.workspaces) {
      column.print([
        txt(` ${icon(space.name)}`)
          .color(space.color)
          .tree(),
        grey(`-`),
        inline([grey('('), green(`${space.packages.length}`), grey(' packages)')]),
      ]);

      if (recursive) {
        if (!space.packages.length) {
          column.print([txt('<empty>').darkGrey().tree(1)]);
          continue;
        }

        for (const pkg of space.packages) {
          column.print([txt(` ${pkg.base}`).color(pkg.color).tree(1), cyan(pkg.name), grey(`(${pkg.path})`)]);
        }
      }
    }

    caption.success('Listing done!');
  });

workspaceCmd.addCommand(listCmd);

const removeCmd = new Command()
  .configureHelp(configs)
  .command('remove [workspaces...]')
  .description('Remove workspace from the project.')
  .action(async (workspaces: string[] = []) => {
    workspaceIntro();

    section.print([txt('').lineTree(), txt('Remove workspaces from the project.').grey().bullet()]);

    if (!workspaces.length) {
      const result = (await multiselect({
        message: 'Which workspaces do you want to remove?',
        options: library.workspaces.map((space) => ({
          label: space.name,
          value: space.name,
        })),
      })) as string[];

      if (isCancel(result)) {
        return caption.cancel('Workspace removal cancelled.');
      }

      workspaces.push(...result);

      if (!workspaces.length) {
        return caption.cancel('No workspaces selected.');
      }
    }

    await tasks([
      {
        title: grey('Removing workspaces from the project...'),
        task: async () => {
          library.remove(workspaces);
          return green('Workspaces removed from the project:');
        },
      },
    ]);
    for (const space of workspaces) {
      column.print([
        txt(` ${icon(space)}`)
          .red()
          .tree(),
        grey('removed.'),
      ]);
    }

    section.print([
      txt('').lineTree(),
      txt('You need to manually remove these directories:').yellow().bullet(),
      ...workspaces.map((space) => txt(` ./${space}`).green().tree()),
    ]);

    caption.success('Workspace removal complete!');
  });

workspaceCmd.addCommand(removeCmd);

const workspaceIntro = () => {
  caption.welcome('workspace manager!');
};
