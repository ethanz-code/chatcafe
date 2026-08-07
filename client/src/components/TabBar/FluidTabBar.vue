<template>
  <nav
    class="fluid-tab-bar"
    :style="{ '--tab-count': Math.max(tabs.length, 1), '--active-index': activeIndex }"
    aria-label="主导航"
  >
    <span class="fluid-tab-bar__track" aria-hidden="true"></span>
    <span v-if="hasActiveTab" class="fluid-tab-bar__bubble" aria-hidden="true"></span>
    <button
      v-for="tab in tabs"
      :key="tab.path"
      class="fluid-tab-bar__item"
      :class="{ 'fluid-tab-bar__item--active': hasActiveTab && tab.path === activePath }"
      type="button"
      :aria-label="tabAriaLabel(tab)"
      :aria-current="hasActiveTab && tab.path === activePath ? 'page' : undefined"
      @click="$emit('navigate', tab.path)"
    >
      <span class="fluid-tab-bar__disc">
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

const badgeValue = (path) => props.badge[path]

const activeIndex = computed(() => {
  return props.tabs.findIndex((tab) => tab.path === props.activePath)
})

const hasActiveTab = computed(() => activeIndex.value >= 0)

const tabAriaLabel = (tab) => {
  const value = badgeValue(tab.path)
  return value ? `${tab.label}，${value}积分` : tab.label
}
</script>

<style scoped>
.fluid-tab-bar {
  position: relative;
  z-index: 100;
  display: grid;
  width: 100%;
  box-sizing: border-box;
  height: calc(var(--app-tab-bar-height) + var(--app-safe-bottom));
  padding: 0 0 var(--app-safe-bottom);
  align-items: stretch;
  grid-template-columns: repeat(var(--tab-count), minmax(0, 1fr));
  background: #fff;
  overflow: visible;
}

/* 顶部贯穿平滑细线 */
.fluid-tab-bar__track {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(28, 32, 46, 0.08);
  pointer-events: none;
}

/* 白色流体气泡：跟随激活项平滑滑动 + 放大上浮，与底栏白底融为一体 */
.fluid-tab-bar__bubble {
  position: absolute;
  inset-block: 0;
  left: 0;
  width: calc(100% / var(--tab-count));
  opacity: 1;
  pointer-events: none;
  transform: translateX(calc(var(--active-index) * 100%));
  transition:
    transform 300ms cubic-bezier(0.34, 1.3, 0.64, 1),
    opacity 200ms ease;
}

.fluid-tab-bar__bubble::before {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  transform: translate(-50%, -50%) translateY(-12px) scale(1.28);
  content: '';
}

.fluid-tab-bar__item {
  position: relative;
  z-index: 2;
  display: flex;
  min-width: 0;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0;
  background: transparent;
  color: #9197a3;
  font: inherit;
  line-height: 1;
  transition: color 200ms ease;
}

.fluid-tab-bar__disc {
  position: relative;
  display: grid;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  place-items: center;
  background: #fff;
  transition: transform 300ms cubic-bezier(0.34, 1.3, 0.64, 1);
}

.fluid-tab-bar__label {
  position: absolute;
  right: 4px;
  bottom: 3px;
  left: 4px;
  overflow: hidden;
  color: currentColor;
  font-size: 11px;
  font-weight: 500;
  line-height: 14px;
  text-align: center;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.fluid-tab-bar__item:hover:not(.fluid-tab-bar__item--active) {
  color: #414650;
}

.fluid-tab-bar__item:focus-visible {
  outline: 2px solid #c7433d;
  outline-offset: 2px;
  border-radius: 12px;
}

.fluid-tab-bar__icon {
  font-size: 27px;
  line-height: 27px;
}

.fluid-tab-bar__item--active {
  color: #c7433d;
}

.fluid-tab-bar__item--active .fluid-tab-bar__disc {
  transform: translateY(-14px) scale(1.35);
}

.fluid-tab-bar__item--active .fluid-tab-bar__icon {
  color: #ff6034;
}

.fluid-tab-bar__item--active .fluid-tab-bar__label {
  font-weight: 600;
}

.fluid-tab-bar__item--active .fluid-tab-bar__badge {
  border-color: #fff;
  background: #fff;
  color: #c7433d;
}

.fluid-tab-bar__badge {
  position: absolute;
  top: -2px;
  right: -3px;
  min-width: 15px;
  height: 15px;
  padding: 0 4px;
  border: 1.5px solid #fff;
  border-radius: 8px;
  background: #c7433d;
  color: #fff;
  font-size: 9px;
  font-weight: 600;
  line-height: 12px;
  text-align: center;
}

@media (prefers-reduced-motion: reduce) {
  .fluid-tab-bar__bubble,
  .fluid-tab-bar__disc {
    transition: none;
  }
}
</style>
