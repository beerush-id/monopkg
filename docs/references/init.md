# Initialize Basic Package

A basic package is a simple package with a main file, without any template or configuration.

::: info Note
To create a package using a template, use the [`monopkg create`](./create) command instead.
:::

## Usage

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

::: info Global Options

- **`-R`**, `--root` - Root workspace of the new package (default: `./packages`).

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- `-N`, `--name` - Sets the package name (default: `<directory-name>`).
- `-S`, `--scope` - Sets the scope name (e.g., `beerush` for `@beerush/<package-name>`).
- `-M`, `--main` - Specifies the main file of the package (default: `src/library.ts`).
- `-V`, `--version` - Sets the initial version of the package (default: `0.0.1`).

## Examples

### Basic Usage

Create a new package named `my-package`. The newly created package will be located in the `./packages/my-package` directory.

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

### Custom Package Name

Create a new package named `main-ui` in the `ui` directory. The newly created package will be located in the `./packages/ui` directory.

::: code-group

```bash [Global]
monopkg init ui -N main-ui
```

```bash [Bun]
bun x @beerush/monopkg init ui -N main-ui
```

```bash [NPM]
npx @beerush/monopkg init ui -N main-ui
```

```bash [Yarn]
yarn x @beerush/monopkg init ui -N main-ui
```

:::


### Scoped Package Name

Create a new package named `@beerush/my-package`. The newly created package will be located in the `./packages/my-package` directory.

::: code-group

```bash [Global]
monopkg init my-package -S beerush
```

```bash [Bun]
bun x @beerush/monopkg init my-package -S beerush
```

```bash [NPM]
npx @beerush/monopkg init my-package -S beerush
```

```bash [Yarn]
yarn x @beerush/monopkg init my-package -S beerush
```

:::

### Custom Main File

Create a new package named `my-package` with the main file `src/app.ts`. The newly created package will be located in the `./packages/my-package` directory.

::: code-group

```bash [Global]
monopkg init my-package -M src/app.ts
```

```bash [Bun]
bun x @beerush/monopkg init my-package -M src/app.ts
```

```bash [NPM]
npx @beerush/monopkg init my-package -M src/app.ts
```

```bash [Yarn]
yarn x @beerush/monopkg init my-package -M src/app.ts
```

:::

### Using Targeted Workspace

Create a new package named `@beerush/my-package` under the `apps` workspace. The newly created package will be located in the `./apps/my-package` directory.

::: code-group

```bash [Global]
monopkg init my-package -R apps -S beerush
```

```bash [Bun]
bun x @beerush/monopkg init my-package -R apps -S beerush
```

```bash [NPM]
npx @beerush/monopkg init my-package -R apps -S beerush
```

```bash [Yarn]
yarn x @beerush/monopkg init my-package -R apps -S beerush
```

:::
