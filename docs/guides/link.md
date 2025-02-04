# Link Dependencies

In some cases, you may want to link local dependencies outside the monorepo to all packages within the monorepo.

## Usage

Use the following command to link dependencies to all packages in the monorepo simultaneously.

::: code-group

```bash [Global]
monopkg link [options] <dependencies...>
```

```bash [Bun]
bun x monopkg link [options] <dependencies...>
```

```bash [NPM]
npx monopkg link [options] <dependencies...>
```

```bash [Yarn]
yarn dlx monopkg link [options] <dependencies...>
```

:::

## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

::: info NOTES

Linking dependencies will not add them to the `package.json` files of the packages. It will only create symbolic links to the specified dependencies.

:::

## Examples

Link `@beerush/utils` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg link @beerush/utils
```

```bash [Bun]
bun x monopkg link @beerush/utils
```

```bash [NPM]
npx monopkg link @beerush/utils
```

```bash [Yarn]
yarn dlx monopkg link @beerush/utils
```
