# Usage

To use **`MonoPKG`**, you need to have a project with `workspaces` field in the root level `package.json` file. The
`workspaces` field should contain an array of paths to the packages in the monorepo.

::: details What is Workspace?

A workspace is a directory containing one or more packages. A package can be an app, library, or any other type of code
that have its own `package.json`.

> [!INFO] package.json
> ```json
> {
>   "workspaces": [
>     "apps/*",
>     "packages/*"
>   ]
> }
> ```

You can also [convert](../guides/add-space) an existing project into workspace.

> [!INFO] Learn More
> Check this section for more information about [workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

:::

To run a command, use the following syntax:

::: code-group

```sh [Global]
monopkg [command] [options]
```

```sh [Bun]
bun x monopkg [command] [options]
```

```sh [NPM]
npx monopkg [command] [options]
```

```sh [Yarn]
yarn dlx monopkg [command] [options]
```

:::

::: info NOTE

Replace `[command]` with the command you want to run and `[options]` with the options you want to use. For example:

```sh
monopkg list -i name version
```

:::

::: details Tips

If you prefer, you can use the short alias `mpkg` instead of `monopkg` if MonoPKG is installed globally. For example:

```sh
mpkg list -i name version
```

:::

### Getting Help

To see the available commands and options, you can run the following command:

::: code-group

```sh [Global]
monopkg --help
```

```sh [Bun]
bun x monopkg --help
```

```sh [NPM]
npx monopkg --help
```

```sh [Yarn]
yarn dlx monopkg --help
```

:::

To see the options for a specific command, you can run:

::: code-group

```sh [Global]
monopkg [command] --help
```

```sh [Bun]
bun x monopkg [command] --help
```

```sh [NPM]
npx monopkg [command] --help
```

```sh [Yarn]
yarn dlx monopkg [command] --help
```

## Interactive

Interactive mode will guide you through the available commands and options, allowing you to select the desired action
without typing the command manually, and prevent you from making mistakes.

For example, to create a new package, you'll be prompted to select the available workspace to create the package in,
select the available template, and enter the package name, etc.

To run **`MonoPKG`** in interactive mode, simply run the command without any arguments. The interactive mode will start
and guide you through the available commands and options.

### Example

::: code-group

```sh [Interactive]
monopkg add eslint typescript prettier
```

:::

The command above will prompt you to select all the required options.

![Interactive](/interactive.jpg)

::: tip NOTES

To skip the interactive prompts, you can use `-y` or `--yes` option. It will use the default options. 

:::

## Dry Run

To run the command in `dry` mode, you can use the `--dry` option. It will show you the commands that will be executed without actually running them. No changes will be made to the project. Example:

::: code-group

```sh [Global]
monopkg add eslint typescript prettier --dry
```

```sh [Bun]
bun x monopkg add eslint typescript prettier --dry
```

```sh [NPM]
npx monopkg add eslint typescript prettier --dry
```

```sh [Yarn]
yarn dlx monopkg add eslint typescript prettier --dry
```

:::

The command above will show you the commands that will be executed without actually running them.

## Defaults

To skip the prompts and use the default options, you can use the `--yes` option. It will use the default options without asking for confirmation. Example:

::: code-group

```sh [Global]
monopkg add eslint typescript prettier --yes
```

```sh [Bun]
bun x monopkg add eslint typescript prettier --yes
```

```sh [NPM]
npx monopkg add eslint typescript prettier --yes
```

```sh [Yarn]
yarn dlx monopkg add eslint typescript prettier --yes
```

:::

The command above will use the default options without asking for confirmation.
