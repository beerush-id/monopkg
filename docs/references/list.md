# List Packages

This document provides instructions on how to list all packages in the monorepo.

## Usage

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

::: info Global Options

- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- **`-I`**, `--info` - Show information of the specified fields.
- `--public` - Show only public packages.
- `--private` - Show only private packages.
- `--restricted` - Show only restricted packages.
- `--publishable` - Show only publishable packages.

## Examples

### Basic Usage

List all packages in the monorepo.

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

### With Information

List all packages and show package's `name`, `version`, and `type` fields.

::: code-group

```bash [Global]
monopkg list --info name version type
```

```bash [Bun]
bun x @beerush/monopkg list --info name version type
```

```bash [NPM]
npx @beerush/monopkg list --info name version type
```

```bash [Yarn]
yarn x @beerush/monopkg list --info name version type
```

:::

### Public Packages

List all public packages.

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

### Advanced Usage

List all `publishable` packages under `apps` workspace, and show package's `name`, and `version` fields.

::: code-group

```bash [Global]
monopkg list --publishable -R apps --info name version
```

```bash [Bun]
bun x @beerush/monopkg list --publishable -R apps --info name version
```

```bash [NPM]
npx @beerush/monopkg list --publishable -R apps --info name version
```

```bash [Yarn]
yarn x @beerush/monopkg list --publishable -R apps --info name version
```

:::

::: info Sample Output

```bash
Packages in @beerush/monoapp[v0.0.1]:

- ⚡apps:
  - <none>

- ⚡utils:
  - monopkg
  ↪ name         : @beerush/monopkg
  ↪ version      : 0.0.1
```

:::
