import { spawn } from 'node:child_process';
import { clear, column, getCtx, Icon, inline, renderCol, Spacer, TreeSign, txt } from '../utils/common.js';
import process from 'node:process';
import { type DependencyScope, type MetaPointer, type PackageMeta, readMeta, writeMeta } from './meta.js';
import { join } from 'node:path';
import { read, remove, write } from '@beerush/utils';
import { type Library } from './library.js';
import { type Workspace } from './workspace.js';
import { BASE_COLOR, RESOLVE_TIMEOUT, type ScriptCommand } from './shared.js';
import { blue, cyan, darkGrey, green } from '../utils/color.js';

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

export const STACK_RESOLVES = new Map<string, boolean>();

export class Package {
  public id = crypto.randomUUID();
  public base: string;
  public path: string;
  public meta: PackageMeta;
  public link: { library: string; workspace: string };

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

    for (const [name] of Object.entries({
      ...this.meta.dependencies,
      ...this.meta.devDependencies,
      ...this.meta.peerDependencies,
      ...this.meta.optionalDependencies,
    })) {
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
    this.path = join(root.path, pointer.base);

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

      if (pkg) {
        return (
          this.meta.dependencies?.[pkg.name] ||
          this.meta.devDependencies?.[pkg.name] ||
          this.meta.peerDependencies?.[pkg.name] ||
          this.meta.optionalDependencies?.[pkg.name]
        );
      }
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

  public write() {
    if (this.changes?.length) {
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

  public async run(scripts: string[], sequential?: boolean, dependent?: string, dry?: boolean): Promise<void[] | void> {
    const dependencies = this.dependencies;

    if (dependencies.length) {
      if (sequential) {
        for (const dep of dependencies) {
          for (const script of scripts) {
            await dep.run([script], true, this.createStyledId(script), dry);
          }
        }
      } else {
        await Promise.all(
          dependencies.map((dep) => {
            return Promise.all(
              scripts.map((script) => {
                return dep.run([script], false, this.createStyledId(script), dry);
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
          await this.exec(block, dependent, dry);
        }
      }

      return;
    } else {
      await Promise.all(
        scripts.map((script) => {
          const block = this.script(script);

          if (block) {
            return this.exec(block, dependent, dry);
          }
        })
      );
    }
  }

  private createStyledId(cmd: string) {
    return getExecLabel(this, cmd);
  }

  private async exec(block: ScriptBlock, dependent?: string, dry?: boolean) {
    const logId = this.createStyledId(block.name);
    const running = RUNNING_SCRIPTS.get(this)?.get(block.name);

    if (running) {
      return await running;
    }

    if (dependent) {
      renderCol([txt(dependent).tree(), txt(' depends on -> ').black().fillBlue(), logId]);
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
    renderCol([txt(logId).exec(), blue(pm), cyan('run'), green(block.name)]);

    const promise = execScript(pm, ['run', block.name], join(this.library.path, this.path), logId, debounce, dry);

    RUNNING_SCRIPTS.get(this)?.set(block.name, promise);
    await promise;

    if (current !== modified) {
      this.set(`scripts.${block.name}`, current, true);
    }
  }
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
        .left(maxSpace - pkg.base.length, Spacer.DOT),
    ]),
    darkGrey('.'),
    txt(pkg.base).color(pkg.color),
    darkGrey('['),
    green(cmd),
    darkGrey(']'),
  ]);
};

async function execScript(
  cmd: string,
  args: string[],
  cwd: string,
  logId: string,
  timeout = RESOLVE_TIMEOUT,
  dry?: boolean
) {
  let debounce = 0;
  let resolved = false;
  const startTime = Date.now();

  return new Promise((resolve, reject) => {
    const resolveQueue = () => {
      clearTimeout(debounce);

      debounce = setTimeout(() => {
        resolved = true;
        resolve('ok');

        renderCol([
          txt(logId).done(),
          txt(' ✓ Script processed. ').black().fillGreen(),
          green(`(${(Date.now() - startTime).toLocaleString()}ms)`),
        ]);
      }, timeout) as never;
    };

    if (dry) {
      resolveQueue();
      return;
    }

    const child = spawn(cmd, args, {
      cwd,
      stdio: ['inherit', 'pipe', 'pipe'],
      shell: true,
    });

    const print = (data: string) => {
      if (!resolved) {
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
            darkGrey(TreeSign.MIDDLE),
            darkGrey(Spacer.DASHED.repeat(prefixLength + 2)),
            inline([' ', line]),
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
    child.stderr.on('data', print);

    child.on('exit', (code) => {
      clearTimeout(debounce);

      if (!resolved) {
        renderCol([
          txt(logId).done(),
          txt(' ✓ Script completed. ').black().fillGreen(),
          green(`(${(Date.now() - startTime).toLocaleString()}ms)`),
        ]);

        resolved = true;
      }

      if (code === 0) {
        resolve('ok');
      } else {
        reject(new Error('Failed to run script.'));
      }
    });

    child.on('error', (error) => {
      clearTimeout(debounce);
      reject(error);
    });
  });
}
