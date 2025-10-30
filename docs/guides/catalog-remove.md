# Remove from Catalog

Remove packages from catalogs with the `remove` command. This command allows you to clean up packages that are no longer needed or to reorganize your catalogs.

## Usage

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

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Options

- **`-c`**, **`--catalog`** `<name>` - Remove from specific catalog group
- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

## Examples

### Remove specific packages from the global catalog

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

### Remove packages from a specific catalog group

Remove `typescript` from the `frontend` catalog group:

::: code-group

```bash [Global]
monopkg catalog remove typescript -c frontend
```

```bash [Bun]
bun x monopkg catalog remove typescript -c frontend
```

```bash [NPM]
npx monopkg catalog remove typescript -c frontend
```

```bash [Yarn]
yarn dlx monopkg catalog remove typescript -c frontend
```

:::

### Interactive mode

Launch interactive mode to select packages to remove:

::: code-group

```bash [Global]
monopkg catalog remove
```

```bash [Bun]
bun x monopkg catalog remove
```

```bash [NPM]
npx monopkg catalog remove
```

```bash [Yarn]
yarn dlx monopkg catalog remove
```

:::

In interactive mode, you can:
1. Select packages to remove from each catalog
2. Choose which catalogs to operate on
3. Remove packages from multiple catalogs in one session

### Remove from specific catalog interactively

Select packages to remove from a specific catalog:

::: code-group

```bash [Global]
monopkg catalog remove -c frontend
```

```bash [Bun]
bun x monopkg catalog remove -c frontend
```

```bash [NPM]
npx monopkg catalog remove -c frontend
```

```bash [Yarn]
yarn dlx monopkg catalog remove -c frontend
```

:::

### Dry run

To see what would be removed without actually making changes:

::: code-group

```bash [Global]
monopkg catalog remove react -c frontend --dry
```

```bash [Bun]
bun x monopkg catalog remove react -c frontend --dry
```

```bash [NPM]
npx monopkg catalog remove react -c frontend --dry
```

```bash [Yarn]
yarn dlx monopkg catalog remove react -c frontend --dry
```

:::

## Command variations

The remove command can be used in several ways:

1. **No arguments**: Interactive mode to select packages from all catalogs
2. **Packages only**: Specify packages to remove, then select which catalogs to remove them from
3. **Catalog only**: Select which catalog to operate on, then select packages to remove
4. **Both packages and catalog**: Directly remove specified packages from the specified catalog

## Sample scenario

### Before removal

Let's say your root `package.json` looks like this:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21",
    "react": "18.2.0"
  },
  "catalogs": {
    "frontend": {
      "react": "18.2.0",
      "typescript": "5.0.0"
    },
    "backend": {
      "express": "4.18.2"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

### After removal

After running `monopkg catalog remove react --global`, the root `package.json` will look like:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21"
  },
  "catalogs": {
    "frontend": {
      "react": "18.2.0",
      "typescript": "5.0.0"
    },
    "backend": {
      "express": "4.18.2"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

After running `monopkg catalog remove react typescript -c frontend`, the root `package.json` will look like:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21"
  },
  "catalogs": {
    "frontend": {},
    "backend": {
      "express": "4.18.2"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

## Important considerations

1. **Package usage**: Removing a package from a catalog doesn't automatically update packages that reference it. If packages in your monorepo are using the removed catalog entry, they will continue to work with their current resolved versions, but they won't be able to resolve the catalog reference anymore.

2. **Multiple catalogs**: A package can exist in multiple catalogs. When removing, you specify which catalog to remove it from.

3. **Empty catalogs**: Removing the last package from a catalog will leave an empty catalog. You can delete empty catalogs with the `catalog delete` command.

## Best practices

1. **Check usage**: Before removing packages from catalogs, check if any packages in your monorepo are using them.

2. **Clean up empty catalogs**: After removing packages, consider deleting empty catalogs to keep your configuration clean.

3. **Document changes**: Keep track of why packages were removed from catalogs for future reference.

4. **Use interactive mode**: When in doubt, use interactive mode to visually confirm which packages you're removing.