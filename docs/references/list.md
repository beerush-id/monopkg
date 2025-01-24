# List Packages

This document provides instructions on how to list all packages in the monorepo using different package managers.

## Command

Use the following commands to list packages:

::: code-group

```bash [Global]
monopkg list [options] [global-options]
```

```bash [Bun]
bun x @beerush/monopkg list [options]
```

```bash [NPM]
npx @beerush/monopkg list [options]
```

```bash [Yarn]
yarn x @beerush/monopkg list [options]
```

:::

::: info [Global Options](../guides/usage#global-options)

- **`-r`**, `--root` - Specify the root workspace of the packages. Defaults to `packages` if not specified.

:::

## Options

- `--public` - Show only public packages.
- `--private` - Show only private packages.
- `--restricted` - Show only restricted packages.
- `--publishable` - Show only publishable packages.

## Examples

### List all packages

::: code-group

```bash [Global]
monopkg list
```

```bash [Bun]
bun x @beerush/monopkg list
```

```bash [NPM]
npx @beerush/monopkg list
```

```bash [Yarn]
yarn x @beerush/monopkg list
```

:::

### List all public packages

::: code-group

```bash [Global]
monopkg list --public
```

```bash [Bun]
bun x @beerush/monopkg list --public
```

```bash [NPM]
npx @beerush/monopkg list --public
```

```bash [Yarn]
yarn x @beerush/monopkg list --public
```

:::

### List all packages under `apps` workspace

::: code-group

```bash [Global]
monopkg list -r apps
```

```bash [Bun]
bun x @beerush/monopkg list -r apps
```

```bash [NPM]
npx @beerush/monopkg list -r apps
```

```bash [Yarn]
yarn x @beerush/monopkg list -r apps
```

:::
