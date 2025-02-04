# Create Package

In a monorepo, you may need to create new packages from templates to streamline the development process. By using the `monopkg create` command, you can quickly generate new packages with predefined configurations and structures. This not only saves time but also ensures consistency across your packages, making it easier to maintain and scale your monorepo.

## Usage

This command allows you to create a new package from a template.

::: code-group

```bash [Global]
monopkg create <template-name> [options]
```

```bash [Bun]
bun x monopkg create <template-name> [options]
```

```bash [NPM]
npx monopkg create <template-name> [options]
```

```bash [Yarn]
yarn dlx monopkg create <template-name> [options]
```

:::

## Options

- **`-n`**, **`--name`** - Package name.
- **`-o`**, **`--out-path`** - Path to the package directory.
- **`-c`**, **`--cwd-path`** - Create new directory and `cd` to it.
- **`-w`**, **`--workspace`** - Workspace of the new package (default: `./packages`).

::: info NOTE

In case you are creating a package using a non-builtin template, you may encounter a situation where you need to `cd` to a specific directory before running the template command. In such cases, you can use the `--cwd-path` instead of `--out-path` option to create a new directory and `cd` to it before running the template command.

:::

## Examples

### Basic Usage

The simplest way to create a new package is by using the interactive mode. This will allow you to select the workspace, template, and package name from a list of available options.

::: code-group

```bash [Global]
monopkg create
```

```bash [Bun]
bun x monopkg create
```

```bash [NPM]
npx monopkg create
```

```bash [Yarn]
yarn dlx monopkg create
```

:::

The command will prompt you to select the workspace, template, location, and package name.

![Create Package](/package.jpg)

## Non-Built-in Templates

In case you want to use a non-built-in template, you can specify the template name as an argument. For example, to create a new package using the `create-next-app` template, you can run the following command:

::: code-group

```bash [Global]
monopkg create create-next-app
```

```bash [Bun]
bun x monopkg create create-next-app
```

```bash [NPM]
npx monopkg create create-next-app
```

```bash [Yarn]
yarn dlx monopkg create create-next-app
```

:::

::: info NOTE

Non-builtin template should follow the `npx {create-name}` format. If you need to add an argument to the template command, you need to quote the template command and arguments.

:::
