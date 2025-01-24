# Remove Dependencies

Easily remove dependencies from all packages in your monorepo with a single command.

## Command

Use the following commands based on your package manager:

::: code-group

```bash [Global]
monopkg remove <package-name...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg remove <package-name...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg remove <package-name...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg remove <package-name...> [global-options]
```

:::

## Global Options

Customize the command with these options:

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Specify the root workspace of the packages.

## Examples

### Remove a Single Dependency

Remove `lodash` from all packages in the monorepo:

::: code-group

```bash [Global]
monopkg remove lodash
```

```bash [Bun]
bun x @beerush/monopkg remove lodash
```

```bash [NPM]
npx @beerush/monopkg remove lodash
```

```bash [Yarn]
yarn x @beerush/monopkg remove lodash
```

:::

### Remove Multiple Dependencies from Specific Packages

Remove `lodash` and `typescript` from `package-a` and `package-b`:

::: code-group

```bash [Global]
monopkg remove lodash typescript -i package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg remove lodash typescript -i package-a package-b
```

```bash [NPM]
npx @beerush/monopkg remove lodash typescript -i package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg remove lodash typescript -i package-a package-b
```

:::

### Remove a Dependency from a Specific Workspace

Remove `lodash` from all packages in the `apps` workspace:

::: code-group

```bash [Global]
monopkg remove lodash -r apps
```

```bash [Bun]
bun x @beerush/monopkg remove lodash -r apps
```

```bash [NPM]
npx @beerush/monopkg remove lodash -r apps
```

```bash [Yarn]
yarn x @beerush/monopkg remove lodash -r apps
```

:::
