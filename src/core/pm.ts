import type { DependencyScope } from './meta.js';

export type ScopeMaps = {
  [K in DependencyScope]: string;
};

export type ManagerMap = {
  name: string;
  label: string;
  add: string;
  exe: {
    cmd: string;
    arg?: string;
  };
  remove: string;
  link: string;
  unlink: string;
  scopes: ScopeMaps;
};

export type ManagerMaps = {
  [key: string]: ManagerMap;
};

export type CommandArgs = {
  cmd: string;
  arg: string;
  scopes: ScopeMaps;
};

const COMMON_SCOPES = {
  dependencies: '',
  devDependencies: '--dev',
  peerDependencies: '--peer',
  optionalDependencies: '--optional',
};

export const PACKAGE_MANAGERS: ManagerMaps = {
  bun: {
    name: 'bun',
    label: 'Bun',
    add: 'add',
    exe: {
      cmd: 'bun',
      arg: 'x',
    },
    link: 'link',
    remove: 'remove',
    scopes: COMMON_SCOPES,
    unlink: 'unlink',
  },
  npm: {
    name: 'npm',
    label: 'NPM',
    add: 'install',
    exe: {
      cmd: 'npx',
    },
    link: 'link',
    remove: 'uninstall',
    scopes: {
      dependencies: '--save',
      devDependencies: '--save-dev',
      peerDependencies: '--save-peer',
      optionalDependencies: '--save-optional',
    },
    unlink: 'unlink',
  },
  pnpm: {
    name: 'pnpm',
    label: 'PNPM',
    add: 'add',
    exe: {
      cmd: 'pnpm',
      arg: 'dlx',
    },
    link: 'link',
    remove: 'remove',
    scopes: COMMON_SCOPES,
    unlink: 'unlink',
  },
  yarn: {
    name: 'yarn',
    label: 'Yarn',
    add: 'add',
    exe: {
      cmd: 'yarn',
      arg: 'dlx',
    },
    link: 'link',
    remove: 'remove',
    scopes: COMMON_SCOPES,
    unlink: 'unlink',
  },
};

export const DEPENDENCY_SCOPE_MAPS: Record<string, string> = {
  '': 'dependencies',
  '--dev': 'devDependencies',
  '--peer': 'peerDependencies',
  '--optional': 'optionalDependencies',
  '--save': 'dependencies',
  '--save-dev': 'devDependencies',
  '--save-peer': 'peerDependencies',
  '--save-optional': 'optionalDependencies',
};

/**
 * Get package manager command arguments
 * @param {string} pm
 * @param {'add' | 'remove'} action
 * @param {DependencyScope} scope
 * @returns {CommandArgs}
 */
export const getPmArgs = (
  pm: keyof ManagerMaps | string,
  action: 'add' | 'remove' | 'link' | 'unlink',
  scope?: DependencyScope
): CommandArgs | void => {
  const manager = PACKAGE_MANAGERS[pm];
  if (!manager) return;

  const command = manager[action];
  if (!command) return;

  const scopes = manager.scopes;
  if (!scopes) return;

  return {
    cmd: command,
    arg: scope ? scopes[scope] : '',
    scopes,
  };
};

export const getExeCommand = (pm: keyof ManagerMaps | string) => {
  const manager = PACKAGE_MANAGERS[pm];
  if (!manager) return;

  return manager.exe;
};
