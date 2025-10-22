import { Command } from 'commander';
import { addSharedOptions, caption, configs, type FilterOptions, runTask } from './program.js';
import { clear, column, getCtx, icon, inline, section, setCtx, txt } from '../utils/common.js';
import { Package } from '../core/package.js';
import { library, selectPackages } from '../core/index.js';
import type { QueryOptions } from '../core/shared.js';
import { darkGrey, grey } from '../utils/color.js';
import { confirm, isCancel, multiselect } from '@clack/prompts';
import { listDirs } from '../core/meta.js';

export const infoCmd = new Command()
  .configureHelp(configs)
  .command('info')
  .usage('[command]')
  .description('Show information in packages.')
  .action(() => {
    printInfos(['name', 'version', 'description', 'type'], infoCmd.opts());
  });

addSharedOptions(infoCmd);

const getInfoCmd = new Command()
  .configureHelp(configs)
  .command('get <keys...>')
  .description('Get package information.')
  .usage('<keys...>')
  .option('--sort', 'Sort keys')
  .action((keys: string[]) => {
    printInfos(keys, infoCmd.opts());
  });

addSharedOptions(getInfoCmd);
infoCmd.addCommand(getInfoCmd);

const setInfoCmd = new Command()
  .configureHelp(configs)
  .command('set <key=value...>')
  .usage('<key=value...>')
  .description('Set package information.')
  .action(async (keyValues: string[]) => {
    const options = infoCmd.opts<FilterOptions>();
    caption.welcome('information updater!', options?.dry);

    const packages = await selectPackages(library, {
      ...options,
      subTitle: 'set information to',
      cancelMessage: 'Update information cancelled!',
    });

    if (!packages?.length) {
      return;
    }

    const keys = keyValues.map((keyVal) => keyVal.split('=')[0]);

    await runTask(
      packages.map((pkg) => {
        return {
          title: column([grey('Setting information for'), txt(pkg.name).color(pkg.color)]),
          task: async () => {
            const logs = [];

            for (const keyVal of keyValues) {
              const [key, value] = keyVal.split('=');
              const current = pkg.get(key);

              pkg.set(key, value, false);

              if (current) {
                if (current === value) {
                  logs.push(
                    inline([txt(key).align(keys).grey(), txt(':').darkGrey(), ' ', txt(JSON.stringify(value)).green()])
                  );
                } else {
                  logs.push(
                    inline([
                      txt(key).align(keys).grey(),
                      txt(':').darkGrey(),
                      ' ',
                      txt(JSON.stringify(current)).red().strike(),
                      ' ',
                      txt('->').darkGrey(),
                      ' ',
                      txt(JSON.stringify(value)).green(),
                    ])
                  );
                }
              } else {
                logs.push(
                  inline([txt(key).align(keys).grey(), txt(':').darkGrey(), ' ', txt(JSON.stringify(value)).green()])
                );
              }
            }

            if (!options.dry) {
              pkg.write();
            }

            return section([column([grey('Updated information for'), txt(pkg.name).color(pkg.color)]), ...logs]);
          },
        };
      })
    );

    caption.success('Information updated!');
  });

addSharedOptions(setInfoCmd);
infoCmd.addCommand(setInfoCmd);

const delInfoCmd = new Command()
  .configureHelp(configs)
  .command('del <keys...>')
  .usage('<keys...>')
  .description('Delete package information.')
  .action(async (keys) => {
    const options = infoCmd.opts<FilterOptions>();

    caption.welcome('information removal!', options.dry);

    const packages = await selectPackages(library, {
      ...options,
      subTitle: 'delete information from',
      cancelMessage: 'Delete information cancelled!',
    });

    if (!packages?.length) {
      return;
    }

    await runTask(
      packages.map((pkg) => {
        return {
          title: column([grey('Deleting information from'), txt(pkg.name).color(pkg.color)]),
          task: async () => {
            const logs = [];

            for (const key of keys) {
              pkg.rem(key);
              logs.push(inline([txt(key).red().strike()]));
            }

            if (!options.dry) {
              pkg.write();
            }

            return section([column([grey('Information deleted from'), txt(pkg.name).color(pkg.color)]), ...logs]);
          },
        };
      })
    );

    caption.success('Information removal completed!');
  });

addSharedOptions(delInfoCmd);
infoCmd.addCommand(delInfoCmd);

type ExportOptions = {
  module: string[];
  source: string;
  output: string;
  wildcard: boolean;
};

const exportCmd = new Command()
  .configureHelp(configs)
  .command('exports [paths...]')
  .usage('[paths...]')
  .description('Generate exports information in package.json.')
  .option('-m, --module [modules...]', 'Exported modules (esm, cjs, dts).')
  .option('-s, --source [path]', 'Source directory.', 'src')
  .option('-o, --output [path]', 'Output directory.', 'dist')
  .option('--wildcard', 'Add wildcard exports.')
  .action(async (paths: string[] = []) => {
    const infoOptions = infoCmd.opts<FilterOptions>();
    const options = exportCmd.opts<ExportOptions>();

    caption.welcome('exports generator!', infoOptions.dry);

    const packages = await selectPackages(library, {
      ...infoOptions,
      subTitle: 'generate exports for',
      cancelMessage: 'Exports generation cancelled!',
    });

    if (!packages) {
      return;
    }

    if (!options.module?.length) {
      const result = await multiselect({
        message: 'Which modules to export?',
        required: false,
        options: ['dts', 'svelte', 'esm', 'cjs'].map((mod) => ({ value: mod, title: mod })),
      });

      if (isCancel(result)) {
        return caption.cancel('Exports generation cancelled!');
      }

      options.module = result;
    }

    if (typeof options.wildcard === 'undefined') {
      const result = await confirm({
        message: 'Add wildcard exports?',
        initialValue: false,
      });

      if (isCancel(result)) {
        return caption.cancel('Exports generation cancelled!');
      }

      options.wildcard = result;
    }

    for (const pkg of packages) {
      let exportPaths = [...paths];

      if (exportPaths.includes('*')) {
        exportPaths = listDirs(options.source, pkg.pointer.path);
      }

      if (pkg.hasDependency('typescript')) {
        options.module.push('dts');
      }

      if (!exportPaths.length) {
        const dirs = listDirs(options.source, pkg.pointer.path);
        const result = await multiselect({
          message: column([grey('Which directories to export from'), txt(pkg.base).color(pkg.color), grey('package?')]),
          required: false,
          options: dirs.map((dir) => ({ value: dir, title: dir })),
        });

        if (isCancel(result)) {
          continue;
        }

        exportPaths = result;
      }

      await runTask([
        {
          title: inline([grey('Generating exports for '), txt(pkg.name).color(pkg.color), grey(':')]),
          task: async () => {
            const outRef = options.output.replace(/^[./]+/, '');
            const outDir = `./${outRef}`;
            const useSvt = options.module.includes('svelte');
            const useEsm = pkg.type === 'module' || options.module.includes('esm') || useSvt;
            const useCjs = pkg.type !== 'module' || options.module.includes('cjs');
            const useDts = options.module.includes('dts');
            const cjsIndex = `index.${useEsm ? 'cjs' : 'js'}`;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const maps: any = {};

            if (!Array.isArray(pkg.meta.files)) {
              pkg.meta.files = [];
            }

            if (!pkg.meta.files.includes(outRef)) {
              pkg.meta.files.push(outRef);
            }

            if (!pkg.meta.directories) {
              pkg.meta.directories = {};
            }

            pkg.meta.directories[outRef] = outDir;

            if (useDts) {
              pkg.meta.types = `${outDir}/index.d.ts`;
            } else {
              delete pkg.meta.types;
            }

            if (useSvt) {
              pkg.meta.svelte = `${outDir}/index.js`;
            } else {
              delete pkg.meta.svelte;
            }

            if (useCjs) {
              pkg.meta.main = `${outDir}/${cjsIndex}`;
            } else {
              delete pkg.meta.main;
            }

            if (useEsm) {
              pkg.meta.module = `${outDir}/index.js`;
            } else {
              delete pkg.meta.module;
            }

            maps['.'] = {};

            if (useDts) {
              maps['.'].types = `${outDir}/index.d.ts`;
            }

            if (useSvt) {
              maps['.'].svelte = `${outDir}/index.js`;
            }

            if (useEsm) {
              maps['.'].import = `${outDir}/index.js`;
            }

            if (useCjs) {
              maps['.'].require = `${outDir}/${cjsIndex}`;
            }

            for (const path of exportPaths) {
              const base = `${outDir}/${path}`;
              const key = `./${path}`;

              maps[key] = {};

              if (useDts) {
                maps[key].types = `${base}/index.d.ts`;
              }

              if (useSvt) {
                maps[key].svelte = `${base}/index.js`;
              }

              if (useEsm) {
                maps[key].import = `${base}/index.js`;
              }

              if (useCjs) {
                maps[key].require = `${base}/${cjsIndex}`;
              }

              if (options.wildcard) {
                maps[key + '/*'] = `${base}/*`;
              }
            }

            pkg.meta.exports = maps;

            printPkgInfo(pkg, ['main', 'module', 'types', 'svelte', 'exports', 'files', 'directories'], 0, false, true);
            inline.print(txt('').lineTree());

            if (!infoOptions.dry) {
              column.print([txt('Writing exports for').grey().tree(), txt(pkg.name).color(pkg.color)]);
              pkg.write(true);
            }

            return column([grey('Exports for'), txt(pkg.name).color(pkg.color), grey('generated!')]);
          },
        },
      ]);
    }

    caption.success('Exports generated!');
  });

addSharedOptions(exportCmd);
infoCmd.addCommand(exportCmd);

export const printInfos = (keys: string[], options: QueryOptions) => {
  const workspaces = library.query({ ...options });

  caption.welcome('package information!');

  txt('').lineTree().print();

  inline.print([
    txt(icon(library.name)).green().tree(0),
    txt('[').darkGrey(),
    txt('v' + library.version).yellow(),
    txt(']').darkGrey(),
  ]);

  for (const space of workspaces) {
    const isLast = workspaces.indexOf(space) === workspaces.length - 1;

    inline.print([txt(icon(space.name)).color(space.color).tree(0), txt(':').darkGrey()]);

    for (const pkg of space.packages) {
      const isLastPkg = space.packages.indexOf(pkg) === space.packages.length - 1;
      printPkgInfo(pkg, options.sort ? keys.sort((a, b) => a.localeCompare(b)) : keys, 0, isLast && isLastPkg);
      if (!isLastPkg) inline.print(txt('').lineTree(1));
    }

    if (!isLast) {
      inline.print(txt('').lineTree());
    }
  }

  caption.success('Information reading done!');
};

export const printPkgInfo = (pkg: Package, keys: string[], indent = 0, isEnd = false, simple?: boolean) => {
  const longestKey = keys.reduce((acc: number, key: string) => (key.length > acc ? key.length : acc), 0);

  if (!simple) {
    inline.print([
      txt(pkg.base)
        .color(pkg.color)
        .tree(indent + 1),
      darkGrey(':'),
    ]);
  }

  for (const key of keys) {
    const isLast = keys.indexOf(key) === keys.length - 1;
    setCtx('longest-key', longestKey);
    printValue(key, pkg.get(key), indent + (simple ? 0 : 2), isEnd && isLast);
  }
};

export const printValue = (label: string, value: unknown, indent = 0, isEnd = false) => {
  const max = getCtx<number>('longest-key');

  if (Array.isArray(value)) {
    inline.print([txt(label).grey().tree(indent).align(max), txt(':').darkGrey()]);

    const align = (key: string) => key.padEnd(`${value.length - 1}`.length);

    for (let i = 0; i < value.length; i++) {
      const isLast = i === value.length - 1;
      printValue(align(`${i}`), value[i], indent + 1, isEnd && isLast);
    }
  } else if (typeof value === 'object') {
    inline.print([txt(label).grey().tree(indent).align(max), txt(':').darkGrey()]);

    deepPrint(value as Record<string, unknown>, indent, isEnd);
  } else {
    const lbl = txt(label).align(max);
    const pkg = library.get(clear(label).trim());

    if (pkg) {
      lbl.color(pkg.color);
    } else {
      lbl.grey();
    }

    inline.print([lbl.tree(indent), txt(':').darkGrey(), ' ', txt(JSON.stringify(value ?? 'N/A')).green()]);
  }
};

export const deepPrint = (obj: Record<string, unknown>, indent = 0, isEnd = false) => {
  const keys = Object.keys(obj);
  const longestKey = keys.reduce((acc: number, key: string) => (key.length > acc ? key.length : acc), 0);
  const align = (key: string) => key.padEnd(longestKey);

  for (const key of keys) {
    const isLast = keys.indexOf(key) === keys.length - 1;
    printValue(align(key), obj[key], indent + 1, isEnd && isLast);
  }
};
