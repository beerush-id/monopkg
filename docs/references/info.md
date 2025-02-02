# Package Information

In a monorepo, you may have multiple packages that share common information. To avoid managing the same information
multiple times, you can use the `monopkg info` command to manage package information for all packages in the monorepo at
once. This not only saves time but also ensures consistency across your packages.

For example, all packages in the monorepo may have the same `author`, `license`, or `repository` information. By using
the
`monopkg info` command, you can specify various options to tailor the information management process to your needs. This
flexibility allows you to manage your package information efficiently and keep your project organized.

## Usage

To manage the package information, you can use the following command:

::: code-group

```bash [Global]
monopkg info [command] [global-options]
```

```bash [Bun]
bun x @beerush/monopkg info [command] [global-options]
```

```sh [NPM]
npx @beerush/monopkg info [command] [global-options]```
```

```sh [Yarn]
yarn x @beerush/monopkg info [command] [global-options]
```

:::

::: info Global Options

- **`-F`**, `--filter` - Include specific packages.
- **`-E`**, `--exclude` - Exclude specific packages.
- **`-R`**, `--root` - Root workspaces of the packages.

See the [Global Options](../guides/usage#global-options) page for more details.

:::

## Commands

- **`get`** `<keys...>` - Get a specific package information.
- **`set`** `<key=value...>` - Set a specific package information value.
- **`del`** `<keys...>` - Delete a specific package information.

### Options

- **`--sort`** - Sort the output keys.

::: tip Tips

- You can use dot notation to access nested keys. For example, `author.name` will access the `name` key under the
  `author`
  key.
- You can sort the output keys by using the `--sort` option, so the keys will be displayed in alphabetical order.

:::

## Examples

### Basic Usage

Print the basic package information (`name, version, description, type`) of all packages in the monorepo.

::: code-group

```bash [Global]
monopkg info
```

```bash [Bun]
bun x @beerush/monopkg info
```

```bash [NPM]
npx @beerush/monopkg info
```

```bash [Yarn]
yarn x @beerush/monopkg info
```

:::

::: details Sample Output

```sh
Packages in @beerush/openpkg[v0.0.1]:

- ⚡apps:
  - docs:
    - name        : "docs"
    - version     : "0.0.1"
    - description : N/A
    - type        : "module"

  - web:
    - name        : "web"
    - version     : "0.0.1"
    - description : N/A
    - type        : "module"

- ⚡utils:
  - monopkg:
    - name        : "@beerush/monopkg"
    - version     : "0.0.1"
    - description : "Monorepo Package Manager"
    - type        : "module"
```

:::

### With Filters

Print the basic package information of `package-a` and `package-b`.

::: code-group

```bash [Global]
monopkg info -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg info -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg info -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg info -F package-a package-b
```

:::

### With Targeted Workspaces

Print the basic package information of all packages in the `apps` and `utils` workspaces.

::: code-group

```bash [Global]
monopkg info -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg info -R apps utils
```

```bash [NPM]
npx @beerush/monopkg info -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg info -R apps utils
```

:::

## Get Information

In this section, you will learn how to get package information of all packages using the `monopkg info get` command.

### Basic Usage

Get the `author` information of all packages in the monorepo.

::: code-group

```bash [Global]
monopkg info get author
```

```bash [Bun]
bun x @beerush/monopkg info get author
```

```bash [NPM]
npx @beerush/monopkg info get author
```

```bash [Yarn]
yarn x @beerush/monopkg info get author
```

:::

### Multiple Keys

Get the `dependencies`, `author` and `license` information of all packages under the `apps` and `utils` workspaces.

::: code-group

```bash [Global]
monopkg info get dependencies author license -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg info get dependencies author license -R apps utils
```

```bash [NPM]
npx @beerush/monopkg info get dependencies author license -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg info get dependencies author license -R apps utils
```

:::

::: details Sample Output

```sh
Packages in @beerush/opendb[v0.0.1]:

- ⚡apps:
  - docs:
    - author       : "Beerush"
    - dependencies :
      - @beerush/opendb-ui : "*"
    - license      : "ISC"

  - web:
    - author       : "Beerush"
    - dependencies :
      - @beerush/opendb-ui : "*"
    - license      : "ISC"

- ⚡utils:
  - monopkg:
    - author       : "Beerush"
    - dependencies :
      - commander : "^13.1.0"
    - license      : "MIT"
```

:::

### Nested Keys

Get the `author.name` and `publishConfig.access` information of `package-a` and `package-b` packages.

::: code-group

```bash [Global]
monopkg info get author.name publishConfig.access -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg info get author.name publishConfig.access -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg info get author.name publishConfig.access -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg info get author.name publishConfig.access -F package-a package-b
```

:::

## Set Information

In this section, you will learn how to set package information of all packages using the `monopkg info set` command.

### Basic Usage

Set the `author` information for all packages in the monorepo.

::: code-group

```bash [Global]
monopkg info set author="John Doe <john@domain.com>"
```

```bash [Bun]
bun x @beerush/monopkg info set author="John Doe <john@domain.com>"
```

```bash [NPM]
npx @beerush/monopkg info set author="John Doe <john@domain.com>"
```

```bash [Yarn]
yarn x @beerush/monopkg info set author="John Doe <john@dmain.com>"
```

:::

### Multiple Keys

Set the `author` and `license` information for all packages under the `apps` and `utils` workspaces.

::: code-group

```bash [Global]
monopkg info set author="John Doe" license="MIT" -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg info set author="John Doe" license="MIT" -R apps utils
```

```bash [NPM]
npx @beerush/monopkg info set author="John Doe" license="MIT" -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg info set author="John Doe" license="MIT" -R apps utils
```

:::

### Nested Keys

Set the `author.name` and `publishConfig.access` information for `package-a` and `package-b` packages.

::: code-group

```bash [Global]
monopkg info set author.name="John Doe" publishConfig.access="public" -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg info set author.name="John Doe" publishConfig.access="public" -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg info set author.name="John Doe" publishConfig.access="public" -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg info set author.name="John Doe" publishConfig.access="public" -F package-a package-b
```

:::

## Delete Information

In this section, you will learn how to delete package information of all packages using the `monopkg info del` command.

::: warning Note

When deleting package information, be cautious as this action is irreversible. Ensure that you have a backup of the data
or that you are certain about the information you are deleting.
:::

### Basic Usage

Delete the `author` information for all packages in the monorepo.

::: code-group

```bash [Global]
monopkg info del author
```

```bash [Bun]
bun x @beerush/monopkg info del author
```

```bash [NPM]
npx @beerush/monopkg info del author
```

```bash [Yarn]
yarn x @beerush/monopkg info del author
```

:::

### Multiple Keys

Delete the `author` and `license` information for all packages under the `apps` and `utils` workspaces.

::: code-group

```bash [Global]
monopkg info del author license -R apps utils
```

```bash [Bun]
bun x @beerush/monopkg info del author license -R apps utils
```

```bash [NPM]
npx @beerush/monopkg info del author license -R apps utils
```

```bash [Yarn]
yarn x @beerush/monopkg info del author license -R apps utils
```

:::

### Nested Keys

Delete the `author.name` and `publishConfig.access` information for `package-a` and `package-b` packages.

::: code-group

```bash [Global]
monopkg info del author.name publishConfig.access -F package-a package-b
```

```bash [Bun]
bun x @beerush/monopkg info del author.name publishConfig.access -F package-a package-b
```

```bash [NPM]
npx @beerush/monopkg info del author.name publishConfig.access -F package-a package-b
```

```bash [Yarn]
yarn x @beerush/monopkg info del author.name publishConfig.access -F package-a package-b
```

:::
