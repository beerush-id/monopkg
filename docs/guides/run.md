# Run Scripts

Execute concurrent scripts across all packages in the monorepo simultaneously. This command is useful for running build,
test, and other scripts in all packages at once.

## Usage

Use the following command to run scripts in all packages:

::: code-group

```bash [Global]
monopkg run <scripts...>
```

```bash [Bun]
bun x monopkg run <scripts...>
```

```bash [NPM]
npx monopkg run <scripts...>
```

```bash [Yarn]
yarn dlx monopkg run <scripts...>
```

:::

## Options

- **`-b`**, `--before-run` **`<scripts...>`** - Execute scripts before the main script.
- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

::: info Note

The `before-run` scripts will run on the specified packages before executing the main scripts in each package.

:::

## Examples

### Basic Usage

Run `build` script in all packages

::: code-group

```bash [Global]
monopkg run build
```

```bash [Bun]
bun x monopkg run build
```

```bash [NPM]
npx monopkg run build
```

```bash [Yarn]
yarn dlx monopkg run build
```

:::

### Using Before Run Scripts

Run `clean` script before `build` script in all packages

::: code-group

```bash [Global]
monopkg run build --before-run clean
```

```bash [Bun]
bun x monopkg run build --before-run clean
```

```bash [NPM]
npx monopkg run build --before-run clean
```

```bash [Yarn]
yarn dlx monopkg run build --before-run clean
```

:::

### Using Targeted Workspaces

Run `dev:esm` and `dev:cjs` scripts in the `apps` and `tools` workspaces.

::: code-group

```bash [Global]
monopkg run dev:esm dev:cjs -w apps tools
```

```bash [Bun]
bun x monopkg run dev:esm dev:cjs -w apps tools
```

```bash [NPM]
npx monopkg run dev:esm dev:cjs -w apps tools
```

```bash [Yarn]
yarn dlx monopkg run dev:esm dev:cjs -w apps tools
```

:::

### Using Filters

Run `test` script in `package-a` and `package-b`

::: code-group

```bash [Global]
monopkg run test -f package-a package-b
```

```bash [Bun]
bun x monopkg run test -f package-a package-b
```

```bash [NPM]
npx monopkg run test -f package-a package-b
```

```bash [Yarn]
yarn dlx monopkg run test -f package-a package-b
```

:::
