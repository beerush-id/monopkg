# Welcome to MonoPKG

**MonoPKG** is an interactive CLI tool for managing monorepos effortlessly. It offers a suite of commands to handle
`workspaces`, `packages`, `dependencies`, `scripts`, and `package versions` within a monorepo, making your development
process
smoother and more efficient. If you enjoy doing everything manually, skip it! It's not for you. 😅

![MonoPKG](/overview.jpg)

::: tip Just Don't!
**`MonoPKG`** isn't here to dethrone `turbo`, `nx`, `lerna`, or any other monorepo giants. It's your friendly
neighborhood tool designed to make package management in a monorepo a breeze. So, no need for epic showdowns or
comparisons. Just enjoy the simplicity! 🍺
:::

## Why Use MonoPKG?

Imagine you have the following monorepo structure:

::: details Your Awesome Monorepo

```plaintext
├─ apps
|  ├─ app-a
|  ├─ app-b
├─ packages
|  ├─ pkg-a
|  ├─ pkg-b
|  ├─ pkg-c
|  ├─ pkg-d
|  ├─ pkg-e
├─ tools
|  ├─ tool-a
|  ├─ tool-b
└─ package.json
```

:::

### Adding Dependencies

Traditionally, adding a new dependency like `lodash` to all packages would require running multiple commands:

::: details Multi Command Madness

```sh
cd ./apps/app-a && bun add lodash
cd ../app-b && bun add lodash
cd ../../packages/pkg-a && bun add lodash
cd ../packages/pkg-b && bun add lodash
cd ../packages/pkg-c && bun add lodash
cd ../packages/pkg-d && bun add lodash
cd ../packages/pkg-e && bun add lodash
cd ../../tools/tool-a && bun add lodash
cd ../tools/tool-b && bun add lodash
```

:::

This process is not only tedious but also prone to errors. With MonoPKG, you can simplify this to a single command:

::: code-group

```sh [Global]
monopkg add lodash
```

```sh [Bun]
bun x monopkg add lodash
```

```sh [NPM]
npx monopkg add lodash
```

```sh [Yarn]
yarn dlx monopkg add lodash
```

:::

### Adding Scripts

Adding new scripts to each package manually can be a daunting task. MonoPKG makes it easy to add identical scripts
across all packages with minimal effort.

::: info
Avoid the hassle of editing each `package.json` file manually. Use MonoPKG to add scripts efficiently.

::: details Don't Look! 🥷

```sh
monopkg script add dev="tsup --watch" build="rimraf dist && tsup" -w packages
```

The above command is equivalent to going through each package under `packages` folder and adding the script manually.
It's a ninja move! 🥷

```json
{
  "scripts": {
    "dev": "tsup --watch", // [!code ++]
    "build": "rimraf dist && tsup" // [!code ++]
  }
}
```

:::

### Linking Internal Packages

Linking internal packages manually involves editing the `dependencies` field in the `package.json` file of the target
package and run the `install` command. MonoPKG streamlines this process, reducing the risk of errors.

::: details Example

> [!INFO] Command
> ```sh [command]
> monopkg attach pkg-a pkg-b -f pkg-c pkg-d
> ```
> The above command links `pkg-a` and `pkg-b` to `pkg-c` and `pkg-d`, and add them to the `dependencies` field in
> `package.json`. It's like magic! 🪄

::: info Output

::: code-group

```json [pkg-c/package.json]
{
  "dependencies": {
    "some": "^1.0.0",
    "deps": "^1.0.0",
    "@scope/pkg-a": "workspace:*", // [!code ++]
    "@scope/pkg-b": "workspace:*" // [!code ++]
  }
}
```

```json [pkg-d/package.json]
{
  "dependencies": {
    "some": "^1.0.0",
    "deps": "^1.0.0",
    "@scope/pkg-a": "workspace:*", // [!code ++]
    "@scope/pkg-b": "workspace:*" // [!code ++]
  }
}
```

:::

Experience the ease of managing your monorepo with MonoPKG and focus more on building great software!
