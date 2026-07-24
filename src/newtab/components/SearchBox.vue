<!--
  * @Description: 搜索框组件，支持多搜索引擎切换、搜索历史记录
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useSearchStore } from "@/stores/search";
import { useSettingsStore } from "@/stores/settings";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "focus-change", isFocused: boolean): void;
}>();

const searchStore = useSearchStore();
const settingsStore = useSettingsStore();

const query = ref("");
const isFocused = ref(false);
const isHovered = ref(false);
const showEngineDropdown = ref(false);
const searchHistory = ref<string[]>([]);
const inputRef = ref<HTMLInputElement | null>(null);
const containerRef = ref<HTMLDivElement | null>(null);
const lastUsedEngineId = ref<string | null>(null);

const SEARCH_HISTORY_KEY = "Aurora_search_history";
const MAX_HISTORY_ITEMS = 10;

// 当有输入内容时隐藏 placeholder
const showPlaceholder = computed(() => !query.value && !isFocused.value);

// 显示搜索历史下拉框条件：聚焦且有历史记录且启用了搜索历史功能
const showHistoryDropdown = computed(
  () => isFocused.value && searchHistory.value.length > 0 && settingsStore.settings.searchHistory
);

// 加载搜索历史
function loadHistory() {
  try {
    const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
    if (stored) {
      searchHistory.value = JSON.parse(stored);
    }
  } catch {
    searchHistory.value = [];
  }
}

// 保存搜索历史
function saveHistory(searchQuery: string) {
  // 如果未启用搜索历史功能，则不保存
  if (!settingsStore.settings.searchHistory) return;

  const trimmed = searchQuery.trim();
  if (!trimmed) return;

  // 移除重复项
  const filtered = searchHistory.value.filter(item => item !== trimmed);
  // 添加到开头
  filtered.unshift(trimmed);
  // 限制数量
  searchHistory.value = filtered.slice(0, MAX_HISTORY_ITEMS);

  try {
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(searchHistory.value));
  } catch {
    // ignore storage errors
  }
}

// 清除所有历史记录
function clearHistory() {
  searchHistory.value = [];
  try {
    localStorage.removeItem(SEARCH_HISTORY_KEY);
  } catch {
    // ignore storage errors
  }
}

function handleSearch() {
  if (query.value.trim()) {
    const searchQuery = query.value;
    saveHistory(searchQuery);
    searchStore.search(searchQuery);

    // 根据设置决定是否清空搜索框
    if (settingsStore.settings.autoClearSearchBar) {
      // 延迟清空，确保搜索操作完成
      setTimeout(() => {
        query.value = "";
      }, 100);
    }
  }
}

function selectHistoryItem(item: string) {
  query.value = item;
  handleSearch();
}

function selectEngine(engineId: string) {
  // 保存当前引擎作为最近使用的引擎
  lastUsedEngineId.value = searchStore.currentEngine.id;
  searchStore.setEngine(engineId);
  showEngineDropdown.value = false;
}

function toggleEngineDropdown(event: MouseEvent) {
  event.stopPropagation();
  showEngineDropdown.value = !showEngineDropdown.value;
}

function closeDropdown() {
  showEngineDropdown.value = false;
}

function handleFocus() {
  isFocused.value = true;
  emit("focus-change", true);
}

function handleBlur() {
  // 延迟关闭，以便点击下拉项能正常工作
  setTimeout(() => {
    isFocused.value = false;
    query.value = ""; // 退出聚焦时清空输入框
    emit("focus-change", false);
  }, 150);
}

// 处理 Tab / Shift+Tab 键
function handleTabKey(event: KeyboardEvent) {
  const behavior = settingsStore.settings.tabSwitchBehavior;

  // 如果是 nextControl，使用默认行为
  if (behavior === "nextControl") {
    return;
  }

  // 阻止默认的 Tab 行为
  event.preventDefault();

  if (behavior === "searchEngine") {
    // 切换到下一个/上一个搜索引擎
    const engines = searchStore.engines;
    const currentIndex = engines.findIndex(e => e.id === searchStore.currentEngine.id);

    let nextIndex: number;
    if (event.shiftKey) {
      // Shift+Tab: 上一个引擎
      nextIndex = currentIndex > 0 ? currentIndex - 1 : engines.length - 1;
    } else {
      // Tab: 下一个引擎
      nextIndex = currentIndex < engines.length - 1 ? currentIndex + 1 : 0;
    }

    selectEngine(engines[nextIndex].id);
  } else if (behavior === "recentEngine") {
    // 切换到最近使用的搜索引擎
    if (lastUsedEngineId.value && lastUsedEngineId.value !== searchStore.currentEngine.id) {
      // 在当前引擎和最近使用的引擎之间切换
      selectEngine(lastUsedEngineId.value);
    } else {
      // 如果没有最近使用的引擎，切换到下一个
      const engines = searchStore.engines;
      const currentIndex = engines.findIndex(e => e.id === searchStore.currentEngine.id);
      const nextIndex = currentIndex < engines.length - 1 ? currentIndex + 1 : 0;
      selectEngine(engines[nextIndex].id);
    }
  } else if (behavior === "searchSuggestion") {
    // 搜索建议模式：如果有搜索历史，在历史记录中导航
    if (searchHistory.value.length > 0) {
      // 如果当前查询为空或不在历史记录中，填充第一个历史记录
      const currentQuery = query.value.trim();
      const currentIndex = searchHistory.value.indexOf(currentQuery);

      if (event.shiftKey) {
        // Shift+Tab: 上一个建议
        if (currentIndex > 0) {
          query.value = searchHistory.value[currentIndex - 1];
        } else if (currentIndex === 0) {
          query.value = ""; // 回到空输入
        } else {
          query.value = searchHistory.value[searchHistory.value.length - 1];
        }
      } else {
        // Tab: 下一个建议
        if (currentIndex === -1 || currentIndex === searchHistory.value.length - 1) {
          query.value = searchHistory.value[0];
        } else {
          query.value = searchHistory.value[currentIndex + 1];
        }
      }
    }
  }
}

// 点击外部关闭
function handleClickOutside(event: MouseEvent) {
  if (containerRef.value && !containerRef.value.contains(event.target as Node)) {
    // 检查是否点击在一言区域内，如果是则不关闭聚焦状态
    const target = event.target as HTMLElement;
    const isPoetryArea = target.closest("[data-poetry-area]");
    if (isPoetryArea) {
      return; // 点击一言区域时不关闭聚焦状态
    }

    isFocused.value = false;
    showEngineDropdown.value = false;
    query.value = ""; // 退出聚焦时清空输入框
    emit("focus-change", false);
  }
}

// 监听聚焦状态变化
watch(isFocused, focused => {
  if (focused) {
    showEngineDropdown.value = false;
  }
});

// 监听搜索历史设置变化
watch(
  () => settingsStore.settings.searchHistory,
  enabled => {
    if (!enabled) {
      // 如果禁用了搜索历史，清除历史记录
      clearHistory();
    }
  }
);

onMounted(() => {
  loadHistory();
  document.addEventListener("click", handleClickOutside);

  // 根据设置自动聚焦搜索框
  // 使用 sessionStorage 确保在整个浏览器会话中只执行一次
  // 如果同时开启了自动显示应用网格，则不自动聚焦（因为搜索框会被隐藏）
  const AUTO_FOCUS_FLAG = "Aurora_auto_focus_executed";
  const hasAutoFocused = sessionStorage.getItem(AUTO_FOCUS_FLAG);

  if (!hasAutoFocused && settingsStore.settings.autoFocusSearch && !settingsStore.settings.autoShowAppGrid) {
    // 延迟确保设置已加载且 DOM 已渲染
    setTimeout(() => {
      inputRef.value?.focus();
      // 标记已执行，后续不再自动聚焦
      sessionStorage.setItem(AUTO_FOCUS_FLAG, "true");
    }, 600);
  }
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<template>
  <div ref="containerRef" class="search-box-container">
    <div
      class="search-box"
      :class="{
        'search-box-focused': isFocused,
        'search-box-hovered': isHovered && !isFocused,
        'search-box-shrink': settingsStore.settings.searchBoxAnimation,
      }"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <!-- Search engine selector - 仅聚焦时显示 -->
      <Transition name="fade">
        <button v-if="isFocused" class="search-engine-btn" @mousedown.prevent @click="toggleEngineDropdown">
          <Icon :icon="searchStore.currentEngine.icon" class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </Transition>

      <!-- Search input -->
      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-input"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown.enter="handleSearch"
        @keydown.tab="handleTabKey"
      />

      <!-- 默认状态下显示"搜索"占位符 -->
      <Transition name="placeholder-fade">
        <div v-if="showPlaceholder" class="search-placeholder" @click="inputRef?.focus()">
          {{ t("search.placeholder") }}
        </div>
      </Transition>

      <!-- Search button - 仅聚焦时显示 -->
      <Transition name="fade">
        <button v-if="isFocused" class="search-btn" @mousedown.prevent @click="handleSearch">
          <Icon icon="ri:search-line" class="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
      </Transition>
    </div>

    <!-- Search engine dropdown -->
    <Transition name="dropdown">
      <div v-if="showEngineDropdown" class="search-dropdown" @mousedown.prevent @mouseleave="closeDropdown">
        <button
          v-for="engine in searchStore.engines"
          :key="engine.id"
          class="dropdown-item"
          :class="{ 'dropdown-item-active': engine.id === searchStore.currentEngine.id }"
          @click="selectEngine(engine.id)"
        >
          <Icon :icon="engine.icon" class="flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5" />
          <span>{{ engine.name }}</span>
          <Icon
            v-if="engine.id === searchStore.currentEngine.id"
            icon="ri:check-line"
            class="w-4 h-4 ml-auto check-icon"
          />
        </button>
      </div>
    </Transition>

    <!-- Search history dropdown -->
    <Transition name="history-dropdown">
      <div v-if="showHistoryDropdown" class="history-dropdown" @mousedown.prevent>
        <button v-for="item in searchHistory" :key="item" class="history-item" @click="selectHistoryItem(item)">
          <span class="history-text">{{ item }}</span>
        </button>
        <!-- 清除历史记录作为列表项 -->
        <button class="history-item clear-history-item" @click="clearHistory">
          <Icon icon="ri:delete-bin-line" class="w-3.5 h-3.5 opacity-60" />
          <span class="history-text">{{ t("search.clearHistory") }}</span>
        </button>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
/* 搜索框容器 - 响应式 */
.search-box-container {
  position: relative;
  width: 100%;
  max-width: 560px;
}

/* 搜索框 - 默认状态：半透明白色背景，提亮效果 */
.search-box {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 43px;
  width: 100%;
  border-radius: 9999px;
  background-color: var(--search-bg-default);
  backdrop-filter: blur(10px) saturate(1.5);
  -webkit-backdrop-filter: blur(10px) saturate(1.5);
  border: none;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: var(--search-shadow-hover) 0 0 10px;
}

/* 伸缩动效 - 默认状态缩小 */
.search-box-shrink {
  width: 230px;
  margin: 0 auto;
}

/* 小屏幕适配 */
@media (max-width: 480px) {
  .search-box-shrink {
    width: 180px;
  }
}

/* 伸缩动效 - Hover 和聚焦时展开 */
.search-box-shrink.search-box-hovered,
.search-box-shrink.search-box-focused {
  width: 100%;
}

/* Hover 状态 */
.search-box-hovered {
  background-color: var(--search-bg-hover);
  box-shadow: var(--search-shadow-default) 0 0 10px;
}

.search-box-hovered .search-input {
  color: var(--search-text-hover);
}

/* 聚焦状态 */
.search-box-focused {
  background-color: var(--search-bg-focus);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

.search-box-focused .search-input {
  color: var(--search-text-focus);
  text-align: center;
}

/* 搜索引擎按钮 */
.search-engine-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 44px;
  color: var(--search-engine-icon);
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.search-engine-btn:hover {
  opacity: 0.8;
}

@media (min-width: 640px) {
  .search-engine-btn {
    width: 56px;
  }
}

/* 搜索输入框 */
.search-input {
  flex: 1;
  height: 100%;
  padding: 0 20px;
  background: transparent;
  border: none;
  outline: none;
  font-size: 14px;
  font-family: inherit;
  color: var(--search-text-default);
  text-align: center;
  width: 100%;
}

.search-box-focused .search-input {
  padding: 0 8px;
}

@media (min-width: 640px) {
  .search-input {
    font-size: 15px;
  }
}

/* 默认占位符 "搜索" */
.search-placeholder {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  color: var(--search-text-default);
  font-size: 14px;
  pointer-events: none;
  user-select: none;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  transition: color 0.25s ease;
}

.search-box-hovered .search-placeholder {
  color: var(--search-placeholder-hover);
}

@media (min-width: 640px) {
  .search-placeholder {
    font-size: 15px;
  }
}

/* 搜索按钮 */
.search-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 44px;
  color: var(--search-btn-icon);
  transition: opacity 0.15s ease;
  flex-shrink: 0;
}

.search-btn:hover {
  opacity: 0.8;
}

@media (min-width: 640px) {
  .search-btn {
    width: 56px;
  }
}

/* 搜索引擎下拉菜单 */
.search-dropdown {
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 50;
  width: 160px;
  margin-top: 8px;
  overflow: hidden;
  border-radius: 16px;
  background: var(--search-bg-focus);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

@media (min-width: 640px) {
  .search-dropdown {
    width: 192px;
  }
}

.dropdown-item {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  padding: 10px 14px;
  font-size: 13px;
  text-align: left;
  color: var(--search-text-focus);
  transition: background-color 0.15s ease;
}

.dropdown-item:hover {
  background-color: var(--search-history-item-hover);
}

.dropdown-item-active {
  background-color: var(--search-history-item-hover);
}

.check-icon {
  color: rgb(var(--color-accent));
}

@media (min-width: 640px) {
  .dropdown-item {
    gap: 12px;
    padding: 12px 16px;
    font-size: 14px;
  }
}

/* 搜索历史下拉菜单 - 毛玻璃效果 */
.history-dropdown {
  --main-backdrop-filter: blur(30px) saturate(1.25);
  --white-alpha-10: rgba(255, 255, 255, 0.1);

  position: absolute;
  left: 0;
  right: 0;
  top: 100%;
  z-index: 40;
  width: 100%;
  margin-top: 8px;
  overflow-y: hidden;
  border-radius: 15px;
  padding: 5px;
  background-color: var(--white-alpha-10);
  backdrop-filter: var(--main-backdrop-filter);
  -webkit-backdrop-filter: var(--main-backdrop-filter);
  transition: top 0.25s, width 0.25s;
  font-size: small;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  text-align: left;
  color: white;
  border-radius: 10px;
  transition: background-color 0.15s ease;
}

.history-item:hover {
  background-color: #ffffff1a;
}

.history-text {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 清除历史记录项 */
.clear-history-item {
  margin-top: 2px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding-top: 10px;
  border-radius: 0 0 10px 10px;
}

.clear-history-item:hover {
  background-color: #ffffff1a;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 下拉动画 */
.dropdown-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-8px);
}

/* 历史下拉动画 - 与图标动画保持一致 */
.history-dropdown-enter-active,
.history-dropdown-leave-active {
  transition: opacity 0.2s ease;
}

.history-dropdown-enter-from,
.history-dropdown-leave-to {
  opacity: 0;
}

/* 搜索占位符动画 */
.placeholder-fade-enter-active {
  transition: opacity 0.3s ease-out, transform 0.3s ease-out;
}

.placeholder-fade-leave-active {
  transition: opacity 0.2s ease-in, transform 0.2s ease-in;
}

.placeholder-fade-enter-from {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.9);
}

.placeholder-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, -50%) scale(1.05);
}
</style>