<!--
  * @Description: Aurora Newtab 主应用组件
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed, watch, nextTick } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useAppsStore } from "@/stores/apps";
import { useWallpaperStore, getDynamicFallback } from "@/stores/wallpaper";
import { useNotesStore } from "@/stores/notes";
import TimeDisplay from "./components/TimeDisplay.vue";
import SearchBox from "./components/SearchBox.vue";
import DockBar from "./components/DockBar.vue";
import AppGrid from "./components/AppGrid.vue";
import SettingsMenu from "./components/SettingsMenu.vue";
import PoetryDisplay from "./components/PoetryDisplay.vue";
import GreetingToast from "./components/GreetingToast.vue";
import { defineAsyncComponent } from "vue";

// 懒加载大组件，减小初始包体积
const NotesDialog = defineAsyncComponent(() => import("./components/NotesDialog.vue"));
const PinnedNotes = defineAsyncComponent(() => import("./components/PinnedNotes.vue"));

const settingsStore = useSettingsStore();
const appsStore = useAppsStore();
const wallpaperStore = useWallpaperStore();
const notesStore = useNotesStore();

const showAppGrid = ref(false);
const isSearchFocused = ref(false);
const showNotesDialog = ref(false);

// 标记是否是初始加载
const isInitialLoad = ref(true);

// 壁纸加载状态 - 控制入场动画
const wallpaperReady = ref(false);

// 延迟的模糊状态 - 在视图切换动画期间保持稳定，避免亮度变化
const shouldBlurDelayed = ref(false);
let blurTimeout: ReturnType<typeof setTimeout> | null = null;

function handleSearchFocusChange(focused: boolean) {
  isSearchFocused.value = focused;
}

const defaultWallpaper = "/wallpaper/static/1.jpg";

// 视频壁纸加载错误状态
const videoError = ref(false);

// 壁纸 URL
const wallpaperUrl = computed(() => {
  // 如果是预设动态壁纸且视频加载失败，使用后备静态图
  if (wallpaperStore.settings.type === "dynamic" && videoError.value) {
    return getDynamicFallback(wallpaperStore.settings.dynamicIndex);
  }
  // 如果是本地视频且加载失败，使用默认壁纸
  if (wallpaperStore.isVideoWallpaper && videoError.value) {
    return defaultWallpaper;
  }
  return wallpaperStore.currentUrl || defaultWallpaper;
});

// 壁纸加载完成的处理
function onWallpaperLoad() {
  // 等待一帧后才开始显示动画，确保浏览器已完成渲染
  requestAnimationFrame(() => {
    wallpaperReady.value = true;
  });
}

// 视频加载错误处理
function onVideoError() {
  videoError.value = true;
  // 使用静态后备图
  wallpaperReady.value = true;
}

// 视频加载成功
function onVideoLoad() {
  videoError.value = false;
  wallpaperReady.value = true;
}

// 监听壁纸 URL 变化，重置加载状态以触发新的入场动画
watch(wallpaperUrl, () => {
  wallpaperReady.value = false;
  videoError.value = false;
});

// 显示壁纸加载指示器（仅在壁纸切换时显示，不在初始加载时显示）
const showWallpaperLoading = computed(() => {
  // 初始加载时不显示 loading（有 placeholder）
  if (isInitialLoad.value) return false;
  // 壁纸正在加载且还未准备好
  return (wallpaperStore.loading || !wallpaperReady.value) && !videoError.value;
});

// 监听视图切换，延迟更新模糊状态
watch(
  [showAppGrid, isSearchFocused],
  ([newShowAppGrid, newIsSearchFocused]) => {
    const shouldBlur = newShowAppGrid || newIsSearchFocused;

    // 清除之前的定时器
    if (blurTimeout) {
      clearTimeout(blurTimeout);
      blurTimeout = null;
    }

    if (shouldBlur) {
      // 需要模糊时立即应用（切换到网格视图或搜索聚焦）
      shouldBlurDelayed.value = true;
    } else {
      // 不需要模糊时立即移除，与应用列表消失动画同步
      shouldBlurDelayed.value = false;
    }
  },
  { immediate: true }
);

// 壁纸样式（用于 img/video 标签）
const wallpaperStyle = computed(() => {
  // 只在应用网格视图时应用模糊效果
  // 当 overlayBlur 关闭时，即使在应用列表视图中也不应用背景模糊
  const shouldApplyBlur = showAppGrid.value && wallpaperStore.settings.blur && settingsStore.settings.overlayBlur;
  const blurAmount = shouldApplyBlur ? wallpaperStore.settings.blurAmount || 10 : 0;
  const scale = shouldBlurDelayed.value ? 1.1 : 1;
  return {
    filter: `blur(${blurAmount}px)`,
    transform: `translate(-50%, -50%) scale(${scale})`,
  };
});

onMounted(async () => {
  // 初始化 stores（等待设置加载完成）
  await settingsStore.init();

  // 根据设置立即设置应用网格状态，避免动画切换
  // 使用 sessionStorage 确保在整个浏览器会话中只执行一次
  const AUTO_GRID_FLAG = "Aurora_auto_grid_executed";
  const hasAutoGrid = sessionStorage.getItem(AUTO_GRID_FLAG);

  if (!hasAutoGrid && settingsStore.settings.autoShowAppGrid) {
    showAppGrid.value = true;
    sessionStorage.setItem(AUTO_GRID_FLAG, "true");
  }

  appsStore.init();
  await wallpaperStore.init(); // 等待壁纸缓存检查完成
  notesStore.init();

  // 标记初始加载完成，允许后续的过渡动画
  await nextTick();
  isInitialLoad.value = false;
});

// 打开便笺弹窗
function openNotesDialog(noteId?: string) {
  if (noteId) {
    notesStore.selectNote(noteId);
  }
  showNotesDialog.value = true;
}

// 关闭便笺弹窗
function closeNotesDialog() {
  showNotesDialog.value = false;
}

onUnmounted(() => {
  // 清理定时器
  if (blurTimeout) {
    clearTimeout(blurTimeout);
    blurTimeout = null;
  }
});

function toggleAppGrid() {
  showAppGrid.value = !showAppGrid.value;
}

function closeAppGrid() {
  showAppGrid.value = false;
}

// 右键切换应用网格
function handleContextMenu(e: MouseEvent) {
  // 检查是否点击在交互元素上（按钮、链接、输入框等）
  const target = e.target as HTMLElement;
  const isInteractive = target.closest("button, a, input, [data-no-context]");

  if (!isInteractive) {
    e.preventDefault();
    toggleAppGrid();
  }
}

// 点击时间切换网格视图和正常视图
function handleTimeClick(e: MouseEvent) {
  e.stopPropagation();
  toggleAppGrid();
}

// 在应用网格视图中，点击空白区域关闭网格
function handleAppGridClick(e: MouseEvent) {
  const target = e.target as HTMLElement;

  // 首先检查是否是 Dock 栏区域，如果是则直接返回，不执行任何操作
  const isDockBar = target.closest("[data-dock-bar]");
  if (isDockBar) return;

  // 如果不在网格视图，直接返回
  if (!showAppGrid.value) return;

  // 排除的区域：
  // 1. 右上角的设置按钮区域（[data-settings-menu] 及其子元素）
  // 2. 应用网格的 item（.app-icon-card 及其子元素，已在 AppGrid 中阻止冒泡）
  // 3. 时间显示区域（在网格视图中点击时间不关闭）
  const excludedAreas = target.closest(
    "[data-settings-menu], [data-settings-menu] *, .app-icon-card, .app-icon-card *, [data-time-display], [data-time-display] *"
  );

  // 如果点击的不是排除区域，关闭应用网格
  if (!excludedAreas) {
    closeAppGrid();
  }
}
</script>

<template>
  <div
    class="relative w-full h-full overflow-hidden"
    :class="[
      `accent-${settingsStore.settings.accentColor}`,
      {
        'smooth-mode': settingsStore.settings.smoothMode,
        'reduce-motion': settingsStore.settings.reduceMotion,
      },
    ]"
    @contextmenu="handleContextMenu"
  >
    <!-- Initial background layer - 防止白屏闪烁 -->
    <div class="wallpaper-placeholder" />

    <!-- Background wallpaper layer with blur -->
    <div class="wallpaper-container" :class="{ 'wallpaper-visible': wallpaperReady }">
      <!-- 视频壁纸 -->
      <video
        v-if="wallpaperStore.isVideoWallpaper && !videoError"
        :src="wallpaperUrl"
        class="wallpaper-video wallpaper-transition"
        :style="wallpaperStyle"
        autoplay
        loop
        muted
        playsinline
        @loadeddata="onVideoLoad"
        @error="onVideoError"
      />
      <!-- 静态图片壁纸 -->
      <img
        v-else
        :src="wallpaperUrl"
        alt="wallpaper"
        class="wallpaper-img wallpaper-transition"
        :style="wallpaperStyle"
        @load="onWallpaperLoad"
      />
    </div>

    <!-- 壁纸加载 Loading 指示器 -->
    <Transition name="loading-fade">
      <div v-if="showWallpaperLoading" class="wallpaper-loading">
        <div class="loading-spinner" />
        <span class="loading-text">{{ wallpaperStore.isVideoWallpaper ? "动态壁纸加载中..." : "壁纸加载中..." }}</span>
      </div>
    </Transition>

    <!-- Gradient overlay -->
    <div
      class="gradient-overlay"
      :class="{
        'overlay-blur': showAppGrid && settingsStore.settings.overlayBlur,
        'vignette-effect': settingsStore.settings.wallpaperVignette,
      }"
    />

    <!-- Main content -->
    <div class="relative z-10 flex flex-col items-center w-full h-full" @click="handleAppGridClick">
      <!-- 主内容区域 - 垂直居中布局 -->
      <div class="main-content">
        <!-- Time display - 固定在内容顶部，不随视图切换移动 -->
        <div class="time-wrapper" data-time-display>
          <TimeDisplay @click="handleTimeClick" />
        </div>

        <!-- 内容切换区域 - 搜索框/一言和网格平滑切换 -->
        <div class="switch-container">
          <!-- 搜索框和一言 (normal view) - 添加消失动画 -->
          <Transition :name="isInitialLoad ? '' : 'view-switch'">
            <div v-if="!showAppGrid" key="search-view" class="view-panel search-panel">
              <div class="search-wrapper">
                <SearchBox @focus-change="handleSearchFocusChange" />
              </div>
              <!-- 一言 - 搜索框聚焦时显示 -->
              <Transition name="poetry-fade">
                <PoetryDisplay
                  v-if="isSearchFocused"
                  class="poetry-bottom"
                  :class="{ 'poetry-no-dock': !settingsStore.settings.showShortcutDock }"
                  data-poetry-area
                  @mousedown.prevent
                />
              </Transition>
            </div>
          </Transition>
          <!-- App Grid view - 淡入淡出动画 -->
          <Transition :name="isInitialLoad ? '' : 'grid-fade'">
            <div v-if="showAppGrid" key="grid-view" class="view-panel grid-panel">
              <AppGrid :key="`grid-${showAppGrid}`" @open-notes="openNotesDialog" />
            </div>
          </Transition>
        </div>
      </div>

      <!-- Settings button (top right) - only show in app grid mode -->
      <Transition :name="isInitialLoad ? '' : 'settings-slide'">
        <div v-if="showAppGrid" class="settings-container" data-settings-menu>
          <SettingsMenu />
        </div>
      </Transition>

      <!-- Dock bar (bottom) - 根据设置显示/隐藏 -->
      <Transition name="dock-slide">
        <DockBar
          v-if="settingsStore.settings.showShortcutDock"
          :show-grid="showAppGrid"
          @toggle-grid="toggleAppGrid"
          @open-notes="openNotesDialog"
        />
      </Transition>

      <!-- Pinned notes (top left) -->
      <PinnedNotes @open-notes="openNotesDialog" />
    </div>

    <!-- Greeting Toast - 根据设置显示问候 -->
    <GreetingToast v-if="settingsStore.settings.showGreeting" />

    <!-- Notes Dialog -->
    <NotesDialog v-if="showNotesDialog" @close="closeNotesDialog" />
  </div>
</template>

<style scoped>
/* 壁纸占位背景 - 防止白屏闪烁 */
.wallpaper-placeholder {
  position: absolute;
  inset: 0;
  z-index: 0;
  background: #1a1a1a; /* 深色背景，避免白色闪烁 */
}

/* 壁纸容器 - 用于实现平滑入场动画 */
.wallpaper-container {
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  transform: scale(1.08);
  transition: opacity 0.5s, transform 0.5s;
  will-change: opacity, transform;
}

/* 壁纸容器加载完成后的状态 */
.wallpaper-container.wallpaper-visible {
  opacity: 1;
  transform: scale(1);
}

/* 壁纸图片样式 */
.wallpaper-img {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
}

/* 视频壁纸样式 */
.wallpaper-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  object-fit: cover;
}

/* 壁纸加载指示器 */
.wallpaper-loading {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 100;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px 32px;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.loading-spinner {
  width: 36px;
  height: 36px;
  border: 3px solid rgba(255, 255, 255, 0.2);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  color: #fff;
  font-size: 14px;
  font-weight: 500;
  white-space: nowrap;
  opacity: 0.9;
}

/* Loading 淡入淡出动画 */
.loading-fade-enter-active,
.loading-fade-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.loading-fade-enter-from,
.loading-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

/* 渐变遮罩层 */
.gradient-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
}

/* 暗角滤镜效果 */
.gradient-overlay.vignette-effect {
  background-image: radial-gradient(#0000, #00000080), radial-gradient(#0000 33%, #0000004d 166%);
}

/* 遮罩层毛玻璃效果 */
.gradient-overlay.overlay-blur {
  backdrop-filter: blur(10px) saturate(1.2);
  -webkit-backdrop-filter: blur(10px) saturate(1.2);
}

/* 壁纸过渡 - 与视图切换同步 */
.wallpaper-transition {
  transition: filter 0.25s, opacity 1s, transform 0.25s;
  will-change: filter, transform;
}

/* 主内容区域 - 垂直居中 */
.main-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  padding: 100px 16px 100px;
  box-sizing: border-box;
}

@media (max-width: 640px) {
  .main-content {
    padding: 60px 12px 90px;
  }
}

@media (max-height: 700px) {
  .main-content {
    padding: 40px 16px 80px;
  }
}

/* 时间容器 - 固定在内容顶部，不移动 */
.time-wrapper {
  flex-shrink: 0;
  margin-bottom: 24px;
  z-index: 20;
}

@media (min-width: 640px) {
  .time-wrapper {
    margin-bottom: 32px;
  }
}

@media (max-height: 700px) {
  .time-wrapper {
    margin-bottom: 16px;
  }
}

/* 搜索框容器 */
.search-wrapper {
  width: 100%;
  max-width: 560px;
  flex-shrink: 0;
}

/* 切换容器 - 搜索框和网格共用 */
.switch-container {
  position: relative;
  width: 100%;
  max-width: 680px;
  flex: 1;
  min-height: 0;
}

/* 视图面板基础样式 - 绝对定位避免切换时位置偏移 */
.view-panel {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* 搜索面板 */
.search-panel {
  justify-content: flex-start;
  padding-top: 8px;
}

/* 一言位于底部 */
.poetry-bottom {
  margin-top: auto;
  margin-bottom: 80px;
  width: 100%;
  max-width: 600px;
  transition: margin-bottom 0.3s ease;
}

@media (min-width: 640px) {
  .poetry-bottom {
    margin-bottom: 100px;
  }
}

/* 当没有 Dock 时，一言的底部边距更小 */
.poetry-no-dock {
  margin-bottom: 40px !important;
}

@media (min-width: 640px) {
  .poetry-no-dock {
    margin-bottom: 50px !important;
  }
}

/* 网格面板 - 可滚动 */
.grid-panel {
  overflow-y: auto;
  overflow-x: hidden;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

.grid-panel::-webkit-scrollbar {
  display: none;
}

/* 设置按钮容器 */
.settings-container {
  position: absolute;
  z-index: 30;
  top: 16px;
  right: 16px;
}

@media (max-width: 640px) {
  .settings-container {
    top: 12px;
    right: 12px;
  }
}

/* 搜索框视图切换动画 */
.view-switch-enter-active {
  /* 进入时立即显示，避免与背景变化产生闪烁 */
  transition: none;
}

.view-switch-leave-active {
  transition: opacity 0.15s;
}

.view-switch-enter-from {
  /* 进入时不设置初始透明度，直接显示 */
  opacity: 1;
}

.view-switch-leave-to {
  opacity: 0;
}

/* 网格视图切换动画 - fade-in 效果 */
.grid-fade-enter-active {
  transition: opacity 0.25s ease-in;
}

.grid-fade-leave-active {
  transition: opacity 0.25s ease-out;
}

.grid-fade-enter-from,
.grid-fade-leave-to {
  opacity: 0;
}

/* 设置按钮动画 - 快速平滑 */
.settings-slide-enter-active {
  transition: opacity 0.15s ease-out, transform 0.15s ease-out;
}

.settings-slide-leave-active {
  transition: opacity 0.1s ease-in, transform 0.1s ease-in;
}

.settings-slide-enter-from {
  opacity: 0;
  transform: scale(0.9);
}

.settings-slide-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 一言淡入淡出动画 */
.poetry-fade-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.poetry-fade-leave-active {
  transition: opacity 0.25s ease-in, transform 0.25s ease-in;
}

.poetry-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.poetry-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

/* Dock 栏滑入滑出动画 */
.dock-slide-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s;
}

.dock-slide-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.dock-slide-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.dock-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* ================================
 * 流畅模式 - 禁用/减弱特效
 * ================================ */
.smooth-mode .wallpaper-transition,
.smooth-mode .gradient-overlay,
.smooth-mode .wallpaper-container {
  transition: none !important;
  animation: none !important;
}

.smooth-mode .wallpaper-container.wallpaper-visible {
  animation: none !important;
}

/* 流畅模式下减弱模糊效果 */
.smooth-mode .wallpaper-img,
.smooth-mode .gradient-overlay {
  backdrop-filter: none !important;
  -webkit-backdrop-filter: none !important;
}

/* ================================
 * 减弱动态效果 - 缩短动画时长
 * ================================ */
.reduce-motion *,
.reduce-motion *::before,
.reduce-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

.reduce-motion .view-switch-enter-active,
.reduce-motion .view-switch-leave-active,
.reduce-motion .grid-fade-enter-active,
.reduce-motion .grid-fade-leave-active,
.reduce-motion .settings-slide-enter-active,
.reduce-motion .settings-slide-leave-active,
.reduce-motion .poetry-fade-enter-active,
.reduce-motion .poetry-fade-leave-active,
.reduce-motion .dock-slide-enter-active,
.reduce-motion .dock-slide-leave-active {
  transition-duration: 0.05s !important;
}
</style>