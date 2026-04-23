# LLM Prompt: Integrate vue-instant-search GlobalSearchModal

Use this prompt in any LLM chat when you want help integrating the package into a Vue 3 app.

## Prompt

I need help integrating `vue-instant-search` in a Vue 3 project.

Please do all of the following:

1. Add and use `GlobalSearchModal` from `vue-instant-search`.
2. Keep all business logic in the parent:
- query state
- API fetching
- grouping favorites/results
- navigation on select
- favorite toggle persistence
3. Do not fetch data or navigate inside the modal component.
4. Use grouped arrays in this shape:

```ts
type SearchGroup<T> = {
  key: string
  label: string
  items: T[]
}
```

5. Wire controlled props and events:
- props: `open`, `query`, `favorites`, `results`, `loading`
- optional props when needed: `placeholder`, `emptyState`, `resultsEmptyState`, `showFavoriteToggle`, `closeOnSelect`, `getItemKey`, `getItemTitle`, `getItemSubtitle`, `isFavorite`
- events: `update:open`, `update:query`, `search-input`, `select`, `toggle-favorite`, `close`
6. Keep keyboard behavior intact:
- ArrowUp, ArrowDown, Enter, Escape
7. Preserve current UI design unless I explicitly ask for redesign.
8. If replacing an old modal implementation, convert it into a thin adapter that maps old app data/actions into the package component.
9. Remove dead code left from the old implementation.
10. Update docs to match actual API (no outdated props/slots/events).
11. Run build checks and report any remaining risks.

## Extra context to include when needed

- Package import:

```ts
import { GlobalSearchModal } from 'vue-instant-search'
```

- Expected item payload examples:

```ts
type PersonItem = {
  xid: string
  full_name: string
  phone_number?: string
  email?: string
  type: 'lead' | 'customer'
  is_favorite?: boolean
}
```

- Typical select behavior:
- lead -> lead details route
- customer -> customer details route

## Output format I want from the LLM

1. Short plan.
2. Exact file edits.
3. Final code.
4. Build/test results.
5. Any follow-up cleanup suggestions.
