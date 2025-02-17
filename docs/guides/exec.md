# Execute Command

This command allows you to download and execute a package from the NPM registry.

::: info NOTE

This command is a wrapper of the active package manager. For instance, if you are using Yarn, the command will be `yarn dlx`.

:::

## Command

::: code-group

```bash [Global]
monopkg x <package> [options]
```

:::

## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

## Examples

::: code-group

```bash [Global]
monopkg x "rimraf dist" -f apps/*
```

:::

This command downloads the `rimraf` package from the NPM registry and executes the `rimraf dist` command in all packages in the `apps` workspace.
