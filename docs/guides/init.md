# Initialize Project

Project initialization is the process of setting up a new project or workspace with the necessary configurations and files to get started. **`MonoPKG`** provides a command to initialize a basic package in a workspace.

::: warning FYI

If you are using another monorepo tool such as **`Turbo`**, **`Lerna`**, etc., you don't have to initialize a project with **`MonoPKG`**. You can use the other tool's commands to initialize a project. **`MonoPKG`** is designed to work with projects that have a `workspaces` field in the `package.json` file, so it won't interfere with other tools.

:::

## Command

To initialize a project, you can use the following command:

::: code-group

```bash [Global]
monopkg init [directory] [options]
```

```bash [Bun]
bun x monopkg init [directory] [options]
```

```bash [NPM]
npx monopkg init [directory] [options]
```

```bash [Yarn]
yarn dlx monopkg init [directory] [options]
```

:::

## Options

- **`-n`**, `--name` - Project name.
- **`-w`**, `--workspace` `<workspaces...>` - Workspaces to initialize.
- **`-p`**, `--pm` `<pm-name>` - Project manager to use (bun, npm, pnpm, yarn).

## Examples

Create a new project in `test` directory with the name `my-project`:

::: code-group

```bash [Global]
monopkg init test -n my-project
```

```bash [Bun]
bun x monopkg init test -n my-project
```

```bash [NPM]
npx monopkg init test -n my-project
```

```bash [Yarn]
yarn dlx monopkg init test -n my-project
```

:::

The command above will create a new project in the `test` directory with the name `my-project`. You will be prompted to select workspaces to initialize and the project manager to use.
