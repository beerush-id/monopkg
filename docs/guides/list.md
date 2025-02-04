# List Packages

This document provides instructions on how to list all packages in the monorepo.

## Usage

Use the following commands to list packages:

::: code-group

```bash [Global]
monopkg list [options]
```

```bash [Bun]
bun x monopkg list [options]
```

```bash [NPM]
npx monopkg list [options]
```

```bash [Yarn]
yarn dlx monopkg list [options]
```

:::

## Options

- **`-w`**, `--workspace` - Root workspaces of the packages.
- **`-i`**, `--info` - Show information of the specified fields.
- `--public` - Show only public packages.
- `--private` - Show only private packages.
- `--restricted` - Show only restricted packages.
- `--publishable` - Show only publishable packages.

## Examples

### Basic Usage

List all packages in the monorepo.

::: code-group

```bash [Global]
monopkg list
```

```bash [Bun]
bun x monopkg list
```

```bash [NPM]
npx monopkg list
```

```bash [Yarn]
yarn dlx monopkg list
```

:::

::: info Sample Output

![List all Packages](/list-all.jpg)

:::

### With Information

List all packages and show package's `name`, `version`, and `type` fields.

::: code-group

```bash [Global]
monopkg list --info name version type
```

```bash [Bun]
bun x monopkg list --info name version type
```

```bash [NPM]
npx monopkg list --info name version type
```

```bash [Yarn]
yarn dlx monopkg list --info name version type
```

:::

### Public Packages

List all public packages.

::: code-group

```bash [Global]
monopkg list --public
```

```bash [Bun]
bun x monopkg list --public
```

```bash [NPM]
npx monopkg list --public
```

```bash [Yarn]
yarn dlx monopkg list --public
```

:::

### Advanced Usage

List all `private` packages under `apps` workspace, and show package's `name`, `version`, and `type` fields.

::: code-group

```bash [Global]
monopkg list --private -w apps --info name version type
```

```bash [Bun]
bun x monopkg list --private -w apps --info name version type
```

```bash [NPM]
npx monopkg list --private -w apps --info name version type
```

```bash [Yarn]
yarn dlx monopkg list --private -w apps --info name version type
```

:::

::: info Sample Output

![List Packages](/list.jpg)

:::
