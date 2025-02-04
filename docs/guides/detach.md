# Unlink Packages

This document provides instructions on how to remove links between packages in the monorepo.

By using the `detach` command, you can unlink packages in the monorepo. This command will remove the specified packages from the `dependencies`, `devDependencies`, `peerDependencies`, or `optionalDependencies` field in the `package.json` file of the target package.

## Command

Use the following commands to unlink packages:

::: code-group

```bash [Global]
monopkg detach <packages...> [options]
```

```bash [Bun]
bun x monopkg detach <packages...> [options]
```

```bash [NPM]
npx monopkg detach <packages...> [options]
```

```bash [Yarn]
yarn dlx monopkg detach <packages...> [options]
```
:::

## Options

- **`-w`**, `--workspace` - Root workspace of the packages.
- **`-f`**, `--filter` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.

## Examples

Unlink `ui` package from the `web` package.

::: code-group

```bash [Global]
monopkg detach ui -f web
```

```bash [Bun]
bun x monopkg detach ui -f web
```

```bash [NPM]
npx monopkg detach ui -f web
```

```bash [Yarn]
yarn dlx monopkg detach ui -f web
```

:::

::: info Output

The updated `package.json` file of the `web` package will look like this:

```json
{
  "devDependencies": {
    "eslint": "^7.32.0",
    "ui": "workspace:*" // [!code --]
  }
}
```

:::
