import { Command } from 'commander';
import { configs, listAllPackages, listPackages, options, setPkgInfo, textStyle } from './core.js';

export const versionCmd = new Command()
  .configureHelp(configs)
  .command('version [target]')
  .description('Bump or set package version (default: patch)')
  .action((target = 'patch') => {
    const { root, include, exclude } = options;

    const packages = root ? listPackages(root) : listAllPackages();
    const targetPackages = packages
      .filter((p) => (include ? include.includes(p.base) : true))
      .filter((p) => !exclude?.includes(p.base));

    for (const pkg of targetPackages) {
      try {
        let [major, minor, patch] = (pkg.version ?? '0.0.1').split('.');

        if (target === 'major') {
          major = String(Number(major) + 1);
          minor = '0';
          patch = '0';
        } else if (target === 'minor') {
          minor = String(Number(minor) + 1);
          patch = '0';
        } else if (target === 'patch') {
          patch = String(Number(patch) + 1);
        } else if (target.match(/^\d+\.\d+\.\d+$/)) {
          [major, minor, patch] = target.split('.');
        }

        pkg.meta.version = `${major}.${minor}.${patch}`;

        console.log(
          textStyle.blue(pkg.path, '⚡'),
          textStyle.grey('>'),
          textStyle.cyan('v' + pkg.version),
          textStyle.yellow(' -> '),
          textStyle.green('v' + pkg.meta.version)
        );

        setPkgInfo(pkg.path, pkg.meta);
      } catch (error) {
        console.error(error);
      }
    }
  });
