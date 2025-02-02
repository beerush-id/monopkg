# Adding Workspace

Workspaces are folders that contain packages or applications. In a monorepo, workspaces are used to group related
packages and applications together. In this guide, you will learn how to add new workspaces to your monorepo.

::: tip FYI

This command can also be used to initialize a new, simple monorepo workspace in an existing project. If the root
`package.json` contains a `workspaces` field, it will be considered a monorepo workspace.

:::

## Command

This command allows you to add new workspaces to the monorepo.

::: code-group

```bash [Global]
monopkg add-space <spaces...> [options]
```

```bash [Bun]
bun x @beerush/monopkg add-space <spaces...> [options]
```

```bash [NPM]
npx @beerush/monopkg add-space <spaces...> [options]
```

```bash [Yarn]
yarn x @beerush/monopkg add-space <spaces...> [options]
```

:::

## Options

- `--cold` - Cold run, skip creating the workspace folder.

## Examples

### Single Workspace

Add a new workspace named `tools`:

::: code-group

```bash [Global]
monopkg add-space tools
```

```bash [Bun]
bun x @beerush/monopkg add-space tools
```

```bash [NPM]
npx @beerush/monopkg add-space tools
```

```bash [Yarn]
yarn x @beerush/monopkg add-space tools
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
monopkg add-space tools apps
```

```bash [Bun]
bun x @beerush/monopkg add-space tools apps
```

```bash [NPM]
npx @beerush/monopkg add-space tools apps
```

```bash [Yarn]
yarn x @beerush/monopkg add-space tools apps
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
monopkg add-space tools --cold
```

```bash [Bun]
bun x @beerush/monopkg add-space tools --cold
```

```bash [NPM]
npx @beerush/monopkg add-space tools --cold
```

```bash [Yarn]
yarn x @beerush/monopkg add-space tools --cold
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
