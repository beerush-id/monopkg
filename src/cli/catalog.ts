import { Command } from 'commander';
import { addOverrides, addSharedOptions, caption, configs } from './program.js';
import { column, inline, section, txt } from '../utils/common.js';
import { library } from '../core/index.js';

// Add this import for fetching from npm
import { type CatalogOptions } from './catalog/utils.js';
import { createCatalogGroup } from './catalog/create.js';
import { deleteCatalogGroups } from './catalog/delete.js';
import { addToCatalog } from './catalog/add.js';
import { removeFromCatalog } from './catalog/remove.js';
import { renameCatalogGroup } from './catalog/rename.js';
import { useCatalog } from './catalog/use.js';
import { ejectCatalog } from './catalog/eject.js';

export const catalogCmd = new Command()
  .configureHelp(configs)
  .command('catalog [command] [options]')
  .description('Manage package version catalog')
  .usage('[command] [options]')
  .action(async () => {
    await listCatalog(catalogCmd.opts());
  });

const createCmd = new Command()
  .command('create <name...>')
  .description('Create catalog group')
  .action(async (names: string[]) => {
    await createCatalogGroup(names, createCmd.opts());
  });

addOverrides(createCmd);
catalogCmd.addCommand(createCmd);

const addCmd = new Command()
  .command('add [packages...]')
  .description('Add packages to a catalog')
  .option('-c, --catalog <name>', 'Add to specific catalog group')
  .option('-g, --global', 'Add to global catalog')
  .action(async (packages: string[]) => {
    await addToCatalog(packages, addCmd.opts());
  });

addOverrides(addCmd);

const removeCmd = new Command()
  .command('remove [packages...]')
  .description('Remove packages from a catalog')
  .option('-c, --catalog <name>', 'Remove from specific catalog group')
  .option('-g, --global', 'Remove from global catalog')
  .action(async (packages: string[]) => {
    await removeFromCatalog(packages, removeCmd.opts());
  });

addOverrides(removeCmd);

const deleteCmd = new Command()
  .command('delete <name...>')
  .description('Delete catalog groups')
  .action(async (names: string[]) => {
    await deleteCatalogGroups(names, deleteCmd.opts());
  });

addOverrides(deleteCmd);
catalogCmd.addCommand(deleteCmd);

const renameCmd = new Command()
  .command('rename <oldName> <newName>')
  .description('Rename a catalog group')
  .action(async (oldName: string, newName: string) => {
    await renameCatalogGroup(oldName, newName, renameCmd.opts());
  });

addOverrides(renameCmd);
catalogCmd.addCommand(renameCmd);

const useCmd = new Command()
  .command('use [packages...]')
  .description('Use catalog versions in packages')
  .option('-c, --catalog <name>', 'Use specific catalog group')
  .option('-s, --save', 'Use as dependencies')
  .option('-d, --dev', 'Use as devDependencies')
  .option('-o, --optional', 'Use as optionalDependencies')
  .option('-p, --peer', 'Use as peerDependencies')
  .action(async (packages: string[]) => {
    await useCatalog(packages, useCmd.opts());
  });

addSharedOptions(useCmd);

const ejectCmd = new Command()
  .command('eject')
  .description('Flatten catalog versions to actual versions')
  .action(async () => {
    await ejectCatalog(ejectCmd.opts());
  });
addSharedOptions(ejectCmd);

catalogCmd.addCommand(addCmd);
catalogCmd.addCommand(useCmd);
catalogCmd.addCommand(removeCmd);
catalogCmd.addCommand(ejectCmd);

async function listCatalog(options: CatalogOptions) {
  caption.welcome('catalog list!', options.dry);

  const catalog = library.meta.catalog ?? {};
  const catalogs = library.meta.catalogs ?? {};

  // Display global catalog
  const entries = Object.entries(catalog);

  if (library.meta.catalog) {
    section.print([txt('').lineTree(), txt('Global:').grey().bullet()]);
  }

  if (entries.length > 0) {
    for (const [name, version] of entries) {
      inline.print([txt(name).green().tree(1), txt('@').darkGrey(), txt(version).yellow()]);
    }
  } else {
    if (library.meta.catalog) {
      inline.print(txt('(empty)').darkGrey().tree(1));
    }
  }

  // Display catalog groups
  const catalogGroups = Object.entries(catalogs);
  for (const [groupName, groupCatalog] of catalogGroups) {
    const groupEntries = Object.entries(groupCatalog as Record<string, string>);
    section.print([txt('').lineTree(), column([txt(`Catalog:`).grey().bullet(), txt(groupName).green()])]);

    if (groupEntries.length > 0) {
      for (const [name, version] of groupEntries) {
        inline.print([txt(name).green().tree(1), txt('@').darkGrey(), txt(version).yellow()]);
      }
    } else {
      inline.print(txt('(empty)').darkGrey().tree(1));
    }
  }

  caption.success('Catalog listing completed');
}
