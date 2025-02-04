# Add Dependencies

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
monopkg add [options] <dependencies...>
```

```bash [Bun]
bun x monopkg add [options] <dependencies...>
```

```bash [NPM]
npx monopkg add [options] <dependencies...>
```

```bash [Yarn]
yarn dlx monopkg add [options] <dependencies...>
```

:::

## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.
- **`-d`**, `--dev` - Install as dev dependencies.
- **`-p`**, `--peer` - Install as peer dependencies.
- **`-o`**, `--optional` - Install as optional dependencies.

## Examples

### Basic Usage

Add `lodash` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg add lodash
```

```bash [Bun]
bun x monopkg add lodash
```

```bash [NPM]
npx monopkg add lodash
```

```bash [Yarn]
yarn dlx monopkg add lodash
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
monopkg add lodash -f package-a package-b
```

```bash [Bun]
bun x monopkg add lodash -f package-a package-b
```

```bash [NPM]
npx monopkg add lodash -f package-a package-b
```

```bash [Yarn]
yarn dlx monopkg add lodash -f package-a package-b
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
monopkg add -d lodash typescript
```

```bash [Bun]
bun x monopkg add -d lodash typescript
```

```bash [NPM]
npx monopkg add -d lodash typescript
```

```bash [Yarn]
yarn dlx monopkg add -d lodash typescript
```

:::

::: details Comparison

The command above is equivalent to running the following commands for each package in the monorepo:

- `cd ./packages/pkg-a && bun add -d lodash typescript`
- `cd ./packages/pkg-b && bun add -d lodash typescript`
- `cd ./packages/pkg-c && bun add -d lodash typescript`
- `cd ./packages/pkg-d && bun add -d lodash typescript`
- _and so on_.

:::

### With Exclusion Filters

Add `lodash` and `typescript` as `peerDependencies` to all packages in the monorepo, except `package-a`.

::: code-group

```bash [Global]
monopkg add -p lodash typescript -e package-a
```

```bash [Bun]
bun x monopkg add -p lodash typescript -e package-a
```

```bash [NPM]
npx monopkg add -p lodash typescript -e package-a
```

```bash [Yarn]
yarn dlx monopkg add -p lodash typescript -e package-a
```

:::

::: details Comparison

The command above is equivalent to running the following commands for each package in the monorepo, except
`package-a`:

- `cd ./packages/pkg-b && bun add -p lodash typescript`
- `cd ./packages/pkg-c && bun add -p lodash typescript`
- `cd ./packages/pkg-d && bun add -p lodash typescript`
- _and so on_.

:::

### With Target Workspaces

Add `lodash` to all packages in the `apps` workspace.

::: code-group

```bash [Global]
monopkg add lodash -w apps
```

```bash [Bun]
bun x monopkg add lodash -w apps
```

```bash [NPM]
npx monopkg add lodash -w apps
```

```bash [Yarn]
yarn dlx monopkg add lodash -w apps
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
monopkg add -d eslint typescript -w apps utils -e app-a util-a
```

```bash [Bun]
bun x monopkg add -d eslint typescript -w apps utils -e app-a util-a
```

```bash [NPM]
npx monopkg add -d eslint typescript -w apps utils -e app-a util-a
```

```bash [Yarn]
yarn dlx monopkg add -d eslint typescript -w apps utils -e app-a util-a
```

:::

::: details Comparison

The command above is equivalent to running the following commands:

- `cd ./apps/app-b && bun add -d eslint typescript`
- `cd ./apps/app-c && bun add -d eslint typescript`
- `cd ./apps/app-d && bun add -d eslint typescript`
- `cd ./utils/util-b && bun add -d eslint typescript`
- `cd ./utils/util-c && bun add -d eslint typescript`

:::
