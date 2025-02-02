# Use Packages

In a monorepo, it is common to link internal packages to other packages within the monorepo. This is especially useful
when you are developing multiple packages that depend on each other.

Unlike the `link` command, this command does not require you to link the target package globally first. It also adheres
to the workspace configuration of the monorepo.

::: info Example

In a Bun workspace, to use internal packages, we will use `workspace:*` as the version in the `package.json` file. For
example:

```json
{
  "dependencies": {
    "@beerush/ui": "workspace:*"
  }
}
```

Under the hood, this command performs the following steps:

1. Edits the `package.json` file of each package to include the specified packages as dependencies by following the
   workspace configuration.
2. Runs the `install` command to link the packages.

:::

## Usage

Use the following command to link internal packages to all packages in the monorepo:

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

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- `-D, --dev` - Link as dev dependencies.
- `-P, --peer` - Link as peer dependencies.

::: info Note

If you do not specify any options, the packages will be linked as dependencies.

:::

## Examples

### Basic Usage

Use `ui` package in all packages in the monorepo.

::: code-group

```bash [Global]
monopkg use ui
```

```bash [Bun]
bun x @beerush/monopkg use ui
```

```bash [NPM]
npx @beerush/monopkg use ui
```

```bash [Yarn]
yarn x @beerush/monopkg use ui
```

:::

::: info Output

```json
{
  "dependencies": {
    "@beerush/ui": "workspace:*" // [!code ++]
  }
}
```

:::

::: details Self Linking?

Don't worry about linking the package to itself. The command will automatically exclude the package from the list of
packages to link.

:::


### Advanced Usage

Use `ui` and `core` packages as `devDependencies` in `app-a` and `util-b` packages under the `apps` and `utils` workspaces.

::: code-group

```bash [Global]
monopkg use -D ui core -F app-a util-b -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg use -D ui core -F app-a util-b -R apps utils
```

```bash [NPM]
npx @beerush/monopkg use -D ui core -F app-a util-b -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg use -D ui core -F app-a util-b -R apps utils
```

:::
