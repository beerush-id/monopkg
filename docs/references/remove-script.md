# Remove Scripts

Easily remove a script from all packages in your monorepo with a single command.

## Usage

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

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

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
