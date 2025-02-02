import { spawn, type SpawnOptions, spawnSync } from 'node:child_process';
import process from 'node:process';

export type ShellOutput = {
  error?: Error;
  data: string;
  code: number | null;
};

export type ShellOptions = SpawnOptions & {
  onData?: (data: string) => void;
};

export function shell(command: string, args: string[], options: ShellOptions = {}) {
  const result: ShellOutput = { data: '', code: null };

  return new Promise<ShellOutput>((resolve, reject) => {
    const proc = spawn(command, args, {
      ...options,
      stdio: 'inherit',
      shell: true,
    });

    proc.on('error', (err) => {
      reject({ ...result, error: err });
    });

    proc.on('close', (code) => {
      if (code) {
        reject({ ...result, code, error: new Error(`Command failed with code ${code}`) });
      } else {
        resolve({ ...result, code });
      }
    });
  });
}

export function isGitClean(cwd = process.cwd()) {
  return spawnSync('git', ['status', '--porcelain'], { cwd }).stdout.toString().trim() === '';
}
