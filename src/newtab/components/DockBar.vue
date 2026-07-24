<!--
  * @Description: Dock 栏组件，显示固定在底部栏的应用图标，支持拖拽排序
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { VueDraggable } from "vue-draggable-plus";
import { useI18n } from "vue-i18n";
import { useAppsStore } from "@/stores/apps";
import { useSettingsStore } from "@/stores/settings";
import type { AppItem } from "@/types";

const { t } = useI18n();

defineProps<{
  showGrid: boolean;
}>();

const emit = defineEmits<{
  (e: "toggle-grid"): void;
  (e: "open-notes"): void;
}>();

const appsStore = useAppsStore();
const settingsStore = useSettingsStore();

// 移动端检测
const isMobile = ref(false);

function checkIsMobile() {
  // 检测是否为触摸设备且屏幕宽度较小
  isMobile.value = ("ontouchstart" in window || navigator.maxTouchPoints > 0) && window.innerWidth < 768;
}

onMounted(() => {
  checkIsMobile();
  window.addEventListener("resize", checkIsMobile);
  // 监听方向变化
  window.addEventListener("orientationchange", checkIsMobile);
});

onUnmounted(() => {
  window.removeEventListener("resize", checkIsMobile);
  window.removeEventListener("orientationchange", checkIsMobile);
});

// 使用 ref 替代 computed，以便 VueDraggable 能正确工作
const sortedDockApps = ref<AppItem[]>([]);

// 监听 store 变化并更新 sortedDockApps
watch(
  () => appsStore.dockApps,
  newApps => {
    sortedDockApps.value = [...newApps];
  },
  { immediate: true, deep: true }
);

// 拖拽结束后更新顺序并持久化
async function onDragEnd() {
  try {
    await appsStore.reorderDockApps(sortedDockApps.value);
  } catch (error) {
    console.error("保存 dock 应用顺序失败:", error);
  }
}

function handleAppClick(url: string) {
  if (url === "#theme-toggle") {
    settingsStore.toggleTheme();
  } else if (url === "#notes") {
    emit("open-notes");
  } else {
    window.open(url, "_blank");
  }
}

// 判断是否使用默认图标颜色
function useDefaultIconColor(app: AppItem) {
  return !app.iconColor;
}

// 获取应用的 CSS 变量样式（用于自定义颜色）
function getAppCssVars(app: AppItem) {
  if (app.iconColor) {
    return { "--dock-icon-color": app.iconColor };
  }
  return undefined;
}
</script>

<template>
  <div class="dock-container" data-dock-bar>
    <div class="dock-bar glass-dock animate-slide-up-dock">
      <div class="dock-scrollable">
        <div class="dock-content">
          <!-- Toggle grid button -->
          <button class="dock-icon dock-icon-wrapper" @click.stop="emit('toggle-grid')">
            <Icon icon="ri:apps-2-line" class="dock-icon-size" :class="showGrid ? 'text-accent' : 'text-muted'" />
            <span class="dock-tooltip">{{ t("dock.apps") }}</span>
          </button>

          <!-- Dock apps with drag and drop (disabled on mobile) -->
          <VueDraggable
            v-model="sortedDockApps"
            :animation="150"
            :disabled="isMobile"
            class="dock-draggable-contents"
            @end="onDragEnd"
          >
            <button
              v-for="app in sortedDockApps"
              :key="app.id"
              class="dock-icon dock-icon-wrapper"
              :style="getAppCssVars(app)"
              @click.stop="handleAppClick(app.url)"
            >
              <Icon
                v-if="app.iconType === 'iconify'"
                :icon="app.icon"
                class="dock-icon-size"
                :class="{
                  'dock-icon-default-color': useDefaultIconColor(app),
                  'dock-icon-custom-color': !useDefaultIconColor(app),
                }"
              />
              <img
                v-else-if="app.iconType === 'url'"
                :src="app.icon"
                :alt="app.name"
                class="object-contain dock-icon-size"
              />
              <span
                v-else
                class="text-base font-semibold sm:text-lg"
                :class="{
                  'dock-icon-default-color': useDefaultIconColor(app),
                  'dock-icon-custom-color': !useDefaultIconColor(app),
                }"
              >
                {{ app.name.charAt(0) }}
              </span>
              <span class="dock-tooltip">{{ app.name }}</span>
            </button>
          </VueDraggable>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Dock 容器 - 响应式 */
.dock-container {
  position: absolute;
  bottom: calc(8px + env(safe-area-inset-bottom, 0px));
  left: 50%;
  transform: translateX(-50%);
  max-width: calc(100% - 16px);
  z-index: 20;
  overflow: visible;
  /* 为顶部 tooltip 预留足够空间 */
  padding-top: 50px;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-container {
    bottom: calc(6px + env(safe-area-inset-bottom, 0px));
    max-width: calc(100% - 12px);
    padding-top: 48px;
  }
}

@media (min-width: 640px) {
  .dock-container {
    bottom: 12px;
    max-width: calc(100% - 24px);
    padding-top: 52px;
  }
}

/* Dock 栏 - 使用伪元素作为背景 */
.dock-bar {
  position: relative;
  overflow: visible;
  /* dock-bar 本身只是一个容器，背景由伪元素提供 */
}

/* glass-dock 效果应用到伪元素 */
.dock-bar.glass-dock {
  background: transparent !important;
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
  border: none !important;
  box-shadow: none !important;
}

/* 背景伪元素 - 承载所有视觉效果，只覆盖实际可见的 dock 区域 */
.dock-bar.glass-dock::before {
  content: "";
  position: absolute;
  /* 调整位置以匹配实际的可见内容区域 */
  top: 50px;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 18px;
  background: var(--dock-bg);
  backdrop-filter: blur(30px);
  -webkit-backdrop-filter: blur(30px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  pointer-events: none;
  z-index: -1;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-bar.glass-dock::before {
    top: 48px;
    border-radius: 14px;
  }
}

@media (min-width: 640px) {
  .dock-bar.glass-dock::before {
    top: 52px;
    border-radius: 20px;
  }
}

/* 滚动容器 - 处理横向滚动 */
.dock-scrollable {
  overflow-x: auto;
  /* 关键：为 tooltip 预留顶部空间（tooltip 高度约 32px + 间距 12px） */
  padding: 58px 12px 8px 12px;
  /* 使用负 margin 向上移动，视觉上保持在原位 */
  margin: -50px 0 0 0;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE/Edge */
  scroll-behavior: smooth;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-scrollable {
    padding: 54px 10px 6px 10px;
    margin: -48px 0 0 0;
  }
}

@media (min-width: 640px) {
  .dock-scrollable {
    padding: 64px 16px 12px 16px;
    margin: -52px 0 0 0;
  }
}

.dock-scrollable::-webkit-scrollbar {
  display: none; /* Chrome/Safari */
}

/* 内容容器 - 包含所有图标 */
.dock-content {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: min-content;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-content {
    gap: 4px;
  }
}

@media (min-width: 640px) {
  .dock-content {
    gap: 8px;
  }
}

/* Draggable container */
.dock-draggable-contents {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-draggable-contents {
    gap: 4px;
  }
}

@media (min-width: 640px) {
  .dock-draggable-contents {
    gap: 8px;
  }
}

/* Dock 图标容器 - 用于 tooltip 定位 */
.dock-icon-wrapper {
  position: relative;
}

/* Dock 图标 - 响应式尺寸 */
.dock-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  background: rgb(var(--dropdown-bg));
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
  flex-shrink: 0;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }
}

@media (min-width: 640px) {
  .dock-icon {
    width: 52px;
    height: 52px;
    border-radius: 14px;
  }
}

.dock-icon:hover {
  transform: scale(1.08);
  box-shadow: var(--shadow-md);
}

.dock-icon:active {
  transform: scale(0.95);
}

/* 拖拽时的样式 */
.dock-icon.sortable-ghost {
  opacity: 0.5;
}

.dock-icon.sortable-drag {
  opacity: 0.8;
  cursor: grabbing;
}

/* 默认图标颜色 - 使用 CSS 变量适配主题 */
.dock-icon-default-color {
  color: rgb(var(--color-text-secondary));
}

/* 自定义图标颜色 - 使用组件级 CSS 变量 */
.dock-icon-custom-color {
  color: var(--dock-icon-color);
}

/* 图标尺寸 */
.dock-icon-size {
  width: 20px;
  height: 20px;
}

/* 小屏幕 (<400px) */
@media (max-width: 399px) {
  .dock-icon-size {
    width: 18px;
    height: 18px;
  }
}

@media (min-width: 640px) {
  .dock-icon-size {
    width: 24px;
    height: 24px;
  }
}

.text-accent {
  color: rgb(var(--color-dock-active));
}

.text-muted {
  color: rgb(var(--color-text-muted));
}

/* Tooltip 提示 */
.dock-tooltip {
  position: absolute;
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%) translateY(4px);
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.9);
  color: rgba(0, 0, 0, 0.85);
  font-size: 12px;
  white-space: nowrap;
  border-radius: 8px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease;
  z-index: 100;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.dock-icon-wrapper:hover .dock-tooltip {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}

/* 移动端触摸优化 */
@media (hover: none) and (pointer: coarse) {
  /* 移动设备上移除悬停效果，改用触摸反馈 */
  .dock-icon:hover {
    transform: none;
  }

  .dock-icon:active {
    transform: scale(0.92);
  }

  /* 移动端隐藏 tooltip（没有 hover 状态） */
  .dock-tooltip {
    display: none;
  }

  /* 移动端滚动优化 */
  .dock-scrollable {
    /* 增强触摸滚动体验 */
    -webkit-overflow-scrolling: touch;
    scroll-snap-type: x proximity;
    scroll-padding: 0 12px;
  }

  .dock-icon {
    /* 移动端禁用拖拽时的样式 */
    touch-action: pan-x;
    user-select: none;
    -webkit-user-select: none;
    -webkit-tap-highlight-color: transparent;
  }

  /* 移动端滚动时的视觉反馈 */
  .dock-content {
    /* 确保内容可以超出容器宽度以便滚动 */
    width: max-content;
  }
}

/* 横屏移动端优化 */
@media (max-height: 480px) and (orientation: landscape) {
  .dock-container {
    bottom: calc(4px + env(safe-area-inset-bottom, 0px));
  }

  .dock-bar {
    padding: 6px 10px;
  }

  .dock-icon {
    width: 36px;
    height: 36px;
    border-radius: 10px;
  }

  .dock-icon-size {
    width: 18px;
    height: 18px;
  }
}
</style>