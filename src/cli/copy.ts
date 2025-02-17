import { Command } from 'commander';
import { addSharedOptions, caption, configs, runTask } from './program.js';
import { mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { isCancel, multiselect, select } from '@clack/prompts';
import { library, Package, selectPackages } from '../core/index.js';
import { column, glob, inline, section, txt } from '../utils/common.js';
import { cyan, darkGrey, green, grey } from '../utils/color.js';
import { join } from 'node:path';

const ignores = [
  'dist',
  '.git',
  'node_modules',
  'package.json',
  'package-lock.json',
  'yarn.lock',
  'bun.lockb',
  'pnpm-lock.yaml',
];

const includes = ['*ignore', '*.json', '*.js', '*.ts'];

export const copyCmd = new Command()
  .configureHelp(configs)
  .command('copy [files...]')
  .description('Copy files and directories.')
  .option('-s, --source <package>', 'Source package to copy from.')
  .action(async (files: string[]) => {
    const options = copyCmd.opts();

    caption.welcome('file copier!', options.dry);

    if (!options.source) {
      const result = (await select({
        message: grey('Which package do you want to copy from?'),
        options: library.packages.map((pkg) => {
          return {
            label: column([
              txt(pkg.base).color(pkg.color),
              inline([darkGrey('['), cyan(pkg.name), darkGrey(']')]),
              inline([darkGrey('('), grey(pkg.path), darkGrey(')')]),
            ]),
            value: pkg.name,
          };
        }),
      })) as string;

      if (isCancel(result)) {
        return caption.cancel('File copy cancelled!');
      }

      options.source = result;
    }

    const source = library.get(options.source) as Package;

    if (!source) {
      return caption.error(`Package "${options.source}" does not exist!`);
    }

    if (files.includes('*')) {
      files = readdirSync(join(library.path, source.path)).filter((file) => {
        return !ignores.some((key) => glob(key).test(file));
      });
    }

    if (!files?.length) {
      const paths = readdirSync(join(library.path, source.path)).filter((file) => {
        return !ignores.some((key) => glob(key).test(file));
      });
      const initialValues = paths.filter((file) => {
        return includes.some((key) => glob(key).test(file));
      });
      const result = await multiselect({
        message: grey('Which files do you want to copy?'),
        initialValues,
        options: paths.map((file) => {
          return {
            label: grey(file),
            value: file,
          };
        }),
      });

      if (isCancel(result)) {
        return caption.cancel('File copy cancelled!');
      }

      files = result;
    }

    if (!files?.length) {
      return caption.cancel('No files selected!');
    }

    const stats = files.map((file) => {
      const cwd = join(library.path, source.path);
      const path = join(cwd, file);
      const stats = statSync(path);

      return {
        cwd,
        file,
        path,
        isDirectory: stats.isDirectory(),
      };
    });

    section.print([
      txt('').lineTree(),
      column([
        txt('Copying the following files from').grey().bullet(),
        txt(source.base).color(source.color),
        grey('package:'),
      ]),
      ...files.map((file) => {
        return txt(file).green().tree();
      }),
    ]);

    const packages = await selectPackages(library, {
      ...options,
      subTitle: 'copy the selected files to',
      cancelMessage: 'File copy cancelled!',
      isExcluded: (current) => current.name === source.name,
    });

    if (!packages) {
      return;
    }

    await runTask([
      ...packages
        .filter((current) => current.name !== source.name)
        .map((pkg) => {
          return {
            title: column([grey('Copying files to'), txt(pkg.base).color(pkg.color), grey('package:')]),
            task: async () => {
              const cwd = join(library.path, pkg.path);

              for (const stat of stats) {
                const path = join(cwd, stat.file);

                if (!options.dry) {
                  if (stat.isDirectory) {
                    mkdirSync(path, { recursive: true });
                  } else {
                    const content = readFileSync(stat.path, 'utf-8');
                    writeFileSync(path, content, 'utf-8');
                  }
                }

                inline([txt(pkg.base).darkGrey().bullet(), darkGrey('/'), green(stat.file)]).print();
              }

              txt('').lineTree().print();

              return column([
                grey('Files copied to the'),
                txt(pkg.base).color(pkg.color),
                grey('package successfully!'),
              ]);
            },
          };
        }),
    ]);

    caption.success('File copy complete!');
  });

addSharedOptions(copyCmd);
