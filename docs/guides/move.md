# Move Packages

Moving packages is a common task when working with monorepos. MonoPKG simplifies this process by providing a command to
move packages to a new workspace.

::: warning IMPORTANT

Before moving packages, make sure to commit your changes to avoid losing any work. **MonoPKG** only moves the packages without tracking changes in the repository.

:::

## Command

To move packages, you can run the following command:

::: code-group

```bash [Global]
monopkg move [packages...] [options]
```

```bash [Bun]
bun x monopkg move [packages...] [options]
```

```bash [NPM]
npx monopkg move [packages...] [options]
```

```bash [Yarn]
yarn dlx monopkg move [packages...] [options]
```

:::

## Options

- `--name` - Set the new package name.
- `--path` - Set the new package location (relative to a workspace).
- `--rename` - Rename package in interactive mode.
- **`-w`**, `--workspace` - Workspace to move the packages to.
- **`-y`**, `--yes` - Skip interactive prompts and use default options.
- `--dry` - Run in dry mode without writing any changes.

::: warning IMPORTANT

Renaming a package will apply the name change to the packages that depend on it. Make sure to commit your work before renaming a package to prevent losing any work.

:::

## Examples

### Moving Packages

Move multiple packages to a new workspace:

::: code-group

```bash [Global]
monopkg move users posts galleries --workspace services
```

```bash [Bun]
bun x monopkg move users posts galleries --workspace services
```

```bash [NPM]
npx monopkg move users posts galleries --workspace services
```

```bash [Yarn]
yarn dlx monopkg move users posts galleries --workspace services
```

:::

::: info

The above command will move the `users`, `posts`, and `galleries` packages to the `services` workspace, assuming the packages are located in the `packages` workspace before.

:::

### Renaming a Package

Rename a package and its folder location.

::: code-group

```bash [Global]
monopkg move @test/ui --name @test/ui-kit --path ui-kit
```

```bash [Bun]
bun x monopkg move @test/ui --name @test/ui-kit --path ui-kit
```

```bash [NPM]
npx monopkg move @test/ui --name @test/ui-kit --path ui-kit
```

```bash [Yarn]
yarn dlx monopkg move @test/ui --name @test/ui-kit --path ui-kit
```

:::

::: info

The above command will change the package name from `@test/ui` to `@test/ui-kit`, and move the folder location from `packages/ui` to `packages/ui-kit`.
If the `@test/ui` package has a dependents, it will also apply the name change to the packages that depend on it.

:::

::: info Sample Output

![List Packages](/rename.jpg)

:::
