# Versioning

Use this command to update the version of packages in the monorepo. You can update all packages or specific ones.

## Command

Update the version of all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg version [version]
```

```bash [Bun]
bun x monopkg version [version]
```

```bash [NPM]
npx monopkg version [version]
```

```bash [Yarn]
yarn dlx monopkg version [version]
```

:::

## Options

- **`-f`**, `--filter` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-w`**, `--workspace` - Root workspace of the packages.

## Examples

### Patch version all packages

::: code-group

```bash [Global]
monopkg version patch
```

```bash [Bun]
bun x monopkg version patch
```

```bash [NPM]
npx monopkg version patch
```

```bash [Yarn]
yarn dlx monopkg version patch
```

:::

### Minor version all packages

::: code-group

```bash [Global]
monopkg version minor
```

```bash [Bun]
bun x monopkg version minor
```

```bash [NPM]
npx monopkg version minor
```

```bash [Yarn]
yarn dlx monopkg version minor
```

:::

### Major version all packages

::: code-group

```bash [Global]
monopkg version major
```

```bash [Bun]
bun x monopkg version major
```

```bash [NPM]
npx monopkg version major
```

```bash [Yarn]
yarn dlx monopkg version major
```

:::

### Patch version specific packages

::: code-group

```bash [Global]
monopkg version patch -f package-a package-b
```

```bash [Bun]
bun x monopkg version patch -f package-a package-b
```

```bash [NPM]
npx monopkg version patch -f package-a package-b
```

```bash [Yarn]
yarn dlx monopkg version patch -f package-a package-b
```

:::

### Set specific version for all packages

::: code-group

```bash [Global]
monopkg version 1.2.3
```

```bash [Bun]
bun x monopkg version 1.2.3
```

```bash [NPM]
npx monopkg version 1.2.3
```

```bash [Yarn]
yarn dlx monopkg version 1.2.3
```

:::
