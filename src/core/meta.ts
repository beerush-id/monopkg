import { join, parse } from 'node:path';
import process from 'node:process';
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';

export const DEPENDENCY_SCOPES = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

export type FlatRecord = Record<string, string>;
export type Dependencies = Record<string, string>;
export type DependencyScope = 'dependencies' | 'devDependencies' | 'peerDependencies' | 'optionalDependencies';
export type PackageMeta = {
  type: string;
  name: string;
  version: string;
  description: string;
  scripts: FlatRecord;
  dependencies: Dependencies;
  devDependencies: Dependencies;
  peerDependencies: Dependencies;
  optionalDependencies: Dependencies;
} & {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

export type PackagePointer = {
  base: string;
  path: string;
  file: string;
};
export type PackagePointers = PackagePointer[];
export type MetaPointer = PackagePointer & { meta: PackageMeta };
export type MetaPointers = MetaPointer[];

const { root: rootDir } = parse(process.cwd());

/**
 * Read package meta from package.json
 * @param {string} path
 * @param {string} cwd
 * @returns {PackageMeta}
 */
export function readMeta(path: string, cwd?: string): PackageMeta | void {
  if (!path.startsWith(rootDir)) {
    path = join(cwd ?? process.cwd(), path);
  }

  if (!path.endsWith('package.json')) {
    path = join(path, 'package.json');
  }

  try {
    const pkgInfo = readFileSync(path, 'utf-8');

    return JSON.parse(pkgInfo) as PackageMeta;
  } catch (error) {
    if (error instanceof Error) {
      // console.error('Error reading package:', error);
    }
  }
}

/**
 * Write package meta to package.json
 * @param {string} path
 * @param {PackageMeta} meta
 * @param {string} cwd
 */
export function writeMeta(path: string, meta: PackageMeta, cwd?: string) {
  if (!path.startsWith(rootDir)) {
    path = join(cwd ?? process.cwd(), path);
  }

  if (!path.endsWith('package.json')) {
    path = join(path, 'package.json');
  }

  try {
    const pkgInfo = JSON.stringify(meta, null, 2);

    return writeFileSync(path, pkgInfo, 'utf-8');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error writing package:', error);
    }
  }
}

/**
 * List package pointers
 * @param {string} path
 * @param {string} cwd
 * @returns {PackagePointers}
 */
export function listPointers(path: string, cwd?: string): PackagePointers {
  if (!path.startsWith(rootDir)) {
    path = join(cwd ?? process.cwd(), path);
  }

  try {
    const dirs = readdirSync(path);

    return dirs
      .filter((dir) => {
        const base = join(path, dir);
        const file = join(base, 'package.json');

        return statSync(base).isDirectory() && existsSync(file);
      })
      .map((base) => ({
        base,
        path: join(path, base),
        file: join(path, base, 'package.json'),
      }));
  } catch (error) {
    if (error instanceof Error) {
      // console.error('Error reading directory:', error);
    }
  }

  return [];
}

/**
 * List package meta
 * @param {string} path
 * @param {string} cwd
 * @returns {MetaPointers}
 */
export function list(path: string, cwd?: string): MetaPointers {
  return listPointers(path, cwd).map(({ path, file, base }) => {
    return { base, path, file, meta: readMeta(file) as PackageMeta };
  });
}

/**
 * Get package manager of a package.
 * @param {PackageMeta} meta
 * @returns {string}
 */
export function getPm(meta: PackageMeta): string | undefined {
  return meta.packageManager?.includes('bun')
    ? 'bun'
    : meta.packageManager?.includes('yarn')
      ? 'yarn'
      : meta.packageManager?.includes('npm')
        ? 'npm'
        : meta.packageManager?.includes('pnpm')
          ? 'pnpm'
          : undefined;
}

export const actionLabelMaps = {
  title: {
    add: 'Adding',
    remove: 'Removing',
    link: 'Linking',
    unlink: 'Unlinking',
  },
  dir: {
    add: 'to',
    remove: 'from',
    link: 'to',
    unlink: 'from',
  },
  sub: {
    add: 'add to',
    remove: 'remove from',
    link: 'link to',
    unlink: 'unlink from',
  },
  end: {
    add: 'added to',
    remove: 'removed from',
    link: 'linked to',
    unlink: 'unlinked from',
  },
  alt: {
    add: 'added',
    remove: 'removed',
    link: 'linked',
    unlink: 'unlinked',
  },
};
