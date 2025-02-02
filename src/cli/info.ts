import { Command } from 'commander';
import { addSharedOptions, configs } from './config.js';
import { clear, getCtx, icon, inline, render, renderCol, setCtx, txt } from '../utils/common.js';
import { Package } from '../core/package.js';
import { library } from '../core/index.js';
import type { QueryOptions } from '../core/shared.js';
import { darkGrey, yellow } from '../utils/color.js';

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
  .action((keyValues: string[]) => {
    const workspaces = library.query(infoCmd.opts());

    const keys = keyValues.map((keyVal) => keyVal.split('=')[0]);

    for (const space of workspaces) {
      if (!space.packages.length) continue;

      render([txt(icon(space.name)).color(space.color).tree(0)]);

      for (const pkg of space.packages) {
        render([txt(pkg.base).color(pkg.color).tree(1), txt(':').darkGrey()]);

        for (const keyVal of keyValues) {
          const [key, value] = keyVal.split('=');
          const current = pkg.get(key);
          pkg.set(key, value, false);

          if (current) {
            if (current === value) {
              render([
                txt(key).align(keys).grey().tree(2),
                txt(':').darkGrey(),
                ' ',
                txt(JSON.stringify(value)).green(),
              ]);
            } else {
              render([
                txt(key).align(keys).grey().tree(2),
                txt(':').darkGrey(),
                ' ',
                txt(JSON.stringify(current)).red().strike(),
                ' ',
                txt('->').darkGrey(),
                ' ',
                txt(JSON.stringify(value)).green(),
              ]);
            }
          } else {
            render([txt(key).align(keys).grey().tree(2), txt(':').darkGrey(), ' ', txt(JSON.stringify(value)).green()]);
          }
        }

        pkg.write();
      }
    }
  });

addSharedOptions(setInfoCmd);
infoCmd.addCommand(setInfoCmd);

const delInfoCmd = new Command()
  .configureHelp(configs)
  .command('del <keys...>')
  .usage('<keys...>')
  .description('Delete package information.')
  .action((keys) => {
    const workspaces = library.query(infoCmd.opts());

    for (const space of workspaces) {
      if (!space.packages.length) continue;

      render([txt(icon(space.name)).color(space.color).tree(0)]);

      for (const pkg of space.packages) {
        render([txt(pkg.base).color(pkg.color).tree(1), txt(':').darkGrey()]);

        for (const key of keys) {
          pkg.rem(key);

          render([txt(key).red().tree(2).strike()]);
        }

        pkg.write();
      }
    }
  });

addSharedOptions(delInfoCmd);
infoCmd.addCommand(delInfoCmd);

export const printInfos = (keys: string[], options: QueryOptions) => {
  const workspaces = library.query({ ...options });

  render([
    txt(icon(library.name)).green().beginTree(0),
    txt('[').darkGrey(),
    txt('v' + library.version).yellow(),
    txt(']').darkGrey(),
  ]);

  for (const space of workspaces) {
    const isLast = workspaces.indexOf(space) === workspaces.length - 1;

    render([txt(icon(space.name)).color(space.color).tree(0), txt(':').darkGrey()]);

    for (const pkg of space.packages) {
      const isLastPkg = space.packages.indexOf(pkg) === space.packages.length - 1;
      printPkgInfo(pkg, options.sort ? keys.sort((a, b) => a.localeCompare(b)) : keys, 0, isLast && isLastPkg);
      if (!isLastPkg) render(txt('').lineTree(1));
    }

    if (!isLast) {
      render(txt('').lineTree());
    }
  }
};

export const printPkgInfo = (pkg: Package, keys: string[], indent = 0, isEnd = false) => {
  const longestKey = keys.reduce((acc: number, key: string) => (key.length > acc ? key.length : acc), 0);

  renderCol([
    txt(pkg.base)
      .color(pkg.color)
      .tree(indent + 1),
    darkGrey('-'),
    inline([
      darkGrey('('),
      txt(pkg.name).color(pkg.color),
      darkGrey('@'),
      yellow(pkg.version),
      darkGrey(')'),
      txt(':').darkGrey(),
    ]),
  ]);

  for (const key of keys) {
    const isLast = keys.indexOf(key) === keys.length - 1;
    setCtx('align', longestKey);
    printValue(key, pkg.get(key), indent + 2, isEnd && isLast);
  }
};

export const printValue = (label: string, value: unknown, indent = 0, isEnd = false) => {
  const max = getCtx<number>('align');

  if (Array.isArray(value)) {
    render([txt(label).grey().tree(indent).align(max), txt(':').darkGrey()]);

    const align = (key: string) => key.padEnd(`${value.length - 1}`.length);

    for (let i = 0; i < value.length; i++) {
      const isLast = i === value.length - 1;
      printValue(align(`${i}`), value[i], indent, isEnd && isLast);
    }
  } else if (typeof value === 'object') {
    render([txt(label).grey().tree(indent).align(max), txt(':').darkGrey()]);

    deepPrint(value as Record<string, unknown>, indent, isEnd);
  } else {
    const lbl = txt(label).align(max);
    const pkg = library.get(clear(label).trim());

    if (pkg) {
      lbl.color(pkg.color);
    } else {
      lbl.grey();
    }

    render([
      lbl[isEnd ? 'endTree' : 'tree'](indent),
      txt(':').darkGrey(),
      ' ',
      txt(JSON.stringify(value ?? 'N/A')).green(),
    ]);
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
