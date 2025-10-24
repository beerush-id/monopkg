import { type CatalogOptions, resolveVersion } from './utils.js';
import { caption, runTask } from '../program.js';
import { confirm, isCancel } from '@clack/prompts';
import { column, inline, txt } from '../../utils/common.js';
import { grey } from '../../utils/color.js';
import { library, selectPackages } from '../../core/index.js';

export async function ejectCatalog(options: CatalogOptions) {
  caption.welcome('catalog eject!', options.dry);

  const depTypes = ['dependencies', 'devDependencies', 'peerDependencies', 'optionalDependencies'];

  const confirmRoot = await confirm({
    message: 'Eject root package?',
    initialValue: false,
  });
  const updateRoot = !isCancel(confirmRoot) && confirmRoot;

  if (updateRoot) {
    await runTask([
      {
        title: column([grey('Ejecting catalog references from'), txt('root').cyan()]),
        task: async () => {
          for (const depType of depTypes) {
            if (library.meta[depType]) {
              for (const [name, ref] of Object.entries(library.meta[depType])) {
                if ((ref as string).startsWith('catalog:')) {
                  library.meta[depType][name] = resolveVersion(name, ref as string);

                  column.print([
                    txt(`${depType}:`).darkGrey().tree(),
                    inline([txt(name).cyan(), txt('@').darkGrey(), txt(ref as string).red()]),
                    txt('->').darkGrey(),
                    inline([txt(name).cyan(), txt('@').darkGrey(), txt(library.meta[depType][name]).yellow()]),
                  ]);
                }
              }
            }
          }

          if (!options.dry) {
            library.write();
          }

          inline.print(txt('').lineTree());
          return column([grey('Ejected catalog references from'), txt('root').cyan()]);
        },
      },
    ]);
  }

  const selectedPackages = await selectPackages(library, {
    ...options,
    subTitle: 'eject catalog from',
    cancelMessage: 'Eject catalog cancelled.',
  });

  if (!selectedPackages) {
    return;
  }

  await runTask(
    selectedPackages.map((pkg) => {
      return {
        title: column([grey('Ejecting catalog references from'), txt(pkg.name).color(pkg.color)]),
        task: async () => {
          for (const depType of depTypes) {
            if (pkg.meta[depType]) {
              for (const [name, ref] of Object.entries(pkg.meta[depType])) {
                if ((ref as string).startsWith('catalog:')) {
                  const version = resolveVersion(name, ref as string);

                  pkg.set(`${depType}.${name}`, version);

                  column.print([
                    txt(`${depType}:`).darkGrey().tree(),
                    inline([txt(name).color(pkg.color), txt('@').darkGrey(), txt(ref as string).red()]),
                    txt('->').darkGrey(),
                    inline([txt(name).color(pkg.color), txt('@').darkGrey(), txt(version).yellow()]),
                  ]);
                }
              }
            }
          }

          if (!options.dry) {
            pkg.write();
          }

          inline.print(txt('').lineTree());
          return column([grey('Ejected catalog references from'), txt(pkg.name).color(pkg.color)]);
        },
      };
    })
  );

  caption.success('Catalog references ejected');
}
