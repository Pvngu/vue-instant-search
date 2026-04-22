<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { Modal as AModal, Spin as ASpin } from 'ant-design-vue'
import { SearchOutlined } from '@ant-design/icons-vue'
import GlobalSearchResultItem from './global-search/GlobalSearchResultItem.vue'
import { buildEntries, getDefaultItemTitle } from './global-search/entries'
import type {
  FlatEntry,
  SearchGroup,
  SearchItemMeta,
} from './global-search/types'

export type {
  FlatEntry,
  GlobalSearchCategory,
  GlobalSearchModalProps,
  SearchGroup,
  SearchItemMeta,
  SearchSelectPayload,
  ToggleFavoritePayload,
} from './global-search/types'

const props = defineProps({
  open: { type: Boolean, required: true },
  query: { type: String, default: '' },
  favorites: { type: Array as PropType<Array<SearchGroup>>, default: () => [] },
  results: { type: Array as PropType<Array<SearchGroup>>, default: () => [] },
  placeholder: { type: String, default: 'Type to search' },
  loading: { type: Boolean, default: false },
  showFavoriteToggle: { type: Boolean, default: true },
  closeOnSelect: { type: Boolean, default: true },
  emptyState: { type: String, default: 'Type to start searching.' },
  resultsEmptyState: { type: String, default: 'No results found for "{query}".' },
  getItemKey: {
    type: Function as PropType<(item: unknown, meta: SearchItemMeta) => string | number>,
    default: undefined,
  },
  getItemTitle: {
    type: Function as PropType<(item: unknown, meta: FlatEntry) => string>,
    default: undefined,
  },
  getItemSubtitle: {
    type: Function as PropType<(item: unknown, meta: FlatEntry) => string>,
    default: undefined,
  },
  isFavorite: {
    type: Function as PropType<(item: unknown, meta: FlatEntry) => boolean>,
    default: undefined,
  },
})

const emit = defineEmits(['update:open', 'update:query', 'search-input', 'select', 'toggle-favorite', 'close'])

const searchInputRef = ref<HTMLInputElement | null>(null)
const resultsListRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)

const favoriteEntries = computed(() => buildEntries(props.favorites, 'favorites', props.getItemKey))
const resultEntries = computed(() => buildEntries(props.results, 'results', props.getItemKey))

const resultSections = computed(() => {
  return props.results
    .map((group) => {
      const entries = resultEntries.value.filter((entry) => entry.group.key === group.key)
      return { group, entries }
    })
    .filter((section) => section.entries.length > 0)
})

const flatResults = computed<Array<FlatEntry>>(() => {
  const list: Array<FlatEntry> = []

  if (!props.query && favoriteEntries.value.length > 0) {
    list.push(...favoriteEntries.value)
  }

  list.push(...resultEntries.value)

  return list
})

const activeItem = computed(() => {
  if (activeIndex.value >= 0 && activeIndex.value < flatResults.value.length) {
    return flatResults.value[activeIndex.value]
  }

  return null
})

const hasFavorites = computed(() => favoriteEntries.value.length > 0)

const resolveResultsMessage = () => {
  return props.resultsEmptyState.replace('{query}', props.query)
}

const getItemTitle = (entry: FlatEntry) => {
  return props.getItemTitle?.(entry.item, entry) ?? getDefaultItemTitle(entry.item)
}

const getItemSubtitle = (entry: FlatEntry) => {
  return props.getItemSubtitle?.(entry.item, entry) ?? ''
}

const isItemFavorited = (entry: FlatEntry) => {
  return props.isFavorite?.(entry.item, entry) ?? false
}

const favoriteActionTitle = (entry: FlatEntry) => {
  if (entry.category === 'favorites') {
    return 'Remove from favorites'
  }

  return isItemFavorited(entry) ? 'Remove from favorites' : 'Add to favorites'
}

const focusSearchInput = async () => {
  await nextTick()
  searchInputRef.value?.focus()
  searchInputRef.value?.select()
}

const syncActiveIndex = () => {
  if (flatResults.value.length === 0) {
    activeIndex.value = -1
    return
  }

  if (activeIndex.value < 0 || activeIndex.value >= flatResults.value.length) {
    activeIndex.value = 0
  }
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen) {
      syncActiveIndex()
      await focusSearchInput()
      await scrollToActiveItem()
      return
    }

    activeIndex.value = -1
  },
  { immediate: true },
)

watch(flatResults, async () => {
  syncActiveIndex()
  await scrollToActiveItem()
})

const close = () => {
  emit('update:open', false)
  emit('close')
}

const handleSearch = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:query', target.value)
  emit('search-input', target.value)
}

const scrollToActiveItem = async () => {
  await nextTick()

  if (resultsListRef.value) {
    const activeEl = resultsListRef.value.querySelector<HTMLElement>('.result-item.is-active')
    activeEl?.scrollIntoView({ block: 'nearest' })
  }
}

const setActiveIndex = (index: number) => {
  if (index >= 0 && index < flatResults.value.length) {
    activeIndex.value = index
  }
}

const onArrowDown = () => {
  if (flatResults.value.length === 0) return
  activeIndex.value = activeIndex.value < flatResults.value.length - 1 ? activeIndex.value + 1 : 0
  void scrollToActiveItem()
}

const onArrowUp = () => {
  if (flatResults.value.length === 0) return
  activeIndex.value = activeIndex.value > 0 ? activeIndex.value - 1 : flatResults.value.length - 1
  void scrollToActiveItem()
}

const selectEntry = (entry: FlatEntry) => {
  emit('select', entry)

  if (props.closeOnSelect) {
    close()
  }
}

const toggleFavorite = (entry: FlatEntry, event?: MouseEvent) => {
  if (event) {
    const el = event.currentTarget as HTMLElement | null
    el?.classList.remove('animate-pop')
    void el?.offsetWidth
    el?.classList.add('animate-pop')
  }

  emit('toggle-favorite', {
    ...entry,
    favorite: !isItemFavorited(entry),
  })
}

const onEnter = () => {
  if (activeItem.value) {
    selectEntry(activeItem.value)
  }
}

const handleInputKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    onArrowDown()
    return
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault()
    onArrowUp()
    return
  }

  if (event.key === 'Enter') {
    event.preventDefault()
    onEnter()
    return
  }

  if (event.key === 'Escape') {
    event.preventDefault()
    close()
  }
}

defineExpose({
  focusSearchInput,
  close,
})
</script>

<template>
  <a-modal
    :open="open"
    @cancel="close"
    :footer="null"
    :closable="false"
    :maskClosable="true"
    :destroyOnClose="true"
    wrap-class-name="global-search-modal"
    :width="600"
  >
    <div class="vis:flex vis:flex-col">
      <div class="vis:flex vis:items-center vis:px-6 vis:py-4 vis:border-b! vis:border-slate-200!">
        <SearchOutlined class="vis:mr-4 vis:text-xl vis:text-gray-700!" />
        <input
          ref="searchInputRef"
          :value="query"
          class="vis:flex-1 vis:border-0 vis:outline-0 vis:text-lg! vis:bg-transparent vis:text-gray-700 vis:placeholder:text-gray-300!"
          :placeholder="placeholder"
          @keydown="handleInputKeydown"
          @input="handleSearch"
        />
        <div class="vis:flex vis:items-center">
          <span class="shortcut-key vis:bg-[#f0f0f0] vis:border! vis:border-[#d9d9d9]! vis:rounded-sm vis:px-1.5 vis:py-0.5 vis:text-[11px] vis:text-[#8c8c8c]">ESC</span>
        </div>
      </div>

      <div class="vis:max-h-120 vis:overflow-y-auto vis:py-3 vis:px-0 vis:flex vis:flex-col">
        <div v-if="loading" class="loading-state">
          <a-spin />
        </div>

        <div v-else-if="flatResults.length === 0 && !query" class="empty-state">
          <slot name="empty">
            {{ emptyState }}
          </slot>
        </div>

        <div v-else-if="flatResults.length === 0 && query" class="empty-state">
          <slot name="empty-search" :query="query">
            {{ resolveResultsMessage() }}
          </slot>
        </div>

        <div v-else ref="resultsListRef" class="results-list">
          <template v-if="!query && hasFavorites">
            <div class="results-group-title">Favorites</div>

            <GlobalSearchResultItem
              v-for="(entry, index) in favoriteEntries"
              :key="`fav-${entry.key}`"
              :entry="entry"
              :active="Boolean(activeItem && activeItem.key === entry.key && activeItem.category === 'favorites')"
              :title="getItemTitle(entry)"
              :subtitle="getItemSubtitle(entry)"
              :favorite="isItemFavorited(entry)"
              :show-favorite-toggle="showFavoriteToggle"
              :favorite-action-title="favoriteActionTitle(entry)"
              @select="selectEntry(entry)"
              @activate="setActiveIndex(index)"
              @toggle-favorite="(event) => toggleFavorite(entry, event)"
            >
              <template v-if="$slots.item" #item="slotProps">
                <slot name="item" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-icon']" #item-icon="slotProps">
                <slot name="item-icon" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-title']" #item-title="slotProps">
                <slot name="item-title" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-subtitle']" #item-subtitle="slotProps">
                <slot name="item-subtitle" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-actions']" #item-actions="slotProps">
                <slot name="item-actions" v-bind="slotProps" />
              </template>
            </GlobalSearchResultItem>
          </template>

          <template v-for="section in resultSections" :key="section.group.key">
            <div class="results-group-title">
              {{ section.group.label }} <span v-if="!query" class="recent-badge">Recent</span>
            </div>

            <GlobalSearchResultItem
              v-for="entry in section.entries"
              :key="`result-${entry.key}`"
              :entry="entry"
              :active="Boolean(activeItem && activeItem.key === entry.key && activeItem.category === 'results')"
              :title="getItemTitle(entry)"
              :subtitle="getItemSubtitle(entry)"
              :favorite="isItemFavorited(entry)"
              :show-favorite-toggle="showFavoriteToggle"
              :favorite-action-title="favoriteActionTitle(entry)"
              @select="selectEntry(entry)"
              @activate="setActiveIndex(flatResults.findIndex((candidate) => candidate.key === entry.key && candidate.category === 'results'))"
              @toggle-favorite="(event) => toggleFavorite(entry, event)"
            >
              <template v-if="$slots.item" #item="slotProps">
                <slot name="item" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-icon']" #item-icon="slotProps">
                <slot name="item-icon" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-title']" #item-title="slotProps">
                <slot name="item-title" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-subtitle']" #item-subtitle="slotProps">
                <slot name="item-subtitle" v-bind="slotProps" />
              </template>
              <template v-if="$slots['item-actions']" #item-actions="slotProps">
                <slot name="item-actions" v-bind="slotProps" />
              </template>
            </GlobalSearchResultItem>
          </template>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style>
.global-search-modal .ant-modal-content {
  padding: 0;
  border-radius: 12px;
  overflow: hidden;
  background: transparent;
  box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.3);
}

.global-search-modal .ant-modal-body {
  padding: 0;
  background: #fff;
}

.global-search-modal.ant-modal {
  top: 100px;
  padding-bottom: 0;
}
</style>

<style scoped>
.shortcut-key {
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial;
}

.loading-state,
.empty-state {
  padding: 32px 24px;
  text-align: center;
  color: #8c8c8c;
  font-size: 14px;
}

.results-group-title {
  padding: 8px 24px 6px;
  font-size: 12px;
  font-weight: 600;
  color: #8c8c8c;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 8px;
  position: sticky;
  top: -12px;
  background-color: white;
  z-index: 2;
}

.recent-badge {
  background: #e6f7ff;
  color: #1890ff;
  border: 1px solid #91d5ff;
  border-radius: 10px;
  padding: 0 6px;
  font-size: 10px;
  font-weight: 500;
  text-transform: none;
  letter-spacing: normal;
}
</style>
