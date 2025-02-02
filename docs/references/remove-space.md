# Remove Workspaces

This guides will show you how to remove a workspaces from your monorepo.

::: warning Note

This command only removes the workspace from the `workspaces` field in the `package.json` file. It does not delete the workspace directory.

:::

## Usage

Use the following commands to remove a workspace:

::: code-group

```bash [Global]
monopkg remove-space <space-name...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg remove-space <space-name...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg remove-space <space-name...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg remove-space <space-name...> [global-options]
```

:::

## Examples

Remove the `foo`, `bar`, and `baz` workspaces from your monorepo:

::: code-group

```bash [Global]
monopkg remove-space foo bar baz
```

```bash [Bun]
bun x @beerush/monopkg remove-space foo bar baz
```

```bash [NPM]
npx @beerush/monopkg remove-space foo bar baz
```

```bash [Yarn]
yarn x @beerush/monopkg remove-space foo bar baz
```

:::
