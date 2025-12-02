import { spawn } from 'node:child_process';
import { clear, column, getCtx, glob, Icon, inline, Spacer, TreeSign, txt } from '../utils/common.js';
import process from 'node:process';
import { type DependencyScope, type MetaPointer, type PackageMeta, readMeta, writeMeta } from './meta.js';
import { join } from 'node:path';
import { read, remove, write } from '@beerush/utils';
import { type Library } from './library.js';
import { type Workspace } from './workspace.js';
import { BASE_COLOR, RESOLVE_TIMEOUT, type ScriptCommand } from './shared.js';
import { blue, COLOR, cyan, darkGrey, green } from '../utils/color.js';
import { caption } from '../cli/program.js';

export const PACKAGES = new Map<string, Package>();
export const LIBRARIES = new Map<string, Library>();
export const WORKSPACES = new Map<string, Workspace>();

export const LIBRARY_PACKAGES = new Map<string, Package[]>();
export const LIBRARY_WORKSPACES = new Map<string, Workspace[]>();
export const WORKSPACE_PACKAGES = new Map<string, Package[]>();

export const RUNNING_SCRIPTS = new Map<Package, Map<string, Promise<unknown>>>();
export const PACKAGE_CHANGES = new Map<Package, { key: string; value: unknown }[]>();

export type Dependent = {
  scope: DependencyScope;
  package: Package;
};

export type ScriptBlock = {
  name: string;
  package: Package;
  commands: ScriptCommand[];
};

export type RunOptions = {
  standalone?: boolean;
  sequential?: boolean;
  dependent?: string;
  strict?: boolean;
  dry?: boolean;
};

export const STACK_RESOLVES = new Map<string, boolean>();

export class Package {
  public id = crypto.randomUUID();
  public base: string;
  public path: string;
  public meta: PackageMeta;
  public link: { library: string; workspace: string };

  public newName?: string;
  public newPath?: string;

  public get type(): string {
    return this.meta.type;
  }

  public get name(): string {
    return this.meta.name;
  }

  public get version(): string {
    return this.meta.version;
  }

  public get description(): string {
    return this.meta.description;
  }

  public get isPublic(): boolean {
    return this.meta.publishConfig?.access === 'public';
  }

  public get isRestricted(): boolean {
    return this.meta.publishConfig?.access === 'restricted';
  }

  public get isPrivate(): boolean {
    return this.meta.private;
  }

  public get isPublishable(): boolean {
    return !this.isPrivate;
  }

  public get library(): Library {
    return LIBRARIES.get(this.link.library) as Library;
  }

  public get workspace(): Workspace {
    return WORKSPACES.get(this.link.workspace) as Workspace;
  }

  public get changes() {
    return PACKAGE_CHANGES.get(this);
  }

  public set changes(value) {
    PACKAGE_CHANGES.set(this, value as never);
  }

  public get dependents() {
    const packages = this.library.packages;
    const dependents: Dependent[] = [];

    for (const pkg of packages) {
      if (pkg.meta.dependencies?.[this.name]) dependents.push({ package: pkg, scope: 'dependencies' });
      if (pkg.meta.devDependencies?.[this.name]) dependents.push({ package: pkg, scope: 'devDependencies' });
      if (pkg.meta.peerDependencies?.[this.name]) dependents.push({ package: pkg, scope: 'peerDependencies' });
      if (pkg.meta.optionalDependencies?.[this.name]) dependents.push({ package: pkg, scope: 'optionalDependencies' });
    }

    return dependents;
  }

  public get dependencies() {
    const dependencies: Package[] = [];

    const targetDependencies = Object.entries({
      ...this.meta.dependencies,
      ...this.meta.devDependencies,
      ...this.meta.peerDependencies,
      ...this.meta.optionalDependencies,
    }).filter(([, value]) => value === 'workspace:*');

    for (const [name] of targetDependencies) {
      const dependency = this.library.get(name);

      if (dependency && !dependencies.includes(dependency)) {
        dependencies.push(dependency);
      }
    }

    return dependencies;
  }

  public style: (text: string, prefix?: string) => string;
  public color: number;

  constructor(
    public pointer: MetaPointer,
    root: Workspace
  ) {
    this.link = { library: root.link.library, workspace: root.id };
    this.base = pointer.base;
    this.path = join(root.path, pointer.base).replace(/\\/g, '/');

    PACKAGES.set(this.id, this);
    RUNNING_SCRIPTS.set(this, new Map());
    PACKAGE_CHANGES.set(this, []);

    if (pointer?.meta) {
      this.meta = pointer.meta;
    } else {
      this.meta = readMeta(this.path, this.library.path) as PackageMeta;
    }

    const packages = this.workspace.packages;
    const workspaces = this.library.workspaces;
    const spaceIndex = workspaces.findIndex((s) => s.name === root.name) ?? 0;

    this.color = BASE_COLOR + spaceIndex + packages.length + 10;
    this.style = (text: string, prefix: string = '') => {
      return `\x1b[38;5;${this.color}m${prefix ?? ''}${text}\x1b[0m`;
    };
  }

  public set<K extends keyof PackageMeta>(key: K, value: PackageMeta[K], save?: boolean) {
    const current = read<Record<string, unknown>>(this.meta, key as never);
    if (current === value) return;

    this.changes?.push({ key, value } as never);
    write<Record<string, unknown>>(this.meta, key as never, value);

    if (save) this.write();
  }

  public get<K extends keyof PackageMeta>(key: K): PackageMeta[K] {
    return read<Record<string, unknown>>(this.meta, key as never);
  }

  public rem<K extends keyof PackageMeta>(key: K, save?: boolean) {
    remove<Record<string, unknown>>(this.meta, key as never);
    this.changes?.push({ key, value: undefined } as never);

    if (save) this.write();
  }

  public hasScript(...scripts: string[]) {
    return scripts.some((name) => this.meta.scripts?.[name]);
  }

  public script(name: string) {
    const script = this.meta.scripts?.[name];

    if (script) {
      const commands: ScriptCommand[] = script.split('&&').map((cmdText) => {
        const [cmd, ...args] = cmdText.trim().split(/\s/g);
        const command: ScriptCommand = { cmd, args };

        command.hook = this.library.config.execHook?.(command);

        return command;
      });

      return { name, package: this, commands } as ScriptBlock;
    }
  }

  public dependsOn(...names: string[]) {
    this.setDependency('dependencies', ...names);
  }

  public devDependsOn(...names: string[]) {
    this.setDependency('devDependencies', ...names);
  }

  public peerDependsOn(...names: string[]) {
    this.setDependency('peerDependencies', ...names);
  }

  public optionalDependsOn(...names: string[]) {
    this.setDependency('optionalDependencies', ...names);
  }

  public setDependency(scope: DependencyScope, ...packages: string[]) {
    const changes = [];

    for (const name of packages) {
      const pkg = this.library.get(name);

      if (pkg) {
        if (!this.meta[scope]) {
          this.meta[scope] = {};
        }

        delete this.meta.dependencies?.[pkg.name];
        delete this.meta.devDependencies?.[pkg.name];
        delete this.meta.peerDependencies?.[pkg.name];
        delete this.meta.optionalDependencies?.[pkg.name];

        this.meta[scope][pkg.name] = 'workspace:*';

        const entries = Object.entries(this.meta[scope]);
        this.meta[scope] = Object.fromEntries(entries.sort(([a], [b]) => a.localeCompare(b)));

        changes.push({ key: pkg.name, value: 'workspace:*' });
      }
    }

    this.changes = changes;
    this.write();
  }

  public hasDependency(...packages: string[]) {
    return packages.some((name) => {
      const pkg = this.library.get(name);
      return (
        this.meta.dependencies?.[pkg?.name ?? name] ||
        this.meta.devDependencies?.[pkg?.name ?? name] ||
        this.meta.peerDependencies?.[pkg?.name ?? name] ||
        this.meta.optionalDependencies?.[pkg?.name ?? name]
      );
    });
  }

  public removeDependency(...packages: string[]) {
    const changes = [];

    for (const name of packages) {
      const pkg = this.library.get(name);

      if (pkg) {
        delete this.meta.dependencies?.[pkg.name];
        delete this.meta.devDependencies?.[pkg.name];
        delete this.meta.peerDependencies?.[pkg.name];
        delete this.meta.optionalDependencies?.[pkg.name];

        changes.push({ key: pkg.name, value: undefined });
      }
    }

    this.changes = changes;
    this.write();
  }

  public write(force?: boolean) {
    if (this.changes?.length || force) {
      writeMeta(this.path, this.meta, this.library.path);
      this.changes = [];
    }
  }

  public runStacks(scripts: string[]): Package[] {
    if (STACK_RESOLVES.get(this.id)) {
      return [];
    }

    const packages = [];

    for (const dep of this.dependencies) {
      const canRun = dep.hasScript(...scripts);

      if (canRun) {
        packages.push(...dep.runStacks(scripts));
      }
    }

    packages.push(this);

    STACK_RESOLVES.set(this.id, true);

    return packages;
  }

  public async run(
    scripts: string[],
    { standalone, sequential, dependent, dry, strict }: RunOptions
  ): Promise<void[] | void> {
    const dependencies = standalone ? [] : this.dependencies;

    if (dependencies.length) {
      if (sequential) {
        for (const dep of dependencies) {
          for (const script of scripts) {
            await dep.run([script], {
              standalone: false,
              sequential: true,
              dependent: this.createStyledId(script),
              strict,
              dry,
            });
          }
        }
      } else {
        await Promise.all(
          dependencies.map((dep) => {
            return Promise.all(
              scripts.map((script) => {
                return dep.run([script], {
                  standalone: false,
                  sequential: false,
                  dependent: this.createStyledId(script),
                  strict,
                  dry,
                });
              })
            );
          })
        );
      }
    }

    if (sequential) {
      for (const script of scripts) {
        const block = this.script(script);

        if (block) {
          await this.exec(block, dependent, dry, strict);
        }
      }
    } else {
      await Promise.all(
        scripts.map((script) => {
          const block = this.script(script);

          if (block) {
            return this.exec(block, dependent, dry, strict);
          }
        })
      );
    }
  }

  private createStyledId(cmd: string) {
    return getExecLabel(this, cmd);
  }

  private async exec(block: ScriptBlock, dependent?: string, dry?: boolean, strict?: boolean) {
    const logId = this.createStyledId(block.name);
    const running = RUNNING_SCRIPTS.get(this)?.get(block.name);

    if (running) {
      return await running;
    }

    if (dependent) {
      column.print([txt(dependent).tree(), txt(' depends on -> ').black().fillBlue(), logId]);
    }

    const current = this.get(`scripts.${block.name}`);
    const modified = block.commands
      .map((c) => {
        return [c.cmd, ...c.args].join(' ');
      })
      .join(' && ');

    if (modified !== current) {
      this.set(`scripts.${block.name}`, modified, true);
    }

    const pm = this.library.pm;
    const debounce = this.library.config?.execDebounce?.(block) ?? RESOLVE_TIMEOUT;
    column.print([txt(logId).exec(), blue(pm), cyan('run'), green(block.name)]);

    const promise = execScript({
      cmd: pm,
      args: ['run', block.name],
      cwd: join(this.library.path, this.path),
      logId,
      timeout: strict ? 0 : debounce,
      dry,
      strict,
    });

    RUNNING_SCRIPTS.get(this)?.set(block.name, promise);
    await promise;

    if (current !== modified) {
      this.set(`scripts.${block.name}`, current, true);
    }
  }
}

export function matchPkg(pkg: Package, ...filters: string[]) {
  return filters.some((filter) => {
    return pkg.name === filter || pkg.base === filter || glob(filter).test(pkg.base) || glob(filter).test(pkg.path);
  });
}

export const getMaxExecLabel = (packages: Package[]) => {
  return packages.reduce((max, pkg) => {
    const label = inline([pkg.workspace.name, pkg.base]);
    return Math.max(max, label.length);
  }, 0);
};

export const getExecLabel = (pkg: Package, cmd: string) => {
  const maxSpace = getCtx<number>('max-space') ?? 0;
  return inline([
    column([
      txt(Icon.CHECKED).color(pkg.workspace.color),
      txt(pkg.workspace.name)
        .color(pkg.workspace.color)
        .left(maxSpace - pkg.base.length, `—` as never),
    ]),
    darkGrey('»'),
    txt(pkg.base).color(pkg.color),
    darkGrey('['),
    green(cmd),
    darkGrey(']'),
  ]);
};

type ExecOptions = {
  cmd: string;
  args: string[];
  cwd?: string;
  dry?: boolean;
  timeout?: number;
  logId?: string;
  strict?: boolean;
};

export async function execScript({
  cmd,
  args,
  cwd = process.cwd(),
  logId = '',
  timeout = RESOLVE_TIMEOUT,
  dry = false,
  strict,
}: ExecOptions) {
  let debounce = 0;
  let resolved = false;
  const startTime = Date.now();

  return new Promise((resolve) => {
    const resolveQueue = () => {
      clearTimeout(debounce);

      debounce = setTimeout(() => {
        resolved = true;
        resolve('ok');

        column.print([
          txt(logId).done(),
          txt(' ✓ Script processed. ').black().fillGreen(),
          green(`(${(Date.now() - startTime).toLocaleString()}ms)`),
        ]);
      }, timeout) as never;
    };

    if (dry && timeout) {
      resolveQueue();
      return;
    }

    const child = spawn(cmd, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    });

    const print = (data: string, error?: boolean) => {
      if (!resolved && timeout) {
        resolveQueue();
      }

      const text = data.toString();
      const prefixLength = clear(logId).length;
      const maxLength = (process.stdout.columns ?? 80) - prefixLength - 6;
      const newLines = txt(text).wrap(maxLength).lines;
      const firstLine = newLines.shift();
      const nextLines = newLines
        .map((line) => {
          if (!line.trim()) return '';

          return inline([
            txt(TreeSign.MIDDLE).color(error ? COLOR.RED : COLOR.GREY_DARK),
            txt(Spacer.DASHED.repeat(prefixLength + 2)).color(error ? COLOR.RED : COLOR.GREY_DARK),
            inline([' ', error ? txt(clear(line)).red() : line]),
          ]);
        })
        .filter((l) => l)
        .join('\n');

      process.stdout.write(txt(logId).tree().text() + ' ' + firstLine + '\n');

      if (nextLines) {
        process.stdout.write(nextLines + '\n');
      }
    };

    child.stdout.on('data', print);
    child.stderr.on('data', (data) => print(data, true));

    child.on('exit', (code) => {
      clearTimeout(debounce);

      if (!resolved) {
        column.print([
          txt(logId)[code ? 'error' : 'done'](),
          txt(` ✓ Script ${code ? 'failed' : 'completed'}. `)
            .color(code ? COLOR.WHITE : COLOR.BLACK)
            .fill(code ? COLOR.RED : COLOR.GREEN),
          txt(`(${(Date.now() - startTime).toLocaleString()}ms)`).color(code ? COLOR.RED : COLOR.GREEN),
        ]);

        resolved = true;
      }

      if (code === 0) {
        resolve('ok');
      } else {
        if (strict) {
          caption.error(`Script executions exited: EXIT CODE ${code}`);
          process.exit(code ?? 1);
        }
      }
    });

    child.on('error', (error) => {
      clearTimeout(debounce);
      caption.error(error.message);
    });
  });
}
