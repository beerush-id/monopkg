# Rename Catalog

Rename catalog groups with the `rename` command. This is useful when you need to reorganize your catalogs or correct naming mistakes.

## Usage

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

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Options

- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

## Examples

### Rename a catalog group

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

### Dry run

To see what changes would be made without actually making them:

::: code-group

```bash [Global]
monopkg catalog rename frontend ui --dry
```

```bash [Bun]
bun x monopkg catalog rename frontend ui --dry
```

```bash [NPM]
npx monopkg catalog rename frontend ui --dry
```

```bash [Yarn]
yarn dlx monopkg catalog rename frontend ui --dry
```

:::

## How it works

The rename command works by:

1. Checking that the old catalog name exists
2. Checking that the new catalog name doesn't already exist
3. Creating a new catalog with the new name containing all packages from the old catalog
4. Deleting the old catalog
5. Updating all package.json files that reference the old catalog name to use the new name
6. Saving all changes

## Sample scenario

### Before renaming

Let's say your root `package.json` looks like this:

```json
{
  "name": "my-monorepo",
  "catalogs": {
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

And you have a package that references the frontend catalog in `packages/my-app/package.json`:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "react": "catalog:frontend",
    "typescript": "catalog:frontend"
  }
}
```

### After renaming

After running `monopkg catalog rename frontend ui`, the root `package.json` will look like:

```json
{
  "name": "my-monorepo",
  "catalogs": {
    "ui": {
      "react": "18.2.0",
      "typescript": "5.0.0"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

And the `packages/my-app/package.json` will be updated to:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "react": "catalog:ui",
    "typescript": "catalog:ui"
  }
}
```

## Constraints

1. **Old catalog must exist**: You can only rename catalogs that actually exist.

2. **New catalog must not exist**: You can't rename a catalog to a name that already exists.

3. **Automatic reference updates**: All packages in your monorepo that reference the old catalog name will be automatically updated to use the new name.

## Use cases

1. **Naming corrections**: Fix typos or naming inconsistencies in catalog names.

2. **Reorganization**: Reorganize your catalogs to better reflect your project structure or team organization.

3. **Standardization**: Standardize catalog names across multiple monorepos in your organization.

4. **Lifecycle changes**: Rename catalogs to reflect changes in their purpose (e.g., `experimental` to `stable`).

## Best practices

1. **Check references**: Before renaming, make sure you understand which packages reference the catalog.

2. **Coordinate with team**: If working in a team, coordinate catalog renames to avoid conflicts.

3. **Update documentation**: Update any internal documentation that references the old catalog names.

4. **Use descriptive names**: Choose new names that clearly describe the catalog's purpose.

5. **Test after renaming**: After renaming, test that your packages still work correctly.