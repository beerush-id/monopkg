import { Command } from 'commander';
import {
  configs,
  listPackages,
  listPrivatePackages,
  listPublicPackages,
  listPublishablePackages,
  listRestrictedPackages,
  mainName,
  mainVersion,
  options,
  textStyle,
  workspaces
} from './core.js';

export const listCmd = new Command()
  .configureHelp(configs)
  .command('list')
  .description('List packages')
  .option('--public', 'Only list public packages')
  .option('--private', 'Only list private packages')
  .option('--restricted', 'Only list restricted packages')
  .option('--publishable', 'Only list publishable packages')
  .action(async () => {
    const opts = listCmd.opts();

    console.log(`Packages in ${mainName} ${mainVersion}:\n`);

    const usedWorkspaces = workspaces.filter((w) =>
      options.root ? options.root.includes(w) : true
    );

    for (const workspace of usedWorkspaces) {
      const packages = opts.public
        ? listPublicPackages(workspace)
        : opts.restricted
          ? listRestrictedPackages(workspace)
          : opts.publishable
            ? listPublishablePackages(workspace)
            : opts.private
              ? listPrivatePackages(workspace)
              : listPackages(workspace);

      console.log(`- ${textStyle.blue(workspace)}:`);

      for (const pkg of packages) {
        const version = textStyle.yellow(`v${pkg.version}`);
        const path = textStyle.cyan(`(${pkg.path})`);

        console.log(`  - ${textStyle.green(pkg.name)} ${version} ${path}`);
      }

      console.log();
    }
  });
