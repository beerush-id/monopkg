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
import { isCancel, multiselect } from '@clack/prompts';
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

const addCmd = new Command()
  .command('add [packages...]')
  .description('Add packages to the catalog')
  .action(async (packages: string[]) => {
    await addToCatalog(packages, addCmd.opts());
  });

addOverrides(addCmd);

const removeCmd = new Command()
  .command('remove [packages...]')
  .description('Remove packages from the catalog')
  .action(async (packages: string[]) => {
    await removeFromCatalog(packages, removeCmd.opts());
  });

addOverrides(removeCmd);

const useCmd = new Command()
  .command('use [packages...]')
  .description('Use catalog versions in packages')
  .option('-i, --interactive', 'Interactive mode')
  .action(async (packages: string[], options: { interactive?: boolean }) => {
    await useCatalog(packages, options, useCmd.opts());
  });

addSharedOptions(useCmd);

catalogCmd.addCommand(addCmd);
catalogCmd.addCommand(useCmd);
catalogCmd.addCommand(removeCmd);

type CatalogOptions = OverrideOptions;
type UseOptions = FilterOptions;

async function listCatalog(options: CatalogOptions) {
  caption.welcome('catalog list!', options.dry);

  // Ensure catalog exists
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  const catalog = library.meta.catalog;
  const entries = Object.entries(catalog);

  if (entries.length === 0) {
    inline.print(txt('Catalog is empty.').yellow().tree());
    caption.cancel('No packages in catalog.');
    return;
  }

  section.print([txt('').lineTree(), txt('Packages in catalog:').grey().bullet()]);

  for (const [name, version] of entries) {
    inline.print([txt(name).green().tree(), txt('@').darkGrey(), txt(version).yellow()]);
  }

  caption.success(`Found ${entries.length} package(s) in catalog`);
}

async function addToCatalog(packages: string[], options: CatalogOptions) {
  caption.welcome('catalog add!', options.dry);

  // Ensure catalog exists
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  const catalog = library.meta.catalog;

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
      message: grey('Select packages to add to catalog:'),
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
    catalog[pkg.name] = pkg.version;

    // Print warning for packages that failed to fetch
    if (pkg.fetchError) {
      inline.print(txt(`! Failed to fetch version for ${pkg.name}, using 'latest'`).red().tree());
    }

    inline.print([txt(`+ ${pkg.name}`).green().tree(), txt('@').darkGrey(), txt(pkg.version).yellow()]);
  }

  // Save to package.json
  if (!options.dry) {
    const orderedCatalog = Object.fromEntries(Object.entries(catalog).sort((a, b) => a[0].localeCompare(b[0])));
    const newCatalog: Record<string, string> = {};
    for (const [name, version] of Object.entries(orderedCatalog)) {
      newCatalog[name] = version;
    }

    library.meta.catalog = newCatalog;
    library.write();
  }

  caption.success('Packages added to catalog');
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

  // Ensure catalog exists
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  const catalog = library.meta.catalog;
  const catalogEntries = Object.entries(catalog);

  // If no packages provided, enter interactive mode
  let packagesToRemove: string[] = [];
  if (packages.length === 0) {
    if (catalogEntries.length === 0) {
      caption.cancel('Catalog is empty.');
      return;
    }

    // Interactive mode to select packages, sorted alphabetically
    const sortedEntries = catalogEntries.sort((a, b) => a[0].localeCompare(b[0]));
    const result = await multiselect({
      message: grey('Select packages to remove from catalog:'),
      options: [
        { value: 'all', label: 'All packages' },
        ...sortedEntries.map(([name, version]) => ({
          value: name,
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
      packagesToRemove = sortedEntries.map(([name]) => name);
    } else {
      packagesToRemove = result as string[];
    }
  } else {
    packagesToRemove = packages;
  }

  // Check if packages using catalog versions exist
  const packagesToUpdate: { pkg: Package; deps: { name: string; oldVersion: string }[] }[] = [];

  for (const pkg of library.packages) {
    const depsToUpdate: { name: string; oldVersion: string }[] = [];

    // Check all dependency types
    const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
    for (const depType of depTypes) {
      if (pkg.meta[depType]) {
        for (const [depName, depVersion] of Object.entries(pkg.meta[depType])) {
          if ((depVersion as string).startsWith('catalog:') && packagesToRemove.includes(depName)) {
            depsToUpdate.push({ name: depName, oldVersion: catalog[depName] || 'latest' });
          }
        }
      }
    }

    if (depsToUpdate.length > 0) {
      packagesToUpdate.push({ pkg, deps: depsToUpdate });
    }
  }

  // Update packages that use catalog versions
  if (packagesToUpdate.length > 0) {
    section.print([
      txt('').lineTree(),
      txt('The following packages use catalog versions that will be updated:').grey().bullet(),
    ]);

    for (const { pkg, deps } of packagesToUpdate) {
      inline.print(
        column([
          txt('Package:').grey().tree(),
          txt(pkg.base).color(pkg.color),
          grey('will replace catalog versions for:'),
          ...deps.map((d) => txt(`${d.name}@${d.oldVersion}`).green()),
        ])
      );
    }

    // Update the packages
    if (!options.dry) {
      for (const { pkg, deps } of packagesToUpdate) {
        for (const dep of deps) {
          const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];
          for (const depType of depTypes) {
            if (pkg.meta[depType] && pkg.meta[depType][dep.name] === `catalog:${dep.name}`) {
              pkg.meta[depType][dep.name] = dep.oldVersion;
            }
          }
        }
        // Save package.json
        pkg.write();
      }
    }
  }

  // Remove from catalog
  for (const pkgName of packagesToRemove) {
    if (catalog[pkgName]) {
      const version = catalog[pkgName] ?? 'latest';
      delete catalog[pkgName];
      inline.print([txt(`- ${pkgName}`).red().tree(), txt('@').darkGrey(), txt(version).yellow()]);
    } else {
      inline.print(txt(`! ${pkgName} (not in catalog)`).yellow().tree());
    }
  }

  // Save to package.json
  if (!options.dry) {
    library.write();
  }

  caption.success('Packages removed from catalog');
}

async function useCatalog(packages: string[], cmdOptions: { interactive?: boolean }, options: UseOptions) {
  caption.welcome('catalog use!', options.dry);

  // Ensure catalog exists
  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  const catalog = library.meta.catalog;

  // If no packages provided or interactive mode, let user select from catalog
  let selectedPackages: string[] = [];
  if (cmdOptions.interactive || packages.length === 0) {
    if (Object.keys(catalog).length === 0) {
      caption.cancel('Catalog is empty. Add packages to catalog first.');
      return;
    }

    // Sort catalog entries alphabetically
    const sortedEntries = Object.entries(catalog).sort((a, b) => a[0].localeCompare(b[0]));
    const result = await multiselect({
      message: grey('Select packages from catalog:'),
      options: [
        { value: 'all', label: 'All packages' },
        ...sortedEntries.map(([name, version]) => ({
          value: name,
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
      selectedPackages = sortedEntries.map(([name]) => name);
    } else {
      selectedPackages = result as string[];
    }
  } else {
    // Validate that all packages exist in catalog
    const missingPackages = packages.filter((pkg) => !catalog[pkg]);
    if (missingPackages.length > 0) {
      section.print([txt('The following packages are not in catalog:').yellow().bullet()]);
      missingPackages.forEach((pkg) => inline.print(txt(`! ${pkg}`).yellow().tree()));
      caption.cancel('Some packages are not in catalog.');
      return;
    }
    selectedPackages = packages;
  }

  // Select target packages to update
  const targetPackages = await selectTargetPackages(options);
  if (!targetPackages) return;

  // Update the selected packages to use catalog versions
  await runTask(
    targetPackages.map((pkg) => {
      return {
        title: column([grey('Updating the'), txt(pkg.name).color(pkg.color), grey('package to use catalog versions:')]),
        message: column([grey('Used packages:'), ...selectedPackages.map((name) => txt(name).green())]),
        task: async () => {
          // Check all dependency types
          const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

          for (const depName of selectedPackages) {
            const version = library.meta.catalog?.[depName] || 'latest';
            let hasUpdates = false;

            for (const depType of depTypes) {
              if (pkg.meta[depType]) {
                if (pkg.meta[depType][depName]) {
                  const oldVersion = pkg.meta[depType][depName];
                  pkg.meta[depType][depName] = `catalog:`;

                  column.print([
                    txt(`${depType}:`).darkGrey().tree(),
                    inline([txt(depName).color(pkg.color), txt('@').darkGrey(), txt(oldVersion).red()]),
                    txt('->').darkGrey(),
                    inline([
                      txt(depName).color(pkg.color),
                      txt('@').darkGrey(),
                      txt(`catalog:`).yellow(),
                      txt(version).darkGrey(),
                    ]),
                  ]);

                  hasUpdates = true;
                }
              }
            }

            if (!hasUpdates) {
              column.print([
                txt('Package').darkGrey().tree(),
                txt(depName).green(),
                txt('is not being used in the').darkGrey(),
                txt(pkg.name).color(pkg.color),
                txt('package.').darkGrey(),
              ]);
            }
          }

          if (!options.dry) {
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
