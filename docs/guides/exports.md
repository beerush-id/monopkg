# Exports

Generate `exports` field in `package.json` file. This field is used to specify the entry points of a package. Generally, it is used to define the main file of a package, and define the sub-path entries of the package.

## Command

::: code-group

```bash [Global]
monopkg info exports [paths...] [options]
```

```bash [Bun]
bun x monopkg info exports [paths...] [options]
```

```bash [NPM]
npx monopkg info exports [paths...] [options]
```

```bash [Yarn]
yarn dlx monopkg info exports [paths...] [options]
```

:::

## Options

- **`-m`**, `--module` **`<modules...>`** - Exported modules (esm, cjs, dts, svelte).
- **`-s`**, `--source` **`<path>`** - Source directory to scan the exportable folders (default: `src`).
- **`-o`**, `--output` **`<path>`** - Output directory for the entry point (default: `dist`).
- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.
- **`--wildcard`** - Add wildcard exports for sub-path entries.

::: info NOTE

- The `esm` module is used for ES module exports, it's the `imports` field in each export entry, and `module` field in the `package.json`.
- The `cjs` module is used for CommonJS module exports, it's the `require` field in each export entry, and `main` field in the `package.json`.
- The `dts` module is used for TypeScript declaration file exports, it's the `types` field in each export entry, and `types` field in the `package.json`.
- If both `esm` and `cjs` modules are used, the `cjs` entry will point to `.cjs` files, and the `esm` entry will point to `.js` files.
- If your package has `typescript` as a dependency, the `dts` module will be automatically generated.

:::

## Examples

::: code-group

```bash [Global]
monopkg info exports core auth --module esm cjs dts --wildcard
```

```bash [Bun]
bun x monopkg info exports core auth --module esm cjs dts --wildcard
```

```bash [NPM]
npx monopkg info exports core auth --module esm cjs dts --wildcard
```

```bash [Yarn]
yarn dlx monopkg info exports core auth --module esm cjs dts --wildcard
```

:::

This command generates the `exports` field in the `package.json` for the `core` and `auth` folder in the `src` directory. The output will be like this:

::: details package.json

```json
{
  "name": "example",
  "version": "1.0.0",
  "description": "Example package",
  "type": "module", // [!code ++]
  "main": "dist/index.cjs", // [!code ++]
  "module": "dist/index.js", // [!code ++]
  "types": "dist/index.d.ts", // [!code ++]
  "exports": { // [!code ++]
    "./": { // [!code ++]
      "types": "./dist/index.d.ts", // [!code ++]
      "import": "./dist/index.js", // [!code ++]
      "require": "./dist/index.cjs" // [!code ++]
    }, // [!code ++]
    "./auth": { // [!code ++]
      "types": "./dist/auth/index.d.ts", // [!code ++]
      "import": "./dist/auth/index.js", // [!code ++]
      "require": "./dist/auth/index.cjs" // [!code ++]
    }, // [!code ++]
    "./auth/*": "./dist/auth/*", // [!code ++]
    "./core": { // [!code ++]
      "types": "./dist/core/index.d.ts", // [!code ++]
      "import": "./dist/core/index.js", // [!code ++]
      "require": "./dist/core/index.cjs" // [!code ++]
    }, // [!code ++]
    "./core/*": "./dist/core/*" // [!code ++]
  }, // [!code ++]
  "dependencies": {
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/lodash": "^4.14.168"
  }
}
```

:::

::: tip TIPS

The easiest way to generate the `exports` field is using the interactive mode. Run the command without any arguments, and it will prompt you to select the packages and modules you want to export.

:::

