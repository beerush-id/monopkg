import { Command } from 'commander';
import {
  addOverrides,
  addSharedOptions,
  caption,
  configs,
  type FilterOptions,
  type OverrideOptions,
  runTask,
} from './program.js';
import { column, inline, section, txt } from '../utils/common.js';
import { isCancel, multiselect, select } from '@clack/prompts';
import { grey } from '../utils/color.js';
import { library, Package, selectPackages } from '../core/index.js';

// Add this import for fetching from npm
import { get } from 'node:https';

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
  .option('-i, --interactive', 'Interactive mode')
  .option('-c, --catalog <name>', 'Use specific catalog group')
  .action(async (packages: string[]) => {
    await useCatalog(packages, useCmd.opts());
  });

addSharedOptions(useCmd);

catalogCmd.addCommand(addCmd);
catalogCmd.addCommand(useCmd);
catalogCmd.addCommand(removeCmd);

type CatalogOptions = OverrideOptions & {
  catalog?: string;
  global?: boolean;
};
type UseOptions = FilterOptions & {
  catalog?: string;
};

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

async function createCatalogGroup(names: string[], options: CatalogOptions) {
  caption.welcome('catalog create!', options.dry);

  // Ensure catalogs exists
  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  const catalogs = library.meta.catalogs;

  for (const name of names) {
    if (!catalogs[name]) {
      catalogs[name] = {};
      inline.print(txt(`+ Created catalog group '${name}'`).green().tree());
    } else {
      inline.print(txt(`! Catalog group '${name}' already exists`).yellow().tree());
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success('Catalog groups created');
}

async function deleteCatalogGroups(names: string[], options: CatalogOptions) {
  caption.welcome('catalog delete!', options.dry);

  // Ensure catalogs exist
  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  const catalogs = library.meta.catalogs;

  for (const name of names) {
    if (name === 'global') {
      if (Object.keys(library.meta.catalog ?? {}).length > 0) {
        inline.print(txt(`! Cannot delete global catalog because it is not empty`).red().tree());
      } else {
        delete library.meta.catalog;
        inline.print(txt(`- Deleted global catalog`).red().tree());
      }
      continue;
    }

    if (catalogs[name]) {
      if (Object.keys(catalogs[name]).length > 0) {
        inline.print(txt(`! Cannot delete catalog group '${name}' because it is not empty`).red().tree());
      } else {
        delete catalogs[name];
        inline.print(txt(`- Deleted catalog group '${name}'`).red().tree());
      }
    } else {
      inline.print(txt(`! Catalog group '${name}' does not exist`).yellow().tree());
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success('Catalog groups deleted');
}

async function addToCatalog(packages: string[], options: CatalogOptions) {
  caption.welcome('catalog add!', options.dry);

  // Ensure catalogs exist
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  const catalogs = library.meta.catalogs;
  const globalCatalog = library.meta.catalog;

  // Determine target catalog
  let targetCatalog: Record<string, string> | null = null;
  let catalogName: string | null = null;

  if (options.global) {
    // Explicitly adding to global catalog
    targetCatalog = globalCatalog;
    catalogName = 'global';
  } else if (options.catalog) {
    // Adding to specific group
    if (!catalogs[options.catalog]) {
      catalogs[options.catalog] = {};
    }
    targetCatalog = catalogs[options.catalog] as Record<string, string>;
    catalogName = options.catalog;
  } else {
    // No target specified, prompt user
    const catalogOptions = [
      { value: 'global', label: 'Global' },
      ...Object.keys(catalogs).map((name) => ({ value: `group:${name}`, label: txt(name).green().text() })),
    ];

    if (catalogOptions.length === 1) {
      // Only global catalog exists
      targetCatalog = globalCatalog;
      catalogName = 'global';
    } else {
      // Let user choose
      const result = await select({
        message: grey('Select catalog to add packages to:'),
        options: catalogOptions,
      });

      if (isCancel(result)) {
        caption.cancel('Operation cancelled.');
        return;
      }

      if (result === 'global') {
        targetCatalog = globalCatalog;
        catalogName = 'global';
      } else if (result.startsWith('group:')) {
        const groupName = result.substring(6);
        if (!catalogs[groupName]) {
          catalogs[groupName] = {};
        }
        targetCatalog = catalogs[groupName] as Record<string, string>;
        catalogName = groupName;
      }
    }
  }

  if (!targetCatalog) {
    caption.cancel('No catalog selected.');
    return;
  }

  // If no packages provided, collect all dependencies and let user choose
  let packagesToAdd: string[] = [];
  if (packages.length === 0) {
    // Collect all dependencies from all packages
    const allDeps = new Map<string, string>(); // packageName -> highestVersion

    for (const pkg of library.packages) {
      // Check all dependency types
      const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
      for (const depType of depTypes) {
        if (pkg.meta[depType]) {
          for (const [depName, depVersion] of Object.entries(pkg.meta[depType])) {
            // Skip if it's already a catalog reference
            if ((depVersion as string).startsWith('catalog:')) {
              continue;
            }

            // Skip workspace/internal packages
            if ((depVersion as string).startsWith('workspace:')) {
              continue;
            }

            // If we don't have this package yet, or if this version is "higher"
            // For now, we'll just collect the first version we see, but in a real implementation
            // we might want to implement proper semver comparison
            if (!allDeps.has(depName) || compareVersions(depVersion as string, allDeps.get(depName) as string) > 0) {
              allDeps.set(depName, depVersion as string);
            }
          }
        }
      }
    }

    if (allDeps.size === 0) {
      caption.cancel('No external dependencies found in the library.');
      return;
    }

    // Interactive mode to select packages, sorted alphabetically
    const sortedDeps = Array.from(allDeps.entries()).sort((a, b) => a[0].localeCompare(b[0]));
    const result = await multiselect({
      message: grey(`Select packages to add to ${catalogName} catalog:`),
      options: [
        { value: 'all', label: 'All packages' },
        ...sortedDeps.map(([name, version]) => ({
          value: `${name}@${version}`,
          label: inline([txt(name).cyan(), txt('@').darkGrey(), txt(version).yellow()]),
        })),
      ],
      required: true,
    });

    if (isCancel(result)) {
      caption.cancel('Operation cancelled.');
      return;
    }

    // Handle "all" selection
    if ((result as string[]).includes('all')) {
      packagesToAdd = sortedDeps.map(([name, version]) => `${name}@${version}`);
    } else {
      packagesToAdd = result as string[];
    }
  } else {
    packagesToAdd = packages;
  }

  // Parse all packages concurrently and fetch versions when needed
  const parsedPackages = await Promise.all(packagesToAdd.map((pkg) => parsePackage(pkg)));

  // Add packages to catalog
  for (const pkg of parsedPackages.sort((a, b) => a.name.localeCompare(b.name))) {
    targetCatalog[pkg.name] = pkg.version;

    // Print warning for packages that failed to fetch
    if (pkg.fetchError) {
      inline.print(txt(`! Failed to fetch version for ${pkg.name}, using 'latest'`).red().tree());
    }

    inline.print([txt(`+ ${pkg.name}`).green().tree(), txt('@').darkGrey(), txt(pkg.version).yellow()]);
  }

  // Save to package.json
  if (!options.dry) {
    // Sort global catalog
    const orderedGeneralCatalog = Object.fromEntries(
      Object.entries(globalCatalog).sort((a, b) => a[0].localeCompare(b[0]))
    );
    library.meta.catalog = orderedGeneralCatalog;

    // Sort all catalog groups
    for (const [groupName, groupCatalog] of Object.entries(catalogs)) {
      const orderedGroupCatalog = Object.fromEntries(
        Object.entries(groupCatalog as Record<string, string>).sort((a, b) => a[0].localeCompare(b[0]))
      );
      catalogs[groupName] = orderedGroupCatalog;
    }

    library.write();
  }

  caption.success(`Packages added to ${catalogName} catalog`);
}

// Simple version comparison (in a real implementation, you might want to use a proper semver library)
function compareVersions(version1: string, version2: string): number {
  // For now, we'll just do a simple string comparison
  // In a real implementation, you'd want to use semver comparison
  if (version1 === version2) return 0;
  return version1 > version2 ? 1 : -1;
}

async function removeFromCatalog(packages: string[], options: CatalogOptions) {
  caption.welcome('catalog remove!', options.dry);

  // Ensure catalogs exist
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  // Handle different command variations
  if (packages.length === 0 && !options.catalog) {
    // Case 1: `catalog remove` - no package and catalog given, prompt to select from each catalog
    await handleRemoveFromEachCatalog(options);
    return;
  } else if (packages.length > 0 && !options.catalog) {
    // Case 2: `catalog remove react vite` - no catalog given, prompt to select which catalog to remove from
    await handleRemoveWithPackageSelection(packages, options);
    return;
  } else if (packages.length === 0 && options.catalog) {
    // Case 3: `catalog remove -c library` - package given, prompt to select package from the selected catalog
    await handleRemoveFromSpecificCatalog(options.catalog, options);
    return;
  } else {
    // Direct removal - packages and catalog both specified
    await handleDirectRemoval(packages, options);
    return;
  }
}

async function handleRemoveFromEachCatalog(options: CatalogOptions) {
  const globalCatalog = library.meta.catalog ?? {};
  const catalogs = library.meta.catalogs ?? {};

  // Check if there are any catalogs with packages
  const hasGeneralPackages = Object.keys(globalCatalog).length > 0;
  const hasGroupPackages = Object.values(catalogs).some((group) => Object.keys(group).length > 0);

  if (!hasGeneralPackages && !hasGroupPackages) {
    caption.cancel('All catalogs are empty.');
    return;
  }

  // Process global catalog first
  if (hasGeneralPackages) {
    const globalPackages = Object.keys(globalCatalog);
    const result = await multiselect({
      message: grey('Select packages to remove from global catalog:'),
      options: globalPackages.map((pkg) => ({ value: pkg, label: pkg })),
      required: false,
    });

    if (isCancel(result)) {
      caption.cancel('Operation cancelled.');
      return;
    }

    if (Array.isArray(result) && result.length > 0) {
      for (const pkgName of result) {
        const version = globalCatalog[pkgName];
        delete globalCatalog[pkgName];
        inline.print([
          txt(`- ${pkgName}`).red().tree(),
          txt('@').darkGrey(),
          txt(version).yellow(),
          txt(' (from global)').darkGrey(),
        ]);
      }
    }
  }

  // Process each catalog group
  for (const [groupName, groupCatalog] of Object.entries(catalogs)) {
    const groupCatalogTyped = groupCatalog as Record<string, string>;
    const groupPackages = Object.keys(groupCatalogTyped);

    if (groupPackages.length > 0) {
      const result = await multiselect({
        message: grey(`Select packages to remove from '${groupName}' catalog:`),
        options: groupPackages.map((pkg) => ({ value: pkg, label: pkg })),
        required: false,
      });

      if (isCancel(result)) {
        caption.cancel('Operation cancelled.');
        return;
      }

      if (Array.isArray(result) && result.length > 0) {
        for (const pkgName of result) {
          const version = groupCatalogTyped[pkgName];
          delete groupCatalogTyped[pkgName];
          inline.print([
            txt(`- ${pkgName}`).red().tree(),
            txt('@').darkGrey(),
            txt(version).yellow(),
            txt(` (from ${groupName})`).darkGrey(),
          ]);
        }
      }
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success('Packages removed from catalogs');
}

async function handleRemoveWithPackageSelection(packages: string[], options: CatalogOptions) {
  const globalCatalog = library.meta.catalog ?? {};
  const catalogs = library.meta.catalogs ?? {};

  // For each package, ask which catalog to remove it from
  for (const pkgName of packages) {
    // Find which catalogs contain this package
    const catalogOptions: { value: string; label: string }[] = [];

    if (globalCatalog[pkgName]) {
      catalogOptions.push({ value: 'global', label: `Global (${globalCatalog[pkgName]})` });
    }

    for (const [groupName, groupCatalog] of Object.entries(catalogs)) {
      const groupCatalogTyped = groupCatalog as Record<string, string>;
      if (groupCatalogTyped[pkgName]) {
        catalogOptions.push({
          value: `group:${groupName}`,
          label: `${groupName} catalog (${groupCatalogTyped[pkgName]})`,
        });
      }
    }

    if (catalogOptions.length === 0) {
      inline.print(txt(`! ${pkgName} (not found in any catalog)`).yellow().tree());
      continue;
    }

    if (catalogOptions.length === 1) {
      // Only one option, remove directly
      const option = catalogOptions[0];
      if (option.value === 'global') {
        const version = globalCatalog[pkgName];
        delete globalCatalog[pkgName];
        inline.print([
          txt(`- ${pkgName}`).red().tree(),
          txt('@').darkGrey(),
          txt(version).yellow(),
          txt(' (from global)').darkGrey(),
        ]);
      } else {
        const groupName = option.value.substring(6); // Remove 'group:' prefix
        const groupCatalog = catalogs[groupName] as Record<string, string>;
        const version = groupCatalog[pkgName];
        delete groupCatalog[pkgName];
        inline.print([
          txt(`- ${pkgName}`).red().tree(),
          txt('@').darkGrey(),
          txt(version).yellow(),
          txt(` (from ${groupName})`).darkGrey(),
        ]);
      }
    } else {
      // Multiple options, prompt user to select
      const result = await select({
        message: grey(`Select catalog to remove '${pkgName}' from:`),
        options: catalogOptions,
      });

      if (isCancel(result)) {
        caption.cancel('Operation cancelled.');
        return;
      }

      if (result === 'global') {
        const version = globalCatalog[pkgName];
        delete globalCatalog[pkgName];
        inline.print([
          txt(`- ${pkgName}`).red().tree(),
          txt('@').darkGrey(),
          txt(version).yellow(),
          txt(' (from global)').darkGrey(),
        ]);
      } else if (result.startsWith('group:')) {
        const groupName = result.substring(6); // Remove 'group:' prefix
        const groupCatalog = catalogs[groupName] as Record<string, string>;
        const version = groupCatalog[pkgName];
        delete groupCatalog[pkgName];
        inline.print([
          txt(`- ${pkgName}`).red().tree(),
          txt('@').darkGrey(),
          txt(version).yellow(),
          txt(` (from ${groupName})`).darkGrey(),
        ]);
      }
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success('Packages removed from catalogs');
}

async function handleRemoveFromSpecificCatalog(catalogName: string, options: CatalogOptions) {
  const globalCatalog = library.meta.catalog ?? {};
  const catalogs = library.meta.catalogs ?? {};

  // Validate catalog exists
  if (catalogName !== 'global' && !catalogs[catalogName]) {
    caption.cancel(`Catalog group '${catalogName}' does not exist.`);
    return;
  }

  // Get packages from the specified catalog
  let catalogPackages: string[] = [];
  if (catalogName === 'global') {
    catalogPackages = Object.keys(globalCatalog);
  } else {
    const groupCatalog = catalogs[catalogName] as Record<string, string>;
    catalogPackages = Object.keys(groupCatalog);
  }

  if (catalogPackages.length === 0) {
    caption.cancel(`Catalog '${catalogName}' is empty.`);
    return;
  }

  // Prompt user to select packages to remove
  const result = await multiselect({
    message: grey(`Select packages to remove from '${catalogName}' catalog:`),
    options: catalogPackages.map((pkg) => ({ value: pkg, label: pkg })),
    required: true,
  });

  if (isCancel(result)) {
    caption.cancel('Operation cancelled.');
    return;
  }

  // Remove selected packages
  if (Array.isArray(result) && result.length > 0) {
    for (const pkgName of result) {
      let version = '';
      if (catalogName === 'global') {
        version = globalCatalog[pkgName];
        delete globalCatalog[pkgName];
      } else {
        const groupCatalog = catalogs[catalogName] as Record<string, string>;
        version = groupCatalog[pkgName];
        delete groupCatalog[pkgName];
      }
      inline.print([
        txt(`- ${pkgName}`).red().tree(),
        txt('@').darkGrey(),
        txt(version).yellow(),
        txt(` (from ${catalogName})`).darkGrey(),
      ]);
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success(`Packages removed from '${catalogName}' catalog`);
}

async function handleDirectRemoval(packages: string[], options: CatalogOptions) {
  const globalCatalog = library.meta.catalog ?? {};
  const catalogs = library.meta.catalogs ?? {};

  // Determine target catalog
  let targetCatalog: Record<string, string> | null = null;
  let catalogName: string = '';

  if (options.global) {
    targetCatalog = globalCatalog;
    catalogName = 'global';
  } else if (options.catalog) {
    if (!catalogs[options.catalog]) {
      caption.cancel(`Catalog group '${options.catalog}' does not exist.`);
      return;
    }
    targetCatalog = catalogs[options.catalog] as Record<string, string>;
    catalogName = options.catalog;
  } else {
    caption.cancel('Catalog must be specified when providing packages directly.');
    return;
  }

  // Remove packages from the specified catalog
  for (const pkgName of packages) {
    if (targetCatalog[pkgName]) {
      const version = targetCatalog[pkgName];
      delete targetCatalog[pkgName];
      inline.print([
        txt(`- ${pkgName}`).red().tree(),
        txt('@').darkGrey(),
        txt(version).yellow(),
        txt(` (from ${catalogName})`).darkGrey(),
      ]);
    } else {
      inline.print(txt(`! ${pkgName} (not in ${catalogName} catalog)`).yellow().tree());
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success(`Packages removed from '${catalogName}' catalog`);
}

async function renameCatalogGroup(oldName: string, newName: string, options: CatalogOptions) {
  caption.welcome('catalog rename!', options.dry);

  // Ensure catalogs exist
  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  const catalogs = library.meta.catalogs;

  // Check if the old catalog exists
  if (!catalogs[oldName]) {
    caption.cancel(`Catalog group '${oldName}' does not exist.`);
    return;
  }

  // Check if the new catalog name already exists
  if (catalogs[newName]) {
    caption.cancel(`Catalog group '${newName}' already exists.`);
    return;
  }

  // First, update all packages that use the old catalog name
  let updatedPackagesCount = 0;
  const oldCatalogReference = `catalog:${oldName}`;
  const newCatalogReference = `catalog:${newName}`;

  for (const pkg of library.packages) {
    let packageUpdated = false;

    // Check all dependency types
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    for (const depType of depTypes) {
      if (pkg.meta[depType]) {
        for (const [depName, depVersion] of Object.entries(pkg.meta[depType])) {
          if (depVersion === oldCatalogReference) {
            pkg.meta[depType][depName] = newCatalogReference;
            packageUpdated = true;

            column.print([
              txt(`Updated`).darkGrey().tree(),
              txt(`${depName}`).cyan(),
              txt('in').darkGrey(),
              txt(`${pkg.name}`).green(),
              txt(`(${depType})`).darkGrey(),
            ]);
          }
        }
      }
    }

    // Save package if it was updated
    if (packageUpdated && !options.dry) {
      pkg.write();
      updatedPackagesCount++;
    }
  }

  // Rename the catalog
  catalogs[newName] = catalogs[oldName];
  delete catalogs[oldName];

  column.print([
    txt(`Renamed catalog group`).green().tree(),
    txt(`'${oldName}'`).red(),
    txt('→').darkGrey(),
    txt(`'${newName}'`).green(),
  ]);

  if (updatedPackagesCount > 0) {
    column.print([
      txt(`Updated`).green().tree(),
      txt(`${updatedPackagesCount}`).yellow(),
      txt('packages that were using the old catalog name').green(),
    ]);
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success('Catalog group renamed');
}

async function useCatalog(packages: string[], options: UseOptions) {
  caption.welcome('catalog use!', options.dry);

  // Ensure catalogs exist
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  const globalCatalog = library.meta.catalog;
  const catalogs = library.meta.catalogs;

  // Determine which catalog to use
  let selectedCatalogName: string | null = null;
  let selectedCatalog: Record<string, string> | null = null;

  if (options.catalog) {
    if (options.catalog === 'global') {
      selectedCatalogName = '';
      selectedCatalog = globalCatalog;
    } else if (catalogs[options.catalog]) {
      selectedCatalogName = options.catalog;
      selectedCatalog = catalogs[options.catalog] as Record<string, string>;
    } else {
      caption.cancel(`Catalog group '${options.catalog}' does not exist.`);
      return;
    }
  }

  // If no packages provided or interactive mode, let user select from catalog
  let selectedPackages: CatalogPackage[] = [];
  if (packages.length === 0) {
    // NEW APPROACH: Pick from each catalog separately instead of merging all catalogs
    if (selectedCatalog) {
      // If a specific catalog is selected, use the existing logic for that catalog only
      const catalogEntries = Object.entries(selectedCatalog);

      if (catalogEntries.length === 0) {
        caption.cancel(`Selected catalog '${selectedCatalogName || 'global'}' is empty.`);
        return;
      }

      // Sort catalog entries alphabetically
      catalogEntries.sort((a, b) => a[0].localeCompare(b[0]));

      // Create options with catalog information
      const packageOptions = catalogEntries.map(([name, version]) => ({
        value: name,
        label: inline([txt(name).cyan(), txt('@').darkGrey(), txt(version).yellow()]),
      }));

      const result = await multiselect({
        message: grey(`Select packages from ${selectedCatalogName || 'global'} catalog:`),
        options: [{ value: 'all', label: 'All packages' }, ...packageOptions],
        required: true,
      });

      if (isCancel(result)) {
        caption.cancel('Operation cancelled.');
        return;
      }

      // Handle "all" selection
      if ((result as string[]).includes('all')) {
        selectedPackages = catalogEntries.map(([name, version]) => ({
          name,
          version,
          catalog: selectedCatalogName || 'global',
        }));
      } else {
        selectedPackages = (result as string[]).map((name) => ({
          name,
          version: selectedCatalog![name],
          catalog: selectedCatalogName || 'global',
        }));
      }
    } else {
      // NEW: When no specific catalog is selected, prompt for each catalog separately

      // First, check if there are any packages in catalogs
      const hasGlobalPackages = Object.keys(globalCatalog).length > 0;
      const hasGroupPackages = Object.values(catalogs).some(
        (group) => Object.keys(group as Record<string, string>).length > 0
      );

      if (!hasGlobalPackages && !hasGroupPackages) {
        caption.cancel('Catalogs are empty. Add packages to catalog first.');
        return;
      }

      // Collect packages from global catalog first
      if (hasGlobalPackages) {
        const globalEntries = Object.entries(globalCatalog);
        globalEntries.sort((a, b) => a[0].localeCompare(b[0]));

        const globalOptions = globalEntries.map(([name, version]) => ({
          value: name,
          label: inline([txt(name).cyan(), txt('@').darkGrey(), txt(version).yellow()]),
        }));

        const globalResult = await multiselect({
          message: grey('Select packages from global catalog:'),
          options: [{ value: 'all', label: 'All packages' }, ...globalOptions],
          required: false,
        });

        if (isCancel(globalResult)) {
          caption.cancel('Operation cancelled.');
          return;
        }

        if ((globalResult as string[]).includes('all')) {
          selectedPackages.push(
            ...globalEntries.map(([name, version]) => ({
              name,
              version,
              catalog: 'global',
            }))
          );
        } else if (Array.isArray(globalResult)) {
          selectedPackages.push(
            ...(globalResult as string[]).map((name) => ({
              name,
              version: globalCatalog[name],
              catalog: 'global',
            }))
          );
        }
      }

      // Then collect packages from each group catalog
      for (const [groupName, groupCatalog] of Object.entries(catalogs)) {
        const groupCatalogTyped = groupCatalog as Record<string, string>;
        const groupEntries = Object.entries(groupCatalogTyped);

        if (groupEntries.length > 0) {
          groupEntries.sort((a, b) => a[0].localeCompare(b[0]));

          const groupOptions = groupEntries.map(([name, version]) => ({
            value: name,
            label: inline([txt(name).cyan(), txt('@').darkGrey(), txt(version).yellow()]),
          }));

          const groupResult = await multiselect({
            message: grey(`Select packages from '${groupName}' catalog:`),
            options: [{ value: 'all', label: 'All packages' }, ...groupOptions],
            required: false,
          });

          if (isCancel(groupResult)) {
            caption.cancel('Operation cancelled.');
            return;
          }

          if ((groupResult as string[]).includes('all')) {
            selectedPackages.push(
              ...groupEntries.map(([name, version]) => ({
                name,
                version,
                catalog: groupName,
              }))
            );
          } else if (Array.isArray(groupResult)) {
            selectedPackages.push(
              ...(groupResult as string[]).map((name) => {
                const version = groupCatalogTyped[name];
                return {
                  name,
                  version,
                  catalog: groupName,
                };
              })
            );
          }
        }
      }

      // Check if any packages were selected
      if (selectedPackages.length === 0) {
        caption.cancel('No packages selected.');
        return;
      }
    }
  } else {
    // Create a map of all packages with their catalogs
    const packageMap: Map<string, CatalogPackage[]> = new Map();

    // Add global catalog packages
    Object.entries(globalCatalog).forEach(([name, version]) => {
      if (!packageMap.has(name)) {
        packageMap.set(name, []);
      }
      packageMap.get(name)!.push({ name, version, catalog: 'global' });
    });

    // Add group catalog packages
    Object.entries(catalogs).forEach(([groupName, groupCatalog]) => {
      const groupCatalogTyped = groupCatalog as Record<string, string>;
      Object.entries(groupCatalogTyped).forEach(([name, version]) => {
        if (!packageMap.has(name)) {
          packageMap.set(name, []);
        }
        packageMap.get(name)!.push({ name, version, catalog: groupName });
      });
    });

    // Check if all requested packages exist
    const missingPackages: string[] = [];
    for (const pkg of packages) {
      if (!packageMap.has(pkg)) {
        missingPackages.push(pkg);
      }
    }

    if (missingPackages.length > 0) {
      section.print([txt('The following packages are not in any catalog:').yellow().bullet()]);
      missingPackages.forEach((pkg) => inline.print(txt(`! ${pkg}`).yellow().tree()));
      caption.cancel('Some packages are not in any catalog.');
      return;
    }

    // For each requested package, add it to selectedPackages
    // If it exists in multiple catalogs, prompt user to select which one
    for (const pkgName of packages) {
      const pkgOptions = packageMap.get(pkgName)!;
      if (pkgOptions.length === 1) {
        // Only exists in one catalog
        selectedPackages.push(pkgOptions[0]);
      } else {
        // Exists in multiple catalogs, prompt user to select
        const options = pkgOptions.map((pkgInfo) => ({
          value: JSON.stringify(pkgInfo),
          label: inline([
            txt(pkgInfo.name).cyan(),
            txt('@').darkGrey(),
            txt(pkgInfo.version).yellow(),
            txt(' (').darkGrey(),
            txt(pkgInfo.catalog === 'global' ? 'global' : `catalog:${pkgInfo.catalog}`).green(),
            txt(')').darkGrey(),
          ]),
        }));

        const result = await select({
          message: grey(`Select catalog for '${pkgName}':`),
          options,
        });

        if (isCancel(result)) {
          caption.cancel('Operation cancelled.');
          return;
        }

        selectedPackages.push(JSON.parse(result as string));
      }
    }
  }

  // Select target packages to update
  const targetPackages = await selectTargetPackages(options);
  if (!targetPackages) return;

  // Update the selected packages to use catalog versions
  await runTask(
    targetPackages.map((pkg) => {
      return {
        title: column([grey('Updating the'), txt(pkg.name).color(pkg.color), grey('package to use catalog versions:')]),
        message: column([grey('Used packages:'), ...selectedPackages.map((pkgInfo) => txt(pkgInfo.name).green())]),
        task: async () => {
          // Check all dependency types
          const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

          for (const pkgInfo of selectedPackages) {
            const { name: depName, catalog } = pkgInfo;
            // Determine which catalog this package belongs to
            let catalogReference = 'catalog:';
            if (catalog !== 'global') {
              catalogReference = `catalog:${catalog}`;
            }

            for (const depType of depTypes) {
              if (pkg.meta[depType]) {
                if (pkg.meta[depType][depName]) {
                  const oldVersion = pkg.meta[depType][depName];
                  pkg.set(`${depType}.${depName}`, catalogReference);

                  column.print([
                    txt(`${depType}:`).darkGrey().tree(),
                    inline([txt(depName).color(pkg.color), txt('@').darkGrey(), txt(oldVersion).red()]),
                    txt('->').darkGrey(),
                    inline([
                      txt(depName).color(pkg.color),
                      txt('@').darkGrey(),
                      txt(catalogReference).yellow(),
                      txt(pkgInfo.version).darkGrey(),
                    ]),
                  ]);
                }
              }
            }
          }

          if (!options.dry) {
            inline.print('Package written.');
            pkg.write();
          }

          return column([
            grey('Updated the'),
            txt(pkg.name).color(pkg.color),
            grey('package to use catalog versions.'),
          ]);
        },
      };
    })
  );

  caption.success('Packages updated to use catalog versions');
}

async function selectTargetPackages(options: UseOptions): Promise<Package[] | void> {
  // Select packages to update
  const packages = await selectPackages(library, {
    ...options,
    subTitle: 'update',
    cancelMessage: 'Operation cancelled.',
  });

  if (!packages) {
    return;
  }

  return packages;
}

type CatalogPackage = {
  name: string;
  version: string;
  catalog: string;
};

// Add this helper function to fetch package info from npm
function fetchPackageInfo(packageName: string): Promise<{ version: string }> {
  column.print([txt(`Fetching package info for`).darkGrey().tree(), txt(`${packageName}...`).green()]);

  return new Promise((resolve, reject) => {
    const url = `https://registry.npmjs.org/${encodeURIComponent(packageName)}`;

    get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            reject(new Error(`Package ${packageName} not found`));
            return;
          }

          resolve({
            version: parsed['dist-tags']?.latest || parsed.version || 'latest',
          });
        } catch (err) {
          reject(err);
        }
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// Helper function to parse package string and fetch version if needed
async function parsePackage(pkg: string): Promise<{ name: string; version: string; fetchError?: boolean }> {
  let name, version;
  if (pkg.startsWith('@')) {
    // Scoped package: @scope/name@version
    const splitIndex = pkg.indexOf('@', 1); // Find the first @ after the scope
    if (splitIndex === -1) {
      // No version specified: @scope/name
      name = pkg;
      try {
        const info = await fetchPackageInfo(name);
        version = info.version;
      } catch (err) {
        version = 'latest';
        console.error(`Error fetching package info for ${name}:`, err);
        return { name, version, fetchError: true };
      }
    } else {
      // Version specified: @scope/name@version
      name = pkg.substring(0, splitIndex);
      version = pkg.substring(splitIndex + 1) || 'latest';
    }
  } else {
    // Regular package: name@version
    const parts = pkg.split('@');
    name = parts[0];
    if (parts.length <= 1) {
      // No version specified, fetch from npm
      try {
        const info = await fetchPackageInfo(name);
        version = info.version;
      } catch (err) {
        version = 'latest';
        console.error(`Error fetching package info for ${name}:`, err);
        return { name, version, fetchError: true };
      }
    } else {
      version = parts[1] || 'latest';
    }
  }

  return { name, version };
}
