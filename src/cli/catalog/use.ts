import { type CatalogPackage, selectTargetPackages, type UseOptions } from './utils.js';
import { caption, runTask } from '../program.js';
import { library } from '../../core/index.js';
import { column, inline, section, txt } from '../../utils/common.js';
import { confirm, isCancel, multiselect, select } from '@clack/prompts';
import { grey } from '../../utils/color.js';

export async function useCatalog(packages: string[], options: UseOptions) {
  caption.welcome('catalog use!', options.dry);

  if (!library.meta.catalog) {
    library.meta.catalog = {};
  }

  if (!library.meta.catalogs) {
    library.meta.catalogs = {};
  }

  const globalCatalog = library.meta.catalog;
  const catalogs = library.meta.catalogs;
  const depTypeMap = {
    save: 'dependencies',
    dev: 'devDependencies',
    optional: 'optionalDependencies',
    peer: 'peerDependencies',
  };

  for (const [option, depType] of Object.entries(depTypeMap)) {
    if (options[option as keyof UseOptions]) {
      if (!library.meta[depType]) {
        library.meta[depType] = {};
      }

      for (const pkg of library.packages) {
        if (!pkg.meta[depType]) {
          library.meta[depType][pkg.name] = {};
        }
      }
    }
  }

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

  let selectedPackages: CatalogPackage[] = [];
  if (!packages.length) {
    if (selectedCatalog) {
      const catalogEntries = Object.entries(selectedCatalog);

      if (catalogEntries.length === 0) {
        caption.cancel(`Selected catalog '${selectedCatalogName || 'global'}' is empty.`);
        return;
      }

      catalogEntries.sort((a, b) => a[0].localeCompare(b[0]));

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
      const hasGlobalPackages = Object.keys(globalCatalog).length > 0;
      const hasGroupPackages = Object.values(catalogs).some(
        (group) => Object.keys(group as Record<string, string>).length > 0
      );

      if (!hasGlobalPackages && !hasGroupPackages) {
        caption.cancel('Catalogs are empty. Add packages to catalog first.');
        return;
      }

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

      if (selectedPackages.length === 0) {
        caption.cancel('No packages selected.');
        return;
      }
    }
  } else {
    const packageMap: Map<string, CatalogPackage[]> = new Map();

    Object.entries(globalCatalog).forEach(([name, version]) => {
      if (!packageMap.has(name)) {
        packageMap.set(name, []);
      }
      packageMap.get(name)!.push({ name, version, catalog: 'global' });
    });

    Object.entries(catalogs).forEach(([groupName, groupCatalog]) => {
      const groupCatalogTyped = groupCatalog as Record<string, string>;
      Object.entries(groupCatalogTyped).forEach(([name, version]) => {
        if (!packageMap.has(name)) {
          packageMap.set(name, []);
        }
        packageMap.get(name)!.push({ name, version, catalog: groupName });
      });
    });

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

    for (const pkgName of packages) {
      const pkgOptions = packageMap.get(pkgName)!;
      if (pkgOptions.length === 1) {
        selectedPackages.push(pkgOptions[0]);
      } else {
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

  for (const pkgInfo of selectedPackages) {
    for (const [option, depType] of Object.entries(depTypeMap)) {
      if (options[option as keyof UseOptions] && !library.meta[depType][pkgInfo.name]) {
        library.meta[depType][pkgInfo.name] = 'latest';
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

  const targetPackages = await selectTargetPackages(options);
  if (!targetPackages) return;

  for (const pkgInfo of selectedPackages) {
    for (const trgInfo of targetPackages) {
      for (const [option, depType] of Object.entries(depTypeMap)) {
        if (options[option as keyof UseOptions] && !trgInfo.meta[depType][pkgInfo.name]) {
          trgInfo.meta[depType][pkgInfo.name] = 'latest';
        }
      }
    }
  }

  await runTask(
    targetPackages.map((pkg) => {
      return {
        title: column([grey('Updating the'), txt(pkg.name).color(pkg.color), grey('package to use catalog versions:')]),
        task: async () => {
          for (const pkgInfo of selectedPackages) {
            const { name: depName, catalog } = pkgInfo;
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
