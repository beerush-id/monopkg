import { confirm, isCancel, multiselect, select, tasks, text } from '@clack/prompts';
import { blue, Color, cyan, darkGrey, green, grey, pink, red, yellow } from '../utils/color.js';
import { column, Icon, icon, inline, section, txt } from '../utils/common.js';
import { PACKAGE_MANAGERS } from './pm.js';
import { basename, join } from 'node:path';
import { APP_TEMPLATES, type PackageTemplate, validate } from './template.js';
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { type PackageMeta } from './meta.js';
import { spawnSync } from 'node:child_process';
import { merge } from '@beerush/utils';
import { isGitClean } from '../utils/shell.js';
import { caption } from '../cli/program.js';

type SpaceTemplate = {
  name: string;
  label: string;
  hint: string;
  default: string;
  color: Color;
  templates: PackageTemplate[];
};
const SPACE_TEMPLATES: Array<SpaceTemplate> = [
  {
    name: 'apps',
    label: 'Apps',
    default: 'svelte-minimal',
    hint: 'Apps are where your client-side applications live.',
    color: Color.CYAN,
    templates: APP_TEMPLATES.filter((t) => t.category === 'framework'),
  },
  {
    name: 'packages',
    label: 'Packages',
    default: 'vanilla',
    hint: 'Packages are where your shared libraries live.',
    color: Color.BLUE,
    templates: APP_TEMPLATES.filter((t) => t.category !== 'backend'),
  },
  {
    name: 'services',
    label: 'Services',
    default: 'elysia',
    color: Color.YELLOW,
    hint: 'Services are where your API endpoints live.',
    templates: APP_TEMPLATES.filter((t) => t.category === 'backend'),
  },
];

export type SetupProjectOptions = {
  path?: string;
  name?: string;
  pm?: string;
  workspace?: string[];
  isInit?: boolean;
  isUpgrade?: boolean;
  initMeta?: PackageMeta;
};

export async function setupProject({
  isInit = false,
  isUpgrade = false,
  path = '',
  name = '',
  workspace: workspaces = [],
  pm,
  initMeta,
}: SetupProjectOptions = {}) {
  const cancel = (message?: string) => {
    caption.cancel(message ?? 'Setup wizard cancelled.');
  };

  if (isInit) {
    caption.welcome('project setup wizard!');
  } else {
    if (isUpgrade) {
      caption.welcome('project upgrade wizard!');
    } else {
      caption.welcome('project setup wizard!');
      section.print([
        txt('').lineTree(),
        column([
          txt(`Looks like you haven't initialized a`).yellow().tree(),
          pink(icon('MonoPKG')),
          yellow('project yet.'),
        ]),
      ]);
    }

    let create = await confirm({
      message: grey('Would you like to initialize a new one?'),
    });

    if (isCancel(create)) {
      return cancel();
    }

    if (!create) {
      create = await confirm({
        message: grey('I insist, pretty please? 😌'),
      });
    }

    if (isCancel(create) || !create) {
      return cancel('Fine. Be that way! 😒');
    }
  }

  if (!path && !isUpgrade) {
    path = (await text({
      message: grey('Where would you like to create the workspaces?'),
      validate: validate.path,
    })) as string;

    if (isCancel(path)) {
      return cancel();
    }
  }

  if (isUpgrade && !isGitClean()) {
    inline.print(red('Git repository is not clean. Please commit or stash your changes.'));
    return cancel();
  }

  if (!name) {
    name = (await text({
      message: grey('What is the namespace of your workspaces?'),
      initialValue: basename(path),
      validate: validate.name,
    })) as string;

    if (isCancel(name)) {
      return cancel();
    }
  }

  if (!pm) {
    pm = (await select({
      message: grey('Which package manager would you like to use?'),
      initialValue: 'bun',
      options: Object.entries(PACKAGE_MANAGERS).map(([key, value]) => {
        return { value: key, label: value.label };
      }),
    })) as string;

    if (isCancel(pm)) {
      return cancel();
    }
  }

  if (!workspaces?.length) {
    const keys = SPACE_TEMPLATES.map((space) => space.name);

    workspaces = (await multiselect({
      message: grey('Which workspaces would you like to create? (Default: all)'),
      required: true,
      initialValues: ['apps', 'packages', 'services'],
      options: SPACE_TEMPLATES.map((space) => {
        return {
          value: space.name,
          label: inline([
            column([txt(Icon.BRAND).color(space.color), txt(space.name).align(keys).color(space.color)]),
            darkGrey(' - '),
            txt(space.label).align(keys).color(space.color),
          ]),
          hint: space.hint,
        };
      }),
    })) as string[];

    if (isCancel(workspaces)) {
      return cancel();
    }
  }

  let readme = readFileSync(new URL('../templates/readme.md', import.meta.url), 'utf-8') ?? '';
  const files = readdirSync(new URL('../templates/basic', import.meta.url));

  const workspaceList = workspaces
    .map((s) => {
      const space = SPACE_TEMPLATES.find((space) => space.name === s);
      if (space) {
        return `- \`**${space.name}**\` (**${space.label}**) - ${space.hint}`;
      } else {
        return `- \`**${s}**\``;
      }
    })
    .join('\n');
  readme = readme.replace('{{SPACES}}', workspaceList);

  const outPath = join(process.cwd(), path);
  const pmVersion = spawnSync(pm, ['--version'], { shell: true }).stdout.toString().trim();
  const engine = pm === 'bun' ? 'bun' : 'node';
  const engineVersion =
    pm === 'bun' ? pmVersion : spawnSync('node', ['--version'], { shell: true }).stdout.toString().trim();
  const bin = pm === 'bun' ? 'bpkg' : 'mpkg';

  const selfUrl = new URL('../../package.json', import.meta.url);
  const selfMeta = JSON.parse(readFileSync(selfUrl, 'utf-8')) as PackageMeta;

  const meta: PackageMeta = {
    name,
    type: 'module',
    version: '0.0.1',
    description: '',
    scripts: {
      build: `${bin} run build`,
      dev: `${bin} run dev`,
      format: `${bin} run format`,
      lint: `${bin} run lint`,
      test: `${bin} run test`,
    },
    devDependencies: {
      monopkg: `^${selfMeta.version ?? '0.0.1'}`,
      prettier: '^3.4.2',
    },
    engines: {
      [engine]: `>=${engineVersion}`,
    },
    packageManager: `${pm}@${pmVersion}`,
    private: true,
    workspaces: workspaces.map((space) => `${space}/*`),
  } as never;

  if (initMeta) {
    merge(meta, initMeta);
  }

  await tasks([
    {
      title: grey(`Creating root workspaces in ${outPath}...`),
      task: async () => {
        if (!isUpgrade) {
          mkdirSync(outPath, { recursive: true });
        }

        return inline([green('Root workspaces'), grey(' created.')]);
      },
    },
    ...workspaces.map((s) => {
      let space = SPACE_TEMPLATES.find((space) => space.name === s) as SpaceTemplate;

      if (!space) {
        space = {
          name: s,
          label: s,
          color: Color.CYAN,
        } as SpaceTemplate;
      }

      return {
        title: inline([grey('Creating '), txt(icon(space.name)).color(space.color), grey(` workspace...`)]),
        task: async () => {
          const spacePath = join(outPath, space.name);

          mkdirSync(spacePath, { recursive: true });
          writeFileSync(join(spacePath, '.gitkeep'), '', 'utf-8');

          return inline([grey('Workspace '), txt(icon(space.name)).color(space.color), grey(' created.')]);
        },
      };
    }),
    {
      title: grey('Creating package.json...'),
      task: async () => {
        const pkgPath = join(outPath, 'package.json');
        const pkg = JSON.stringify(meta, null, 2);
        writeFileSync(pkgPath, pkg, 'utf-8');
        return inline([green('package.json'), grey(' file created.')]);
      },
    },
    {
      title: grey('Creating README.md...'),
      task: async () => {
        if (!isUpgrade) {
          const readmePath = join(outPath, 'README.md');
          writeFileSync(readmePath, readme, 'utf-8');
        }

        return inline([green('README.md'), grey(' file created.')]);
      },
    },
    {
      title: grey('Copying template files...'),
      task: async () => {
        if (!isUpgrade) {
          for (const file of files) {
            const src = new URL(`../templates/basic/${file}`, import.meta.url);
            const dest = join(outPath, file);
            writeFileSync(dest, readFileSync(src), 'utf-8');
          }
        }

        return inline([green('Template files'), grey(' copied.')]);
      },
    },
  ]);

  caption.success('Project initialization complete.');

  if (!isUpgrade) {
    section.print([
      txt('To get started, run the following commands:').green().beginTree(),
      txt(column([blue('cd'), cyan(basename(outPath))])).tree(0),
      txt(column([blue(pm), cyan('install')])).endTree(),
    ]);
  }

  return {
    endsPath: outPath,
    meta,
  };
}
