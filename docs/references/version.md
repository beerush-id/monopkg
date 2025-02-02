# Versioning

Use this command to update the version of packages in the monorepo. You can update all packages or specific ones.

::: info
If an updated package is used by another package in the monorepo, the dependent package will also be updated to use the new version.
:::

## Command

Update the version of all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg version <version> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg version <version> [global-options]
```

```bash [NPM]
npx @beerush/monopkg version <version> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg version <version> [global-options]
```

:::

::: info [Global Options](../guides/usage#global-options)
- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspace of the packages.
:::

## Examples

### Patch version all packages

::: code-group

```bash [Global]
monopkg version patch
```

```bash [Bun]
bun x @beerush/monopkg version patch
```

```bash [NPM]
npx @beerush/monopkg version patch
```

```bash [Yarn]
yarn x @beerush/monopkg version patch
```

:::

### Minor version all packages

::: code-group

```bash [Global]
monopkg version minor
```

```bash [Bun]
bun x @beerush/monopkg version minor
```

```bash [NPM]
npx @beerush/monopkg version minor
```

```bash [Yarn]
yarn x @beerush/monopkg version minor
```

:::

### Major version all packages

::: code-group

```bash [Global]
monopkg version major
```

```bash [Bun]
bun x @beerush/monopkg version major
```

```bash [NPM]
npx @beerush/monopkg version major
```

```bash [Yarn]
yarn x @beerush/monopkg version major
```

:::

### Patch version specific packages

::: code-group

```bash [Global]
monopkg version patch -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg version patch -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg version patch -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg version patch -F package-a package-b
```

:::

### Set specific version for all packages

::: code-group

```bash [Global]
monopkg version 1.2.3
```

```bash [Bun]
bun x @beerush/monopkg version 1.2.3
```

```bash [NPM]
npx @beerush/monopkg version 1.2.3
```

```bash [Yarn]
yarn x @beerush/monopkg version 1.2.3
```

:::
