# Initialize Basic Package

A basic package is a simple package with a main file, without any template or configuration.

::: info
To create a package from a template, use the [`monopkg create`](./create) command.
:::

## Command

This command creates a basic package within a workspace.

::: code-group

```bash [Global]
monopkg init <directory-name> [options] [global-options]
```

```bash [Bun]
bun x @beerush/monopkg init <directory-name> [options] [global-options]
```

```bash [NPM]
npx @beerush/monopkg init <directory-name> [options] [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg init <directory-name> [options] [global-options]
```

:::

::: info [Global Options](../guides/usage#global-options)

- **`-r`**, `--root` - Specifies the root workspace of the packages. Defaults to `packages` if not provided.

:::

### Options

| Option                   | Alias | Argument                      | Description                                                     |
|--------------------------|-------|-------------------------------|-----------------------------------------------------------------|
| <nobr>`--name`</nobr>    | `-n`  | <nobr>`<package-name>`</nobr> | Sets the package name (default: `<directory-name>`).            |
| <nobr>`--scope`</nobr>   | `-s`  | <nobr>`<scope-name>`</nobr>   | Sets the scope name (e.g., `beerush` for `@beerush/<package-name>`). |
| <nobr>`--main`</nobr>    | `-m`  | <nobr>`<main-file>`</nobr>    | Specifies the main file of the package (default: `src/index.ts`). |
| <nobr>`--version`</nobr> | `-v`  | <nobr>`<version>`</nobr>      | Sets the initial version of the package (default: `0.0.1`).     |

## Examples

1. **Create a new package named `my-package` (`./packages/my-package`).**

   ::: code-group

    ```bash [Global]
    monopkg init my-package
    ```

    ```bash [Bun]
    bun x @beerush/monopkg init my-package
    ```

    ```bash [NPM]
    npx @beerush/monopkg init my-package
    ```

    ```bash [Yarn]
    yarn x @beerush/monopkg init my-package
    ```

   :::

2. **Create a new package named `@beerush/my-package` (`./packages/my-package`).**

   ::: code-group

    ```bash [Global]
    monopkg init my-package -s beerush
    ```

    ```bash [Bun]
    bun x @beerush/monopkg init my-package -s beerush
    ```

    ```bash [NPM]
    npx @beerush/monopkg init my-package -s beerush
    ```

    ```bash [Yarn]
    yarn x @beerush/monopkg init my-package -s beerush
    ```

   :::

3. **Create a new package named `my-package` with the main file `src/app.ts` (`./packages/my-package`).**

   ::: code-group

    ```bash [Global]
    monopkg init my-package -m src/app.ts
    ```

    ```bash [Bun]
    bun x @beerush/monopkg init my-package -m src/app.ts
    ```

    ```bash [NPM]
    npx @beerush/monopkg init my-package -m src/app.ts
    ```

    ```bash [Yarn]
    yarn x @beerush/monopkg init my-package -m src/app.ts
    ```

   :::

4. **Create a new package named `@beerush/my-package` under the `apps` workspace (`./apps/my-package`).**

   ::: code-group

    ```bash [Global]
    monopkg init my-package -r apps -s beerush
    ```

    ```bash [Bun]
    bun x @beerush/monopkg init my-package -r apps -s beerush
    ```

    ```bash [NPM]
    npx @beerush/monopkg init my-package -r apps -s beerush
    ```

    ```bash [Yarn]
    yarn x @beerush/monopkg init my-package -r apps -s beerush
    ```

   :::
