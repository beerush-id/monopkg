# Link Packages

This document provides instructions on how to create links between packages in the monorepo.

By using the `attach` command, you can link packages in the monorepo. This command will add the specified packages to the `dependencies`, `devDependencies`, `peerDependencies`, or `optionalDependencies` field in the `package.json` file of the target package.

## Command

Use the following commands to link packages:

::: code-group

```bash [Global]
monopkg attach <packages...> [options]
```

```bash [Bun]
bun x monopkg attach <packages...> [options]
```

```bash [NPM]
npx monopkg attach <packages...> [options]
```

```bash [Yarn]
yarn dlx monopkg attach <packages...> [options]
```
:::

## Options

- **`-d`**, `--dev` - Add packages as devDependencies.
- **`-p`**, `--peer` - Add packages as peerDependencies.
- **`-o`**, `--optional` - Add packages as optionalDependencies.
- **`-w`**, `--workspace` - Root workspace of the packages.
- **`-f`**, `--filter` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.

## Examples

Link `ui` package to the `web` package as `devDependencies`.

::: code-group

```bash [Global]
monopkg attach ui -f web -d
```

```bash [Bun]
bun x monopkg attach ui -f web -d
```

```bash [NPM]
npx monopkg attach ui -f web -d
```

```bash [Yarn]
yarn dlx monopkg attach ui -f web -d
```

:::

::: info Output

The updated `package.json` file of the `web` package will look like this:

```json
{
  "devDependencies": {
    "eslint": "^7.32.0",
    "ui": "workspace:*" // [!code ++]
  }
}
```

:::
