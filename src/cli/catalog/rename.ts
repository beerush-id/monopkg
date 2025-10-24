import type { CatalogOptions } from './utils.js';
import { caption } from '../program.js';
import { library } from '../../core/index.js';
import { column, txt } from '../../utils/common.js';

export async function renameCatalogGroup(oldName: string, newName: string, options: CatalogOptions) {
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
