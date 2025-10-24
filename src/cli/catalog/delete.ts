import type { CatalogOptions } from './utils.js';
import { caption } from '../program.js';
import { library } from '../../core/index.js';
import { inline, txt } from '../../utils/common.js';

export async function deleteCatalogGroups(names: string[], options: CatalogOptions) {
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
