import { LIBRARIES, matchPkg, Package, WORKSPACE_PACKAGES, WORKSPACES } from './package.js';
import { type Library } from './library.js';
import { BASE_COLOR, PKG_QUERY_OPTIONS, type QueryOptions } from './shared.js';
import { list } from './meta.js';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

export class Workspace {
  public id = crypto.randomUUID();
  public link: { library: string };
  public packages: Package[] = [];

  public get library(): Library {
    return LIBRARIES.get(this.link.library) as Library;
  }

  public style: (text: string, prefix?: string) => string;
  public color: number;
  public scope?: string;

  constructor(
    library: Library,
    public name: string,
    public path: string,
    public code: string,
    load?: boolean
  ) {
    this.link = { library: library.id };

    WORKSPACES.set(this.id, this);
    WORKSPACE_PACKAGES.set(this.id, this.packages);

    const workspaces = this.library.workspaces;
    const spaceIndex = workspaces.length;
    const colorOffset = BASE_COLOR + spaceIndex * 2;

    this.color = (colorOffset + name.length) % 256;
    this.style = (text: string, prefix: string = '') => {
      return `\x1b[38;5;${this.color}m${prefix ?? ''}${text}\x1b[0m`;
    };

    if (load) this.load();
  }

  public load() {
    try {
      const metaUrl = pathToFileURL(join(this.library.path, this.name, 'workspace.json'));
      const metaText = readFileSync(metaUrl, 'utf8');
      const meta = JSON.parse(metaText);

      this.scope = meta?.scope ?? this.library.name;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Ignore
      // console.error(err);
    }
    const pointers = list(this.path, this.library.path);

    for (const pointer of pointers) {
      const pkg = new Package(pointer, this);
      this.packages.push(pkg);
      this.library.packages.push(pkg);
    }
  }

  public get(name: string) {
    return this.packages.find((pkg) => matchPkg(pkg, name));
  }

  public find(...names: string[]): Package[] {
    if (!names.length) return this.packages;
    return this.packages.filter((pkg) => matchPkg(pkg, ...names));
  }

  public query(options: QueryOptions): Package[] {
    if (!Object.keys(options).filter((o) => PKG_QUERY_OPTIONS.includes(o)).length) {
      return this.packages;
    }

    const result = this.find(...(options.filter ?? [])).filter((pkg) => {
      return !matchPkg(pkg, ...(options.exclude ?? []));
    });

    if (options.private) {
      return result.filter((pkg) => pkg.isPrivate);
    } else if (options.public) {
      return result.filter((pkg) => pkg.isPublic);
    } else if (options.restricted) {
      return result.filter((pkg) => pkg.isRestricted);
    } else if (options.publishable) {
      return result.filter((pkg) => pkg.isPublishable);
    }

    return result;
  }

  public async run(scripts: string[], query: QueryOptions = {}, sequential?: boolean) {
    const packages = this.query(query);

    if (sequential) {
      const results = [];

      for (const pkg of packages) {
        results.push(await pkg.run(scripts, { sequential }));
      }

      return results;
    }

    return await Promise.all(packages.map((pkg) => pkg.run(scripts, { sequential })));
  }
}
