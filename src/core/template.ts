import { confirm, isCancel, select, text } from '@clack/prompts';
import { basename, join } from 'node:path';
import { library, Workspace } from './index.js';
import { getExeCommand } from './pm.js';
import { column, inline, txt } from '../utils/common.js';
import { COLOR, cyan, green, purple } from '../utils/color.js';
import { caption } from '../cli/program.js';
import type { PackageMeta } from './meta.js';
import { copyDir } from '../utils/shell.js';

export enum PromptType {
  TEXT = 'text',
  CONFIRM = 'confirm',
  SELECT = 'select',
}

export type BasePrompt = {
  type: PromptType;
  name: string;
  message: string;
};

export type TextPrompt = BasePrompt & {
  type: PromptType.TEXT;
  default?: string;
};

export type ConfirmPrompt = BasePrompt & {
  type: PromptType.CONFIRM;
  expect: boolean;
  default?: boolean;
  withValue?: boolean;
  options?: string[];
};

export type SelectOption = {
  value: string;
  label: string;
  color?: number;
};
export type SelectPrompt = BasePrompt & {
  type: PromptType.SELECT;
  options: SelectOption[];
  default?: string;
  valueOnly?: boolean;
};

export type TemplateSetup = {
  args: string[];
  flags?: string[];
  exec?: boolean;
  pathForward?: string | boolean;
  nameForward?: string | boolean;
  pmForward?: string | boolean;
  pmPrefix?: string;
};

export type AppSetup = {
  name: string;
  path: string;
  command: string;
  args: string[];
  cwd: string;
};

export type PromptList = Array<BasePrompt | TextPrompt | ConfirmPrompt | SelectPrompt>;

export type PackageTemplate = {
  name: string;
  label: string;
  setup: TemplateSetup;
  description?: string;
  setupFn?: (options: AppSetup) => Promise<PackageMeta | void> | PackageMeta | void;
  options?: PromptList;
  category?: string;
};

const createViteTemplate = ({ name, label }: { name: string; label: string }) => {
  return {
    name,
    label,
    setup: {
      args: ['vite'],
      exec: false,
      pathForward: true,
    },
    options: [
      {
        type: PromptType.SELECT,
        name: '--template',
        message: 'What language would you like to use?',
        default: `${name}-ts`,
        options: [
          { value: `${name}-ts`, label: 'Typescript', color: COLOR.BLUE },
          { value: name, label: 'Javascript', color: COLOR.YELLOW },
        ],
      },
    ],
    category: 'frontend',
  } as PackageTemplate;
};

const createSvelteTemplate = ({ name, label, template }: { name: string; label: string; template: string }) => {
  return {
    name,
    label,
    setup: {
      args: ['sv', 'create'],
      flags: ['--template', template, '--no-install'],
      exec: true,
      pathForward: true,
    },
    options: [
      {
        type: PromptType.SELECT,
        name: '--types',
        message: 'What language would you like to use?',
        default: 'ts',
        options: [
          { value: 'ts', label: 'Typescript', color: COLOR.BLUE },
          { value: 'jsdoc', label: 'Javascript', color: COLOR.YELLOW },
        ],
      },
      {
        type: PromptType.CONFIRM,
        name: '--no-add-ons',
        message: 'Would you like to customize add-ons?',
        expect: false,
        default: true,
      },
    ],
    category: 'framework',
  } as PackageTemplate;
};

export const APP_TEMPLATES: PackageTemplate[] = [
  {
    name: 'elysia',
    label: 'ElysiaJS',
    setup: {
      args: ['elysia'],
      exec: false,
      pathForward: true,
    },
    category: 'backend',
  },
  {
    name: 'hono',
    label: 'Hono',
    setup: {
      args: ['hono'],
      exec: false,
      pathForward: true,
      pmForward: true,
    },
    options: [
      {
        type: PromptType.SELECT,
        name: '--template',
        message: 'Which template would you like to use?',
        default: 'bun',
        options: [
          { value: 'aws-lambda', label: 'AWS Lambda' },
          { value: 'bun', label: 'Bun' },
          { value: 'cloudflare-pages', label: 'Cloudflare Pages' },
          { value: 'cloudflare-workers', label: 'Cloudflare Workers' },
          { value: 'deno', label: 'Deno' },
          { value: 'fastly', label: 'Fastly' },
          { value: 'lamda-edge', label: 'Lambda@Edge' },
          { value: 'netlify', label: 'Netlify' },
          { value: 'nextjs', label: 'Next.js' },
          { value: 'nodejs', label: 'Node.js' },
          { value: 'vercel', label: 'Vercel' },
          { value: 'x-basic', label: 'Basic' },
        ],
      },
    ],
    category: 'backend',
  },
  {
    name: 'nest',
    label: 'NestJS',
    setup: {
      args: ['@nestjs/cli', 'new'],
      flags: ['--skip-git', '--skip-install'],
      exec: true,
      pathForward: '--directory',
      nameForward: true,
      pmForward: '--package-manager',
    },
    category: 'backend',
  },
  createViteTemplate({ name: 'lit', label: 'Lit' }),
  createViteTemplate({ name: 'preact', label: 'Preact' }),
  createViteTemplate({ name: 'qwik', label: 'Qwik' }),
  createViteTemplate({ name: 'react', label: 'React' }),
  createViteTemplate({ name: 'solid', label: 'Solid' }),
  createViteTemplate({ name: 'svelte', label: 'Svelte' }),
  createViteTemplate({ name: 'vanilla', label: 'Vanilla' }),
  createViteTemplate({ name: 'vue', label: 'Vue' }),
  {
    name: 'angular',
    label: 'Angular',
    setup: {
      args: ['@angular/cli', 'new'],
      flags: ['--skip-git', '--skip-install'],
      exec: true,
      nameForward: true,
      pathForward: '--directory',
      pmForward: '--package-manager',
    },
    options: [
      {
        name: '--style',
        type: PromptType.SELECT,
        message: 'Which stylesheet format would you like to use?',
        default: 'scss',
        options: [
          { value: 'css', label: 'CSS', color: COLOR.BLUE },
          { value: 'scss', label: 'SCSS', color: COLOR.PINK },
          { value: 'sass', label: 'SASS', color: COLOR.PINK },
          { value: 'less', label: 'LESS', color: COLOR.BLUE_DARK },
        ],
      },
      {
        name: '--ssr',
        type: PromptType.CONFIRM,
        message: column(['Would you like to use', green('Server-side Rendering (SSR)'), '?']),
        withValue: true,
        default: false,
      },
    ],
    category: 'framework',
  },
  {
    name: 'next-app',
    label: 'Next.js',
    setup: {
      args: ['next-app'],
      flags: ['--skip-install', '--disable-git', '--yes'],
      exec: false,
      pathForward: true,
      pmPrefix: '--use-',
    },
    options: [
      {
        type: PromptType.CONFIRM,
        name: 'recommended',
        message: column(['Would you like to use the', green('recommended'), 'settings?']),
        default: true,
        options: ['--ts', '--eslint', '--tailwind', '--app', '--turbopack'],
      },
      {
        type: PromptType.SELECT,
        name: 'language',
        message: 'What language would you like to use?',
        default: '--ts',
        valueOnly: true,
        options: [
          { value: '--ts', label: 'Typescript', color: COLOR.BLUE },
          { value: '--js', label: 'Javascript', color: COLOR.YELLOW },
        ],
      },
      {
        type: PromptType.CONFIRM,
        name: '--eslint',
        message: column(['Would you like to use', purple('ESlint'), '?']),
        expect: true,
        default: true,
      },
      {
        type: PromptType.CONFIRM,
        name: '--tailwind',
        message: column(['Would you like to use', cyan('Tailwind CSS'), '?']),
        expect: true,
        default: true,
      },
      {
        type: PromptType.CONFIRM,
        name: '--app',
        message: column(['Would you like to use', cyan('App Router'), '?']),
        expect: true,
        default: true,
      },
      {
        type: PromptType.CONFIRM,
        name: '--turbopack',
        message: column(['Would you like to use', cyan('Turbopack'), '?']),
        expect: true,
        default: true,
      },
      {
        type: PromptType.CONFIRM,
        name: '--src-dir',
        message: column(['Would you like to create in a', cyan('"src/"'), 'directory?']),
        expect: true,
        default: false,
      },
      {
        type: PromptType.TEXT,
        name: '--import-alias',
        message: 'Import alias (optional)',
        default: '@/*',
      },
    ],
    category: 'framework',
  },
  createSvelteTemplate({ name: 'svelte-minimal', label: 'SvelteKit', template: 'minimal' }),
  createSvelteTemplate({ name: 'svelte-library', label: 'SvelteKit Library', template: 'library' }),
  {
    name: 'drizia',
    label: 'Drizia',
    description: 'A simple starter package with ElysiaJS, Drizzle, Supabase, and TSUP.',
    setup: {
      args: ['drizia'],
      exec: false,
      pathForward: true,
    },
    category: 'backend',
    setupFn: async ({ path, cwd }) => {
      const outDir = join(cwd, path);
      const srcDir = new URL('../templates/drizia', import.meta.url);

      try {
        copyDir(srcDir, outDir);
        return { name: basename(path), type: 'module' } as PackageMeta;
      } catch (error) {
        console.error(error);
      }
    },
  },
  {
    name: 'tsup',
    label: 'tsup Project',
    description: 'A simple project with tsup and Typescript.',
    setup: {
      args: ['tsup'],
      exec: false,
      pathForward: false,
    },
    category: 'starter',
    setupFn: async ({ path, cwd }) => {
      const outDir = join(cwd, path);
      try {
        copyDir(new URL('../templates/tsup', import.meta.url), outDir);
        return { name: basename(path), type: 'module' } as PackageMeta;
      } catch (error) {
        console.error(error);
      }
    },
  },
];

export const TEMPLATE_CATEGORIES = [
  {
    name: 'backend',
    label: 'Backend Framework',
    templates: APP_TEMPLATES.filter((template) => template.category === 'backend'),
  },
  {
    name: 'frontend',
    label: 'Frontend',
    templates: APP_TEMPLATES.filter((template) => template.category === 'frontend'),
  },
  {
    name: 'framework',
    label: 'Frontend Framework',
    templates: APP_TEMPLATES.filter((template) => template.category === 'framework'),
  },
  {
    name: 'starter',
    label: 'Starter',
    templates: APP_TEMPLATES.filter((template) => template.category === 'starter'),
  },
];

export type CreateAppOptions = {
  category?: string;
  template?: string;
  path?: string;
  name?: string;
  workspace: Workspace;
};

const cancelSetup = () => caption.cancel('Setup cancelled.');

export const validate = {
  path: (path?: string) => {
    if (!path) {
      return 'Path is required.';
    }

    const parts = path.replace(/^\.\//, '').split('/');
    if (parts.length > 1) {
      return 'Path should not contain subdirectories.';
    }

    if (!/^[\w\-_./]+$/i.test(path)) {
      return 'Invalid path. Use only letters, numbers, and dashes.';
    }

    const exists = library.get(basename(path));
    if (exists) {
      return `Package with this path already exists: ${exists.name}`;
    }
  },
  name: (name?: string, preventConflict = true) => {
    if (!name) {
      return 'Name is required.';
    }

    if (!/^@?[\w\-_/]+$/i.test(name)) {
      return 'Invalid name. Use only scope, letters, numbers, and dashes.';
    }

    if (name.startsWith('@') && !name.includes('/')) {
      return 'Scoped name must include a slash.';
    }

    const exists = library.get(name);
    if (exists && preventConflict) {
      return `Package with this name already exists: ${exists.path}`;
    }
  },
};

export async function setupPackage({ template, category, name, path, workspace }: CreateAppOptions) {
  const scope = (workspace.scope ?? library.meta.name).replace(/^@/, '');

  if (!path) {
    path = (await text({
      message: 'Where would you like to create the package?',
      // validate: validate.path,
    })) as string;

    if (isCancel(path)) {
      return cancelSetup();
    }
  }

  if (!name) {
    name = (await text({
      message: 'What is the name of your package?',
      initialValue: `@${scope}/${basename(path)}`,
      // validate: validate.name,
    })) as string;

    if (isCancel(name)) {
      return cancelSetup();
    }
  }

  const outPath = join(workspace.name, path).replace(/\\/g, '/');
  const existByName = library.get(name);
  const existByPath = library.get(outPath);

  if (existByName) {
    column.print([
      txt(`Package with name`).red().error(),
      txt(name).green(),
      txt('already exists.').red(),
      inline([txt('(').darkGrey(), txt(existByName.path).color(existByName.color), txt(')').darkGrey()]),
    ]);

    return cancelSetup();
  }

  if (existByPath) {
    column.print([
      txt('Package with path').red().error(),
      txt(outPath).green(),
      txt('already exists.').red(),
      inline([txt('(').darkGrey(), txt(existByPath.name).color(existByPath.color), txt(')').darkGrey()]),
    ]);

    return cancelSetup();
  }

  if (!template && !category) {
    category = (await select({
      message: 'What type of package would you like to create?',
      options: TEMPLATE_CATEGORIES.map((category) => ({
        value: category.name,
        label: category.label,
      })),
    })) as string;

    if (isCancel(category)) {
      return cancelSetup();
    }
  }

  if (!template) {
    const templates = TEMPLATE_CATEGORIES.find((item) => item.name === category)?.templates as PackageTemplate[];
    template = (await select({
      message: 'What template would you like to use?',
      options: (templates ?? [])
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((template) => ({
          value: template.name,
          label: template.label,
          hint: template.description,
        })),
    })) as string;

    if (isCancel(template)) {
      return cancelSetup();
    }
  }

  const config = APP_TEMPLATES.find((item) => item.name === template);

  if (!config) {
    const exe = getExeCommand(library.pm);
    return {
      name,
      path,
      command: exe?.cmd ?? library.pm,
      args: exe?.arg ? [exe.arg, template, path ?? name] : [template, path ?? name],
    };
  }

  const { setup, options } = config;
  const args = [...(setup.args ?? [])];
  const flags = [...(setup.flags ?? [])];

  if (options?.length) {
    for (const option of options) {
      if (option.type === PromptType.CONFIRM) {
        const result = (await confirm({
          message: option.message,
          initialValue: (option as ConfirmPrompt).default,
        })) as boolean;

        if (isCancel(result)) {
          return cancelSetup();
        }

        if (Array.isArray((option as ConfirmPrompt).options) && result) {
          flags.push(...((option as ConfirmPrompt).options as string[]));
          break;
        } else if ((option as ConfirmPrompt).withValue) {
          flags.push(option.name, result ? 'true' : 'false');
        } else if (result === (option as ConfirmPrompt).expect) {
          flags.push(option.name);
        }
      } else if (option.type === PromptType.SELECT) {
        const result = (await select({
          message: option.message,
          options: (option as SelectPrompt).options.map((item) => {
            return {
              value: item.value,
              label: item.color ? txt(item.label).color(item.color).text() : item.label,
            };
          }),
          initialValue: (option as SelectPrompt).default,
        })) as string;

        if (isCancel(result)) {
          return cancelSetup();
        }

        if ((option as SelectPrompt).valueOnly) {
          flags.push(result);
        } else {
          flags.push(option.name, result);
        }
      } else if (option.type === PromptType.TEXT) {
        const result = (await text({
          message: option.message,
          initialValue: (option as TextPrompt).default,
        })) as string;

        if (isCancel(result)) {
          return cancelSetup();
        }

        flags.push(option.name, `"${result}"`);
      }
    }
  }

  if (setup.nameForward) {
    if (typeof setup.nameForward === 'string') {
      args.push(setup.nameForward as string, name);
    } else {
      args.push(name);
    }
  }

  if (setup.pathForward) {
    if (typeof setup.pathForward === 'string') {
      args.push(setup.pathForward as string, path);
    } else {
      args.push(path);
    }
  }

  let command = library.pm;
  if (setup.exec) {
    const exe = getExeCommand(library.pm);

    if (exe) {
      command = exe.cmd;

      if (exe.arg) {
        args.unshift(exe.arg);
      }
    }
  } else {
    args.unshift('create');
  }

  if (setup.pmForward) {
    if (typeof setup.pmForward === 'string') {
      flags.push(setup.pmForward as string, library.pm);
    } else {
      flags.push('--pm', library.pm);
    }
  }

  if (setup.pmPrefix) {
    flags.push(`${setup.pmPrefix}${library.pm}`);
  }

  return { name, path, command, args: [...args, ...flags], action: config.setupFn };
}
