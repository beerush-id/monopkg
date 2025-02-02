# Remove Dependencies

Easily remove dependencies from all packages in your monorepo with a single command.

## Usage

This command allows you to remove dependencies from all packages in the monorepo at once.

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

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

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
monopkg remove lodash typescript -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg remove lodash typescript -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg remove lodash typescript -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg remove lodash typescript -F package-a package-b
```

:::

### Remove a Dependency from a Specific Workspace

Remove `lodash` from all packages in the `apps` workspace:

::: code-group

```bash [Global]
monopkg remove lodash -R apps
```

```bash [Bun]
bun x @beerush/monopkg remove lodash -R apps
```

```bash [NPM]
npx @beerush/monopkg remove lodash -R apps
```

```bash [Yarn]
yarn x @beerush/monopkg remove lodash -R apps
```

:::
