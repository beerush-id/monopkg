# @beerush/monopkg

A simple, yet useful package manager for monorepos. Let's say you have this monorepo structure:

```
- apps
  - app-a
  - app-b
- packages
  - pkg-a
  - pkg-b
  - pkg-c
  - pkg-d
  - pkg-e
- tools
  - tool-a
  - tool-b
```

Then, you want to:

- Add new dependencies to all packages at once.
- Add new dependencies to specific packages at once.
- Add new dependencies to all packages except specific packages at once.
- Run scripts in all packages at once.
- Create a new package from a template in a specific workspace.
- Initialize a basic package in a specific workspace.
- Link internal packages to another package at once.
- etc.

> **`@beerush/monopkg`** is not a replacement for `turbo`, `nx`, `lerna`, or other monorepo package managers. It's just
> a simple tool to help you manage packages in a monorepo.

> Only monorepo with `workspaces` field in `package.json` is supported for now.

- ✅ **Bun Workspaces**
- ✅ **Yarn Workspaces**
- ✅ **NPM Workspaces**
- 😝 **PNPM Workspaces**

## Installation

```bash
bun install -g @beerush/monopkg
```

## Usage

```bash
monopkg [command] [options]
```

Or if you don't want to install it globally, you can use `npx`, `bun x`, etc.:

```bash
npx @beerush/monopkg [command] [options]
```

### Commands

- **`add`** - Add dependencies to all packages.
- **`add-script`** - Add a script to all packages.
- **`create`** - Create a package from template.
- **`init`** - Initialize a basic package.
- **`link`** - Link dependencies to all packages.
- **`list`** - List all packages.
- **`remove`** - Remove dependencies from all packages.
- **`remove-script`** - Remove a script from all packages.
- **`run`** - Run a script in all packages.
- **`unlink`** - Unlink dependencies from all packages.
- **`use`** - Link internal packages to another packages.
- **`version`** - Update version of all packages.

> **`package`** refers to the internal packages/apps in the monorepo. External packages is called **`dependency`**.

### Global Options

- `-i, --include` - Included packages to work with.
- `-e, --exclude` - Excluded packages to work with.
- `-r, --root` - Root workspace of the packages (default: `./pacakges`).
- `-h, --help` - Display help message
- `-v, --version` - Display version number

> Default root workspace is **`packages`**. If `packages` missing in the `workspaces` field of `package.json`, it will
> use the first item as the default root.

> Some commands such as **`add`** and **`list`** will use all workspaces in the `workspaces` field of `package.json` if
> no `root` is provided.

## Installing Dependencies (`monopkg add`)

This command will allow you to install dependencies to all packages in the monorepo at once.

```bash
monopkg add [options] <dependencies...> [global-options]
```

### Options

- `-d, --dev` - Install as dev dependencies.
- `-p, --peer` - Install as peer dependencies.

### Examples

Add `lodash` to all packages in the monorepo.

```bash
monopkg add lodash
````

> Equivalent to: `cd ./packages/pkg-a && bun add lodash`, `cd ./packages/pkg-b && bun add lodash`, and so on.

---

Add `lodash` to `package-a` and `package-b`.

```bash
monopkg add lodash -i package-a package-b
```

---

Add `lodash` and `typescript` as dev dependency to all packages in the monorepo.

```bash
monopkg add -d lodash typescript
```

---

Add `lodash` and `typescript` as peer dependency to all packages in the monorepo, except `package-a`.

```bash
monopkg add -p lodash typescript -e package-a
```

---
Add `loadash` to all packages in `apps` workspace.

```bash
monopkg add lodash -r apps
```

---
Add `lodash` to all packages in the `apps` workspace, except `package-a`.

```bash
monopkg add lodash -r apps -e package-a
```

## Adding Scripts (`monopkg add-script`)

Add a script to all packages in the monorepo at once.

```bash
monopkg add-script <script-name> <script-command> [global-options]
```

### Examples

Add `build` script that run `rimraf dist && tsup && publint` to all packages in the monorepo.

```bash
monopkg add-script build "rimraf dist && tsup && publint"
```

---
Add `dev` script that run `tsup --watch` to all packages in the `apps` workspace.

```bash
monopkg add-script dev "tsup --watch" -r apps
```

## Creating Package from Template (`monopkg create`)

Create a new package from a template.

```bash
monopkg create <template-name> [options] [global-options]
```

### Options

- `-n, --name <package-name>` - Package name.
- `-p, --path <template-path>` - Path to the package directory.
- `-v, --version <version>` - Initial version of the package (default: `0.0.1`).

### Examples

Create a new package named `my-package` from `vite` template (`./packages/my-package`).

```bash
monopkg create vite -n my-package
```

> Equivalent to: `cd ./packages && npx create-vite`.

---

Create a new package named `@beerush/ui` from a special format (`./packages/ui`).

> Some template using `npx {template-name} create` format, so we can use this command to work with them.
> For example, svelte template now using `npx sv create`.

```bash
monopkg create sv-create -n @beerush/ui
```

> Equivalent to: `cd ./packages && npx sv create`, `cd ./packages && bun x sv create`.

---

Create a new package named `@beerush/test` in a specific path (`./packages/test-pkg`).

```bash
monopkg create vite -n @beerush/test -p test-pkg
```

## Initializing Basic Package (`monopkg init`)

Create a basic package under the given root workspace, or under default workspace (`./packages`).

> If you want to create a package from a template, use `monopkg create` command instead.

```bash
monopkg init <directory-name> [options] [global-options]
```

### Options

- `-n, --name <package-name>` - Package name (default: `<directory-name>`).
- `-s, --scope <scope-name>` - Scope name (e.g. `beerush` for `@beerush/<package-name>`).
- `-m, --main <main-file>` - Main file of the package (default: `src/index.ts`).
- `-v, --version <version>` - Initial version of the package (default: `0.0.1`).

### Examples

Create a new package named `my-package` (`./packages/my-package`).

```bash
monopkg init my-package
```

---
Create a new package named `@beerush/my-package` (`./packages/my-package`).

```bash
monopkg init my-package -s beerush
```

---
Create a new package named `my-package` with main file `src/app.ts` (`./packages/my-package`).

```bash
monopkg init my-package -m src/app.ts
```

---
Create a new package named `@beerush/my-package` under `apps` workspace (`./apps/my-package`).

```bash
monopkg init my-package -r apps -s beerush
```

## Linking Dependencies (`monopkg link`)

Link dependencies to all packages in the monorepo at once. This command will also add the dependencies to the
`dependencies` (or `devDependencies`, or `peerDependencies`) field in the `package.json` of each package.

```bash
monopkg link [options] <dependencies...> [global-options]
```

### Options

- `-s, --save` - Link as dependencies.
- `-d, --dev` - Link as dev dependencies.
- `-p, --peer` - Link as peer dependencies.

> If no option is provided, the dependencies won't be added to the `package.json` file.

### Examples

Link `@beerush/utils` to all packages in the monorepo.

```bash
monopkg link -s @beerush/utils
```

---

Link `@beerush/utils` and `@beerush/core` as dev dependencies to `package-a` and `package-b`.

```bash
monopkg link -d @beerush/utils @beerush/core -i package-a package-b
```

## Listing Packages (`monopkg list`)

List all packages in the monorepo.

```bash
monopkg list [options] [global-options]
```

### Options

- `--public` - Show public packages only.
- `--private` - Show private packages only.
- `--restricted` - Show restricted packages only.
- `--publishable` - Show publishable packages only.

### Examples

List all packages in the monorepo.

```bash
monopkg list
```

---
List all public packages in the monorepo.

```bash
monopkg list --public
```

---
List all packages under `apps` workspace.

```bash
monopkg list -r apps
```

## Removing Dependencies (`monopkg remove`)

Remove dependencies from all packages in the monorepo at once.

```bash
monopkg remove <package-name...> [global-options]
```

### Examples

Remove `lodash` from all packages in the monorepo.

```bash
monopkg remove lodash
```

---
Remove `lodash` and `typescript` from `package-a` and `package-b`.

```bash
monopkg remove lodash typescript -i package-a package-b
```

---
Remove `lodash` from all packages in the `apps` workspace.

```bash
monopkg remove lodash -r apps
```

## Removing Scripts (`monopkg remove-script`)

Remove a script from all packages in the monorepo at once.

```bash
monopkg remove-script <script-name> [global-options]
```

### Examples

Remove `build` script from all packages in the monorepo.

```bash
monopkg remove-script build
```

## Running Scripts (`monopkg run`)

Run a concurrent scripts in all packages in the monorepo at once.

```bash
monopkg run <scripts...> [global-options]
```

### Options

- `-b, --before-run <scripts...>` - Run scripts before the main script.

> The before-run scripts will run on all packages* before running the main scripts in each package.

### Examples

Run `build` script in all packages in the monorepo.

```bash
monopkg run build
```

---
Run `clean` script before running `build` script in all packages in the monorepo.

```bash
monopkg run build -b clean
```

---
Run `dev:esm` and `dev:cjs` scripts in all packages in the `tools` workspace.

```bash
monopkg run dev:esm dev:cjs -r tools
```

---
Run `test` script in `package-a` and `package-b`.

```bash
monopkg run test -i package-a package-b
```

---
Run `lint` script in all packages in the `apps` workspace.

```bash
monopkg run lint -r apps
```
