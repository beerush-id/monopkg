import type { CatalogOptions } from './utils.js';
import { caption } from '../program.js';
import { library } from '../../core/index.js';
import { inline, txt } from '../../utils/common.js';

export async function createCatalogGroup(names: string[], options: CatalogOptions) {
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
