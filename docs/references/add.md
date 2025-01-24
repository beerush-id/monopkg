# Installing Dependencies

In a monorepo, you may have multiple packages that share common dependencies. To avoid installing the same dependencies multiple times, you can use the `monopkg add` command to install dependencies for all packages in the monorepo at once. This not only saves time but also ensures consistency across your packages.

By using the `monopkg add` command, you can specify various options to tailor the installation process to your needs. For instance, you can include or exclude specific packages, install dependencies as dev or peer dependencies, and even target specific workspaces within your monorepo. This flexibility allows you to manage your dependencies efficiently and keep your project organized.

## Command

This command allows you to install dependencies for all packages in the monorepo at once.

::: code-group

```bash [Global]
monopkg add [options] <dependencies...> [global-options]
```

```bash [Bun]
bun x @beerush/monopkg add [options] <dependencies...> [global-options]
```

```bash [NPM]
npx @beerush/monopkg add [options] <dependencies...> [global-options]
```

```bash [Yarn]
yarn x @beerush/monopkg add [options] <dependencies...> [global-options]
```

:::

::: info [Global Options](../guides/usage#global-options)

- **`-i`**, `--include` - Include specific packages.
- **`-e`**, `--exclude` - Exclude specific packages.
- **`-r`**, `--root` - Root workspace of the packages.

:::

### Options

- **`-d`**, `--dev` - Install as dev dependencies.
- **`-p`**, `--peer` - Install as peer dependencies.

## Examples

1. **Add `lodash` to all packages in the monorepo.**

   ::: code-group

   ```bash [Global]
   monopkg add lodash
   ```

   ```bash [Bun]
   bun x @beerush/monopkg add lodash
   ```

   ```bash [NPM]
   npx @beerush/monopkg add lodash
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg add lodash
   ```

   :::

   ::: details Alternative
   The command above is equivalent to running the following commands for each package in the monorepo:

   - `cd ./packages/pkg-a && bun add lodash`
   - `cd ./packages/pkg-b && bun add lodash`
   - `cd ./packages/pkg-c && bun add lodash`
   - `cd ./packages/pkg-d && bun add lodash`
   - _and so on_.
     :::

2. **Add `lodash` to `package-a` and `package-b`.**

   ::: code-group

   ```bash [Global]
   monopkg add lodash -i package-a package-b
   ```

   ```bash [Bun]
   bun x @beerush/monopkg add lodash -i package-a package-b
   ```

   ```bash [NPM]
   npx @beerush/monopkg add lodash -i package-a package-b
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg add lodash -i package-a package-b
   ```

   :::

   ::: details Alternative
   The command above is equivalent to running the following commands:

   - `cd ./packages/package-a && bun add lodash`
   - `cd ./packages/package-b && bun add lodash`
     :::

3. **Add `lodash` and `typescript` as dev dependencies to all packages in the monorepo.**

   ::: code-group

   ```bash [Global]
   monopkg add -d lodash typescript
   ```

   ```bash [Bun]
   bun x @beerush/monopkg add -d lodash typescript
   ```

   ```bash [NPM]
   npx @beerush/monopkg add -d lodash typescript
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg add -d lodash typescript
   ```

   :::

   ::: details Alternative
   The command above is equivalent to running the following commands for each package in the monorepo:

   - `cd ./packages/pkg-a && bun add -d lodash typescript`
   - `cd ./packages/pkg-b && bun add -d lodash typescript`
   - `cd ./packages/pkg-c && bun add -d lodash typescript`
   - `cd ./packages/pkg-d && bun add -d lodash typescript`
   - _and so on_.
     :::

4. **Add `lodash` and `typescript` as peer dependencies to all packages in the monorepo, except `package-a`.**

   ::: code-group

   ```bash [Global]
   monopkg add -p lodash typescript -e package-a
   ```

   ```bash [Bun]
   bun x @beerush/monopkg add -p lodash typescript -e package-a
   ```

   ```bash [NPM]
   npx @beerush/monopkg add -p lodash typescript -e package-a
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg add -p lodash typescript -e package-a
   ```

   :::

   ::: details Alternative
   The command above is equivalent to running the following commands for each package in the monorepo, except `package-a`:

   - `cd ./packages/pkg-b && bun add -p lodash typescript`
   - `cd ./packages/pkg-c && bun add -p lodash typescript`
   - `cd ./packages/pkg-d && bun add -p lodash typescript`
   - _and so on_.
     :::

5. **Add `lodash` to all packages in the `apps` workspace.**

   ::: code-group

   ```bash [Global]
   monopkg add lodash -r apps
   ```

   ```bash [Bun]
   bun x @beerush/monopkg add lodash -r apps
   ```

   ```bash [NPM]
   npx @beerush/monopkg add lodash -r apps
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg add lodash -r apps
   ```

   :::

   ::: details Alternative
   The command above is equivalent to running the following commands for each package in the `apps` workspace:

   - `cd ./apps/app-a && bun add lodash`
   - `cd ./apps/app-b && bun add lodash`
   - `cd ./apps/app-c && bun add lodash`
   - `cd ./apps/app-d && bun add lodash`
   - _and so on_.
     :::

6. **Add `lodash` to all packages in the `apps` workspace, except `package-a`.**

   ::: code-group

   ```bash [Global]
   monopkg add lodash -r apps -e package-a
   ```

   ```bash [Bun]
   bun x @beerush/monopkg add lodash -r apps -e package-a
   ```

   ```bash [NPM]
   npx @beerush/monopkg add lodash -r apps -e package-a
   ```

   ```bash [Yarn]
   yarn x @beerush/monopkg add lodash -r apps -e package-a
   ```

   :::

   ::: details Alternative
   The command above is equivalent to running the following commands for each package in the `apps` workspace, except `package-a`:

   - `cd ./apps/app-b && bun add lodash`
   - `cd ./apps/app-c && bun add lodash`
   - `cd ./apps/app-d && bun add lodash`
   - _and so on_.
     :::
