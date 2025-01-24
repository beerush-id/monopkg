# Usage

To use **`MonoPKG`**, you need to have a monorepo with `workspaces` field in `package.json`. The `workspaces` field
should contain an array of paths to the packages in the monorepo.

**Example:**

::: code-group

```json [package.json]
{
  "workspaces": [
    "apps/*",
    "packages/*"
  ]
}
```

:::

To run a command, use the following syntax:

::: code-group

```sh [Global]
monopkg [command] [options]
```

```sh [Bun]
bun x @beerush/monopkg [command] [options]
```

```sh [NPM]
npx @beerush/monopkg [command] [options]
```

```sh [Yarn]
yarn x @beerush/monopkg [command] [options]
```

:::

## Available Commands

Here are the available commands in **`MonoPKG`**:

| Command                                                       | Description                                                                                          |
|---------------------------------------------------------------|------------------------------------------------------------------------------------------------------|
| <nobr>[**`add`**](/references/add)</nobr>                     | Add dependencies to all packages, specific packages, specific pacakges in a workspace, etc.          |
| <nobr>[**`add-script`**](/references/add-script)</nobr>       | Add a script to all packages, specific packages, specific pacakges in a workspace, etc.              |
| <nobr>[**`create`**](/references/create)</nobr>               | Create a package from template in a workspace.                                                       |
| <nobr>[**`init`**](/references/init)</nobr>                   | Initialize a basic package in a workspace.                                                           |
| <nobr>[**`link`**](/references/link)</nobr>                   | Link dependencies to all packages, specific packages, specific pacakges in a workspace, etc.         |
| <nobr>[**`list`**](/references/list)</nobr>                   | List all packages in the monorepo, all packages in a workspace, all public packages, etc.            |
| <nobr>[**`remove`**](/references/remove)</nobr>               | Remove dependencies from all packages, specific packages, specific pacakges in a workspace, etc.     |
| <nobr>[**`remove-script`**](/references/remove-script)</nobr> | Remove a script from all packages, specific packages, specific pacakges in a workspace, etc.         |
| <nobr>[**`run`**](/references/run)</nobr>                     | Run a script in all packages, specific packages, specific pacakges in a workspace, etc.              |
| <nobr>[**`unlink`**](/references/unlink)</nobr>               | Unlink dependencies from all packages, specific packages, specific pacakges in a workspace, etc.     |
| <nobr>[**`use`**](/references/use)</nobr>                     | Link internal packages to another package, specific packages, specific pacakges in a workspace, etc. |
| <nobr>[**`version`**](/references/version)</nobr>             | Update version of all packages, specific packages, specific pacakges in a workspace, etc.            |

::: info NOTE

A **`package`** refers to the internal packages/apps in the monorepo. External packages are called **`dependency`**.

:::

## Global Options

Global options are available for all commands. These options can be used to filter the packages to work with.

| Option      | Shortcut | Description                                       | Default      |
|-------------|----------|---------------------------------------------------|--------------|
| `--include` | `-i`     | Included packages to work with (space separated). | All          |
| `--exclude` | `-e`     | Excluded packages to work with (space separated). | None         |
| `--root`    | `-r`     | Root workspace of the packages.                   | `./packages` |
| `--help`    | `-h`     | Display help message                              |
| `--version` | `-v`     | Display version number                            |

::: tip Default Root

Default root workspace is **`packages`**. If `packages` is missing in the `workspaces` field of `package.json`, it will
use the first item in the `workspaces` field as the default root.

:::

::: tip Workspace Scope

Some commands such as **`add`** and **`list`** will use all workspaces in the `workspaces` field of `package.json` if no
`root` is provided.

:::
