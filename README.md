# Welcome to MonoPKG

**MonoPKG** is your go-to CLI tool for managing monorepos effortlessly. It offers a suite of commands to handle
dependencies, scripts, and package versions within a monorepo, making your development process smoother and more
efficient. If you enjoy doing everything manually, skip it! It's not for you. 😅

> **`MonoPKG`** isn't here to dethrone `turbo`, `nx`, `lerna`, or any other monorepo giants. It's your friendly
> neighborhood tool designed to make package management in a monorepo a breeze. So, no need for epic showdowns or
> comparisons. Just enjoy the simplicity! 🍺

[Visit Documentation](https://beerush-id.github.io/monopkg)

## Why?

Imagine you have the following monorepo structure:

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

### Adding Dependencies

Traditionally, adding a new dependency like `lodash` to all packages would require running multiple commands:

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

With MonoPKG, you can simplify this to a single command:

```sh
monopkg add lodash
```

Check out the [Documentation](https://beerush-id.github.io/monopkg) to get started with MonoPKG.
