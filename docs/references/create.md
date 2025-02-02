# Create Package Using Template

In a monorepo, you may need to create new packages from templates to streamline the development process. By using the `monopkg create` command, you can quickly generate new packages with predefined configurations and structures. This not only saves time but also ensures consistency across your packages, making it easier to maintain and scale your monorepo.

## Usage

This command allows you to create a new package from a template.

::: code-group

```bash [Global]
monopkg create <template-name> [options] [global-options]
```

```bash [Bun]
bun x @beerush/monopkg create <template-name> [options] [global-options]
```

```bash [NPM]
npx @beerush/monopkg create <template-name> [options] [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg create <template-name> [options] [global-options]
```

:::

::: info Global Options

- **`-R`**, `--root` - Root workspace of the new package (default: `./packages`).

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- **`-N`**, **`--name`** - Package name.
- **`-O`**, **`--out`** - Path to the package directory.
- **`-V`**, **`--version`** - Initial version of the package (default: `0.0.1`).

::: info Package Name
Some templates such as `vite` share the same package name and folder name. If you want to create a package with a scoped name (e.g., `@beerush/ui`) in `./packages/ui`, you need to manually edit the `package.json` file after the package is created.

With the `--name` option, you can specify the package name when creating the package, but the folder name will remain as is, so you don't need to manually edit the `package.json` file.
:::

::: info Template Path
Some template simply put the project files in the current directory, so you need to create a new directory and `cd` to it before creating the package.

With the `--out` option, you can specify the path to the package directory when creating the package, so you don't need to create a new directory manually.
:::

## Examples

### Basic Usage

Create a new package named `my-package` using `vite` template. The new package will be created in the `packages` workspace (`./packages/my-package`).

::: code-group

```bash [Global]
monopkg create vite -N my-package
```

```bash [Bun]
bun x @beerush/monopkg create vite -N my-package
```

```bash [NPM]
npx @beerush/monopkg create vite -N my-package
```

```bash [Yarn]
yarn x @beerush/monopkg create vite -N my-package
```

:::

### Special Format

Create a new package named `@beerush/ui` using a special format. The new package will be created in the `packages` workspace (`./packages/ui`).

::: code-group

```bash [Global]
monopkg create sv-create -N @beerush/ui
```

```bash [Bun]
bun x @beerush/monopkg create sv-create -N @beerush/ui
```

```bash [NPM]
npx @beerush/monopkg create sv-create -N @beerush/ui
```

```bash [Yarn]
yarn x @beerush/monopkg create sv-create -N @beerush/ui
```

:::

::: info Note

Some template using `npx {template-name} create` format, so we can use this command to work with them.
For example, svelte template now using `npx sv create`.

The command above is equivalent to:

1. Run `cd ./packages`.
2. Run `npx sv create`.
3. Edit the `package.json` file to change the package name to `@beerush/ui`.

:::

### Advanced Usage

Create a new package named `@beerush/test` version `1.0.0` in `test-pkg` folder in `apps` workspace (`./apps/test-pkg`).

::: code-group

```bash [Global]
monopkg create vite -R apps -O test-pkg -N @beerush/test -V "1.0.0"
```

```bash [Bun]
bun x @beerush/monopkg create vite -R apps -O test-pkg -N @beerush/test -V "1.0.0"
```

```bash [NPM]
npx @beerush/monopkg create vite -R apps -O test-pkg -N @beerush/test -V "1.0.0"
```

```bash [Yarn]
yarn x @beerush/monopkg create vite -R apps -O test-pkg -N @beerush/test -V "1.0.0"
```

:::
