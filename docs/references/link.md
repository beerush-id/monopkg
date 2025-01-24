# Link Dependencies

In some cases, you may want to link local dependencies outside the monorepo to all packages within the monorepo.

## Command

Use the following command to link dependencies to all packages in the monorepo simultaneously.

::: code-group

```bash [Global]
monopkg link [options] <dependencies...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg link [options] <dependencies...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg link [options] <dependencies...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg link [options] <dependencies...> [global-options]
```

:::

### Options

- `-s, --save` - Link as dependencies.
- `-d, --dev` - Link as dev dependencies.
- `-p, --peer` - Link as peer dependencies.

::: info
If no option is provided, the dependencies will not be added to the `package.json` file.
:::

## Examples

Link `@beerush/utils` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg link -s @beerush/utils
```

```bash [Bun]
bun x @beerush/monopkg link -s @beerush/utils
```

```bash [NPM]
npx @beerush/monopkg link -s @beerush/utils
```

```bash [Yarn]
yarn x @beerush/monopkg link -s @beerush/utils
```

:::

Link `@beerush/utils` and `@beerush/core` as dev dependencies to `package-a` and `package-b`.

::: code-group

```bash [Global]
monopkg link -d @beerush/utils @beerush/core -i package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg link -d @beerush/utils @beerush/core -i package-a package-b
```

```bash [NPM]
npx @beerush/monopkg link -d @beerush/utils @beerush/core -i package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg link -d @beerush/utils @beerush/core -i package-a package-b
```

:::
