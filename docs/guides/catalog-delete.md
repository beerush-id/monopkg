# Delete Catalog

Delete empty catalog groups with the `delete` command. This command allows you to clean up unused catalog groups from your monorepo configuration.

## Usage

::: code-group

```bash [Global]
monopkg catalog delete <names...> [options]
```

```bash [Bun]
bun x monopkg catalog delete <names...> [options]
```

```bash [NPM]
npx monopkg catalog delete <names...> [options]
```

```bash [Yarn]
yarn dlx monopkg catalog delete <names...> [options]
```

:::

::: warning
The catalog feature is only supported on **Bun v1.3.0 or higher**. Other package managers do not currently support this feature.
:::

## Examples

### Delete a single catalog group

Delete the `frontend` catalog group:

::: code-group

```bash [Global]
monopkg catalog delete frontend
```

```bash [Bun]
bun x monopkg catalog delete frontend
```

```bash [NPM]
npx monopkg catalog delete frontend
```

```bash [Yarn]
yarn dlx monopkg catalog delete frontend
```

:::

### Delete multiple catalog groups

Delete the `frontend` and `backend` catalog groups:

::: code-group

```bash [Global]
monopkg catalog delete frontend backend
```

```bash [Bun]
bun x monopkg catalog delete frontend backend
```

```bash [NPM]
npx monopkg catalog delete frontend backend
```

```bash [Yarn]
yarn dlx monopkg catalog delete frontend backend
```

:::

### Delete the global catalog

Delete the global catalog (only possible when it's empty):

::: code-group

```bash [Global]
monopkg catalog delete global
```

```bash [Bun]
bun x monopkg catalog delete global
```

```bash [NPM]
npx monopkg catalog delete global
```

```bash [Yarn]
yarn dlx monopkg catalog delete global
```

:::

### Dry run

To see what would be deleted without actually making changes:

::: code-group

```bash [Global]
monopkg catalog delete frontend --dry
```

```bash [Bun]
bun x monopkg catalog delete frontend --dry
```

```bash [NPM]
npx monopkg catalog delete frontend --dry
```

```bash [Yarn]
yarn dlx monopkg catalog delete frontend --dry
```

:::

## Constraints

There are some constraints when deleting catalogs:

1. **Non-empty catalogs cannot be deleted**: If a catalog group contains any packages, it cannot be deleted. You must first remove all packages from the catalog using the `catalog remove` command.

2. **Global catalog deletion**: The global catalog can only be deleted when it's empty. If it contains packages, you'll get an error message.

3. **Non-existent catalogs**: Trying to delete a catalog that doesn't exist will show a warning but won't cause an error.

## Sample scenarios

### Successful deletion

If your `package.json` looks like this:

```json
{
  "name": "my-monorepo",
  "catalogs": {
    "backend": {},
    "frontend": {
      "react": "18.2.0"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

Running `monopkg catalog delete backend` will result in:

```json
{
  "name": "my-monorepo",
  "catalogs": {
    "frontend": {
      "react": "18.2.0"
    }
  },
  "workspaces": [
    "packages/*"
  ]
}
```

### Failed deletion

If you try to delete the `frontend` catalog from the above example, you'll get an error:

```bash
! Cannot delete catalog group 'frontend' because it is not empty
```

You would first need to remove all packages from the `frontend` catalog:

```bash
monopkg catalog remove react -c frontend
monopkg catalog delete frontend
```

## Best practices

1. **Clean up unused catalogs**: Regularly review and delete catalog groups that are no longer needed to keep your configuration clean.

2. **Remove packages first**: Always remove packages from a catalog before attempting to delete it.

3. **Check dependencies**: Before deleting a catalog, make sure no packages in your monorepo are using it.