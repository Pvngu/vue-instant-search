# Controlled Usage Example

```vue
<script setup lang="ts">
import { computed, ref } from 'vue'
import { GlobalSearchModal } from 'vue-instant-search'

type Person = {
  xid: string
  full_name: string
  email?: string
  phone_number?: string
  type: 'lead' | 'customer'
  is_favorite?: boolean
}

const open = ref(false)
const query = ref('')
const source = ref<Person[]>([])
const favoriteIds = ref(new Set<string>())

const filtered = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return source.value

  return source.value.filter((item) => {
    return [item.full_name, item.email, item.phone_number, item.type]
      .join(' ')
      .toLowerCase()
      .includes(q)
  })
})

const favorites = computed(() => {
  const items = source.value.filter((item) => favoriteIds.value.has(item.xid))
  return [{ key: 'favorites', label: 'Favorites', items }]
})

const results = computed(() => {
  return [
    {
      key: 'results',
      label: 'Results',
      items: filtered.value,
    },
  ]
})

const onSearchInput = async (value: string) => {
  // Fetch from API or filter local source.
  console.log(value)
}

const onSelect = (payload: { item: Person }) => {
  // Navigate in parent.
  console.log('selected', payload.item)
}

const onToggleFavorite = (payload: { item: Person; favorite: boolean }) => {
  if (payload.favorite) {
    favoriteIds.value.add(payload.item.xid)
  } else {
    favoriteIds.value.delete(payload.item.xid)
  }

  favoriteIds.value = new Set(favoriteIds.value)
}
</script>

<template>
  <GlobalSearchModal
    v-model:open="open"
    v-model:query="query"
    :favorites="favorites"
    :results="results"
    :get-item-key="(item) => item.xid"
    :get-item-title="(item) => item.full_name"
    :get-item-subtitle="(item) => `${item.email ?? ''} ${item.phone_number ?? ''}`"
    :is-favorite="(item) => Boolean(item.is_favorite)"
    @search-input="onSearchInput"
    @select="onSelect"
    @toggle-favorite="onToggleFavorite"
  />
</template>
```
