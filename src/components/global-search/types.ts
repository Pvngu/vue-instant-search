export type GlobalSearchCategory = 'favorites' | 'results'

export type SearchGroup<T = unknown> = {
  key: string
  label: string
  items: T[]
  description?: string
  emptyLabel?: string
}

export type SearchItemMeta<T = unknown> = {
  item: T
  group: SearchGroup<T>
  category: GlobalSearchCategory
  groupIndex: number
  itemIndex: number
  flatIndex: number
}

export type FlatEntry<T = unknown> = SearchItemMeta<T> & {
  key: string | number
}

export type SearchSelectPayload<T = unknown> = SearchItemMeta<T>

export type ToggleFavoritePayload<T = unknown> = SearchItemMeta<T> & {
  favorite: boolean
}

export type GlobalSearchModalProps<T = unknown> = {
  open: boolean
  query: string
  favorites: Array<SearchGroup<T>>
  results: Array<SearchGroup<T>>
  placeholder: string
  loading: boolean
  showFavoriteToggle: boolean
  closeOnSelect: boolean
  emptyState: string
  resultsEmptyState: string
  getItemKey?: (item: T, meta: SearchItemMeta<T>) => string | number
  getItemTitle?: (item: T, meta: SearchItemMeta<T>) => string
  getItemSubtitle?: (item: T, meta: SearchItemMeta<T>) => string
  isFavorite?: (item: T, meta: SearchItemMeta<T>) => boolean
}
