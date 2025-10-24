import { type CatalogOptions, compareVersions, parsePackage } from './utils.js';
import { caption } from '../program.js';
import { library } from '../../core/index.js';
import { inline, txt } from '../../utils/common.js';
import { isCancel, multiselect, select } from '@clack/prompts';
import { grey } from '../../utils/color.js';

export async function addToCatalog(packages: string[], options: CatalogOptions) {
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
