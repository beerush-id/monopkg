# Run Scripts

Execute concurrent scripts across all packages in the monorepo simultaneously. This command is useful for running build,
test, and other scripts in all packages at once.

## Usage

Use the following command to run scripts in all packages:

::: code-group

```bash [Global]
monopkg run <scripts...> [options]
```

```bash [Bun]
bun x monopkg run <scripts...> [options]
```

```bash [NPM]
npx monopkg run <scripts...> [options]
```

```bash [Yarn]
yarn dlx monopkg run <scripts...> [options]
```

:::

## Options

- **`-b`**, `--before-run` **`<scripts...>`** - Execute scripts before the main script.
- **`-s`**, `--strict` - Wait for the dependencies to be resolved before running the scripts.
- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.
- **`--sequential`** - Run scripts sequentially.
- **`--standalone`** - Run scripts in standalone mode without resolving dependencies.

## Examples

### Basic Usage

Run `build` script in interactive mode.

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

## Using Before Run Scripts

The `--before-run` option allows you to execute scripts before the main script. If provided, the main script will wait for all the before-run scripts to complete before running. 

### Example

Run `clean` script before `build` script in all packages.

::: code-group

```bash [Global]
monopkg run build --before-run clean -f *
```

```bash [Bun]
bun x monopkg run build --before-run clean -f *
```

```bash [NPM]
npx monopkg run build --before-run clean -f *
```

```bash [Yarn]
yarn dlx monopkg run build --before-run clean -f *
```

:::
