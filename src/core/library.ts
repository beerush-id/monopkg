import { join, parse } from 'node:path';
import process from 'node:process';
import { mkdirSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import {
  column,
  icon,
  inline,
  newLine,
  normalize,
  render,
  section,
  setCtx,
  shouldAngry,
  txt,
} from '../utils/common.js';
import { getPm, type PackageMeta, readMeta, writeMeta } from './meta.js';
import { LIBRARIES, LIBRARY_PACKAGES, LIBRARY_WORKSPACES, matchPkg, type Package } from './package.js';
import { Workspace } from './workspace.js';
import type { LibraryConfigs, ProjectResolve, QueryOptions } from './shared.js';
import { setupProject } from './setup.js';
import { cyan, darkGrey, green, grey, lightGreen, yellow } from '../utils/color.js';
import { isCancel, multiselect } from '@clack/prompts';
import { caption } from '../cli/program.js';

export class Library {
  public id = crypto.randomUUID();
  public path: string = process.cwd();
  public meta: PackageMeta = {} as never;
  public status: 'init' | 'ready' | 'error' = 'init';
  public packages: Package[] = [];
  public workspaces: Workspace[] = [];

  public get pm() {
    const pm = this.meta.packageManager ?? 'npm';
    return pm.includes('yarn') ? 'yarn' : pm.includes('pnpm') ? 'pnpm' : pm.includes('bun') ? 'bun' : 'npm';
  }

  public get name() {
    return this.meta.name;
  }

  public get styledName() {
    return green(icon(this.meta.name));
  }

  public get version() {
    return this.meta.version;
  }

  public get styledVersion() {
    return yellow('v' + this.meta.version);
  }

  public get styledId() {
    return [this.styledName, grey('['), this.styledVersion, grey(']')].join('');
  }

  public get description() {
    return this.meta.description;
  }

  public get type() {
    return this.meta.type;
  }

  public get workspace() {
    return this.getSpace(this.meta.defaultRoot ?? 'packages') as Workspace;
  }

  public constructor(public config: LibraryConfigs = {}) {
    if (!this.config) this.config = { defaultRoot: 'packages' };
    if (config?.autoLoad) this.load();

    LIBRARIES.set(this.id, this);
    LIBRARY_PACKAGES.set(this.id, this.packages);
    LIBRARY_WORKSPACES.set(this.id, this.workspaces);
  }

  public async init(isInit?: boolean) {
    let info = loadProject({ initPath: this.path, path: '.' });

    if (isInit) {
      info = (await setupProject({ isInit })) as ProjectResolve;

      if (!info) {
        return;
      }

      this.path = info.lastPath as string;
      this.meta = info.lastMeta as PackageMeta;
    }

    if (!isInit && !info.lastMeta) {
      newLine();
      section.print([
        yellow('▢ OUT OF PROJECT SCOPE'),
        column([txt('INFO:').indent(1).blue(), green('https://beerush-id.github.io/monopkg/guides/usage.html')]),
      ]);
      newLine();

      info = (await setupProject({ isInit })) as ProjectResolve;

      if (!info) {
        return;
      }
    }

    if (!isInit && !info.meta) {
      newLine();
      section.print([
        yellow('▢ OUT OF ROOT WORKSPACE'),
        column([txt('INFO:').indent(1).blue(), green('https://beerush-id.github.io/monopkg/guides/usage.html')]),
      ]);
      newLine();
      section.print([
        txt(' Current project:').green().beginTree(),
        column([txt(' name:').grey().tree(), cyan(info.lastMeta?.name ?? 'Unknown')]),
        column([txt(' version:').grey().tree(), yellow('v' + (info.lastMeta?.version ?? '0.0.1'))]),
        column([txt(' location:').grey().endTree(), green(info.lastPath ?? 'Unknown')]),
      ]);
      newLine();

      if (info.lastMeta) {
        info = (await setupProject({
          isUpgrade: true,
          name: info.lastMeta?.name,
          pm: getPm(info.lastMeta),
          initMeta: info.lastMeta,
        })) as ProjectResolve;

        if (!info) {
          return;
        }
      } else {
        return;
      }
    }

    this.path = info.endsPath ?? info.initPath;
    this.meta = info.meta as PackageMeta;

    if (this.meta.workspaces?.length && this.meta.type !== 'module') {
      this.meta.type = 'module';
      this.write();
    }

    try {
      const configs = await import(pathToFileURL(join(this.path, 'monopkg.config.js')).href);
      Object.assign(this.config, configs.default ?? {});
    } catch (err) {
      if (err instanceof Error) {
        // console.warn(textStyle.lightGrey(`   ${ err.message }`));
      }
    }

    this.status = 'ready';
  }

  public add(spaces: string[], mkdir = true, dry?: boolean, scopes?: Record<string, string>) {
    if (!Array.isArray(this.meta.workspaces)) this.meta.workspaces = [];

    for (let pattern of spaces) {
      if (!pattern.endsWith('/*')) pattern += '/*';
      const { name, path } = normalize(pattern);

      if (this.getSpace(name)) {
        continue;
      }

      this.meta.workspaces.push(pattern);

      const workspace = new Workspace(this, name, path, pattern);
      this.workspaces.push(workspace);

      if (mkdir && !dry) {
        const dir = join(this.path, path);
        mkdirSync(dir, { recursive: true });
        const scope = (scopes ?? {})[name];

        if (scope) {
          const content = JSON.stringify({ name, scope }, null, 2);
          writeFileSync(join(dir, 'workspace.json'), content);
        } else {
          writeFileSync(join(dir, '.gitkeep'), '', 'utf-8');
        }
      }
    }

    if (!dry) {
      this.write();
    }
  }

  public remove(spaces: string[], dry?: boolean) {
    if (!Array.isArray(this.meta.workspaces)) this.meta.workspaces = [];

    for (const pattern of spaces) {
      const { name } = normalize(pattern);
      const workspace = this.getSpace(name);

      if (workspace) {
        const index = this.meta.workspaces.indexOf(workspace.code);

        if (index >= 0) {
          this.meta.workspaces.splice(index, 1);
        }
      }
    }

    if (!dry) {
      this.write();
    }
  }

  public load(workspaces?: string[]) {
    for (const pattern of workspaces ?? (this.meta.workspaces as string[]) ?? []) {
      const { name, path } = normalize(pattern);
      const workspace = new Workspace(this, name, path, pattern, true);
      this.workspaces.push(workspace);
    }

    if (!this.config?.defaultRoot) {
      const pkgSpace = this.getSpace('packages');

      if (pkgSpace) {
        this.config!.defaultRoot = pkgSpace.name;
      } else {
        this.config!.defaultRoot = this.workspaces[0]?.name;
      }
    }
  }

  public get(name: string) {
    return this.packages.find((pkg) => matchPkg(pkg, name));
  }

  public getSpace(name: string): Workspace | void;
  public getSpace(options: QueryOptions): Workspace | void;
  public getSpace(name: string | QueryOptions): Workspace | void {
    if (typeof name === 'object' && Array.isArray(name.workspace)) {
      if (name.workspace.length) {
        return this.getSpace(name.workspace[0]);
      } else {
        return this.workspace;
      }
    }

    return this.workspaces.find((space) => space.name === name);
  }

  public find(...names: string[]) {
    if (!names.length) return this.packages;
    return this.packages.filter((pkg) => matchPkg(pkg, ...names));
  }

  public findSpace(...names: string[]) {
    if (!names.length) return this.workspaces;
    return this.workspaces.filter((space) => names.includes(space.name));
  }

  public filter(fn: (pkg: Package) => boolean) {
    return this.workspaces.map((space) => space.packages.filter(fn)).flat();
  }

  public filterSpace(fn: (space: Workspace) => boolean) {
    return this.workspaces.filter(fn);
  }

  public query(options: QueryOptions, withEmpty?: boolean) {
    const spaces = this.findSpace(...(options.workspace ?? []));
    const result: Workspace[] = [];

    for (const space of spaces) {
      const shadow = new Workspace(this, space.name, space.path, space.code);
      shadow.style = space.style;

      shadow.packages = space.query(options);

      if (shadow.packages.length || withEmpty) result.push(shadow);
    }

    return result;
  }

  public async run(scripts: string[], options: QueryOptions = {}, sequential?: boolean) {
    const startTime = Date.now();
    const spaces = this.query(options);

    const destroyPkgCtx = setCtx('longest-pkg', 0);
    const destroySpaceCtx = setCtx('longest-space', 0);

    if (sequential) {
      for (const space of spaces) {
        await space.run(scripts, options, sequential);
      }
    }

    await Promise.all(spaces.map((space) => space.run(scripts, options)));

    newLine();
    console.log(this.styledId, green('Scripts processed.'), grey(`(${Date.now() - startTime}ms)`));

    destroyPkgCtx();
    destroySpaceCtx();
  }

  public write() {
    writeMeta('.', this.meta, this.path);
  }
}

const { root: rootPath } = parse(process.cwd());

function loadProject(info: ProjectResolve): ProjectResolve {
  const next = join(process.cwd(), info.path);
  info.endsPath = next;

  if (next === rootPath) return info;

  try {
    const init = readMeta(info.path);

    if (!init) {
      info.path = `../${info.path}`;
      return loadProject(info);
    }

    if (!info.initMeta) {
      info.initMeta = init;
    }

    info.lastMeta = init;
    info.lastPath = next;

    if (!Array.isArray(init.workspaces)) {
      info.path = `../${info.path}`;
      return loadProject(info);
    }

    info.meta = init;

    return info;
  } catch (error) {
    if (error instanceof Error) {
      // console.error('Error loading package:', error);
    }
  }

  return info;
}

export type SelectOptions = QueryOptions & {
  title?: string;
  dirTitle?: string;
  subTitle?: string;
  endTitle?: string;
  cancelMessage?: string;
  yes?: boolean;
  isExcluded?: (pkg: Package) => boolean;
};

export const ALL_MARK = '*';

export async function selectPackages(library: Library, options: SelectOptions) {
  const { filter: include = [], exclude = [], subTitle } = options;
  let { workspace: root = [] } = options;

  if (!root?.length && options.yes) {
    root.push(ALL_MARK);
  }

  if (!include?.length && options.yes) {
    include.push(ALL_MARK);
  }

  if (root.includes(ALL_MARK)) {
    root = library.workspaces.map((space) => space.name);
  }

  let filter = [...include];

  if (include?.includes(ALL_MARK)) {
    filter = library.packages
      .filter((pkg) => {
        return !root?.length || root.includes(pkg.workspace.name);
      })
      .map((pkg) => pkg.base);
  }

  const workspaces = library.query({ workspace: root });

  if (!filter.length) {
    for (const space of workspaces) {
      const packages = space.packages
        .filter((pkg) => !options.isExcluded?.(pkg))
        .filter((pkg) => {
          return !matchPkg(pkg, ...exclude);
        })
        .map((pkg) => {
          return {
            value: pkg.base,
            label: inline([
              lightGreen(pkg.base),
              darkGrey(' '),
              txt(pkg.name).darkGreen(),
              darkGrey('@'),
              txt(pkg.version).darkYellow(),
            ]),
          };
        });

      if (!packages.length) {
        render(txt('').lineTree());
        render(
          txt(
            column([
              grey(`No packages available to ${subTitle} the`),
              txt(space.name).color(space.color),
              grey('workspace.'),
            ])
          ).tree()
        );
        continue;
      }

      const result = await multiselect({
        message: column([
          grey(`Select packages to ${subTitle} the`),
          txt(space.name).color(space.color),
          grey('workspace:'),
        ]),
        initialValues: [...include],
        options: [{ value: ALL_MARK, label: 'All' }, ...packages],
        required: false,
      });

      if (isCancel(result)) {
        return caption.cancel(options.cancelMessage);
      }

      if (result.join() === ALL_MARK) {
        filter.push(...packages.map((pkg) => pkg.value));
        continue;
      }

      for (const name of result.filter((name) => name !== ALL_MARK)) {
        if (!filter.includes(name)) {
          filter.push(name);
        }
      }
    }

    if (!filter.length) {
      if (shouldAngry()) {
        section.print([
          txt('').lineTree(),
          txt(' Come on! You gotta be kidding me!').red().lineTree(),
          txt(` You think I'm a God who can read your mind? I'm watching you! 😒`).red().lineTree(),
        ]);

        caption.error('Pfft! 😒 2lwsjfiwoeiwru ewoiru2o3u4oi 2roksajflsakj');
      } else {
        caption.cancel('No packages selected. Nothing to do.');
      }

      return;
    }
  }

  filter = filter.filter((name) => {
    const pkg = library.get(name);
    return pkg && !options.isExcluded?.(pkg);
  });

  if (!filter.length) {
    render(txt('').lineTree());
    render(txt(column([grey(`No packages available matching the filters to ${subTitle}.`)])).tree());
    caption.cancel(options.cancelMessage);
    return [];
  }

  return library.find(...filter).filter((pkg) => !matchPkg(pkg, ...exclude));
}
