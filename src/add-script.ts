import { Command } from 'commander';
import { configs, listAllPackages, listPackages, options, setPkgInfo, textStyle } from './core.js';

export const addScriptCmd = new Command()
  .configureHelp(configs)
  .command('add-script <name> <script>')
  .description('Add script to packages')
  .action((name: string, script: string) => {
    console.log(name, script);
    const { root, include, exclude } = options;

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    for (const pkg of targetPackages) {
      try {
        if (!pkg.meta.scripts) {
          pkg.meta.scripts = {};
        }

        pkg.meta.scripts[name] = script;

        setPkgInfo(pkg.path, pkg.meta);

        console.log(
          textStyle.blue(pkg.path, '⚡'),
          textStyle.grey('>'),
          `${textStyle.grey('scripts.')}${textStyle.yellow(name)}`,
          textStyle.grey('>'),
          textStyle.green(script)
        );
      } catch (error) {
        console.error(error);
      }
    }
  });

export const removeScriptCmd = new Command()
  .configureHelp(configs)
  .command('remove-script <name>')
  .description('Remove script from packages')
  .action((name: string) => {
    console.log(name);
    const { root, include, exclude } = options;

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    for (const pkg of targetPackages) {
      try {
        if (pkg.meta.scripts) {
          delete pkg.meta.scripts?.[name];

          setPkgInfo(pkg.path, pkg.meta);

          console.log(
            textStyle.blue(pkg.path, '⚡'),
            textStyle.grey('>'),
            `${textStyle.grey('scripts.')}${textStyle.red(name)}`,
            textStyle.grey('>'),
            textStyle.red('-')
          );
        }
      } catch (error) {
        console.error(error);
      }
    }
  });
