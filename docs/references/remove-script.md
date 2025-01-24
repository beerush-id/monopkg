# Remove Scripts

Easily remove a script from all packages in your monorepo with a single command.

## Command

Use the following commands to remove a script:

::: code-group

```bash [Global]
monopkg remove-script <script-name> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg remove-script <script-name> [global-options]
```

```bash [NPM]
npx @beerush/monopkg remove-script <script-name> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg remove-script <script-name> [global-options]
```

:::

## Global Options

You can customize the command with the following options:

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Specify the root workspace of the packages.

For more details, refer to the [Global Options](../guides/usage#global-options) section.

## Examples

Here is how you can remove the `build` script from all packages in your monorepo:

::: code-group

```bash [Global]
monopkg remove-script build
```

```bash [Bun]
bun x @beerush/monopkg remove-script build
```

```bash [NPM]
npx @beerush/monopkg remove-script build
```

```bash [Yarn]
yarn x @beerush/monopkg remove-script build
```

:::
