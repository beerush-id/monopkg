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
