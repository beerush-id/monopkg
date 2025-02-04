# Unlink Dependencies

This guides explains how to unlink dependencies from all packages in a monorepo.

## Usage

To unlink dependencies from all packages in the monorepo, use the following command:

::: code-group

```bash [Global]
monopkg unlink <package-name...> [options]
```

```bash [Bun]
bun x monopkg unlink <package-name...> [options]
```

```bash [NPM]
npx monopkg unlink <package-name...> [options]
```

```bash [Yarn]
yarn dlx monopkg unlink <package-name...> [options]
```

:::


## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

## Examples

### Basic Usage

Unlink `@beerush/utils` from all packages in the monorepo:

::: code-group

```bash [Global]
monopkg unlink @beerush/utils
```

```bash [Bun]
bun x monopkg unlink @beerush/utils
```

```bash [NPM]
npx monopkg unlink @beerush/utils
```

```bash [Yarn]
yarn dlx monopkg unlink @beerush/utils
```
