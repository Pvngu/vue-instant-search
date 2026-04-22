<script setup lang="ts">
import { computed, ref } from 'vue'
import { GlobalSearchModal } from './index'

type SearchItem = {
  xid: string
  full_name: string
  phone_number: string
  email: string
  type: 'lead' | 'customer'
  is_favorite: boolean
  status: null
  updated_at: string
}

const modalOpen = ref(true)
const searchQuery = ref('')

const sampleResults = {
  leads: [
    {
      xid: '2abBZobw',
      full_name: 'Edwina Bergnaum',
      phone_number: '331-881-7179',
      email: 'zbaumbach@example.net',
      type: 'lead',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-17T07:48:26.000000Z',
    },
    {
      xid: '3nqdnjW2',
      full_name: 'Bettye Wiegand',
      phone_number: '+1-337-773-7964',
      email: 'malika17@example.org',
      type: 'lead',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-10T03:54:46.000000Z',
    },
    {
      xid: 'M6q877rz',
      full_name: 'Madie Stehr',
      phone_number: '+1.740.474.2678',
      email: 'oreynolds@example.org',
      type: 'lead',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-10T03:54:41.000000Z',
    },
    {
      xid: '2krPmNqR',
      full_name: 'Chaim Wiegand',
      phone_number: '+1.540.715.3138',
      email: 'will.vickie@example.org',
      type: 'lead',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-09T02:50:05.000000Z',
    },
    {
      xid: 'yMWXOPbG',
      full_name: 'Nathanial Weissnat',
      phone_number: '+14699352575',
      email: 'tianna.senger@example.net',
      type: 'lead',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-09T02:48:19.000000Z',
    },
  ] as SearchItem[],
  customers: [
    {
      xid: 'Dnqmpr87',
      full_name: 'Moses Berge',
      phone_number: '+1-414-220-5096',
      email: 'bode.allison@example.com',
      type: 'customer',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-10T03:54:51.000000Z',
    },
    {
      xid: 'dJb0Q1WB',
      full_name: 'Tyra Cummings',
      phone_number: '1-331-500-2741',
      email: 'dexter.reilly@example.net',
      type: 'customer',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-09T02:47:37.000000Z',
    },
    {
      xid: '59bxXbON',
      full_name: 'Sydnee Jerde',
      phone_number: '947-271-5355',
      email: 'tremaine.sanford@example.com',
      type: 'customer',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-04T11:49:04.000000Z',
    },
    {
      xid: 'M6q84vqz',
      full_name: 'Ian Harris',
      phone_number: '1-850-366-1002',
      email: 'rose42@example.com',
      type: 'customer',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-02T20:21:07.000000Z',
    },
    {
      xid: 'B7WlNqjQ',
      full_name: 'Jaiden Lesch',
      phone_number: '+16616173859',
      email: 'hermina77@example.net',
      type: 'customer',
      is_favorite: false,
      status: null,
      updated_at: '2026-04-02T19:44:15.000000Z',
    },
  ] as SearchItem[],
}

const favoriteIds = ref(new Set(['2abBZobw', 'Dnqmpr87']))

const allItems = computed(() => [...sampleResults.leads, ...sampleResults.customers])

const normalize = (value: string) => value.trim().toLowerCase()

const filteredItems = computed(() => {
  const query = normalize(searchQuery.value)

  if (!query) {
    return allItems.value
  }

  return allItems.value.filter((item) => {
    return [item.full_name, item.email, item.phone_number, item.type]
      .join(' ')
      .toLowerCase()
      .includes(query)
  })
})

const favoritesByType = computed(() => {
  const items = allItems.value.filter((item) => favoriteIds.value.has(item.xid))

  return [
    {
      key: 'favorite-leads',
      label: 'Leads',
      description: 'Pinned contacts you revisit often.',
      items: items.filter((item) => item.type === 'lead'),
    },
    {
      key: 'favorite-customers',
      label: 'Customers',
      description: 'Pinned accounts with fast access.',
      items: items.filter((item) => item.type === 'customer'),
    },
  ].filter((group) => group.items.length > 0)
})

const resultsByType = computed(() => {
  return [
    {
      key: 'result-leads',
      label: 'Leads',
      description: searchQuery.value ? `Filtered by "${searchQuery.value}".` : 'Most recent lead matches.',
      items: filteredItems.value.filter((item) => item.type === 'lead'),
    },
    {
      key: 'result-customers',
      label: 'Customers',
      description: searchQuery.value ? `Filtered by "${searchQuery.value}".` : 'Most recent customer matches.',
      items: filteredItems.value.filter((item) => item.type === 'customer'),
    },
  ].filter((group) => group.items.length > 0)
})

const handleSelect = (payload: { item: SearchItem }) => {
  console.info('Selected item', payload.item)
}

const handleToggleFavorite = (payload: { item: SearchItem; favorite: boolean }) => {
  if (payload.favorite) {
    favoriteIds.value = new Set([...favoriteIds.value, payload.item.xid])
  } else {
    const nextIds = new Set(favoriteIds.value)
    nextIds.delete(payload.item.xid)
    favoriteIds.value = nextIds
  }
}
</script>

<template>
  <main class="demo-shell">
    <section class="hero-card">
      <p class="eyebrow">vue-instant-search</p>
      <h1>Global search modal for reusable Vue 3 apps</h1>
      <p class="hero-copy">
        The modal below is driven entirely by parent state: search results, favorites, keyboard shortcuts, and action handlers all live here in the demo app.
      </p>

      <div class="hero-actions">
        <button
          class="primary-button"
          type="button"
          @click="modalOpen = true"
        >
          Open search
        </button>

        <button
          class="secondary-button"
          type="button"
          @click="searchQuery = ''"
        >
          Clear query
        </button>
      </div>

      <dl class="stats-grid">
        <div>
          <dt>Favorites</dt>
          <dd>{{ favoriteIds.size }}</dd>
        </div>
        <div>
          <dt>Results</dt>
          <dd>{{ filteredItems.length }}</dd>
        </div>
        <div>
          <dt>Groups</dt>
          <dd>{{ favoritesByType.length + resultsByType.length }}</dd>
        </div>
      </dl>
    </section>

    <section class="demo-board">
      <div class="board-header">
        <h2>Example data flow</h2>
        <p>Search input updates local state, which filters the grouped arrays passed into the modal.</p>
      </div>

      <pre class="code-sample">{{ JSON.stringify({ query: searchQuery, favoriteIds: [...favoriteIds], results: resultsByType.map((group) => ({ key: group.key, count: group.items.length })) }, null, 2) }}</pre>
    </section>

    <GlobalSearchModal
      v-model:open="modalOpen"
      v-model:query="searchQuery"
      placeholder="Search by name, email, phone, or type"
      :favorites="favoritesByType"
      :results="resultsByType"
      :loading="false"
      :get-item-key="(item) => (item as SearchItem).xid"
      :get-item-title="(item) => (item as SearchItem).full_name"
      :get-item-subtitle="(item) => `${(item as SearchItem).email} · ${(item as SearchItem).phone_number}`"
      :is-favorite="(item) => favoriteIds.has((item as SearchItem).xid)"
      @select="(payload) => handleSelect(payload as { item: SearchItem })"
      @toggle-favorite="(payload) => handleToggleFavorite(payload as { item: SearchItem; favorite: boolean })"
      @search-input="(value) => console.info('search-input', value)"
    >
      <template #item-icon="{ item }">
        <span class="custom-item-icon" :class="(item as SearchItem).type === 'lead' ? 'lead' : 'customer'">
          {{ (item as SearchItem).type === 'lead' ? 'L' : 'C' }}
        </span>
      </template>
    </GlobalSearchModal>
  </main>
</template>