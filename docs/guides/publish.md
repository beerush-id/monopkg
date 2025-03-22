# Publishing

Use the `publish` command to publish your packages to the npm registry.

## Command

Publish all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg publish
```

```bash [Bun]
bun x monopkg publish
```

```bash [NPM]
npx monopkg publish
```

```bash [Yarn]
yarn dlx monopkg publish
```

:::


::: tip Note

The `publish` command uses the `npm publish` command under the hood. Make sure you are logged in to the npm registry before running the command.

:::


## Options

- **`-f`**, `--filter` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-w`**, `--workspace` - Root workspace of the packages.

## Examples

### Publish all packages

::: code-group

```bash [Global]
monopkg publish
```

```bash [Bun]
bun x monopkg publish
```

```bash [NPM]
npx monopkg publish
```

```bash [Yarn]
yarn dlx monopkg publish
```

:::

### Publish specific packages

::: code-group

```bash [Global]
monopkg publish -f package1 package2
```

```bash [Bun]
bun x monopkg publish -f package1 package2
```

```bash [NPM]
npx monopkg publish -f package1 package2
```

```bash [Yarn]
yarn dlx monopkg publish -f package1 package2
```

:::
