# Unlink Dependencies

This guides explains how to unlink dependencies from all packages in a monorepo.

## Usage

To unlink dependencies from all packages in the monorepo, use the following command:

::: code-group

```bash [Global]
monopkg unlink <package-name...> [options] [global-options]
```

```bash [Bun]
bun x @beerush/monopkg unlink <package-name...> [options] [global-options]
```

```bash [NPM]
npx @beerush/monopkg unlink <package-name...> [options] [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg unlink <package-name...> [options] [global-options]
```

:::

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- `-S, --save` - Also remove the entry from the `package.json` file.

## Examples

### Basic Usage

Unlink `@beerush/utils` from all packages in the monorepo:

::: code-group

```bash [Global]
monopkg unlink @beerush/utils
```

```bash [Bun]
bun x @beerush/monopkg unlink @beerush/utils
```

```bash [NPM]
npx @beerush/monopkg unlink @beerush/utils
```

```bash [Yarn]
yarn x @beerush/monopkg unlink @beerush/utils
```

:::

### Using Filters

Unlink `@beerush/utils` and `@beerush/ui` from `package-a` and `package-b`, and remove the entry from the `package.json` file:

::: code-group

```bash [Global]
monopkg unlink -S @beerush/utils @beerush/ui -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg unlink -S @beerush/utils @beerush/ui -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg unlink -S @beerush/utils @beerush/ui -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg unlink -S @beerush/utils @beerush/ui -F package-a package-b
```

:::

### Using Targeted Workspaces

Unlink `@beerush/utils` from all packages in the `apps` and `utils` workspaces:

::: code-group

```bash [Global]
monopkg unlink @beerush/utils -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg unlink @beerush/utils -R apps utils
```

```bash [NPM]
npx @beerush/monopkg unlink @beerush/utils -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg unlink @beerush/utils -R apps utils
```

:::
