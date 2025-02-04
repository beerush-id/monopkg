import type { PackageMeta } from './meta.js';
import type { ScriptBlock } from './package.js';

export const PKG_QUERY_OPTIONS = ['filter', 'exclude', 'private', 'public', 'restricted', 'publishable'];
export const BASE_COLOR = 200;
export const RESOLVE_TIMEOUT = 2500; // 2.5s

export type QueryOptions = {
  workspace?: string[];
  filter?: string[];
  private?: boolean;
  public?: boolean;
  restricted?: boolean;
  publishable?: boolean;
  exclude?: string[];
  sort?: boolean;
};
export type ScriptHook = (ctx: ScriptCommand) => void;
export type ScriptCommand = {
  cmd: string;
  args: string[];
  hook?: ScriptHook | void;
};
export type ProjectResolve = {
  path: string;
  initPath: string;
  meta?: PackageMeta;
  initMeta?: PackageMeta;
  lastPath?: string;
  lastMeta?: PackageMeta;
  endsPath?: string;
};
export type Debouncer = (ctx: ScriptBlock) => number;
export type ScriptHookBuilder = (ctx: ScriptCommand) => ScriptHook | void;
export type LibraryConfigs = {
  defaultRoot?: string;
  autoLoad?: boolean;
  execHook?: ScriptHookBuilder;
  execDebounce?: Debouncer;
};
