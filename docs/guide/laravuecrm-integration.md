# Laravel CRM Integration

This package is designed to replace heavy in-file modal logic with a thin adapter component.

## Recommended migration shape

1. Keep your existing API endpoints and routing logic.
2. Replace old modal rendering with `GlobalSearchModal` from this package.
3. Map your existing response shape into grouped arrays:

```ts
const favoriteGroups = [
  { key: 'favorites-leads', label: 'Leads', items: favorites.leads || [] },
  { key: 'favorites-customers', label: 'Customers', items: favorites.customers || [] },
].filter((group) => group.items.length > 0)

const resultGroups = [
  { key: 'results-leads', label: 'Leads', items: results.leads || [] },
  { key: 'results-customers', label: 'Customers', items: results.customers || [] },
].filter((group) => group.items.length > 0)
```

4. Keep your old route decisions in `@select` handler.
5. Keep your old favorite API persistence in `@toggle-favorite` handler.

## Tip

If your app already uses global triggers (such as Cmd/Ctrl+K and a custom event), keep them in your adapter component and only replace the modal UI layer.
