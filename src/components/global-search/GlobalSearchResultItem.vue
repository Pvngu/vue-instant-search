<script setup lang="ts">
import { computed } from 'vue'
import { Tag as ATag } from 'ant-design-vue'
import { PhoneOutlined, MailOutlined, UserOutlined, EnterOutlined, StarOutlined, StarFilled } from '@ant-design/icons-vue'
import { getItemType } from './entries'
import type { FlatEntry } from './types'

const props = defineProps<{
  entry: FlatEntry
  active: boolean
  title: string
  subtitle: string
  favorite: boolean
  showFavoriteToggle: boolean
  favoriteActionTitle: string
}>()

const emit = defineEmits<{
  (event: 'select'): void
  (event: 'activate'): void
  (event: 'toggle-favorite', payload?: MouseEvent): void
}>()

const itemType = computed(() => getItemType(props.entry.item))

const status = computed(() => {
  return (props.entry.item as { status?: { color?: string; name?: string } })?.status
})

const phone = computed(() => {
  return (props.entry.item as { phone_number?: string })?.phone_number
})

const email = computed(() => {
  return (props.entry.item as { email?: string })?.email
})

const handleToggleFavorite = (event?: MouseEvent) => {
  emit('toggle-favorite', event)
}
</script>

<template>
  <div
    :class="['result-item', { 'is-active': active }]"
    role="option"
    :aria-selected="active"
    @click="emit('select')"
    @mouseenter="emit('activate')"
  >
    <slot
      name="item"
      :item="entry.item"
      :group="entry.group"
      :category="entry.category"
      :group-index="entry.groupIndex"
      :item-index="entry.itemIndex"
      :flat-index="entry.flatIndex"
      :active="active"
      :title="title"
      :subtitle="subtitle"
      :favorite="favorite"
      :on-select="() => emit('select')"
      :on-toggle-favorite="() => handleToggleFavorite()"
    >
      <div class="item-icon-wrapper">
        <slot
          name="item-icon"
          :item="entry.item"
          :group="entry.group"
          :category="entry.category"
          :active="active"
        >
          <UserOutlined :class="['item-icon', itemType === 'customer' ? 'customer-icon' : 'lead-icon']" />
        </slot>
      </div>

      <div class="item-content">
        <div class="item-title-row">
          <slot
            name="item-title"
            :item="entry.item"
            :group="entry.group"
            :category="entry.category"
            :title="title"
          >
            <span class="item-title">{{ title }}</span>
          </slot>

          <a-tag v-if="status" :color="status.color" class="status-tag rounded-xl! ml-2!">
            {{ status.name }}
          </a-tag>
        </div>

        <div class="item-details">
          <slot
            name="item-subtitle"
            :item="entry.item"
            :group="entry.group"
            :category="entry.category"
            :subtitle="subtitle"
          >
            <span v-if="phone"><PhoneOutlined /> {{ phone }}</span>
            <span v-if="email"><MailOutlined /> {{ email }}</span>
          </slot>
        </div>
      </div>

      <div class="item-actions">
        <slot
          name="item-actions"
          :item="entry.item"
          :group="entry.group"
          :category="entry.category"
          :favorite="favorite"
          :on-toggle-favorite="() => handleToggleFavorite()"
          :on-select="() => emit('select')"
        >
          <span
            v-if="showFavoriteToggle"
            class="star-wrapper is-animating"
            :title="favoriteActionTitle"
            @click.stop="handleToggleFavorite($event)"
          >
            <StarFilled v-if="favorite" class="star-filled" />
            <StarOutlined v-else class="star-outlined" />
          </span>
          <EnterOutlined v-if="active" class="enter-icon" />
        </slot>
      </div>
    </slot>
  </div>
</template>

<style scoped>
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

@keyframes pop {
  0% { transform: scale(1); }
  50% { transform: scale(1.3); }
  100% { transform: scale(1); }
}

.animate-pop {
  animation: pop 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
</style>
