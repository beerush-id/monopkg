# Remove Workspaces

This guides will show you how to remove a workspaces from your monorepo.

::: warning NOTE

For safety reason, this command only removes the workspace from the `workspaces` field in the `package.json` file. It does not delete the workspace directory.

:::

## Usage

Use the following commands to remove a workspace:

::: code-group

```bash [Global]
monopkg workspace remove [workspaces...]
```

```bash [Bun]
bun x monopkg workspace remove [workspaces...]
```

```bash [NPM]
npx monopkg workspace remove [workspaces...]
```

```bash [Yarn]
yarn dlx monopkg workspace remove [workspaces...]
```

:::

## Examples

Remove the `foo`, `bar`, and `baz` workspaces from your monorepo:

::: code-group

```bash [Global]
monopkg workspace remove foo bar baz
```

```bash [Bun]
bun x monopkg workspace remove foo bar baz
```

```bash [NPM]
npx monopkg workspace remove foo bar baz
```

```bash [Yarn]
yarn dlx monopkg workspace remove foo bar baz
```

:::
