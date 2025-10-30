# Catalog

The catalog feature allows you to manage package versions centrally in your monorepo. Instead of specifying versions for each dependency in every package, you can define them once in catalogs and reference them across your packages. This ensures version consistency and simplifies dependency management.

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Command

Manage package version catalogs with the following command:

::: code-group

```bash [Global]
monopkg catalog [command] [options]
```

```bash [Bun]
bun x monopkg catalog [command] [options]
```

```bash [NPM]
npx monopkg catalog [command] [options]
```

```bash [Yarn]
yarn dlx monopkg catalog [command] [options]
```

:::

## Subcommands

- **[add](/guides/catalog-add)** - Add packages to a catalog
- **[create](/guides/catalog-create)** - Create catalog groups
- **[delete](/guides/catalog-delete)** - Delete catalog groups
- **[eject](/guides/catalog-eject)** - Eject catalog references to actual versions
- **[remove](/guides/catalog-remove)** - Remove packages from catalogs
- **[rename](/guides/catalog-rename)** - Rename a catalog group
- **[use](/guides/catalog-use)** - Use catalog versions in packages

## Catalogs

Catalogs are version registries that store package versions centrally. There are two types of catalogs:

1. **Global Catalog** - A default catalog that applies to all packages
2. **Catalog Groups** - Named catalogs that can be targeted for specific use cases

Catalogs are defined in the root `package.json` file under the `catalog` (global) and `catalogs` (groups) fields.

## How Catalogs Work

Catalogs provide a powerful way to manage dependencies across your monorepo:

1. **Define versions once**: Specify package versions in catalogs instead of individual package.json files
2. **Reference in packages**: Use catalog references like `catalog:` or `catalog:groupname` in your package dependencies
3. **Automatic resolution**: Bun automatically resolves catalog references to actual versions during installation
4. **Centralized updates**: Update versions in one place and have changes propagate to all referencing packages

## Example Workflow

Here's a typical workflow using catalogs:

1. **Create catalogs** for different purposes:
   ```bash
   monopkg catalog create frontend backend
   ```

2. **Add packages** to catalogs:
   ```bash
   monopkg catalog add react@18.2.0 -c frontend
   monopkg catalog add express@4.18.2 -c backend
   ```

3. **Use catalog references** in your packages:
   ```bash
   monopkg catalog use react -c frontend -s -f my-frontend-app
   monopkg catalog use express -c backend -s -f my-backend-api
   ```

4. **Update versions** centrally when needed:
   ```bash
   # Edit package.json to update react version in frontend catalog
   # All packages using catalog:frontend will get the updated version
   ```

## Sample package.json with Catalogs

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21"
  },
  "catalogs": {
    "backend": {
      "express": "4.18.2",
      "mongoose": "7.0.0"
    },
    "frontend": {
      "react": "18.2.0",
      "typescript": "5.0.0"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

## Benefits of Using Catalogs

1. **Version Consistency**: Ensure all packages use the same versions of shared dependencies
2. **Simplified Updates**: Update dependency versions across multiple packages by changing only the catalog
3. **Reduced Configuration**: Eliminate duplicate version specifications across package.json files
4. **Improved Maintainability**: Centralize dependency management for easier maintenance
5. **Team Coordination**: Coordinate dependency versions across teams working on different packages

## Examples

### List Catalogs

Simply run the catalog command without any subcommands to list all catalogs and their packages:

::: code-group

```bash [Global]
monopkg catalog
```

```bash [Bun]
bun x monopkg catalog
```

```bash [NPM]
npx monopkg catalog
```

```bash [Yarn]
yarn dlx monopkg catalog
```

:::

This command displays all catalogs and their packages in a structured format, helping you understand your current catalog organization.

## Add Packages

Add packages to a catalog with the `add` command. You can either specify packages explicitly or let the system detect dependencies from your packages.

### Usage

::: code-group

```bash [Global]
monopkg catalog add [packages...] [options]
```

```bash [Bun]
bun x monopkg catalog add [packages...] [options]
```

```bash [NPM]
npx monopkg catalog add [packages...] [options]
```

```bash [Yarn]
yarn dlx monopkg catalog add [packages...] [options]
```

:::

### Options

- **`-c`**, **`--catalog`** `<name>` - Add to specific catalog group
- **`--global`** - Add to global catalog
- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

### Examples

#### Add specific packages

Add `react` and `lodash` to the global catalog:

::: code-group

```bash [Global]
monopkg catalog add react lodash --global
```

```bash [Bun]
bun x monopkg catalog add react lodash --global
```

```bash [NPM]
npx monopkg catalog add react lodash --global
```

```bash [Yarn]
yarn dlx monopkg catalog add react lodash --global
```

:::

#### Add packages to a specific catalog group

Add `react` and `lodash` to the `frontend` catalog group:

::: code-group

```bash [Global]
monopkg catalog add react lodash -c frontend
```

```bash [Bun]
bun x monopkg catalog add react lodash -c frontend
```

```bash [NPM]
npx monopkg catalog add react lodash -c frontend
```

```bash [Yarn]
yarn dlx monopkg catalog add react lodash -c frontend
```

:::

#### Interactive mode

Let the system detect and select dependencies to add to a catalog:

::: code-group

```bash [Global]
monopkg catalog add
```

```bash [Bun]
bun x monopkg catalog add
```

```bash [NPM]
npx monopkg catalog add
```

```bash [Yarn]
yarn dlx monopkg catalog add
```

:::

## Create Catalog Groups

Create named catalog groups with the `create` command.

### Usage

::: code-group

```bash [Global]
monopkg catalog create <names...> [options]
```

```bash [Bun]
bun x monopkg catalog create <names...> [options]
```

```bash [NPM]
npx monopkg catalog create <names...> [options]
```

```bash [Yarn]
yarn dlx monopkg catalog create <names...> [options]
```

:::

### Examples

Create `frontend` and `backend` catalog groups:

::: code-group

```bash [Global]
monopkg catalog create frontend backend
```

```bash [Bun]
bun x monopkg catalog create frontend backend
```

```bash [NPM]
npx monopkg catalog create frontend backend
```

```bash [Yarn]
yarn dlx monopkg catalog create frontend backend
```

:::

## Delete Catalog Groups

Delete empty catalog groups with the `delete` command.

### Usage

::: code-group

```bash [Global]
monopkg catalog delete <names...> [options]
```

```bash [Bun]
bun x monopkg catalog delete <names...> [options]
```

```bash [NPM]
npx monopkg catalog delete <names...> [options]
```

```bash [Yarn]
yarn dlx monopkg catalog delete <names...> [options]
```

:::

### Examples

Delete the `frontend` and `backend` catalog groups:

::: code-group

```bash [Global]
monopkg catalog delete frontend backend
```

```bash [Bun]
bun x monopkg catalog delete frontend backend
```

```bash [NPM]
npx monopkg catalog delete frontend backend
```

```bash [Yarn]
yarn dlx monopkg catalog delete frontend backend
```

:::

::: warning
Only empty catalog groups can be deleted. If a catalog group contains packages, you must first remove all packages from it.
:::

## Eject Catalog References

Replace catalog references with actual versions using the `eject` command.

### Usage

::: code-group

```bash [Global]
monopkg catalog eject [options]
```

```bash [Bun]
bun x monopkg catalog eject [options]
```

```bash [NPM]
npx monopkg catalog eject [options]
```

```bash [Yarn]
yarn dlx monopkg catalog eject [options]
```

:::

### Examples

Replace all catalog references with actual versions:

::: code-group

```bash [Global]
monopkg catalog eject
```

```bash [Bun]
bun x monopkg catalog eject
```

```bash [NPM]
npx monopkg catalog eject
```

```bash [Yarn]
yarn dlx monopkg catalog eject
```

:::

::: info
This command is useful when you want to prepare packages for publishing to npm, where catalog references are not supported.
:::

## Remove Packages

Remove packages from catalogs with the `remove` command.

### Usage

::: code-group

```bash [Global]
monopkg catalog remove [packages...] [options]
```

```bash [Bun]
bun x monopkg catalog remove [packages...] [options]
```

```bash [NPM]
npx monopkg catalog remove [packages...] [options]
```

```bash [Yarn]
yarn dlx monopkg catalog remove [packages...] [options]
```

:::

### Options

- **`-c`**, **`--catalog`** `<name>` - Remove from specific catalog group
- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

### Examples

#### Remove specific packages

Remove `react` and `lodash` from the global catalog:

::: code-group

```bash [Global]
monopkg catalog remove react lodash --global
```

```bash [Bun]
bun x monopkg catalog remove react lodash --global
```

```bash [NPM]
npx monopkg catalog remove react lodash --global
```

```bash [Yarn]
yarn dlx monopkg catalog remove react lodash --global
```

:::

#### Remove packages from a specific catalog group

Remove `react` and `lodash` from the `frontend` catalog group:

::: code-group

```bash [Global]
monopkg catalog remove react lodash -c frontend
```

```bash [Bun]
bun x monopkg catalog remove react lodash -c frontend
```

```bash [NPM]
npx monopkg catalog remove react lodash -c frontend
```

```bash [Yarn]
yarn dlx monopkg catalog remove react lodash -c frontend
```

:::

## Rename Catalog Groups

Rename catalog groups with the `rename` command.

### Usage

::: code-group

```bash [Global]
monopkg catalog rename <old-name> <new-name> [options]
```

```bash [Bun]
bun x monopkg catalog rename <old-name> <new-name> [options]
```

```bash [NPM]
npx monopkg catalog rename <old-name> <new-name> [options]
```

```bash [Yarn]
yarn dlx monopkg catalog rename <old-name> <new-name> [options]
```

:::

### Examples

Rename the `frontend` catalog group to `ui`:

::: code-group

```bash [Global]
monopkg catalog rename frontend ui
```

```bash [Bun]
bun x monopkg catalog rename frontend ui
```

```bash [NPM]
npx monopkg catalog rename frontend ui
```

```bash [Yarn]
yarn dlx monopkg catalog rename frontend ui
```

:::

::: info
This command will also update all package references to use the new catalog name.
:::

## Use Catalog Versions

Apply catalog versions to packages with the `use` command.

### Usage

::: code-group

```bash [Global]
monopkg catalog use [packages...] [options]
```

```bash [Bun]
bun x monopkg catalog use [packages...] [options]
```

```bash [NPM]
npx monopkg catalog use [packages...] [options]
```

```bash [Yarn]
yarn dlx monopkg catalog use [packages...] [options]
```

:::

### Options

- **`-c`**, **`--catalog`** `<name>` - Use packages from specific catalog group
- **`-s`**, **`--save`** - Add packages as dependencies
- **`-d`**, **`--dev`** - Add packages as devDependencies
- **`-o`**, **`--optional`** - Add packages as optionalDependencies
- **`-p`**, **`--peer`** - Add packages as peerDependencies
- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

### Examples

#### Use packages from a specific catalog

Use `react` and `lodash` from the `frontend` catalog as dependencies:

::: code-group

```bash [Global]
monopkg catalog use react lodash -c frontend -s
```

```bash [Bun]
bun x monopkg catalog use react lodash -c frontend -s
```

```bash [NPM]
npx monopkg catalog use react lodash -c frontend -s
```

```bash [Yarn]
yarn dlx monopkg catalog use react lodash -c frontend -s
```

:::

#### Interactive mode

Interactively select packages from catalogs to use:

::: code-group

```bash [Global]
monopkg catalog use
```

```bash [Bun]
bun x monopkg catalog use
```

```bash [NPM]
npx monopkg catalog use
```

```bash [Yarn]
yarn dlx monopkg catalog use
```

:::

## Using Catalog References

After adding packages to catalogs, you can reference them in your package dependencies using the `catalog:` prefix:

```json
{
  "dependencies": {
    "react": "catalog:",
    "lodash": "catalog:frontend"
  }
}
```

- `catalog:` refers to the global catalog
- `catalog:frontend` refers to the `frontend` catalog group

When you run `monopkg catalog use`, these references will be updated to use the versions defined in the catalogs.