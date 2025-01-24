import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import process from 'node:process';
import { type HelpConfiguration, program } from 'commander';

export const textStyle = {
  green: (text: string, prefix?: string) => {
    return `\x1b[32m${prefix ?? ''}${text}\x1b[0m`;
  },
  red: (text: string, prefix?: string) => {
    return `\x1b[31m${prefix ?? ''}${text}\x1b[0m`;
  },
  grey: (text: string, prefix?: string) => {
    return `\x1b[90m${prefix ?? ''}${text}\x1b[0m`;
  },
  yellow: (text: string, prefix?: string) => {
    return `\x1b[33m${prefix ?? ''}${text}\x1b[0m`;
  },
  blue: (text: string, prefix?: string) => {
    return `\x1b[34m${prefix ?? ''}${text}\x1b[0m`;
  },
  lightGrey: (text: string, prefix?: string) => {
    return `\x1b[37m${prefix ?? ''}${text}\x1b[0m`;
  },
  cyan: (text: string, prefix?: string) => {
    return `\x1b[36m${prefix ?? ''}${text}\x1b[0m`;
  },
  bold: (text: string, prefix?: string) => {
    return `\x1b[1m${prefix ?? ''}${text}\x1b[0m`;
  },
  padding: (text: string, prefix?: string) => {
    return [prefix ?? '', ...Array.from({ length: text.length }).map((i) => ' ')].join('');
  }
};

export function getPkgInfo(path: string) {
  return JSON.parse(readFileSync(join(process.cwd(), path, 'package.json'), 'utf-8'));
}

export function setPkgInfo(path: string, meta: Record<string, unknown>) {
  return writeFileSync(
    join(process.cwd(), path, 'package.json'),
    JSON.stringify(meta, null, 2),
    'utf-8'
  );
}

const mainPkg = getPkgInfo('.');
export const mainName = textStyle.green(mainPkg.name);
export const mainVersion = textStyle.yellow(`v${mainPkg.version ?? '0.0.1'}`);
export const workspaces = ((mainPkg.workspaces as string[]) ?? []).map((w) => dirname(w));
export const defaultRoot =
  workspaces.find((w) => w.includes('packages')) ?? workspaces[0] ?? './packages';
const packageManager = mainPkg.packageManager ?? 'npm';
export const pm = packageManager.includes('yarn')
  ? 'yarn'
  : packageManager.includes('pnpm')
    ? 'pnpm'
    : packageManager.includes('bun')
      ? 'bun'
      : 'npm';

export function listPackages(root = defaultRoot) {
  return readdirSync(join(process.cwd(), root)).map((pkg) => {
    const path = join(root, pkg);
    const meta = getPkgInfo(path);

    return {
      base: pkg,
      name: meta.name,
      version: meta.version ?? '0.0.1',
      root,
      path,
      meta
    };
  });
}

export function listPublicPackages(root = defaultRoot) {
  return listPackages(root).filter((pkg) => pkg.meta.publishConfig?.access === 'public');
}

export const listPrivatePackages = (root = defaultRoot) => {
  return listPackages(root).filter((pkg) => pkg.meta.private);
};

export function listRestrictedPackages(root = defaultRoot) {
  return listPackages(root).filter((pkg) => pkg.meta.publishConfig?.access !== 'public');
}

export function listPublishablePackages(root = defaultRoot) {
  return listPackages(root).filter((pkg) => !pkg.meta.private);
}

export function listAllPackages() {
  return workspaces.map(listPackages).flat();
}

export const configs: HelpConfiguration = {
  styleTitle: (str) => textStyle.bold(str),
  styleCommandText: (str) => textStyle.cyan(str),
  styleSubcommandText: (str) => textStyle.yellow(str),
  styleOptionText: (str: string) => textStyle.blue(str),
  styleArgumentText: (str: string) => textStyle.green(str),
  styleDescriptionText: (str: string) =>
    textStyle.lightGrey(str.replace(/^[a-z]/, (c) => c.toUpperCase()))
};
export const options = program.opts();
