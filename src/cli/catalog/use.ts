import { type CatalogPackage, selectTargetPackages, type UseOptions } from './utils.js';
import { caption, runTask } from '../program.js';
import { library } from '../../core/index.js';
import { column, inline, section, txt } from '../../utils/common.js';
import { confirm, isCancel, multiselect, select } from '@clack/prompts';
import { grey } from '../../utils/color.js';

export async function useCatalog(packages: string[], options: UseOptions) {
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

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

  const confirmRoot = await confirm({
    message: grey(`Use in the root package.json?`),
    initialValue: false,
  });
  const updateRoot = !isCancel(confirmRoot) && confirmRoot;

  if (updateRoot) {
    await runTask([
      {
        title: column([grey('Updating the'), txt('root').cyan(), grey('package to use catalog versions:')]),
        task: async () => {
          for (const pkgInfo of selectedPackages) {
            const { name: depName, catalog } = pkgInfo;
            let catalogReference = 'catalog:';

            if (catalog !== 'global') {
              catalogReference = `catalog:${catalog}`;
            }

            for (const depType of depTypes) {
              if (!library.meta[depType]) continue;

              if (library.meta[depType][depName]) {
                const oldVersion = library.meta[depType][depName];
                library.meta[depType][depName] = catalogReference;

                column.print([
                  txt(`${depType}:`).darkGrey().tree(),
                  inline([txt(depName).cyan(), txt('@').darkGrey(), txt(oldVersion).red()]),
                  txt('->').darkGrey(),
                  inline([
                    txt(depName).cyan(),
                    txt('@').darkGrey(),
                    txt(catalogReference).yellow(),
                    txt(pkgInfo.version).darkGrey(),
                  ]),
                ]);
              }
            }
          }

          if (!options.dry) {
            library.write();
          }

          inline.print(txt('').lineTree());
          return column([grey('Updated the'), txt('root').cyan(), grey('package to use catalog versions.')]);
        },
      },
    ]);
  }

  // Select target packages to update
  const targetPackages = await selectTargetPackages(options);
  if (!targetPackages) return;

  // Update the selected packages to use catalog versions
  await runTask(
    targetPackages.map((pkg) => {
      return {
        title: column([grey('Updating the'), txt(pkg.name).color(pkg.color), grey('package to use catalog versions:')]),
        task: async () => {
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
            pkg.write();
          }

          inline.print(txt('').lineTree());
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
