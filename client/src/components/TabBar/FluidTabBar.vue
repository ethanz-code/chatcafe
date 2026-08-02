<template>
  <nav
    class="fluid-tab-bar"
    :style="{ '--active-index': activeIndex }"
    aria-label="主导航"
  >
    <span v-if="activeIndex >= 0" class="fluid-tab-bar__indicator" aria-hidden="true"></span>
    <button
      v-for="tab in tabs"
      :key="tab.path"
      class="fluid-tab-bar__item"
      :class="{ 'fluid-tab-bar__item--active': tab.path === activePath }"
      type="button"
      :aria-label="tabAriaLabel(tab)"
      :aria-current="tab.path === activePath ? 'page' : undefined"
      @click="$emit('navigate', tab.path)"
    >
      <span class="fluid-tab-bar__icon-wrap">
        <i
          class="iconfont-ydai fluid-tab-bar__icon"
          :class="`iconfont-ydai-${tab.icon}`"
          aria-hidden="true"
        ></i>
        <span v-if="badgeValue(tab.path)" class="fluid-tab-bar__badge" aria-hidden="true">
          {{ badgeValue(tab.path) }}
        </span>
      </span>
      <span class="fluid-tab-bar__label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  tabs: {
    type: Array,
    required: true,
  },
  activePath: {
    type: String,
    required: true,
  },
  badge: {
    type: Object,
    default: () => ({}),
  },
})

defineEmits(['navigate'])

const activeIndex = computed(() => props.tabs.findIndex((tab) => tab.path === props.activePath))

const badgeValue = (path) => props.badge[path]

const tabAriaLabel = (tab) => {
  const value = badgeValue(tab.path)
  return value ? `${tab.label}，${value}积分` : tab.label
}
</script>

<style scoped>
.fluid-tab-bar {
  --tab-height: 50px;
  position: fixed;
  z-index: 100;
  bottom: 0;
  left: 50%;
  display: grid;
  width: min(100%, var(--app-content-width));
  max-width: var(--app-content-width);
  height: var(--tab-height);
  grid-template-columns: repeat(3, minmax(0, 1fr));
  transform: translateX(-50%);
  border-top: 1px solid rgba(20, 24, 35, 0.1);
  background: rgba(255, 255, 255, 0.97);
}

.fluid-tab-bar__indicator {
  position: absolute;
  z-index: 0;
  top: 4px;
  left: 0;
  width: calc(100% / 3);
  height: 42px;
  border-radius: 8px;
  background: rgba(255, 110, 101, 0.11);
  transform: translateX(calc(var(--active-index) * 100%));
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.fluid-tab-bar__item {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  height: var(--tab-height);
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border: 0;
  background: transparent;
  color: #8a8f99;
  font: inherit;
  font-size: 11px;
  line-height: 16px;
  transition: color 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.fluid-tab-bar__item:focus-visible {
  outline: 2px solid #ff6e65;
  outline-offset: -3px;
}

.fluid-tab-bar__icon-wrap {
  position: relative;
  display: grid;
  width: 22px;
  height: 22px;
  place-items: center;
  transform: scale(0.9);
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.fluid-tab-bar__icon {
  font-size: 22px;
  line-height: 22px;
}

.fluid-tab-bar__label {
  overflow: hidden;
  max-width: 100%;
  text-overflow: ellipsis;
  white-space: nowrap;
  transform: scale(0.94);
  transition: transform 260ms cubic-bezier(0.22, 0.61, 0.36, 1);
}

.fluid-tab-bar__item--active {
  color: #ff6e65;
}

.fluid-tab-bar__item--active .fluid-tab-bar__icon-wrap {
  transform: translateY(-3px) scale(1.05);
}

.fluid-tab-bar__item--active .fluid-tab-bar__label {
  transform: translateY(-2px) scale(1);
}

.fluid-tab-bar__badge {
  position: absolute;
  top: -4px;
  left: 16px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border: 1px solid #fff;
  border-radius: 7px;
  background: #ee4d4d;
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .fluid-tab-bar__indicator,
  .fluid-tab-bar__item,
  .fluid-tab-bar__icon-wrap,
  .fluid-tab-bar__label {
    transition: none;
  }
}
</style>
