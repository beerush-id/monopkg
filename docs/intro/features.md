# Features

## 🤖 Interactive

MonoPKG provides an interactive mode to guide you through the process of managing your monorepo. It helps you select the
desired action without typing the command manually, reducing the risk of errors.

![Interactive Mode](/interactive.jpg)

## 🥷 Simplified Workflow

MonoPKG simplifies the management of monorepos by providing a set of commands to manage packages, dependencies, scripts,
and more.

## ⚡ Seamless Integration

Integrate MonoPKG with your existing monorepo setup to enhance your workflow and streamline your development process.

## Dependency Management

Manage dependencies across all your packages with a single command. No more repetitive installations.

![Dependency Management](/dependency.jpg)

::: info FYI
Working with small monorepos is easy, but as your project grows, managing dependencies can become a nightmare. MonoPKG
simplifies this process, allowing you to focus on development.
:::

[Learn more about managing dependencies with MonoPKG](../guides/add.md)

## Package Management

Create new packages from templates within your monorepo with ease. Save time and effort on manual setups.

![Package Management](/package.jpg)

::: info FYI
Creating new packages manually is fine. But, I bet you'd rather spend your time coding than setting up new packages.
MonoPKG helps you get started quickly.
:::

[Learn more about creating packages with MonoPKG](../guides/create.md)

## Script Management

Easily add, update, and run scripts across all packages with simple commands. Ensure consistency and save time.

![Script Management](/overview.jpg)

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
monopkg script add format="prettier --write ." -w packages
monopkg script add build="bun run format && rimraf dist && tsup && publint" -w packages
```

The above command adds a `format` script and update the `build` script to all packages under the `packages` folder. It's
that simple! 🪄

```json
{
  "scripts": {
    "build": "bun run format && rimraf dist && tsup && publint",    // [!code ++]
    "clean": "rimraf dist",
    "format": "prettier --write ."    // [!code ++]
  }
}
```

:::

[Learn more about managing scripts with MonoPKG](../guides/add-script.md)

## Version Control

Keep track of package versions effortlessly and ensure compatibility across your monorepo. Updating multiple packages is a breeze with MonoPKG.

![Version Control](/version.jpg)

::: info hmmm...
My brain is currently on a coffee break. ☕️ Please hold while it recharges... or just enjoy the silence. 😴
:::

[Learn more about managing package versions with MonoPKG](../guides/version.md)

## Catalog Management

Manage package versions centrally with catalogs. Define versions once and reference them across all your packages, ensuring consistency and simplifying updates.

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

![Catalog Management](/overview.jpg)

::: info CENTRALIZE YOUR VERSIONS

Instead of managing versions in each package.json, define them once in catalogs and reference them everywhere:

```json
{
  "dependencies": {
    "react": "catalog:",
    "lodash": "catalog:frontend"
  }
}
```

When you need to update a package version, you only need to change it in the catalog, not in every package.

::: tip Example

```sh
monopkg catalog add react@18.2.0 --global
monopkg catalog add lodash@4.17.21 -c frontend
monopkg catalog use react lodash -s
```

The above commands add packages to catalogs and then use those versions in your packages. Updating is as simple as changing the catalog entry.

:::

[Learn more about managing catalogs with MonoPKG](../guides/catalog.md)

## Workspace Management

Manage workspaces and packages within your monorepo with ease. Create, update, and delete workspaces effortlessly. Initialize new workspaces or migrate existing ones with a simple command.

![Workspace Management](/workspace.jpg)

[Learn more about managing workspaces with MonoPKG](../guides/add-space.md)

## Get Started Quickly

Focus on development rather than managing configurations and dependencies. [Explore](/guides/getting-started) these features and more with MonoPKG to streamline your monorepo management!