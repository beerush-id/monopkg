# Adding Dependencies

In a monorepo, you may have multiple packages that share common dependencies. To avoid installing the same dependencies
multiple times, you can use the `monopkg add` command to install dependencies for all packages in the monorepo at once.
This not only saves time but also ensures consistency across your packages.

By using the `monopkg add` command, you can specify various options to tailor the installation process to your needs.
For instance, you can include or exclude specific packages, install dependencies as dev or peer dependencies, and even
target specific workspaces within your monorepo. This flexibility allows you to manage your dependencies efficiently and
keep your project organized.

## Usage

This command allows you to install dependencies for all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg add [options] <dependencies...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg add [options] <dependencies...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg add [options] <dependencies...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg add [options] <dependencies...> [global-options]
```

:::

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- **`-D`**, `--dev` - Install as dev dependencies.
- **`-P`**, `--peer` - Install as peer dependencies.

## Examples

### Basic Usage

Add `lodash` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg add lodash
```

```bash [Bun]
bun x @beerush/monopkg add lodash
```

```bash [NPM]
npx @beerush/monopkg add lodash
```

```bash [Yarn]
yarn x @beerush/monopkg add lodash
```

:::

::: details Comparison

The command above is equivalent to running the following commands for each package in the monorepo:

- `cd ./packages/pkg-a && bun add lodash`
- `cd ./packages/pkg-b && bun add lodash`
- `cd ./packages/pkg-c && bun add lodash`
- `cd ./packages/pkg-d && bun add lodash`
- _and so on_.

:::

::: details Output

::: code-group

```json [package-a/package.json]
{
  "dependencies": {
    "lodash": "^4.17.21",    // [!code ++]
    "some-package": "^1.0.0"
  }
}
```

```json [package-b/package.json]
{
  "dependencies": {
    "lodash": "^4.17.21",    // [!code ++]
    "some-package": "^1.0.0"
  }
}
```

```json [...rest of the packages]
{
  "dependencies": {
    "lodash": "^4.17.21",    // [!code ++]
    "some-package": "^1.0.0"
  }
}
```

:::

### With Inclusion Filters

Add `lodash` to `package-a` and `package-b`.

::: code-group

```bash [Global]
monopkg add lodash -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg add lodash -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg add lodash -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg add lodash -F package-a package-b
```

:::

::: details Comparison

The command above is equivalent to running the following commands:

- `cd ./packages/package-a && bun add lodash`
- `cd ./packages/package-b && bun add lodash`

:::

### With Target Environments

Add `lodash` and `typescript` as `devDependencies` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg add -D lodash typescript
```

```bash [Bun]
bun x @beerush/monopkg add -D lodash typescript
```

```bash [NPM]
npx @beerush/monopkg add -D lodash typescript
```

```bash [Yarn]
yarn x @beerush/monopkg add -D lodash typescript
```

:::

::: details Comparison

The command above is equivalent to running the following commands for each package in the monorepo:

- `cd ./packages/pkg-a && bun add -D lodash typescript`
- `cd ./packages/pkg-b && bun add -D lodash typescript`
- `cd ./packages/pkg-c && bun add -D lodash typescript`
- `cd ./packages/pkg-d && bun add -D lodash typescript`
- _and so on_.

:::

### With Exclusion Filters

Add `lodash` and `typescript` as `peerDependencies` to all packages in the monorepo, except `package-a`.

::: code-group

```bash [Global]
monopkg add -P lodash typescript -E package-a
```

```bash [Bun]
bun x @beerush/monopkg add -P lodash typescript -E package-a
```

```bash [NPM]
npx @beerush/monopkg add -P lodash typescript -E package-a
```

```bash [Yarn]
yarn x @beerush/monopkg add -P lodash typescript -E package-a
```

:::

::: details Comparison

The command above is equivalent to running the following commands for each package in the monorepo, except
`package-a`:

- `cd ./packages/pkg-b && bun add -P lodash typescript`
- `cd ./packages/pkg-c && bun add -P lodash typescript`
- `cd ./packages/pkg-d && bun add -P lodash typescript`
- _and so on_.

:::

### With Target Workspaces

Add `lodash` to all packages in the `apps` workspace.

::: code-group

```bash [Global]
monopkg add lodash -R apps
```

```bash [Bun]
bun x @beerush/monopkg add lodash -R apps
```

```bash [NPM]
npx @beerush/monopkg add lodash -R apps
```

```bash [Yarn]
yarn x @beerush/monopkg add lodash -R apps
```

:::

::: details Comparison

The command above is equivalent to running the following commands for each package in the `apps` workspace:

- `cd ./apps/app-a && bun add lodash`
- `cd ./apps/app-b && bun add lodash`
- `cd ./apps/app-c && bun add lodash`
- `cd ./apps/app-d && bun add lodash`
- _and so on_.

:::

### Advanced Usage

Add `eslint` and `typesript` as `devDependencies` to all packages in the `apps` and `utils` workspaces, except `app-a` and `util-a`.

::: code-group

```bash [Global]
monopkg add -D eslint typescript -R apps utils -E app-a util-a
```

```bash [Bun]
bun x @beerush/monopkg add -D eslint typescript -R apps utils -E app-a util-a
```

```bash [NPM]
npx @beerush/monopkg add -D eslint typescript -R apps utils -E app-a util-a
```

```bash [Yarn]
yarn x @beerush/monopkg add -D eslint typescript -R apps utils -E app-a util-a
```

:::

::: details Comparison

The command above is equivalent to running the following commands:

- `cd ./apps/app-b && bun add -D eslint typescript`
- `cd ./apps/app-c && bun add -D eslint typescript`
- `cd ./apps/app-d && bun add -D eslint typescript`
- `cd ./utils/util-b && bun add -D eslint typescript`
- `cd ./utils/util-c && bun add -D eslint typescript`

:::
