# Remove Dependencies

Easily remove dependencies from all packages in your monorepo with a single command.

## Usage

This command allows you to remove dependencies from all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg remove <package-name...>
```

```bash [Bun]
bun x monopkg remove <package-name...>
```

```bash [NPM]
npx monopkg remove <package-name...>
```

```bash [Yarn]
yarn dlx monopkg remove <package-name...>
```

:::

## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.

## Examples

### Remove a Single Dependency

Remove `lodash` from all packages in the monorepo:

::: code-group

```bash [Global]
monopkg remove lodash
```

```bash [Bun]
bun x monopkg remove lodash
```

```bash [NPM]
npx monopkg remove lodash
```

```bash [Yarn]
yarn dlx monopkg remove lodash
```

:::

### Remove Multiple Dependencies from Specific Packages

Remove `lodash` and `typescript` from `package-a` and `package-b`:

::: code-group

```bash [Global]
monopkg remove lodash typescript -f package-a package-b
```

```bash [Bun]
bun x monopkg remove lodash typescript -f package-a package-b
```

```bash [NPM]
npx monopkg remove lodash typescript -f package-a package-b
```

```bash [Yarn]
yarn dlx monopkg remove lodash typescript -f package-a package-b
```

:::

### Remove a Dependency from a Specific Workspace

Remove `lodash` from all packages in the `apps` workspace:

::: code-group

```bash [Global]
monopkg remove lodash -w apps
```

```bash [Bun]
bun x monopkg remove lodash -w apps
```

```bash [NPM]
npx monopkg remove lodash -w apps
```

```bash [Yarn]
yarn dlx monopkg remove lodash -w apps
```

:::
