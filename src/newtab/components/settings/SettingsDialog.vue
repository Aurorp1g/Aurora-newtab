<!--
  * @Description: 设置对话框基础组件，提供通用标题栏和滚动交互
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, computed } from "vue";
import { Icon } from "@iconify/vue";
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();

const props = withDefaults(
  defineProps<{
    title: string;
    showLargeTitle?: boolean;
    showSearch?: boolean;
    searchPlaceholder?: string;
  }>(),
  {
    showLargeTitle: true,
    showSearch: false,
    searchPlaceholder: "搜索设置",
  }
);

const emit = defineEmits<{
  (e: "close"): void;
}>();

const searchQuery = defineModel<string>("searchQuery", { default: "" });
const scrollContainer = ref<HTMLElement | null>(null);
const scrollTop = ref(0);

// Calculate opacity based on scroll position
const titleFadeThreshold = 60;
const largeTitleOpacity = computed(() => {
  if (!props.showLargeTitle) return 0;
  return Math.max(0, 1 - scrollTop.value / titleFadeThreshold);
});
const headerTitleOpacity = computed(() => {
  if (!props.showLargeTitle) return 1;
  return Math.min(1, scrollTop.value / titleFadeThreshold);
});

function handleScroll(e: Event) {
  const target = e.target as HTMLElement;
  scrollTop.value = target.scrollTop;
}

// 固定宽度和高度
const dialogSize = "sm:w-[600px] sm:h-[500px]";

// 点击背景时关闭弹窗（事件已阻止冒泡）
function handleBackdropClick(e: MouseEvent) {
  // 只有点击背景本身（不是弹窗卡片）才关闭
  if (e.target === e.currentTarget) {
    emit("close");
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center dialog-backdrop dialog-perspective"
    @click.stop="handleBackdropClick"
  >
    <div
      :class="[
        'relative w-full h-full shadow-2xl dialog-bg sm:rounded-2xl overflow-hidden flex flex-col dialog-card',
        dialogSize,
        { 'no-tilt': settingsStore.settings.reduceMotion },
      ]"
      @click.stop
    >
      <!-- Fixed Header -->
      <div class="relative flex items-center justify-center h-12 px-5 border-b shrink-0 border-color">
        <!-- Centered title (fades in on scroll) -->
        <h2
          class="text-sm font-semibold transition-opacity duration-200 text-primary"
          :style="{ opacity: headerTitleOpacity }"
        >
          {{ title }}
        </h2>
        <!-- Close trigger zone -->
        <div
          class="absolute top-0 right-0 flex items-center justify-end w-24 h-12 pr-3 close-trigger-zone"
          @click="emit('close')"
        >
          <div class="flex items-center justify-center rounded-full close-button w-9 h-9 text-muted">
            <Icon icon="ri:close-line" class="w-5 h-5" />
          </div>
        </div>
      </div>

      <!-- Scrollable Content -->
      <div ref="scrollContainer" class="flex-1 min-h-0 px-5 py-4 overflow-y-auto dialog-content" @scroll="handleScroll">
        <!-- Large title (fades out on scroll) -->
        <h1
          v-if="showLargeTitle"
          class="mb-4 text-xl font-bold transition-opacity duration-200 text-primary"
          :style="{ opacity: largeTitleOpacity }"
        >
          {{ title }}
        </h1>

        <!-- Search Input -->
        <div v-if="showSearch" class="mb-4">
          <input
            v-model="searchQuery"
            type="text"
            :placeholder="searchPlaceholder"
            class="w-full px-3 py-2 text-sm rounded-lg search-input text-secondary placeholder:text-muted focus:outline-none"
          />
        </div>

        <!-- Content Slot -->
        <div class="dialog-content-inner">
          <slot />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 3D Perspective Container */
.dialog-perspective {
  perspective: 1200px;
}

/* 背景遮罩动画 */
.dialog-backdrop {
  background-color: rgba(0, 0, 0, 0.4);
  animation: backdrop-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes backdrop-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 弹窗卡片动画 */
.dialog-card {
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: dialog-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  /* GPU 加速 */
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

/* When close trigger zone is hovered, tilt the entire card */
.dialog-card:has(.close-trigger-zone:hover) {
  transform: rotateX(4deg) rotateY(4deg);
}

/* 减弱动态效果时禁用倾斜 */
.dialog-card.no-tilt:has(.close-trigger-zone:hover) {
  transform: none !important;
}

/* Close trigger zone */
.close-trigger-zone {
  cursor: pointer;
}

/* 内容区域淡入动画 */
.dialog-content {
  animation: content-fade-in 0.4s 0.1s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.dialog-content-inner {
  animation: content-slide-in 0.45s 0.15s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes content-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes content-slide-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dialog-bg {
  background: rgb(var(--dialog-bg));
}

.text-primary {
  color: rgb(var(--color-text));
}

.text-secondary {
  color: rgb(var(--color-text-secondary));
}

.text-muted {
  color: rgb(var(--color-text-muted));
}

.border-color {
  border-color: rgb(var(--color-border) / 0.3);
}

/* Close button */
.close-button {
  background-color: rgb(var(--color-border) / 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.close-trigger-zone:hover .close-button {
  background-color: rgb(var(--color-border) / 0.35);
  transform: rotate(-15deg);
  color: rgb(var(--color-text-secondary));
}

.close-trigger-zone:active .close-button {
  background-color: rgb(var(--color-border) / 0.45);
  transform: rotate(-15deg) scale(0.9);
}

.search-input {
  background-color: rgba(0, 0, 0, 0.05);
  border: 1.5px solid transparent;
  transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

.search-input:focus {
  background-color: rgb(var(--dialog-item-bg));
  border-color: rgb(var(--color-accent));
  box-shadow: 0 0 0 3px rgb(var(--color-accent) / 0.1);
}

/* Custom scrollbar */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: transparent;
  margin: 8px 0;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-border) / 0.4);
  border-radius: 10px;
  transition: background-color 0.2s ease;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-border) / 0.7);
}

/* Mobile Responsive Styles */
@media (max-width: 639px) {
  .dialog-card {
    border-radius: 0;
  }

  /* 移动端从底部滑入 */
  @keyframes dialog-enter {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .dialog-card {
    animation: dialog-enter 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  }

  .dialog-card:has(.close-trigger-zone:hover) {
    transform: none;
  }

  .close-trigger-zone {
    width: 4rem;
    padding-right: 0.75rem;
  }

  .close-button {
    width: 2.5rem;
    height: 2.5rem;
  }

  .close-button svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>