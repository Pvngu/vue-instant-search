# Vue 3 + Vite

This template should help get you started developing with Vue 3 in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about IDE Support for Vue in the [Vue Docs Scaling up Guide](https://vuejs.org/guide/scaling-up/tooling.html#ide-support).

## GlobalSearchModal

`GlobalSearchModal` is a controlled Vue 3 component for building app-wide search palettes without coupling the UI to routing or data fetching.

### Import

```ts
import { GlobalSearchModal } from 'vue-instant-search'
```

### Props

- `open: boolean` - Controls modal visibility.
- `query: string` - Controlled search text.
- `favorites: SearchGroup[]` - Grouped favorite items.
- `results: SearchGroup[]` - Grouped search results.
- `placeholder: string` - Search input placeholder.
- `loading: boolean` - Shows a loading state.
- `showFavoriteToggle: boolean` - Enables the built-in favorite action button.
- `closeOnSelect: boolean` - Closes the modal after selection.
- `emptyState: string` - Fallback state when no groups are provided.
- `resultsEmptyState: string` - Empty state text for result groups.
- `getItemKey(item, meta)` - Returns a stable key for rendering.
- `getItemTitle(item, meta)` - Returns the primary label shown in the default item layout.
- `getItemSubtitle(item, meta)` - Returns the secondary label shown in the default item layout.
- `isFavorite(item, meta)` - Returns whether an item is currently favorited.

### Events

- `update:open` - Emitted when the modal should open or close.
- `update:query` - Emitted when the search input changes.
- `search-input` - Emitted for each user input change.
- `select` - Emitted when the active item is chosen.
- `toggle-favorite` - Emitted when the favorite action is triggered.
- `close` - Emitted when the modal is dismissed.

### Slots

- `loading` - Custom loading state.
- `empty` - Custom empty state when no groups are available.
- `footer` - Footer area beneath the results.
- `group-header` - Custom group header rendering.
- `item` - Full item rendering override.
- `item-icon` - Icon/avatar area inside the default item layout.
- `item-title` - Primary label inside the default item layout.
- `item-subtitle` - Secondary label inside the default item layout.
- `item-actions` - Right-side actions, including favorite toggles.

### Example flow

The demo app in `src/App.vue` shows how to keep the component fully controlled from the parent: the parent owns the query, filters the sample dataset, groups favorites and results, and handles selection/favorite updates.
