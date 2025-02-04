# Remove Scripts

Easily remove a script from all packages in your monorepo with a single command.

## Usage

Use the following commands to remove a script:

::: code-group

```bash [Global]
monopkg script remove <script-name>
```

```bash [Bun]
bun x monopkg script remove <script-name>
```

```bash [NPM]
npx monopkg script remove <script-name>
```

```bash [Yarn]
yarn dlx monopkg script remove <script-name>
```

:::

## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

## Examples

Here is how you can remove the `build` script from all packages in your monorepo:

::: code-group

```bash [Global]
monopkg script remove build
```

```bash [Bun]
bun x monopkg script remove build
```

```bash [NPM]
npx monopkg script remove build
```

```bash [Yarn]
yarn dlx monopkg script remove build
```

:::
