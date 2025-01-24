# Run Scripts

Execute concurrent scripts across all packages in the monorepo simultaneously. This command is useful for running build, test, and other scripts in all packages at once.

## Command

This command runs scripts concurrently across all packages in the monorepo.

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

## Global Options

::: info [Global Options](../guides/usage#global-options)

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Specify the root workspace of the packages.

:::

### Additional Options

- `-b, --before-run <scripts...>` - Execute scripts before the main script.

::: info

The `before-run` scripts will run on all packages before executing the main scripts in each package.

:::

## Examples

### Run `build` script in all packages

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

### Run `clean` script before `build` script in all packages

::: code-group

```bash [Global]
monopkg run build -b clean
```

```bash [Bun]
bun x @beerush/monopkg run build -b clean
```

```bash [NPM]
npx @beerush/monopkg run build -b clean
```

```bash [Yarn]
yarn x @beerush/monopkg run build -b clean
```

:::

### Run `dev:esm` and `dev:cjs` scripts in the `tools` workspace

::: code-group

```bash [Global]
monopkg run dev:esm dev:cjs -r tools
```

```bash [Bun]
bun x @beerush/monopkg run dev:esm dev:cjs -r tools
```

```bash [NPM]
npx @beerush/monopkg run dev:esm dev:cjs -r tools
```

```bash [Yarn]
yarn x @beerush/monopkg run dev:esm dev:cjs -r tools
```

:::

### Run `test` script in `package-a` and `package-b`

::: code-group

```bash [Global]
monopkg run test -i package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg run test -i package-a package-b
```

```bash [NPM]
npx @beerush/monopkg run test -i package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg run test -i package-a package-b
```

:::

### Run `lint` script in the `apps` workspace

::: code-group

```bash [Global]
monopkg run lint -r apps
```

```bash [Bun]
bun x @beerush/monopkg run lint -r apps
```

```bash [NPM]
npx @beerush/monopkg run lint -r apps
```

```bash [Yarn]
yarn x @beerush/monopkg run lint -r apps
```

:::
