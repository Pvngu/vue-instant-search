import type { FlatEntry, GlobalSearchCategory, SearchGroup, SearchItemMeta } from './types'

export const buildEntries = <T>(
  groups: Array<SearchGroup<T>>,
  category: GlobalSearchCategory,
  getItemKey?: (item: T, meta: SearchItemMeta<T>) => string | number,
): Array<FlatEntry<T>> => {
  const entries: Array<FlatEntry<T>> = []

  groups.forEach((group, groupIndex) => {
    group.items.forEach((item, itemIndex) => {
      const meta: SearchItemMeta<T> = {
        item,
        group,
        category,
        groupIndex,
        itemIndex,
        flatIndex: entries.length,
      }

      const key = getItemKey?.(item, meta) ?? `${group.key}-${itemIndex}`
      entries.push({ ...meta, key })
    })
  })

  return entries
}

export const getDefaultItemTitle = (item: unknown): string => {
  const candidate = item as { title?: string; name?: string; full_name?: string }
  return String(candidate?.title ?? candidate?.name ?? candidate?.full_name ?? 'Untitled')
}

export const getItemType = (item: unknown): 'lead' | 'customer' => {
  const candidate = item as { type?: string }
  return candidate?.type === 'customer' ? 'customer' : 'lead'
}
