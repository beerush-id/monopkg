# Adding Scripts

In a monorepo, you may have multiple packages that share common scripts. Managing these scripts individually for each package can be time-consuming and error-prone. To streamline this process, you can use the `monopkg add-script` command to add a script to all packages in the monorepo at once. This ensures consistency across your packages and saves you from the repetitive task of manually adding the same script to each package.

By using the `monopkg add-script` command, you can easily maintain and update scripts across your entire monorepo. Whether you need to add build scripts, development scripts, or any other custom scripts, this command provides a convenient and efficient way to manage them centrally. This approach not only improves productivity but also reduces the risk of discrepancies and errors in your scripts.

## Command

This command allows you to add a script to all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg add-script <script-name> <script-command> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg add-script <script-name> <script-command> [global-options]
```

```bash [NPM]
npx @beerush/monopkg add-script <script-name> <script-command> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg add-script <script-name> <script-command> [global-options]
```

:::

::: info [Global Options](../guides/usage#global-options)

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Root workspace of the packages.
  :::

## Examples

1. **Add `build` script that run `rimraf dist && tsup && publint` to all packages in the monorepo.**

::: code-group

```bash [Global]
monopkg add-script build "rimraf dist && tsup && publint"
```

```bash [Bun]
bun x @beerush/monopkg add-script build "rimraf dist && tsup && publint"
```

```bash [NPM]
npx @beerush/monopkg add-script build "rimraf dist && tsup && publint"
```

```bash [Yarn]
yarn x @beerush/monopkg add-script build "rimraf dist && tsup && publint"
```

:::

2. **Add `dev` script that run `tsup --watch` to all packages in the `apps` workspace.**

::: code-group

```bash [Global]
monopkg add-script dev "tsup --watch" -r apps
```

```bash [Bun]
bun x @beerush/monopkg add-script dev "tsup --watch" -r apps
```

```bash [NPM]
npx @beerush/monopkg add-script dev "tsup --watch" -r apps
```

```bash [Yarn]
yarn x @beerush/monopkg add-script dev "tsup --watch" -r apps
```

:::

3. **Add `test` script that run `jest` to all packages in the monorepo, except `package-a`.**

::: code-group

```bash [Global]
monopkg add-script test "jest" -e package-a
```

```bash [Bun]
bun x @beerush/monopkg add-script test "jest" -e package-a
```

```bash [NPM]
npx @beerush/monopkg add-script test "jest" -e package-a
```

```bash [Yarn]
yarn x @beerush/monopkg add-script test "jest" -e package-a
```

:::
