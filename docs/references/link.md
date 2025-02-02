# Link Dependencies

In some cases, you may want to link local dependencies outside the monorepo to all packages within the monorepo.

## Usage

Use the following command to link dependencies to all packages in the monorepo simultaneously.

::: code-group

```bash [Global]
monopkg link [options] <dependencies...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg link [options] <dependencies...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg link [options] <dependencies...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg link [options] <dependencies...> [global-options]
```

:::

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- **`-S`**, `--save` - Link as dependencies.
- **`-D`**, `--dev` - Link as dev dependencies.
- **`-P`**, `--peer` - Link as peer dependencies.

::: info
If no option is provided, the dependencies will not be added to the `package.json` file.
:::

## Examples

Link `@beerush/utils` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg link -S @beerush/utils
```

```bash [Bun]
bun x @beerush/monopkg link -S @beerush/utils
```

```bash [NPM]
npx @beerush/monopkg link -S @beerush/utils
```

```bash [Yarn]
yarn x @beerush/monopkg link -S @beerush/utils
```

:::

Link `@beerush/utils` and `@beerush/core` as `devDependencies` to `package-a` and `package-b`.

::: code-group

```bash [Global]
monopkg link -D @beerush/utils @beerush/core -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg link -D @beerush/utils @beerush/core -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg link -D @beerush/utils @beerush/core -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg link -D @beerush/utils @beerush/core -F package-a package-b
```

:::
