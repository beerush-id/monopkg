# Add Workspace

Workspaces are folders that contain packages or applications. In a monorepo, workspaces are used to group related
packages and applications together. In this guide, you will learn how to add new workspaces to your monorepo.

## Command

This command allows you to add new workspaces to the monorepo.

::: code-group

```bash [Global]
monopkg workspace add [workspaces...] [options]
```

```bash [Bun]
bun x monopkg workspace add [workspaces...] [options]
```

```bash [NPM]
npx monopkg workspace add [workspaces...] [options]
```

```bash [Yarn]
yarn dlx monopkg workspace add [workspaces...] [options]
```

:::

::: tip FYI

In the interactive mode, you can enter multiple workspace name to be added. The prompt will keep asking for the workspace name until you press `Enter` without entering a name.

:::

## Options

- **`-s`**, `--scope` - Set the scope name of the new workspace.
- `--cold` - Cold run, skip creating the workspace folder.

## Examples

### Single Workspace

Add a new workspace named `tools`:

::: code-group

```bash [Global]
monopkg workspace add tools
```

```bash [Bun]
bun x monopkg workspace add tools
```

```bash [NPM]
npx monopkg workspace add tools
```

```bash [Yarn]
yarn dlx monopkg workspace add tools
```

:::

::: info Output

**`Folder Structure`**

```json
├─ packages
|  ├─ pkg-a
|  ├─ pkg-b
├─ tools // [!code ++]
|  └─ .gitkeep // [!code ++]
└─ package.json

```

**`package.json`**

```json
{
  "workspaces": [
    "packages/*",
    "tools/*" // [!code ++]
  ]
}

```

:::

### With Custom Scope

Add a new workspace named `tools` with a custom scope `@app-tools`:

::: code-group

```bash [Global] 
monopkg workspace add tools --scope @app-tools
```

```bash [Bun]
bun x monopkg workspace add tools --scope @app-tools
```

```bash [NPM]
npx monopkg workspace add tools --scope @app-tools
```

```bash [Yarn]
yarn dlx monopkg workspace add tools --scope @app-tools
```

:::

::: info Output

**`Folder Structure`**

```json
├─ packages
|  ├─ pkg-a
|  ├─ pkg-b
├─ tools // [!code ++]
|  └─ workspace.json // [!code ++]
└─ package.json

```

**`package.json`**

```json
{
  "workspaces": [
    "packages/*",
    "tools/*" // [!code ++]
  ]
}

```

**`tools/workspace.json`**

```json
{
  "name": "tools", // [!code ++]
  "scope": "@app-tools" // [!code ++]
}

```

:::

::: tip Custom Scope

By setting a custom scope, the workspace will have its own `workspace.json` file with the specified scope. When creating a new package in this workspace, the scope will be used as the default scope for the package in the interactive mode.

:::

### Multiple Workspaces

Add multiple workspaces named `tools` and `apps`:

::: code-group

```bash [Global]
monopkg workspace add tools apps
```

```bash [Bun]
bun x monopkg workspace add tools apps
```

```bash [NPM]
npx monopkg workspace add tools apps
```

```bash [Yarn]
yarn dlx monopkg workspace add tools apps
```

:::

::: info Output

**`Folder Structure`**

```json
├─ apps // [!code ++]
|  └─ .gitkeep // [!code ++]
├─ packages
|  ├─ pkg-a
|  ├─ pkg-b
├─ tools // [!code ++]
|  └─ .gitkeep // [!code ++]
└─ package.json

```

**`package.json`**

```json
{
  "workspaces": [
    "apps/*", // [!code ++]
    "packages/*",
    "tools/*" // [!code ++]
  ]
}

```

:::

::: warning Custom Scope

When adding multiple workspaces, custom scopes can only be set in the interactive mode. Use the `monopkg workspace add` without any arguments to enter the interactive mode.

:::

---

### Skip Creating Workspace Folder

Add a new workspace named `tools` and skip creating the workspace folder:

::: code-group

```bash [Global]
monopkg workspace add tools --cold
```

```bash [Bun]
bun x monopkg workspace add tools --cold
```

```bash [NPM]
npx monopkg workspace add tools --cold
```

```bash [Yarn]
yarn dlx monopkg workspace add tools --cold
```

:::

::: info Output

**`Folder Structure`**

```json
├─ packages
|  ├─ pkg-a
|  ├─ pkg-b
└─ package.json
```

**`package.json`**

```json
{
  "workspaces": [
    "packages/*",
    "tools/*" // [!code ++]
  ]
}

```

:::

::: warning Custom Scope

When using the `--cold` option, the workspace folder will not be created, and the `workspace.json` file will not be generated. Do not use the `--cold` option if you want to set a custom scope, as the `workspace.json` file is required for that.

:::