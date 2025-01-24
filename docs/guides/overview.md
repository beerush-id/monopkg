# Welcome to MonoPKG

**MonoPKG** is your go-to CLI tool for managing monorepos effortlessly. It offers a suite of commands to handle dependencies, scripts, and package versions within a monorepo, making your development process smoother and more efficient. If you enjoy doing everything manually, skip it! It's not for you. 😅

::: tip Just Don't!
**`MonoPKG`** isn't here to dethrone `turbo`, `nx`, `lerna`, or any other monorepo giants. It's your friendly neighborhood tool designed to make package management in a monorepo a breeze. So, no need for epic showdowns or comparisons. Just enjoy the simplicity! 🍺
:::

## Why Use MonoPKG?

Imagine you have the following monorepo structure:

::: info root

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

::: info Manual

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

### Adding Scripts

Adding new scripts to each package manually can be a daunting task. MonoPKG makes it easy to add identical scripts across all packages with minimal effort.

::: tip
Avoid the hassle of editing each `package.json` file manually. Use MonoPKG to add scripts efficiently.
:::

::: details Don't Look! 🥷

::: code-group

```sh [Global]
monopkg add-script build "rimraf dist && tsup && publint" -r packages
```

```sh [Bun]
bun x @beerush/monopkg add-script build "rimraf dist && tsup && publint" -r packages
```

```sh [NPM]
npx @beerush/monopkg add-script build "rimraf dist && tsup && publint" -r packages
```

```sh [Yarn]
yarn x @beerush/monopkg add-script build "rimraf dist && tsup && publint" -r packages
```

The above command is equivalent to going through each package and adding the script manually. It's a ninja move! 🥷

:::

### Linking Internal Packages

Linking internal packages manually involves editing the `dependencies` field in the `package.json` file of the target package and running `bun install` or `npm install`. MonoPKG streamlines this process, reducing the risk of errors.

::: tip
Simplify the process of linking internal packages with MonoPKG and keep your monorepo organized.
:::

Experience the ease of managing your monorepo with MonoPKG and focus more on building great software!

## Key Features

- ### Unified Dependency Management

  Manage dependencies across all your packages with a single command. No more repetitive installations.

  ::: info FYI
  Working with small monorepos is easy, but as your project grows, managing dependencies can become a nightmare. MonoPKG simplifies this process, allowing you to focus on development.
  :::

- ### Simplified Package Creation

  Create new packages from templates within your monorepo with ease. Save time and effort on manual setups.

  ::: details FYI
  Creating new packages manually is fine. But, I bet you'd rather spend your time coding than setting up new packages. MonoPKG helps you get started quickly.
  :::

- ### Streamlined Package Initialization

  Initialize basic packages in your monorepo quickly and efficiently. Get started on new projects without delay.

  ::: details FYI
  I know, initializing package is not a big deal. But, why waste time on repetitive tasks when you can automate them? MonoPKG helps you get things done faster.
  :::

- ### Run Scripts Across Packages

  Execute scripts in multiple packages simultaneously, ensuring consistency and saving time.

  ::: details FYI
  Running scripts in each package manually can be time-consuming. With MonoPKG, you can run scripts across all packages in one go.
  :::

- ### Consistent Scripts

  Easily add and update scripts across all packages to ensure consistency and save time.

  ::: details WHAT IF
  You discovered a shiny new tool and want to update scripts in all packages? MonoPKG to the rescue! With just one command, you can sprinkle that script magic across your entire monorepo.
  :::

- ### Efficient Linking

  Automatically link internal packages, reducing manual edits and potential errors.

  ::: details FYI
  I'm tired of editing `package.json` files and run `bun install` to link internal packages. MonoPKG makes it easy to link packages within your monorepo.
  :::

- ### Version Control

  Keep track of package versions effortlessly and ensure compatibility across your monorepo.

  ::: details hmmm...
  My brain is currently on a coffee break. ☕️ Please hold while it recharges... or just enjoy the silence. 😴
  :::

- ### Enhanced Productivity

  Focus on development rather than managing configurations and dependencies.

Explore these features and more with MonoPKG to streamline your monorepo management!
