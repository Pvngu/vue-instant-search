# vue-instant-search

Reusable Vue 3 global search UI components focused on controlled state, grouped results, and parent-owned business logic.

## Installation

```bash
npm install vue-instant-search
```

## Import

```ts
import { GlobalSearchModal } from 'vue-instant-search'
```

## GlobalSearchModal

`GlobalSearchModal` is a controlled component. It does not fetch data or navigate by itself. The parent controls query state, result groups, and actions.

### Props

- `open: boolean` (required): controls modal visibility.
- `query: string`: controlled search text.
- `favorites: SearchGroup[]`: favorite groups shown when `query` is empty.
- `results: SearchGroup[]`: result groups shown for current query.
- `placeholder: string`: search input placeholder.
- `loading: boolean`: toggles loading state.
- `showFavoriteToggle: boolean`: shows the built-in star button.
- `closeOnSelect: boolean`: closes modal after item selection.
- `emptyState: string`: text shown when there is no query and no data.
- `resultsEmptyState: string`: text shown when query has no results. Supports `{query}` placeholder.
- `getItemKey(item, meta)`: custom key extractor.
- `getItemTitle(item, meta)`: custom title extractor.
- `getItemSubtitle(item, meta)`: custom subtitle extractor.
- `isFavorite(item, meta)`: custom favorite detector.

### Events

- `update:open` with `boolean`.
- `update:query` with `string`.
- `search-input` with `string`.
- `select` with `SearchSelectPayload`.
- `toggle-favorite` with `ToggleFavoritePayload`.
- `close` with no payload.

### Slots

- `empty`: replaces empty state (no query + no items).
- `empty-search`: replaces empty-query-results state. Slot props: `{ query }`.
- `item`: full row override.
- `item-icon`: icon/avatar area override.
- `item-title`: title area override.
- `item-subtitle`: subtitle area override.
- `item-actions`: right-side actions override.

### Types

- `SearchGroup<T>`
- `SearchItemMeta<T>`
- `FlatEntry<T>`
- `SearchSelectPayload<T>`
- `ToggleFavoritePayload<T>`

### Keyboard behavior

- `ArrowDown`: move selection down.
- `ArrowUp`: move selection up.
- `Enter`: select active item.
- `Escape`: close modal.

### Notes

- Favorites are rendered only when query is empty.
- The component is optimized for parent-driven API calls and route handling.
- See the complete usage example in `src/App.vue`.
