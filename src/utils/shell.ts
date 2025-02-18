import { spawn, type SpawnOptions, spawnSync } from 'node:child_process';
import process from 'node:process';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { column, txt } from './common.js';

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

export function copyDir(src: string | URL, dest: string | URL, indent = 0) {
  if (typeof src === 'string') {
    src = pathToFileURL(src) as URL;
  }

  if (typeof dest === 'string') {
    dest = pathToFileURL(dest) as URL;
  }

  mkdirSync(dest, { recursive: true });
  column.print([
    txt('📂 ' + pathFromCwd(dest))
      .green()
      .tree(indent),
  ]);

  const files = readdirSync(src);

  for (const file of files) {
    const srcPath = new URL(join(src.href, file));
    const destPath = new URL(join(dest.href, file));
    const stat = statSync(srcPath);

    if (stat.isDirectory()) {
      copyDir(srcPath, destPath, indent + 1);
    } else {
      const data = readFileSync(srcPath, 'utf-8');
      writeFileSync(destPath, data);
      column.print([
        txt('🗃️ ' + pathFromCwd(destPath, dest))
          .cyan()
          .tree(indent + 1),
      ]);
    }
  }
}

export function pathFromCwd(url: string | URL, cwd?: string | URL) {
  if (!cwd) {
    cwd = process.cwd();
  }

  if (typeof cwd === 'string') {
    cwd = pathToFileURL(cwd) as URL;
  }

  if (typeof url === 'string') {
    url = pathToFileURL(url) as URL;
  }

  return url.href.replace(cwd.href, '').replace(/^\//, '');
}
