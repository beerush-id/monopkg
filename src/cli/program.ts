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

export type OverrideOptions = {
  dry: boolean;
  yes: boolean;
};
export function addOverrides(command: Command) {
  command.option('-y, --yes', 'Skip interactive prompts and use default options.');
  command.option('--dry', 'Dry run without making changes.');
}

export type FilterOptions = OverrideOptions & {
  exclude: string[];
  filter: string[];
  workspace: string[];
};
export function addSharedOptions(command: Command, multi = true) {
  command.option('-e, --exclude <packages...>', 'Excluded packages (default: none).');
  command.option('-f, --filter <packages...>', 'Filter packages to be included (default: all).');

  if (multi) {
    command.option('-w, --workspace <workspaces...>', 'Filter packages by workspace (default: all).');
  } else {
    command.option('-w, --workspace <workspace>', 'Set the workspace scope.');
  }

  addOverrides(command);
}

export type SaveOptions = {
  dev: boolean;
  optional: boolean;
  peer: boolean;
};
export function addSharedSaveOptions(command: Command, action: string) {
  command.option('-d, --dev', `${action} as ${cyan('devDependencies')}.`);
  command.option('-o, --optional', `${action} as ${cyan('optionalDependencies')}.`);
  command.option('-p, --peer', `${action} as ${cyan('peerDependencies')}.`);
}

export const caption = {
  welcome: (message: string, dry?: boolean) => {
    if (dry) {
      section.print(['', txt(' Running in dry mode. No changes will be made. ').fillYellow().exec().black()]);
    }

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
  task: () => Promise<string | void | Error>;
};

export async function runTask(tasks: TaskInit | TaskInit[]) {
  if (!Array.isArray(tasks)) {
    tasks = [tasks];
  }

  for (const task of tasks) {
    writeExec(task.title);

    if (task.message) {
      section.print(txt(task.message).tree());
    }
    txt('').lineTree().print();

    try {
      const result = await task.task();

      if (result) {
        if (result instanceof Error) {
          writeError(result);
        } else {
          writeDone(result);
        }
      }
    } catch (error) {
      writeError(error as Error);
      return;
    }
  }
}

export const writeExec = (message: string) => {
  message.split('\n').forEach((line, i) => {
    if (i === 0) {
      section.print([txt('').lineTree(), txt(line).exec()]);
    } else {
      section.print(txt(line).tree());
    }
  });
};

export const writeDone = (message: string) => {
  message.split('\n').forEach((line, i) => {
    if (i === 0) {
      section.print(txt(line).done());
    } else {
      section.print(txt(line).tree());
    }
  });
};

export const writeError = (error: Error) => {
  error.message.split('\n').forEach((line, i) => {
    if (i === 0) {
      section.print(txt(line).error());
    } else {
      section.print(txt(line).tree());
    }
  });
};

export const writeLine = (message: string | ArrayBuffer) => {
  const text = message.toString().trim();

  if (text) {
    const lines = txt(text).lineTree();
    process.stdout.write(lines.text() + '\n');
  }
};
