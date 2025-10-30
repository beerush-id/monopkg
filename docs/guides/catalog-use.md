# Use Catalog

Apply catalog versions to packages with the `use` command. This command allows you to reference catalog packages in your monorepo packages.

## Usage

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

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Options

- **`-c`**, **`--catalog`** `<name>` - Use packages from specific catalog group
- **`-s`**, **`--save`** - Add packages as dependencies
- **`-d`**, **`--dev`** - Add packages as devDependencies
- **`-o`**, **`--optional`** - Add packages as optionalDependencies
- **`-p`**, **`--peer`** - Add packages as peerDependencies
- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

## Examples

### Use packages from a specific catalog

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

### Interactive mode

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

In interactive mode, you can:
1. Select which catalogs to use packages from
2. Select which packages to use from each catalog
3. Choose which dependency type to add them as
4. Select which packages in your monorepo should use the catalog references

### Use packages as devDependencies

Use `typescript` from the global catalog as a devDependency:

::: code-group

```bash [Global]
monopkg catalog use typescript -d
```

```bash [Bun]
bun x monopkg catalog use typescript -d
```

```bash [NPM]
npx monopkg catalog use typescript -d
```

```bash [Yarn]
yarn dlx monopkg catalog use typescript -d
```

:::

### Dry run

To see what changes would be made without actually making them:

::: code-group

```bash [Global]
monopkg catalog use react -c frontend -s --dry
```

```bash [Bun]
bun x monopkg catalog use react -c frontend -s --dry
```

```bash [NPM]
npx monopkg catalog use react -c frontend -s --dry
```

```bash [Yarn]
yarn dlx monopkg catalog use react -c frontend -s --dry
```

:::

## How it works

The use command works by:

1. Adding catalog references to package.json files
2. The references take the form `catalog:` for global catalog or `catalog:groupname` for specific catalogs
3. When packages are installed with Bun, these references are resolved to actual versions from the catalogs
4. The command can target specific packages in your monorepo or let you select interactively

## Sample scenario

### Before using catalog

Let's say your root `package.json` looks like this:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "react": "18.2.0",
    "lodash": "4.17.21"
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

And you have a package at `packages/my-app/package.json`:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {}
}
```

### After using catalog

After running `monopkg catalog use react lodash -s -f my-app`, the `packages/my-app/package.json` will look like:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "lodash": "catalog:",
    "react": "catalog:"
  }
}
```

After running `monopkg catalog use typescript -c frontend -d -f my-app`, the `packages/my-app/package.json` will look like:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "lodash": "catalog:",
    "react": "catalog:"
  },
  "devDependencies": {
    "typescript": "catalog:frontend"
  }
}
```

## Interactive workflow

When you run `monopkg catalog use` without arguments, you'll go through this workflow:

1. **Select catalogs**: Choose which catalogs to use packages from (global and/or specific groups)
2. **Select packages**: For each selected catalog, choose which packages to use
3. **Choose dependency type**: Select whether to add as dependencies, devDependencies, etc.
4. **Select target packages**: Choose which packages in your monorepo should use these catalog references
5. **Confirm changes**: Review and confirm the changes before they're applied

## Catalog reference resolution

When packages are installed with Bun:

1. `catalog:` references are resolved using the global catalog
2. `catalog:frontend` references are resolved using the `frontend` catalog group
3. The resolved versions are installed as if you had specified the actual version numbers
4. If a package is not found in the specified catalog, the latest version is used

## Use cases

1. **Centralized version management**: Manage versions for common dependencies in one place
2. **Consistent dependency versions**: Ensure all packages use the same versions of shared dependencies
3. **Easy updates**: Update dependency versions across multiple packages by changing only the catalog
4. **Team coordination**: Coordinate dependency versions across teams working on different packages

## Best practices

1. **Plan your catalog structure**: Organize catalogs logically before using them extensively
2. **Document catalog usage**: Keep track of which packages use which catalogs
3. **Regular updates**: Regularly update catalog versions to keep dependencies current
4. **Test after changes**: Always test your packages after making catalog changes
5. **Use descriptive catalog names**: Choose catalog names that clearly indicate their purpose