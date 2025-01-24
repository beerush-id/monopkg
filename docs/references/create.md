# Create Package from Template

In a monorepo, you may need to create new packages from templates to streamline the development process. By using the `monopkg create` command, you can quickly generate new packages with predefined configurations and structures. This not only saves time but also ensures consistency across your packages, making it easier to maintain and scale your monorepo.

## Command

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

::: info [Global Options](../guides/usage#global-options)

- **`-r`**, `--root` - Root workspace of the packages. If not specified, the default workspace is `packages`.

:::

### Options

- **`-n <package-name>`**, **`--name <package-name>`** - Package name.
- **`-p <package-path>`**, **`--path <package-path>`** - Path to the package directory.
- **`-v <version>`**, **`--version <version>`** - Initial version of the package (default: `0.0.1`).

::: tip Package Name
Some templates such as `vite` share the same package name and folder name. If you want to create a package with a scoped name (e.g., `@beerush/ui`) in `./packages/ui`, you need to manually edit the `package.json` file after the package is created.

With the `-n` or `--name` option, you can specify the package name when creating the package, but the folder name will remain as is, so you don't need to manually edit the `package.json` file.
:::

::: tip Template Path
Some template simply put the project files in the current directory, so you need to create a new directory before creating the package.

With the `-p` or `--path` option, you can specify the path to the package directory when creating the package, so you don't need to create a new directory manually.
:::

## Examples

1. **Create a new package named `my-package` from `vite` template (`./packages/my-package`).**

   ::: code-group

   ```bash [Global]
   monopkg create vite -n my-package
   ```

   ```bash [Bun]
   bun x @beerush/monopkg create vite -n my-package
   ```

   ```bash [NPM]
   npx @beerush/monopkg create vite -n my-package
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg create vite -n my-package
   ```

   :::

   ::: details Alternative

   The command above is equivalent to running the following commands:

   1. Run `cd ./packages`.
   2. Run `npx create-vite`.

   :::

2. **Create a new package named `@beerush/ui` from a special format (`./packages/ui`).**

   Some template using `npx {template-name} create` format, so we can use this command to work with them.
   For example, svelte template now using `npx sv create`.

   ::: code-group

   ```bash [Global]
   monopkg create sv-create -n @beerush/ui
   ```

   ```bash [Bun]
   bun x @beerush/monopkg create sv-create -n @beerush/ui
   ```

   ```bash [NPM]
   npx @beerush/monopkg create sv-create -n @beerush/ui
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg create sv-create -n @beerush/ui
   ```

   :::

   ::: details Alternative

   The command above is equivalent to:

   1. Run `cd ./packages`.
   2. Run `npx sv create`.
   3. Edit the `package.json` file to change the package name to `@beerush/ui`.

   :::

3. **Create a new package named `@beerush/test` in a specific path (`./packages/test-pkg`).**

   ::: code-group

   ```bash [Global]
   monopkg create vite -n @beerush/test -p test-pkg
   ```

   ```bash [Bun]
   bun x @beerush/monopkg create vite -n @beerush/test -p test-pkg
   ```

   ```bash [NPM]
   npx @beerush/monopkg create vite -n @beerush/test -p test-pkg
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg create vite -n @beerush/test -p test-pkg
   ```

   :::
