# Add to Catalog

Add packages to a catalog with the `add` command. You can either specify packages explicitly or let the system detect dependencies from your packages.

## Usage

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

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Options

- **`-c`**, **`--catalog`** `<name>` - Add to specific catalog group
- **`--global`** - Add to global catalog
- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

## Examples

### Add specific packages

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

This command will add the latest versions of `react` and `lodash` to your global catalog. If you want to specify exact versions:

::: code-group

```bash [Global]
monopkg catalog add react@18.2.0 lodash@4.17.21 --global
```

```bash [Bun]
bun x monopkg catalog add react@18.2.0 lodash@4.17.21 --global
```

```bash [NPM]
npx monopkg catalog add react@18.2.0 lodash@4.17.21 --global
```

```bash [Yarn]
yarn dlx monopkg catalog add react@18.2.0 lodash@4.17.21 --global
```

:::

### Add packages to a specific catalog group

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

If the `frontend` catalog group doesn't exist, it will be created automatically.

To add packages with specific versions to a catalog group:

::: code-group

```bash [Global]
monopkg catalog add react@18.2.0 lodash@4.17.21 -c frontend
```

```bash [Bun]
bun x monopkg catalog add react@18.2.0 lodash@4.17.21 -c frontend
```

```bash [NPM]
npx monopkg catalog add react@18.2.0 lodash@4.17.21 -c frontend
```

```bash [Yarn]
yarn dlx monopkg catalog add react@18.2.0 lodash@4.17.21 -c frontend
```

:::

### Interactive mode

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

When running this command without any packages specified, MonoPKG will scan all packages in your monorepo and present an interactive selection of all external dependencies. You can choose to add all dependencies or select specific ones.

### Dry run

To see what would be added without actually making changes:

::: code-group

```bash [Global]
monopkg catalog add react@18.2.0 -c frontend --dry
```

```bash [Bun]
bun x monopkg catalog add react@18.2.0 -c frontend --dry
```

```bash [NPM]
npx monopkg catalog add react@18.2.0 -c frontend --dry
```

```bash [Yarn]
yarn dlx monopkg catalog add react@18.2.0 -c frontend --dry
```

:::

## How it works

When you add packages to a catalog:

1. If no version is specified, MonoPKG will fetch the latest version from the npm registry
2. The package and its version are added to the specified catalog in your root `package.json`
3. If the catalog doesn't exist, it will be created
4. Packages are automatically sorted alphabetically in the catalog

## Sample package.json after adding packages

After running `monopkg catalog add react@18.2.0 lodash@4.17.21 --global`, your root `package.json` will look like:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21",
    "react": "18.2.0"
  },
  "workspaces": [
    "packages/*"
  ]
}
```

After running `monopkg catalog add typescript@5.0.0 -c frontend`, your root `package.json` will look like:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21",
    "react": "18.2.0"
  },
  "catalogs": {
    "frontend": {
      "typescript": "5.0.0"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```