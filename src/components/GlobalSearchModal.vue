<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { Modal as AModal, Spin as ASpin, Tag as ATag } from 'ant-design-vue'
import { SearchOutlined, PhoneOutlined, MailOutlined, UserOutlined, EnterOutlined, StarOutlined, StarFilled } from '@ant-design/icons-vue'

export type GlobalSearchCategory = 'favorites' | 'results'

export type KeyboardShortcutDescriptor = {
  key: string
  ctrl?: boolean
  meta?: boolean
  alt?: boolean
  shift?: boolean
}

export type KeyboardShortcutValue =
  | string
  | KeyboardShortcutDescriptor
  | Array<string | KeyboardShortcutDescriptor>

export type KeyboardShortcuts = {
  up?: KeyboardShortcutValue
  down?: KeyboardShortcutValue
  enter?: KeyboardShortcutValue
  close?: KeyboardShortcutValue
}

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

export type SearchSelectPayload<T = unknown> = SearchItemMeta<T>

export type ToggleFavoritePayload<T = unknown> = SearchItemMeta<T> & {
  favorite: boolean
}

export type GlobalSearchModalProps<T = unknown> = {
  open: boolean
  query: string
  favorites: Array<SearchGroup<T>>
  results: Array<SearchGroup<T>>
  title: string
  subtitle: string
  placeholder: string
  loading: boolean
  showFavoriteToggle: boolean
  closeOnSelect: boolean
  emptyState: string
  favoritesEmptyState: string
  resultsEmptyState: string
  shortcuts: KeyboardShortcuts
  getItemKey?: (item: T, meta: SearchItemMeta<T>) => string | number
  getItemTitle?: (item: T, meta: SearchItemMeta<T>) => string
  getItemSubtitle?: (item: T, meta: SearchItemMeta<T>) => string
  isFavorite?: (item: T, meta: SearchItemMeta<T>) => boolean
}

const props = withDefaults(defineProps<GlobalSearchModalProps>(), {
  query: '',
  favorites: () => [],
  results: () => [],
  title: 'Global search',
  subtitle: '',
  placeholder: 'Type to search',
  loading: false,
  showFavoriteToggle: true,
  closeOnSelect: true,
  emptyState: 'Type to start searching.',
  favoritesEmptyState: 'No favorites yet.',
  resultsEmptyState: 'No results found for "{query}".',
  shortcuts: () => ({
    up: 'ArrowUp',
    down: 'ArrowDown',
    enter: 'Enter',
    close: 'Escape',
  }),
})

const emit = defineEmits<{
  (event: 'update:open', value: boolean): void
  (event: 'update:query', value: string): void
  (event: 'search-input', value: string): void
  (event: 'select', payload: SearchSelectPayload): void
  (event: 'toggle-favorite', payload: ToggleFavoritePayload): void
  (event: 'close'): void
}>()

type FlatEntry = SearchItemMeta & {
  key: string | number
}

const searchInputRef = ref<HTMLInputElement | null>(null)
const resultsListRef = ref<HTMLElement | null>(null)
const activeIndex = ref(-1)

const normalizeShortcut = (shortcut: string): KeyboardShortcutDescriptor => {
  const parts = shortcut.split('+').map((part) => part.trim()).filter(Boolean)

  if (parts.length === 0) {
    return { key: shortcut }
  }

  const descriptor: KeyboardShortcutDescriptor = { key: parts[parts.length - 1] }

  for (const part of parts.slice(0, -1)) {
    const normalized = part.toLowerCase()

    if (normalized === 'meta' || normalized === 'cmd' || normalized === 'command') {
      descriptor.meta = true
    } else if (normalized === 'ctrl' || normalized === 'control') {
      descriptor.ctrl = true
    } else if (normalized === 'alt' || normalized === 'option') {
      descriptor.alt = true
    } else if (normalized === 'shift') {
      descriptor.shift = true
    } else if (normalized === 'mod') {
      descriptor.meta = true
    }
  }

  return descriptor
}

const normalizeShortcutValue = (value?: KeyboardShortcutValue): KeyboardShortcutDescriptor[] => {
  if (!value) {
    return []
  }

  const values = Array.isArray(value) ? value : [value]

  return values.map((entry) => (typeof entry === 'string' ? normalizeShortcut(entry) : entry))
}

const matchesShortcut = (event: KeyboardEvent, shortcut?: KeyboardShortcutValue): boolean => {
  return normalizeShortcutValue(shortcut).some((descriptor) => {
    const keyMatches = event.key.toLowerCase() === descriptor.key.toLowerCase()
    const ctrlMatches = Boolean(descriptor.ctrl) === event.ctrlKey
    const metaMatches = Boolean(descriptor.meta) === event.metaKey
    const altMatches = Boolean(descriptor.alt) === event.altKey
    const shiftMatches = Boolean(descriptor.shift) === event.shiftKey

    return keyMatches && ctrlMatches && metaMatches && altMatches && shiftMatches
  })
}

const buildEntries = (groups: Array<SearchGroup>, category: GlobalSearchCategory): FlatEntry[] => {
  const entries: FlatEntry[] = []

  groups.forEach((group, groupIndex) => {
    group.items.forEach((item, itemIndex) => {
      const meta: SearchItemMeta = {
        item,
        group,
        category,
        groupIndex,
        itemIndex,
        flatIndex: entries.length,
      }

      const key = props.getItemKey?.(item, meta) ?? `${group.key}-${itemIndex}`
      entries.push({ ...meta, key })
    })
  })

  return entries
}

const favoriteEntries = computed(() => buildEntries(props.favorites, 'favorites'))
const resultEntries = computed(() => buildEntries(props.results, 'results'))
const flatResults = computed(() => {
  const list: FlatEntry[] = []

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

const openModal = async () => {
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
      await openModal()
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
    favorite: !(props.isFavorite?.(entry.item, entry) ?? false),
  })
}

const onEnter = () => {
  if (activeItem.value) {
    selectEntry(activeItem.value)
  }
}

const getItemTitle = (entry: FlatEntry) => {
  return props.getItemTitle?.(entry.item, entry) ?? String((entry.item as { title?: string; name?: string; full_name?: string })?.title ?? (entry.item as { title?: string; name?: string; full_name?: string })?.name ?? (entry.item as { title?: string; name?: string; full_name?: string })?.full_name ?? 'Untitled')
}

const getItemSubtitle = (entry: FlatEntry) => {
  return props.getItemSubtitle?.(entry.item, entry) ?? ''
}

const isItemFavorited = (entry: FlatEntry) => {
  return props.isFavorite?.(entry.item, entry) ?? false
}

const getGroupEntry = (group: SearchGroup, category: GlobalSearchCategory, itemIndex: number) => {
  const entries = category === 'favorites' ? favoriteEntries.value : resultEntries.value
  return entries.find((entry) => entry.group.key === group.key && entry.itemIndex === itemIndex)
}

defineExpose({
  focusSearchInput: openModal,
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
    <div class="flex flex-col">
      <div class="flex items-center px-6 py-4 border-b! border-slate-200!">
        <SearchOutlined class="mr-4 text-xl text-gray-700!" />
        <input
          ref="searchInputRef"
          :value="query"
          class="flex-1 border-0 outline-0 text-lg! bg-transparent text-gray-700 placeholder:text-gray-300!"
          :placeholder="placeholder"
          @keydown.down.prevent="onArrowDown"
          @keydown.up.prevent="onArrowUp"
          @keydown.enter.prevent="onEnter"
          @keydown.esc.prevent="close"
          @input="handleSearch"
        />
        <div class="flex items-center">
          <span class="shortcut-key bg-[#f0f0f0] border! border-[#d9d9d9]! rounded-sm px-1.5 py-0.5 text-[11px] text-[#8c8c8c]">ESC</span>
        </div>
      </div>

      <div class="max-h-120 overflow-y-auto py-3 px-0 flex flex-col">
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

        <div v-else class="results-list" ref="resultsListRef">
          <template v-if="!query && hasFavorites">
            <div class="results-group-title">
              Favorites
            </div>

            <div
              v-for="(entry, index) in favoriteEntries"
              :key="`fav-${entry.key}`"
              :class="['result-item', { 'is-active': activeItem && activeItem.key === entry.key && activeItem.category === 'favorites' }]"
              role="option"
              :aria-selected="activeItem && activeItem.key === entry.key && activeItem.category === 'favorites'"
              @click="selectEntry(entry)"
              @mouseenter="setActiveIndex(index)"
            >
              <slot
                name="item"
                :item="entry.item"
                :group="entry.group"
                :category="entry.category"
                :group-index="entry.groupIndex"
                :item-index="entry.itemIndex"
                :flat-index="entry.flatIndex"
                :active="activeItem && activeItem.key === entry.key && activeItem.category === 'favorites'"
                :title="getItemTitle(entry)"
                :subtitle="getItemSubtitle(entry)"
                :favorite="isItemFavorited(entry)"
                :on-select="() => selectEntry(entry)"
                :on-toggle-favorite="(event) => toggleFavorite(entry, event)"
              >
                <div class="item-icon-wrapper">
                  <slot
                    name="item-icon"
                    :item="entry.item"
                    :group="entry.group"
                    :category="entry.category"
                    :active="activeItem && activeItem.key === entry.key && activeItem.category === 'favorites'"
                  >
                    <UserOutlined class="item-icon lead-icon" />
                  </slot>
                </div>

                <div class="item-content">
                  <div class="item-title-row">
                    <slot
                      name="item-title"
                      :item="entry.item"
                      :group="entry.group"
                      :category="entry.category"
                      :title="getItemTitle(entry)"
                    >
                      <span class="item-title">{{ getItemTitle(entry) }}</span>
                    </slot>

                    <a-tag v-if="(entry.item as { status?: { color: string; name: string } }).status" :color="(entry.item as { status?: { color: string; name: string } }).status?.color" class="status-tag rounded-xl! ml-2!">
                      {{ (entry.item as { status?: { name: string } }).status?.name }}
                    </a-tag>
                  </div>

                  <div class="item-details">
                    <slot
                      name="item-subtitle"
                      :item="entry.item"
                      :group="entry.group"
                      :category="entry.category"
                      :subtitle="getItemSubtitle(entry)"
                    >
                      <span v-if="(entry.item as { phone_number?: string }).phone_number"><PhoneOutlined /> {{ (entry.item as { phone_number?: string }).phone_number }}</span>
                      <span v-if="(entry.item as { email?: string }).email"><MailOutlined /> {{ (entry.item as { email?: string }).email }}</span>
                    </slot>
                  </div>
                </div>

                <div class="item-actions">
                  <slot
                    name="item-actions"
                    :item="entry.item"
                    :group="entry.group"
                    :category="entry.category"
                    :favorite="isItemFavorited(entry)"
                    :on-toggle-favorite="(event) => toggleFavorite(entry, event)"
                    :on-select="() => selectEntry(entry)"
                  >
                    <span class="star-wrapper is-animating" @click.stop="toggleFavorite(entry, $event)" title="Remove from favorites">
                      <StarFilled class="star-filled" />
                    </span>
                    <EnterOutlined v-if="activeItem && activeItem.key === entry.key && activeItem.category === 'favorites'" class="enter-icon" />
                  </slot>
                </div>
              </slot>
            </div>
          </template>

          <template v-if="resultEntries.length > 0">
            <template
              v-for="group in results"
              :key="group.key"
            >
              <div class="results-group-title">
                {{ group.label }} <span v-if="!query" class="recent-badge">Recent</span>
              </div>

              <div
                v-for="(item, itemIndex) in group.items"
                :key="`result-${group.key}-${itemIndex}`"
              >
                <div
                  v-if="getGroupEntry(group, 'results', itemIndex)"
                  :class="['result-item', { 'is-active': activeItem && activeItem.key === getGroupEntry(group, 'results', itemIndex)?.key && activeItem.category === 'results' }]"
                  role="option"
                  :aria-selected="activeItem && activeItem.key === getGroupEntry(group, 'results', itemIndex)?.key && activeItem.category === 'results'"
                  @click="selectEntry(getGroupEntry(group, 'results', itemIndex)!)"
                  @mouseenter="setActiveIndex(flatResults.findIndex((entry) => entry.key === getGroupEntry(group, 'results', itemIndex)?.key && entry.category === 'results'))"
                >
                  <slot
                    name="item"
                    :item="getGroupEntry(group, 'results', itemIndex)?.item"
                    :group="group"
                    :category="'results'"
                    :group-index="results.findIndex((candidate) => candidate.key === group.key)"
                    :item-index="itemIndex"
                    :flat-index="flatResults.findIndex((entry) => entry.key === getGroupEntry(group, 'results', itemIndex)?.key && entry.category === 'results')"
                    :active="activeItem && activeItem.key === getGroupEntry(group, 'results', itemIndex)?.key && activeItem.category === 'results'"
                    :title="getItemTitle(getGroupEntry(group, 'results', itemIndex)!)"
                    :subtitle="getItemSubtitle(getGroupEntry(group, 'results', itemIndex)!)"
                    :favorite="isItemFavorited(getGroupEntry(group, 'results', itemIndex)!)"
                    :on-select="() => selectEntry(getGroupEntry(group, 'results', itemIndex)!)"
                    :on-toggle-favorite="(event) => toggleFavorite(getGroupEntry(group, 'results', itemIndex)!, event)"
                  >
                    <div class="item-icon-wrapper">
                      <slot
                        name="item-icon"
                        :item="getGroupEntry(group, 'results', itemIndex)?.item"
                        :group="group"
                        :category="'results'"
                        :active="activeItem && activeItem.key === getGroupEntry(group, 'results', itemIndex)?.key && activeItem.category === 'results'"
                      >
                        <UserOutlined class="item-icon lead-icon" />
                      </slot>
                    </div>

                    <div class="item-content">
                      <div class="item-title-row">
                        <slot
                          name="item-title"
                          :item="getGroupEntry(group, 'results', itemIndex)?.item"
                          :group="group"
                          :category="'results'"
                          :title="getItemTitle(getGroupEntry(group, 'results', itemIndex)!)"
                        >
                          <span class="item-title">{{ getItemTitle(getGroupEntry(group, 'results', itemIndex)!) }}</span>
                        </slot>

                        <a-tag v-if="(getGroupEntry(group, 'results', itemIndex)?.item as { status?: { color: string; name: string } })?.status" :color="(getGroupEntry(group, 'results', itemIndex)?.item as { status?: { color: string; name: string } })?.status?.color" class="status-tag rounded-xl! ml-2!">
                          {{ (getGroupEntry(group, 'results', itemIndex)?.item as { status?: { name: string } })?.status?.name }}
                        </a-tag>
                      </div>

                      <div class="item-details">
                        <slot
                          name="item-subtitle"
                          :item="getGroupEntry(group, 'results', itemIndex)?.item"
                          :group="group"
                          :category="'results'"
                          :subtitle="getItemSubtitle(getGroupEntry(group, 'results', itemIndex)!)"
                        >
                          <span v-if="(getGroupEntry(group, 'results', itemIndex)?.item as { phone_number?: string })?.phone_number"><PhoneOutlined /> {{ (getGroupEntry(group, 'results', itemIndex)?.item as { phone_number?: string })?.phone_number }}</span>
                          <span v-if="(getGroupEntry(group, 'results', itemIndex)?.item as { email?: string })?.email"><MailOutlined /> {{ (getGroupEntry(group, 'results', itemIndex)?.item as { email?: string })?.email }}</span>
                        </slot>
                      </div>
                    </div>

                    <div class="item-actions">
                      <slot
                        name="item-actions"
                        :item="getGroupEntry(group, 'results', itemIndex)?.item"
                        :group="group"
                        :category="'results'"
                        :favorite="isItemFavorited(getGroupEntry(group, 'results', itemIndex)!)"
                        :on-toggle-favorite="(event) => toggleFavorite(getGroupEntry(group, 'results', itemIndex)!, event)"
                        :on-select="() => selectEntry(getGroupEntry(group, 'results', itemIndex)!)"
                      >
                        <span class="star-wrapper is-animating" @click.stop="toggleFavorite(getGroupEntry(group, 'results', itemIndex)!, $event)" :title="isItemFavorited(getGroupEntry(group, 'results', itemIndex)!) ? 'Remove from favorites' : 'Add to favorites'">
                          <StarFilled v-if="isItemFavorited(getGroupEntry(group, 'results', itemIndex)!)" class="star-filled" />
                          <StarOutlined v-else class="star-outlined" />
                        </span>
                        <EnterOutlined v-if="activeItem && activeItem.key === getGroupEntry(group, 'results', itemIndex)?.key && activeItem.category === 'results'" class="enter-icon" />
                      </slot>
                    </div>
                  </slot>
                </div>
              </div>
            </template>
          </template>
        </div>
      </div>
    </div>
  </a-modal>
</template>

<style>
/* Global styles for the modal overlay and positioning */
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

/* Modal vertical alignment overrides from AntD defaults */
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

.result-item {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s;
  border-left: 3px solid transparent;
}

.result-item.is-active {
  background: #f5f5f5;
  border-left-color: #1890ff;
}

.item-icon-wrapper {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
  background: #f0f0f0;
}

.lead-icon {
  color: #1890ff;
}

.customer-icon {
  color: #52c41a;
}

.result-item.is-active .lead-icon {
  color: #096dd9;
}

.item-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.item-title-row {
  display: flex;
  align-items: center;
  margin-bottom: 2px;
}

.item-title {
  font-size: 14px;
  font-weight: 500;
  color: #262626;
}

.status-tag {
  font-size: 10px;
  padding: 0 6px;
  line-height: 16px;
  border: none;
  color: white;
}

.item-details {
  font-size: 12px;
  color: #8c8c8c;
  display: flex;
  gap: 12px;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.star-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  transition: background 0.2s;
}

.star-wrapper:hover {
  background: rgba(0, 0, 0, 0.05);
}

.star-outlined {
  font-size: 16px;
  color: #bfbfbf;
}

.star-filled {
  font-size: 16px;
  color: #faad14;
}

.enter-icon {
  color: #bfbfbf;
  font-size: 14px;
}

/* Animations */
@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.animate-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>