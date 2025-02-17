# Copy Files

When working with monorepos, you may need to copy files from one package to another. This is useful when you want to use the same configuration files, scripts, or other assets across multiple packages. The `monopkg copy` command allows you to copy files from one package to another within the monorepo.

## Command

::: code-group

```bash [Global]
monopkg copy [files...] [options]
```

```bash [Bun]
bun x monopkg copy [files...] [options]
```

```bash [NPM]
npx monopkg copy [files...] [options]
```

```bash [Yarn]
yarn dlx monopkg copy [files...] [options]
```

:::

## Options

- **`-s`**, `--source` **`<package>`** - Source package to copy files from.
- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

## Examples

::: code-group

```bash [Global]
monopkg copy eslint.config.js .prettierrc.js -s core -f apps/*
```

```bash [Bun]
bun x monopkg copy eslint.config.js .prettierrc.js -s core -f apps/*
```

```bash [NPM]
npx monopkg copy eslint.config.js .prettierrc.js -s core -f apps/*
```

```bash [Yarn]
yarn dlx monopkg copy eslint.config.js .prettierrc.js -s core -f apps/*
```

:::

The above command copies the `eslint.config.js` and `.prettierrc.js` files from the `core` package to all packages in the `apps` workspace.
