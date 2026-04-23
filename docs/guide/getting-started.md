# Getting Started

## Install

```bash
npm install vue-instant-search
```

## Basic usage

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { GlobalSearchModal } from 'vue-instant-search'

const open = ref(false)
const query = ref('')

const favorites = ref([])
const results = ref([])
</script>

<template>
  <GlobalSearchModal
    v-model:open="open"
    v-model:query="query"
    :favorites="favorites"
    :results="results"
    @search-input="(value) => console.log('search', value)"
    @select="(payload) => console.log('select', payload)"
    @toggle-favorite="(payload) => console.log('toggle-favorite', payload)"
  />
</template>
```

## Controlled data flow

1. Parent owns query state.
2. Parent fetches/filters data based on query.
3. Parent maps data into grouped arrays.
4. Parent handles select and favorite toggle side effects.

## Keyboard behavior

- ArrowDown: next item
- ArrowUp: previous item
- Enter: select active item
- Escape: close modal
