import type { FilterOptions, OverrideOptions } from '../program.js';
import { library, Package, selectPackages } from '../../core/index.js';
import { column, txt } from '../../utils/common.js';
import { get } from 'node:https';

export type CatalogOptions = OverrideOptions & {
  catalog?: string;
  global?: boolean;
};
export type UseOptions = FilterOptions & {
  catalog?: string;
  save?: boolean;
  dev?: boolean;
  optional?: boolean;
  peer?: boolean;
};
export type CatalogPackage = {
  name: string;
  version: string;
  catalog: string;
};

export async function selectTargetPackages(options: UseOptions): Promise<Package[] | void> {
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

export function resolveVersion(name: string, ref: string) {
  const [, catalog] = ref.split('catalog:');
  let version = 'latest';

  if (catalog) {
    version = library.meta?.catalogs?.[catalog]?.[name] ?? 'latest';
  } else {
    version = library.meta?.catalog?.[name] ?? 'latest';
  }

  if (version !== 'latest' && version.match(/^\d+/)) {
    version = `^${version}`;
  }

  return version;
}

// Add this helper function to fetch package info from npm
export function fetchPackageInfo(packageName: string): Promise<{ version: string }> {
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
export async function parsePackage(pkg: string): Promise<{ name: string; version: string; fetchError?: boolean }> {
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

// Simple version comparison (in a real implementation, you might want to use a proper semver library)
export function compareVersions(version1: string, version2: string): number {
  // For now, we'll just do a simple string comparison
  // In a real implementation, you'd want to use semver comparison
  if (version1 === version2) return 0;
  return version1 > version2 ? 1 : -1;
}
