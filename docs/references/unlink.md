# Unlink Dependencies

Easily unlink dependencies from all packages in your monorepo with a single command.

## Command

Use the following commands based on your package manager:

::: code-group

```bash [Global]
monopkg unlink <package-name...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg unlink <package-name...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg unlink <package-name...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg unlink <package-name...> [global-options]
```

:::

### Global Options

Use these options to customize the unlink command:

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Specify the root workspace of the packages.

## Examples

### Unlink a Single Package

Unlink `lodash` from all packages in the monorepo:

::: code-group

```bash [Global]
monopkg unlink lodash
```

```bash [Bun]
bun x @beerush/monopkg unlink lodash
```

```bash [NPM]
npx @beerush/monopkg unlink lodash
```

```bash [Yarn]
yarn x @beerush/monopkg unlink lodash
```

:::

### Unlink Multiple Packages from Specific Packages

Unlink `lodash` and `typescript` from `package-a` and `package-b`:

::: code-group

```bash [Global]
monopkg unlink lodash typescript -i package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg unlink lodash typescript -i package-a package-b
```

```bash [NPM]
npx @beerush/monopkg unlink lodash typescript -i package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg unlink lodash typescript -i package-a package-b
```

:::

### Unlink a Package from a Specific Workspace

Unlink `lodash` from all packages in the `apps` workspace:

::: code-group

```bash [Global]
monopkg unlink lodash -r apps
```

```bash [Bun]
bun x @beerush/monopkg unlink lodash -r apps
```

```bash [NPM]
npx @beerush/monopkg unlink lodash -r apps
```

```bash [Yarn]
yarn x @beerush/monopkg unlink lodash -r apps
```

:::
