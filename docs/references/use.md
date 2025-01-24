# Use Packages

This command links internal packages to other packages within the monorepo. It also adds the dependencies to the `dependencies`, `devDependencies`, or `peerDependencies` field in each package's `package.json`.

Unlike the `link` command, this command does not require you to link the target package globally first. It also adheres to the workspace configuration of the monorepo.

For example, a `@scope/package-name` will use `*` as the version in the `package.json` file, following the workspace configuration.

::: info

Under the hood, this command performs the following steps:

1. Edits the `package.json` file of each package to include the specified packages as dependencies.
2. Runs `bun install` (or the registered package manager) to link the packages.

:::

## Command

Use the following commands based on your package manager:

::: code-group

```bash [Global]
monopkg use <package-name> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg use <package-name> [global-options]
```

```bash [NPM]
npx @beerush/monopkg use <package-name> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg use <package-name> [global-options]
```

:::

::: info [Global Options](../guides/usage#global-options)

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Root workspace of the packages.

:::

### Options

- `-s, --save` - Link as dependencies.
- `-d, --dev` - Link as dev dependencies.
- `-p, --peer` - Link as peer dependencies.

## Examples

**Use `@beerush/ui` in all packages in the monorepo.**

::: code-group

```bash [Global]
monopkg use @beerush/ui
```

```bash [Bun]
bun x @beerush/monopkg use @beerush/ui
```

```bash [NPM]
npx @beerush/monopkg use @beerush/ui
```

```bash [Yarn]
yarn x @beerush/monopkg use @beerush/ui
```

:::

::: details Alternative

The command above is equivalent to running the following commands for each package in the monorepo:

- Edit the `package.json` file of each package to include `@beerush/ui` as a dependency.
- Run `bun install` to link the package.

:::

**Use `@beerush/ui` and `@beerush/core` as dev dependencies in `package-a` and `package-b`.**

::: code-group

```bash [Global]
monopkg use -d @beerush/ui @beerush/core -i package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg use -d @beerush/ui @beerush/core -i package-a package-b
```

```bash [NPM]
npx @beerush/monopkg use -d @beerush/ui @beerush/core -i package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg use -d @beerush/ui @beerush/core -i package-a package-b
```

:::
