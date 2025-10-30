# Create Catalog

Create named catalog groups with the `create` command. Catalog groups allow you to organize your dependencies into logical groups, such as separating frontend and backend dependencies.

## Usage

::: code-group

```bash [Global]
monopkg catalog create <names...> [options]
```

```bash [Bun]
bun x monopkg catalog create <names...> [options]
```

```bash [NPM]
npx monopkg catalog create <names...> [options]
```

```bash [Yarn]
yarn dlx monopkg catalog create <names...> [options]
```

:::

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Examples

### Create a single catalog group

Create a `frontend` catalog group:

::: code-group

```bash [Global]
monopkg catalog create frontend
```

```bash [Bun]
bun x monopkg catalog create frontend
```

```bash [NPM]
npx monopkg catalog create frontend
```

```bash [Yarn]
yarn dlx monopkg catalog create frontend
```

:::

### Create multiple catalog groups

Create `frontend` and `backend` catalog groups:

::: code-group

```bash [Global]
monopkg catalog create frontend backend
```

```bash [Bun]
bun x monopkg catalog create frontend backend
```

```bash [NPM]
npx monopkg catalog create frontend backend
```

```bash [Yarn]
yarn dlx monopkg catalog create frontend backend
```

:::

### Dry run

To see what would be created without actually making changes:

::: code-group

```bash [Global]
monopkg catalog create frontend --dry
```

```bash [Bun]
bun x monopkg catalog create frontend --dry
```

```bash [NPM]
npx monopkg catalog create frontend --dry
```

```bash [Yarn]
yarn dlx monopkg catalog create frontend --dry
```

:::

## How it works

When you create catalog groups:

1. Empty catalog groups are added to your root `package.json` under the `catalogs` field
2. If a catalog group with the same name already exists, a warning will be shown
3. Catalog groups are automatically sorted alphabetically in the `package.json`

## Sample package.json after creating catalogs

After running `monopkg catalog create frontend backend`, your root `package.json` will look like:

```json
{
  "name": "my-monorepo",
  "catalogs": {
    "backend": {},
    "frontend": {}
  },
  "workspaces": [
    "packages/*"
  ]
}
```

If you already have a global catalog, the file would look like:

```json
{
  "name": "my-monorepo",
  "catalog": {
    "lodash": "4.17.21",
    "react": "18.2.0"
  },
  "catalogs": {
    "backend": {},
    "frontend": {}
  },
  "workspaces": [
    "packages/*"
  ]
}
```

## Use cases

Catalog groups are useful for:

1. **Separating concerns**: Keep frontend and backend dependencies in separate catalogs
2. **Team organization**: Different teams can manage their own catalogs
3. **Environment separation**: Have different catalogs for development, testing, and production dependencies
4. **Technology grouping**: Group dependencies by technology stack (e.g., React, Vue, Node.js)

For example, you might organize your catalogs like this:
- `frontend`: React, Vue, and other frontend dependencies
- `backend`: Express, database drivers, and other backend dependencies
- `mobile`: React Native, Expo, and other mobile development dependencies
- `dev-tools`: Development tools and linters used across the monorepo