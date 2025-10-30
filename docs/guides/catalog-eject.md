# Eject Catalog

Replace catalog references with actual versions using the `eject` command. This is useful when preparing packages for publishing to npm, where catalog references are not supported.

## Usage

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

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Options

- **`--dry`** - Run in dry mode without writing any changes
- **`-y`**, **`--yes`** - Skip interactive prompts and use default options

## Examples

### Eject all catalog references

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

### Dry run

To see what changes would be made without actually making them:

::: code-group

```bash [Global]
monopkg catalog eject --dry
```

```bash [Bun]
bun x monopkg catalog eject --dry
```

```bash [NPM]
npx monopkg catalog eject --dry
```

```bash [Yarn]
yarn dlx monopkg catalog eject --dry
```

:::

## How it works

The eject command works by:

1. Scanning all packages in your monorepo for catalog references (dependencies that start with `catalog:`)
2. Resolving each catalog reference to its actual version from the appropriate catalog
3. Replacing the catalog reference with the resolved version
4. Updating the package.json files with the actual versions

## Sample scenario

### Before ejection

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

And you have a package with catalog references in `packages/my-app/package.json`:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "react": "catalog:",
    "lodash": "catalog:",
    "typescript": "catalog:frontend"
  }
}
```

### After ejection

After running `monopkg catalog eject`, the `packages/my-app/package.json` will be updated to:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "react": "^18.2.0",
    "lodash": "^4.17.21",
    "typescript": "^5.0.0"
  }
}
```

Note that:
1. `catalog:` references use the global catalog
2. `catalog:frontend` references use the `frontend` catalog group
3. Version numbers are prefixed with `^` (caret) for non-prerelease versions

## Interactive mode

When you run the eject command, you'll be prompted to:

1. **Eject root package**: Choose whether to eject catalog references in the root package.json
2. **Select packages**: Choose which packages to eject catalog references from

This allows you to selectively apply the ejection to specific parts of your monorepo.

## Use cases

1. **Publishing packages**: Before publishing packages to npm, you need to replace catalog references with actual versions since npm doesn't understand catalog references.

2. **Sharing packages**: When sharing packages outside your monorepo, actual versions are more portable than catalog references.

3. **CI/CD pipelines**: Some deployment processes might not support catalog references, requiring ejection before deployment.

4. **Temporary version pinning**: For specific releases, you might want to temporarily eject to pin exact versions.

## Reverting ejection

There's no automatic way to revert ejection. If you want to go back to using catalog references, you'll need to manually update your package.json files to use catalog references again:

```json
{
  "name": "@myorg/my-app",
  "dependencies": {
    "react": "catalog:",
    "lodash": "catalog:",
    "typescript": "catalog:frontend"
  }
}
```

Then run `monopkg catalog use react lodash typescript -s` to apply the catalog versions.