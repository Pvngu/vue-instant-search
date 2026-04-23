# GlobalSearchModal API

## Import

```ts
import { GlobalSearchModal } from 'vue-instant-search'
```

## Props

| Prop | Type | Required | Default | Description |
| --- | --- | --- | --- | --- |
| `open` | `boolean` | Yes | - | Controls modal visibility |
| `query` | `string` | No | `''` | Controlled search query |
| `favorites` | `SearchGroup[]` | No | `[]` | Favorite groups shown when query is empty |
| `results` | `SearchGroup[]` | No | `[]` | Result groups shown for current query |
| `placeholder` | `string` | No | `'Type to search'` | Search input placeholder |
| `loading` | `boolean` | No | `false` | Shows loading state |
| `showFavoriteToggle` | `boolean` | No | `true` | Shows built-in star action |
| `closeOnSelect` | `boolean` | No | `true` | Closes modal after selection |
| `emptyState` | `string` | No | `'Type to start searching.'` | Empty text when no query and no items |
| `resultsEmptyState` | `string` | No | `'No results found for "{query}".'` | Empty text when query has no matches |
| `getItemKey` | `(item, meta) => string | number` | No | - | Row key resolver |
| `getItemTitle` | `(item, meta) => string` | No | - | Row title resolver |
| `getItemSubtitle` | `(item, meta) => string` | No | - | Row subtitle resolver |
| `isFavorite` | `(item, meta) => boolean` | No | - | Favorite state resolver |

## Events

| Event | Payload |
| --- | --- |
| `update:open` | `boolean` |
| `update:query` | `string` |
| `search-input` | `string` |
| `select` | `SearchSelectPayload` |
| `toggle-favorite` | `ToggleFavoritePayload` |
| `close` | none |

## Slots

| Slot | Slot Props | Purpose |
| --- | --- | --- |
| `empty` | - | Empty view when there is no query and no data |
| `empty-search` | `{ query }` | Empty view when there is a query but no results |
| `item` | `item, group, category, groupIndex, itemIndex, flatIndex, active, title, subtitle, favorite, onSelect, onToggleFavorite` | Full row override |
| `item-icon` | `item, group, category, active` | Icon override |
| `item-title` | `item, group, category, title` | Title override |
| `item-subtitle` | `item, group, category, subtitle` | Subtitle override |
| `item-actions` | `item, group, category, favorite, onSelect, onToggleFavorite` | Action override |

## Types

```ts
type SearchGroup<T = unknown> = {
  key: string
  label: string
  items: T[]
  description?: string
  emptyLabel?: string
}

type SearchItemMeta<T = unknown> = {
  item: T
  group: SearchGroup<T>
  category: 'favorites' | 'results'
  groupIndex: number
  itemIndex: number
  flatIndex: number
}

type SearchSelectPayload<T = unknown> = SearchItemMeta<T>

type ToggleFavoritePayload<T = unknown> = SearchItemMeta<T> & {
  favorite: boolean
}
```
