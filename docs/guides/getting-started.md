# Getting Started

This guide will help you get started with MonoPKG by walking you through the installation process and providing you with some basic information on how to use it.

## Installation

To install MonoPKG, you need to have [Node.js](https://nodejs.org) version 18 or higher installed on your machine. You can also use [Bun](https://bun.sh) version 1 or higher to install MonoPKG.

### Prerequisites

- [Node.js](https://nodejs.org) version 18 or higher, or
- [Bun](https://bun.sh) version 1 or higher.

MonoPKG can be installed globally using [Bun](https://bun.sh), [NPM](https://npmjs.com), or [Yarn](https://yarnpkg.com).

### Installation Commands

Choose your preferred package manager and run the following command to install MonoPKG globally:

::: code-group

```sh [Bun]
bun add -g @beerush/monopkg
```

```sh [NPM]
npm install -g @beerush/monopkg
```

```sh [Yarn]
yarn global add @beerush/monopkg
```

:::

## Running MonoPKG

To run MonoPKG, you can use the following command:

::: code-group

```sh [Global]
monopkg [command] [options]
```

:::

If you prefer not to install it globally, you can also run it using `x` commands. This allows you to execute MonoPKG commands without a global installation:

::: code-group

```sh [Bun]
bun x @beerush/monopkg [command] [options]
```

```sh [NPM]
npm x @beerush/monopkg [command] [options]
```

```sh [Yarn]
yarn x @beerush/monopkg [command] [options]
```

:::

## Verifying Installation

To verify that MonoPKG has been installed correctly, you can run the following command:

```sh
monopkg --version
```

This should display the version of MonoPKG that is installed.

## Uninstalling MonoPKG

If you need to uninstall MonoPKG, you can do so using the following commands based on your package manager:

::: code-group

```sh [Bun]
bun remove -g @beerush/monopkg
```

```sh [NPM]
npm uninstall -g @beerush/monopkg
```

```sh [Yarn]
yarn global remove @beerush/monopkg
```

:::

## Getting Help

For more information on how to use MonoPKG, you can access the help documentation by running:

```sh
monopkg --help
```

This will provide you with a list of available commands and options.
