# Add Scripts

In a monorepo, you may have multiple packages that share common scripts. Managing these scripts individually for each
package can be time-consuming and error-prone. To streamline this process, you can use the `monopkg script add` command
to add a script to all packages in the monorepo at once. This ensures consistency across your packages and saves you
from the repetitive task of manually adding the same script to each package.

::: info

The `script add` command also can be used to update existing scripts, as it will overwrite the script if it already
exists in a package.

:::

By using the `monopkg script add` command, you can easily maintain and update scripts across your entire monorepo.
Whether you need to add build scripts, development scripts, or any other custom scripts, this command provides a
convenient and efficient way to manage them centrally. This approach not only improves productivity but also reduces the
risk of discrepancies and errors in your scripts.

## Usage

This command allows you to add a script to all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg script add <name="script"...>
```

```bash [Bun]
bun x monopkg script add <name="script"...>
```

```bash [NPM]
npx monopkg script add <name="script"...>
```

```bash [Yarn]
yarn dlx monopkg script add <name="script"...>
```

:::

## Options

- **`-f`**, `--filter` **`<packages...>`** - Include specific packages.
- **`-e`**, `--exclude` **`<packages...>`** - Exclude specific packages.
- **`-w`**, `--workspace` **`<workspaces...>`** - Root workspaces of the packages.
- `--delimiter` - Delimiter to separate the script name and script value (default: `=`).

## Examples

### Basic Usage

Add `build` script that run `rimraf dist && tsup && publint` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg script add build="rimraf dist && tsup && publint"
```

```bash [Bun]
bun x monopkg script add build="rimraf dist && tsup && publint"
```

```bash [NPM]
npx monopkg script add build="rimraf dist && tsup && publint"
```

```bash [Yarn]
yarn dlx monopkg script add build="rimraf dist && tsup && publint"
```

:::

::: info Output

```json
{
  "scripts": {
    "dev": "tsup --watch",
    "build": "rimraf dist && tsup && publint" // [!code ++]
  }
}
```

:::

### Multiple Scripts

If you want to add multiple scripts at once, you can specify them as follows:

::: code-group

```bash [Global]
monopkg script add build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

```bash [Bun]
bun x monopkg script add build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

```bash [NPM]
npx monopkg script add build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

```bash [Yarn]
yarn dlx monopkg script add build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

:::

::: info Output

```json
{
  "scripts": {
    "dev": "tsup --watch",
    "build": "rimraf dist && tsup", // [!code ++]
    "test": "jest", // [!code ++]
    "deploy": "npm publish" // [!code ++]
  }
}
```

:::

### With Target Workspaces

Add `dev` script that run `tsup --watch` to all packages in the `apps` and `utils` workspace.

::: code-group

```bash [Global]
monopkg script add dev="tsup --watch" -w apps utils
```

```bash [Bun]
bun x monopkg script add dev="tsup --watch" -w apps utils
```

```bash [NPM]
npx monopkg script add dev="tsup --watch" -w apps utils
```

```bash [Yarn]
yarn dlx monopkg script add dev="tsup --watch" -w apps utils
```

:::

### With Exclusion Filters

Add `test` script that run `jest` to all packages in the monorepo, except `package-a`.

::: code-group

```bash [Global]
monopkg script add test="jest" -e package-a
```

```bash [Bun]
bun x monopkg script add test="jest" -e package-a
```

```bash [NPM]
npx monopkg script add test="jest" -e package-a
```

```bash [Yarn]
yarn dlx monopkg script add test="jest" -e package-a
```

:::
