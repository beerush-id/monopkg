# Run Scripts

Execute concurrent scripts across all packages in the monorepo simultaneously. This command is useful for running build,
test, and other scripts in all packages at once.

## Usage

Use the following command to run scripts in all packages:

::: code-group

```bash [Global]
monopkg run <scripts...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg run <scripts...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg run <scripts...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg run <scripts...> [global-options]
```

:::

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- `-B, --before-run <scripts...>` - Execute scripts before the main script.

::: info Note

The `before-run` scripts will run on the specified packages before executing the main scripts in each package.

:::

## Examples

### Basic Usage

Run `build` script in all packages

::: code-group

```bash [Global]
monopkg run build
```

```bash [Bun]
bun x @beerush/monopkg run build
```

```bash [NPM]
npx @beerush/monopkg run build
```

```bash [Yarn]
yarn x @beerush/monopkg run build
```

:::

### Using Before Run Scripts

Run `clean` script before `build` script in all packages

::: code-group

```bash [Global]
monopkg run build --before-run clean
```

```bash [Bun]
bun x @beerush/monopkg run build --before-run clean
```

```bash [NPM]
npx @beerush/monopkg run build --before-run clean
```

```bash [Yarn]
yarn x @beerush/monopkg run build --before-run clean
```

:::

### Using Targeted Workspaces

Run `dev:esm` and `dev:cjs` scripts in the `apps` and `tools` workspaces.

::: code-group

```bash [Global]
monopkg run dev:esm dev:cjs -R apps tools
```

```bash [Bun]
bun x @beerush/monopkg run dev:esm dev:cjs -R apps tools
```

```bash [NPM]
npx @beerush/monopkg run dev:esm dev:cjs -R apps tools
```

```bash [Yarn]
yarn x @beerush/monopkg run dev:esm dev:cjs -R apps tools
```

:::

### Using Filters

Run `test` script in `package-a` and `package-b`

::: code-group

```bash [Global]
monopkg run test -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg run test -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg run test -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg run test -F package-a package-b
```

:::
