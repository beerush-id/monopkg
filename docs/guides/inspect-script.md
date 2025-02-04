# Inspect Scripts

The `script inspect` command allows you to inspect the scripts in the `package.json` files of all packages in the workspace.

## Usage

To inspect the scripts in the `package.json` files of all packages in the workspace, you can run the following command:

::: code-group

```bash [Global]
monopkg script inspect [name...]
```

```bash [Bun]
bun x monopkg script inspect [name...]
```

```bash [NPM]
npx monopkg script inspect [name...]
```

```bash [Yarn]
yarn dlx monopkg script inspect [name...]
```

:::


## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

## Examples

List all scripts in the `package.json` files of all packages in the workspace:

::: code-group

```bash [Global]
monopkg script inspect
```

```bash [Bun]
bun x monopkg script inspect
```

```bash [NPM]
npx monopkg script inspect
```

```bash [Yarn]
yarn dlx monopkg script inspect
```

:::

List specific scripts in the `package.json` files of all packages in the workspace:

::: code-group

```bash [Global]
monopkg script inspect build test
```

```bash [Bun]
bun x monopkg script inspect build test
```

```bash [NPM]
npx monopkg script inspect build test
```

```bash [Yarn]
yarn dlx monopkg script inspect build test
```

:::
