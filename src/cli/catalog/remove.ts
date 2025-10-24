import type { CatalogOptions } from './utils.js';
import { library } from '../../core/index.js';
import { caption } from '../program.js';
import { isCancel, multiselect, select } from '@clack/prompts';
import { grey } from '../../utils/color.js';
import { inline, txt } from '../../utils/common.js';

export async function removeFromCatalog(packages: string[], options: CatalogOptions) {
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
