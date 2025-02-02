# Adding Scripts

In a monorepo, you may have multiple packages that share common scripts. Managing these scripts individually for each
package can be time-consuming and error-prone. To streamline this process, you can use the `monopkg add-script` command
to add a script to all packages in the monorepo at once. This ensures consistency across your packages and saves you
from the repetitive task of manually adding the same script to each package.

::: info

The `add-script` command also can be used to update existing scripts, as it will overwrite the script if it already
exists in a package.

:::

By using the `monopkg add-script` command, you can easily maintain and update scripts across your entire monorepo.
Whether you need to add build scripts, development scripts, or any other custom scripts, this command provides a
convenient and efficient way to manage them centrally. This approach not only improves productivity but also reduces the
risk of discrepancies and errors in your scripts.

## Usage

This command allows you to add a script to all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg add-script <name="script"...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg add-script <name="script"...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg add-script <name="script"...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg add-script <name="script"...> [global-options]
```

:::

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Options

- `--delimiter` - Delimiter to separate the script name and script value (default: `=`).

## Examples

### Basic Usage

Add `build` script that run `rimraf dist && tsup && publint` to all packages in the monorepo.

::: code-group

```bash [Global]
monopkg add-script build="rimraf dist && tsup && publint"
```

```bash [Bun]
bun x @beerush/monopkg add-script build="rimraf dist && tsup && publint"
```

```bash [NPM]
npx @beerush/monopkg add-script build="rimraf dist && tsup && publint"
```

```bash [Yarn]
yarn x @beerush/monopkg add-script build="rimraf dist && tsup && publint"
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
monopkg add-script build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

```bash [Bun]
bun x @beerush/monopkg add-script build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

```bash [NPM]
npx @beerush/monopkg add-script build="rimraf dist && tsup" test="jest" deploy="npm publish"
```

```bash [Yarn]
yarn x @beerush/monopkg add-script build="rimraf dist && tsup" test="jest" deploy="npm publish"
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
monopkg add-script dev="tsup --watch" -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg add-script dev="tsup --watch" -R apps utils
```

```bash [NPM]
npx @beerush/monopkg add-script dev="tsup --watch" -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg add-script dev="tsup --watch" -R apps utils
```

:::

### With Exclusion Filters

Add `test` script that run `jest` to all packages in the monorepo, except `package-a`.

::: code-group

```bash [Global]
monopkg add-script test="jest" -E package-a
```

```bash [Bun]
bun x @beerush/monopkg add-script test="jest" -E package-a
```

```bash [NPM]
npx @beerush/monopkg add-script test="jest" -E package-a
```

```bash [Yarn]
yarn x @beerush/monopkg add-script test="jest" -E package-a
```

:::
