import { type Command, type HelpConfiguration } from 'commander';
import { blue, cyan, green, grey, yellow } from '../utils/color.js';
import { intro, outro } from '@clack/prompts';
import { Icon, inline, section, txt } from '../utils/common.js';
import { spawn } from 'node:child_process';
import process from 'node:process';

export const configs: HelpConfiguration = {
  styleTitle: (str) => grey(str),
  styleCommandText: (str) => cyan(str),
  styleSubcommandText: (str) => yellow(str),
  styleOptionText: (str: string) => blue(str),
  styleArgumentText: (str: string) => green(str),
  styleDescriptionText: (str: string) => grey(str.replace(/^[a-z]/, (c) => c.toUpperCase())),
};

export function addSharedOptions(command: Command, multi = true) {
  if (multi) {
    command.option('-r, --root <roots...>', 'Root workspaces (default: none).');
  } else {
    command.option('-r, --root <root>', 'Root workspace.');
  }

  command.option('-f, --filter <packages...>', 'Filter packages to be included (default: none).');
  command.option('-e, --exclude <packages...>', 'Excluded packages (default: none).');
}

export const caption = {
  welcome: (message: string) => {
    inline.print('');
    intro(
      inline([
        txt(` Welcome to the`).white().fillDarkGrey(),
        txt(` ${Icon.BRAND} MonoPKG`).pink().fillDarkGrey(),
        txt(` ${message} `).white().fillDarkGrey(),
      ])
    );
  },
  success: (message: string) => {
    outro(txt(` ${message} `).black().fillGreen().text());
    inline.print('');
  },
  error: (message: string) => {
    outro(txt(` ${message} `).white().fillRed().text());
    inline.print('');
  },
  cancel: (message?: string) => {
    outro(
      txt(` ${message ?? 'Operation cancelled'} `)
        .black()
        .fillGrey()
        .text()
    );
    inline.print('');
  },
};

export async function exec(cmd: string, args: string[], opts?: { cwd: string }) {
  return new Promise<void>((resolve, reject) => {
    const shell = spawn(cmd, args, {
      ...opts,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    });

    shell.stdout.on('data', writeLine);
    shell.stderr.on('data', writeLine);

    shell.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });
  });
}

export type TaskInit = {
  title: string;
  message?: string;
  task: () => Promise<string | void>;
};

export async function runTask(tasks: TaskInit | TaskInit[]) {
  if (!Array.isArray(tasks)) {
    tasks = [tasks];
  }

  for (const task of tasks) {
    section.print([txt('').lineTree(), txt(task.title).bullet()]);

    if (task.message) {
      section.print(txt(task.message).tree());
    }
    txt('').lineTree().print();

    const result = await task.task();

    if (result) {
      section.print([txt('').lineTree(), txt(result).bullet()]);
    }
  }
}

export const writeLine = (message: string | ArrayBuffer) => {
  const text = message.toString().trim();

  if (text) {
    const lines = txt(text).lineTree();
    process.stdout.write(lines.text() + '\n');
  }
};
