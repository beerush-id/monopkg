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

- **`-w`**, `--workspace` - Workspace to move the packages to.

## Examples

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
