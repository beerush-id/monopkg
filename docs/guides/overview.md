# Welcome to MonoPKG

**MonoPKG** is your go-to CLI tool for managing monorepos effortlessly. It offers a suite of commands to handle
dependencies, scripts, and package versions within a monorepo, making your development process smoother and more
efficient. If you enjoy doing everything manually, skip it! It's not for you. 😅

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
bun x @beerush/monopkg add lodash
```

```sh [NPM]
npx @beerush/monopkg add lodash
```

```sh [Yarn]
yarn x @beerush/monopkg add lodash
```

:::

::: info FYI

Unlike the built-in tools such as `turbo --filter`, MonoPKG uses the folder name to filter the packages instead of the
package name. This approach simplifies the process since you don't have to remember the package names, and you can see
the folder name right in your editor.

::: details Example

```sh
monopkg run clean -F app-a app-b
```

The above command runs `clean` command on `app-a` and `app-b` packages. With built-in tools, you would have to
use the package name instead of the folder name.

```sh
turbo run clean --filter "@scope/app-a"
```

:::

### Adding Scripts

Adding new scripts to each package manually can be a daunting task. MonoPKG makes it easy to add identical scripts
across all packages with minimal effort.

::: info
Avoid the hassle of editing each `package.json` file manually. Use MonoPKG to add scripts efficiently.

::: details Don't Look! 🥷

```sh
monopkg add-script dev="tsup --watch" build="rimraf dist && tsup" -R packages
```

The above command is equivalent to going through each package under `packages` folder and adding the script manually.
It's a ninja move! 🥷

```json
{
  "scripts": {
    "dev": "tsup --watch",    // [!code ++]
    "build": "rimraf dist && tsup"    // [!code ++]
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
> monopkg use -S pkg-a pkg-b -F pkg-c pkg-d
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
    "@beerush/pkg-a": "workspace:*",  // [!code ++]
    "@beerush/pkg-b": "workspace:*"   // [!code ++]
  }
}
```

```json [pkg-d/package.json]
{
  "dependencies": {
    "some": "^1.0.0",
    "deps": "^1.0.0",
    "@beerush/pkg-a": "workspace:*",  // [!code ++]
    "@beerush/pkg-b": "workspace:*"   // [!code ++]
  }
}
```

:::

Experience the ease of managing your monorepo with MonoPKG and focus more on building great software!

## Key Features

### Unified Dependency Management

Manage dependencies across all your packages with a single command. No more repetitive installations.

::: info FYI
Working with small monorepos is easy, but as your project grows, managing dependencies can become a nightmare. MonoPKG
simplifies this process, allowing you to focus on development.
:::

[Learn more about managing dependencies with MonoPKG](../references/add.md)

### Consistent Scripts

Easily add and update scripts across all packages to ensure consistency and save time.

::: info WHAT IF

You discovered a shiny new tool and want to update scripts in all packages? MonoPKG to the rescue! With a simple
command, you can sprinkle that script magic across your entire monorepo.

::: tip Example

```json
{
  "scripts": {
    "build": "rimraf dist && tsup && publint",
    "clean": "rimraf dist"
  }
}
```

You want to add `format` script to all packages and change the `build` script to include the `format` script.

```sh
monopkg add-script format "prettier --write ." -R packages
monopkg add-script build "bun run format && rimraf dist && tsup && publint" -R packages
```

The above command adds a `format` script and update the `build` script to all packages under the `packages` folder. It's
that simple! 🪄

```json
{
  "scripts": {
    "build": "bun run format && rimraf dist && tsup && publint", // [!code ++]
    "clean": "rimraf dist",
    "format": "prettier --write ." // [!code ++]
  }
}
```

:::

[Learn more about managing scripts with MonoPKG](../references/add-script.md)

### Simplified Package Creation

Create new packages from templates within your monorepo with ease. Save time and effort on manual setups.

::: info FYI
Creating new packages manually is fine. But, I bet you'd rather spend your time coding than setting up new packages.
MonoPKG helps you get started quickly.
:::

[Learn more about creating packages with MonoPKG](../references/create.md)

### Streamlined Package Initialization

Initialize basic packages in your monorepo quickly and efficiently. Get started on new projects without delay.

::: info FYI
I know, initializing package is not a big deal. But, why waste time on repetitive tasks when you can automate them?
MonoPKG helps you get things done faster.
:::

[Learn more about initializing packages with MonoPKG](../references/init.md)

### Run Scripts Across Packages

Execute scripts in multiple packages simultaneously, ensuring consistency and saving time.

::: info FYI
Running scripts in each package manually can be time-consuming. With MonoPKG, you can run scripts across all packages
in one go.
:::

[Learn more about running scripts with MonoPKG](../references/run.md)

### Efficient Linking

Automatically link internal packages, reducing manual edits and potential errors.

::: info FYI
I'm tired of editing `package.json` files and run `bun install` to link internal packages. MonoPKG makes it easy to
link packages within your monorepo.
:::

[Learn more about linking packages with MonoPKG](../references/link.md)

### Version Control

Keep track of package versions effortlessly and ensure compatibility across your monorepo.

::: info hmmm...
My brain is currently on a coffee break. ☕️ Please hold while it recharges... or just enjoy the silence. 😴
:::

[Learn more about managing package versions with MonoPKG](../references/version.md)

### Enhanced Productivity

Focus on development rather than managing configurations and dependencies.

Explore these features and more with MonoPKG to streamline your monorepo management!
