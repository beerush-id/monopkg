# @beerush/monopkg

A simple, yet useful package manager for monorepos. Let's say you have this monorepo structure:

```
- apps
  - app-a
  - app-b
- packages
  - pkg-a
  - pkg-b
  - pkg-c
  - pkg-d
  - pkg-e
- tools
  - tool-a
  - tool-b
```

Then, you want to:

- Add new dependencies to all packages at once.
- Add new dependencies to specific packages at once.
- Add new dependencies to all packages except specific packages at once.
- Run scripts in all packages at once.
- Create a new package from a template in a specific workspace.
- Initialize a basic package in a specific workspace.
- Link internal packages to another package at once.
- etc.

> **`@beerush/monopkg`** is not a replacement for `turbo`, `nx`, `lerna`, or other monorepo package managers. It's just
> a simple tool to help you manage packages in a monorepo.

> Only monorepo with `workspaces` field in `package.json` is supported for now.

- ✅ **Bun Workspaces**
- ✅ **Yarn Workspaces**
- ✅ **NPM Workspaces**
- 😝 **PNPM Workspaces**

## Installation

```bash
bun install -g @beerush/monopkg
```

## Usage

```bash
monopkg [command] [options]
```

Or if you don't want to install it globally, you can use `npx`, `bun x`, etc.:

```bash
npx @beerush/monopkg [command] [options]
```
