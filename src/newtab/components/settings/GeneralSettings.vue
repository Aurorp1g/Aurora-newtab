<!--
  * @Description: 通用设置面板，包含主题、语言、时间、启动项等设置
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import { useAppsStore } from "@/stores/apps";
import type { ThemeMode } from "@/types";
import SettingsDialog from "./SettingsDialog.vue";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const settingsStore = useSettingsStore();
const appsStore = useAppsStore();
const searchQuery = ref("");
const showResetConfirm = ref(false);
const showExtensionHint = ref(false); // 扩展控制提示弹窗

// 主题色选项
const accentColorOptions: { value: "green" | "cyan" | "purple" | "red" | "blue"; color: string }[] = [
  { value: "green", color: "#4ade80" },
  { value: "cyan", color: "#60d4f8" },
  { value: "purple", color: "#a78bfa" },
  { value: "red", color: "#f87171" },
  { value: "blue", color: "#3578F7" },
];

// 切换主题色
function selectAccentColor(value: "green" | "cyan" | "purple" | "red" | "blue") {
  settingsStore.updateSettings({ accentColor: value });
}

// 深色主题下拉选项
const darkModeOptions = computed(() => [
  { value: "system", label: t("generalSettings.darkModeSystem") },
  { value: "dark", label: t("generalSettings.darkModeOn") },
  { value: "light", label: t("generalSettings.darkModeOff") },
]);

// 深色主题下拉状态
const showDarkModeDropdown = ref(false);
const darkModeDropdownButton = ref<HTMLDivElement>();

function toggleDarkModeDropdown() {
  showDarkModeDropdown.value = !showDarkModeDropdown.value;
}

function selectDarkMode(value: string) {
  settingsStore.setTheme(value as ThemeMode);
  showDarkModeDropdown.value = false;
}

function handleDarkModeClickOutside(event: MouseEvent) {
  const el = darkModeDropdownButton.value;
  if (el && event.target instanceof Node && typeof el.contains === "function" && !el.contains(event.target)) {
    showDarkModeDropdown.value = false;
  }
}

// 获取当前深色主题显示文本
function getDarkModeLabel(): string {
  const option = darkModeOptions.value.find(opt => opt.value === settingsStore.settings.theme);
  return option?.label || t("generalSettings.darkModeOff");
}

// 语言下拉选项
const languageOptions = [
  { value: "zh-CN", label: "简体中文" },
  { value: "zh-TW", label: "繁體中文" },
  { value: "en", label: "English" },
];

// 语言下拉状态
const showLanguageDropdown = ref(false);
const languageDropdownButton = ref<HTMLDivElement>();

function toggleLanguageDropdown() {
  showLanguageDropdown.value = !showLanguageDropdown.value;
}

function selectLanguage(value: string) {
  settingsStore.updateSettings({ language: value as "zh-CN" | "zh-TW" | "en" });
  showLanguageDropdown.value = false;
}

function handleLanguageClickOutside(event: MouseEvent) {
  const el = languageDropdownButton.value;
  if (el && event.target instanceof Node && typeof el.contains === "function" && !el.contains(event.target)) {
    showLanguageDropdown.value = false;
  }
}

// 获取当前语言显示文本
function getLanguageLabel(): string {
  const option = languageOptions.find(opt => opt.value === settingsStore.settings.language);
  return option?.label || "简体中文";
}

const tabSwitchOptions = computed(() => [
  { value: "searchEngine", label: t("generalSettings.tabSwitchEngine") },
  { value: "searchSuggestion", label: t("generalSettings.tabSwitchSuggestion") },
  { value: "recentEngine", label: t("generalSettings.tabSwitchRecent") },
  { value: "nextControl", label: t("generalSettings.tabSwitchControl") },
]);

// Custom select dropdown state
const showDropdown = ref(false);
const dropdownButton = ref<HTMLDivElement>();

function toggleDropdown() {
  showDropdown.value = !showDropdown.value;
}

function selectOption(value: string) {
  settingsStore.updateSettings({
    tabSwitchBehavior: value as "searchEngine" | "searchSuggestion" | "recentEngine" | "nextControl",
  });
  showDropdown.value = false;
}

function handleClickOutside(event: MouseEvent) {
  const el = dropdownButton.value;
  if (el && event.target instanceof Node && typeof el.contains === "function" && !el.contains(event.target)) {
    showDropdown.value = false;
  }
}

// Lifecycle hooks
onMounted(() => {
  document.addEventListener("click", handleClickOutside);
  document.addEventListener("click", handleFontWeightClickOutside);
  document.addEventListener("click", handleResolutionClickOutside);
  document.addEventListener("click", handleDarkModeClickOutside);
  document.addEventListener("click", handleLanguageClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
  document.removeEventListener("click", handleFontWeightClickOutside);
  document.removeEventListener("click", handleResolutionClickOutside);
  document.removeEventListener("click", handleLanguageClickOutside);
  document.removeEventListener("click", handleDarkModeClickOutside);
});

// Settings items for filtering
interface SettingItem {
  id: string;
  section: string;
  label: string;
  description?: string;
  type: "toggle" | "select" | "theme";
}

interface FontWeightOption {
  value: "normal" | "medium" | "semibold" | "bold";
  label: string;
}

const fontWeightOptions = computed<FontWeightOption[]>(() => [
  { value: "normal", label: t("generalSettings.fontNormal") },
  { value: "medium", label: t("generalSettings.fontMedium") },
  { value: "semibold", label: t("generalSettings.fontSemibold") },
  { value: "bold", label: t("generalSettings.fontBold") },
]);

// Font weight dropdown state
const showFontWeightDropdown = ref(false);
const fontWeightDropdownButton = ref<HTMLDivElement>();

function toggleFontWeightDropdown() {
  showFontWeightDropdown.value = !showFontWeightDropdown.value;
}

function selectFontWeight(value: string) {
  settingsStore.updateSettings({
    timeFontWeight: value as "normal" | "medium" | "semibold" | "bold",
  });
  showFontWeightDropdown.value = false;
}

function handleFontWeightClickOutside(event: MouseEvent) {
  const el = fontWeightDropdownButton.value;
  if (el && event.target instanceof Node && typeof el.contains === "function" && !el.contains(event.target)) {
    showFontWeightDropdown.value = false;
  }
}

// Wallpaper resolution options and dropdown state
interface ResolutionOption {
  value: "1080p" | "original";
  label: string;
}

const resolutionOptions = computed<ResolutionOption[]>(() => [
  { value: "1080p", label: t("generalSettings.resolution1080p") },
  { value: "original", label: t("generalSettings.resolutionOriginal") },
]);

const showResolutionDropdown = ref(false);
const resolutionDropdownButton = ref<HTMLDivElement>();

function toggleResolutionDropdown() {
  showResolutionDropdown.value = !showResolutionDropdown.value;
}

function selectResolution(value: string) {
  settingsStore.updateSettings({
    wallpaperResolution: value as "1080p" | "original",
  });
  showResolutionDropdown.value = false;
}

function handleResolutionClickOutside(event: MouseEvent) {
  const el = resolutionDropdownButton.value;
  if (el && event.target instanceof Node && typeof el.contains === "function" && !el.contains(event.target)) {
    showResolutionDropdown.value = false;
  }
}

// 设置项配置（使用 computed 实现响应式翻译）
const settingItems = computed<SettingItem[]>(() => [
  { id: "theme", section: t("generalSettings.color"), label: t("generalSettings.accentColor"), type: "theme" },
  { id: "darkMode", section: t("generalSettings.color"), label: t("generalSettings.darkMode"), type: "select" },
  {
    id: "wallpaperVignette",
    section: t("generalSettings.color"),
    label: t("generalSettings.wallpaperVignette"),
    type: "toggle",
  },
  { id: "language", section: t("generalSettings.general"), label: t("generalSettings.language"), type: "select" },
  {
    id: "showPoetry",
    section: t("generalSettings.general"),
    label: t("generalSettings.poetry"),
    description: t("generalSettings.poetryDesc"),
    type: "toggle",
  },
  {
    id: "showFullNote",
    section: t("generalSettings.general"),
    label: t("generalSettings.showFullNote"),
    type: "toggle",
  },
  { id: "use24Hour", section: t("generalSettings.time"), label: t("generalSettings.use24Hour"), type: "toggle" },
  { id: "showSeconds", section: t("generalSettings.time"), label: t("generalSettings.showSeconds"), type: "toggle" },
  {
    id: "blinkSeparator",
    section: t("generalSettings.time"),
    label: t("generalSettings.blinkSeparator"),
    type: "toggle",
  },
  {
    id: "autoFocusSearch",
    section: t("generalSettings.initialization"),
    label: t("generalSettings.autoFocusSearch"),
    type: "toggle",
  },
  {
    id: "autoShowAppGrid",
    section: t("generalSettings.initialization"),
    label: t("generalSettings.autoShowAppGrid"),
    type: "toggle",
  },
  {
    id: "showGreeting",
    section: t("generalSettings.initialization"),
    label: t("generalSettings.showGreeting"),
    type: "toggle",
  },
  {
    id: "smoothMode",
    section: t("generalSettings.performance"),
    label: t("generalSettings.smoothMode"),
    description: t("generalSettings.smoothModeDesc"),
    type: "toggle",
  },
  {
    id: "reduceMotion",
    section: t("generalSettings.performance"),
    label: t("generalSettings.reduceMotion"),
    description: t("generalSettings.reduceMotionDesc"),
    type: "toggle",
  },
  {
    id: "searchBoxAnimation",
    section: t("generalSettings.performance"),
    label: t("generalSettings.searchBoxAnimation"),
    type: "toggle",
  },
  {
    id: "overlayBlur",
    section: t("generalSettings.performance"),
    label: t("generalSettings.overlayBlur"),
    description: t("generalSettings.overlayBlurDesc"),
    type: "toggle",
  },
  {
    id: "shortcutBlur",
    section: t("generalSettings.performance"),
    label: t("generalSettings.shortcutBlur"),
    description: t("generalSettings.shortcutBlurDesc"),
    type: "toggle",
  },
  {
    id: "autoClearSearchBar",
    section: t("generalSettings.searchSection"),
    label: t("generalSettings.autoClearSearchBar"),
    type: "toggle",
  },
  {
    id: "searchHistory",
    section: t("generalSettings.searchSection"),
    label: t("generalSettings.searchHistory"),
    type: "toggle",
  },
  {
    id: "tabSwitchBehavior",
    section: t("generalSettings.searchSection"),
    label: t("generalSettings.tabSwitchBehavior"),
    type: "select",
  },
  {
    id: "showShortcutDock",
    section: t("generalSettings.navigation"),
    label: t("generalSettings.showShortcutDock"),
    type: "toggle",
  },
  {
    id: "openInNewTab",
    section: t("generalSettings.navigation"),
    label: t("generalSettings.openInNewTab"),
    type: "toggle",
  },
  {
    id: "showMoreShortcutsPerRow",
    section: t("generalSettings.navigation"),
    label: t("generalSettings.showMoreShortcuts"),
    description: t("generalSettings.showMoreShortcutsDesc"),
    type: "toggle",
  },
]);

const filteredSections = computed(() => {
  const query = searchQuery.value.toLowerCase().trim();
  const items = settingItems.value;
  const colorSection = t("generalSettings.color");
  const generalSection = t("generalSettings.general");
  const timeSection = t("generalSettings.time");
  const initSection = t("generalSettings.initialization");
  const perfSection = t("generalSettings.performance");
  const searchSection = t("generalSettings.searchSection");
  const navSection = t("generalSettings.navigation");

  if (!query) {
    return [
      { name: colorSection, items: items.filter(i => i.section === colorSection) },
      { name: generalSection, items: items.filter(i => i.section === generalSection) },
      { name: timeSection, items: items.filter(i => i.section === timeSection) },
      { name: initSection, items: items.filter(i => i.section === initSection) },
      { name: perfSection, items: items.filter(i => i.section === perfSection) },
      { name: searchSection, items: items.filter(i => i.section === searchSection) },
      { name: navSection, items: items.filter(i => i.section === navSection) },
    ].filter(s => s.items.length > 0);
  }

  const filtered = items.filter(
    item => item.label.toLowerCase().includes(query) || item.section.toLowerCase().includes(query)
  );

  const sections = new Map<string, SettingItem[]>();
  filtered.forEach(item => {
    if (!sections.has(item.section)) {
      sections.set(item.section, []);
    }
    sections.get(item.section)!.push(item);
  });

  return Array.from(sections.entries()).map(([name, items]) => ({ name, items }));
});

function toggleSetting(key: string) {
  const current = settingsStore.settings[key as keyof typeof settingsStore.settings];
  if (typeof current === "boolean") {
    settingsStore.updateSettings({ [key]: !current });
  }
}

function getSettingValue(key: string): boolean {
  return settingsStore.settings[key as keyof typeof settingsStore.settings] as boolean;
}

async function handleResetShortcuts() {
  await appsStore.resetToDefault();
  showResetConfirm.value = false;
}
</script>

<template>
  <SettingsDialog
    :title="t('generalSettings.title')"
    :show-large-title="true"
    :show-search="true"
    :search-placeholder="t('generalSettings.searchPlaceholder')"
    v-model:search-query="searchQuery"
    @close="emit('close')"
  >
    <!-- Settings Sections -->
    <div class="space-y-4">
      <template v-for="section in filteredSections" :key="section.name">
        <!-- Section Title -->
        <div v-if="section.name !== t('generalSettings.color')">
          <h3 class="section-title">{{ section.name }}</h3>

          <div class="space-y-2">
            <!-- Language Select (only in general section, first item) -->
            <div v-if="section.name === t('generalSettings.general')" class="setting-item">
              <div class="setting-item-label">
                <span class="label-text">{{ t("generalSettings.language") }}</span>
              </div>
              <div class="relative" ref="languageDropdownButton">
                <button class="dark-mode-select" @click.stop="toggleLanguageDropdown">
                  <span>{{ getLanguageLabel() }}</span>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    class="w-4 h-4 transition-transform duration-200 text-muted"
                    :class="{ 'rotate-180': showLanguageDropdown }"
                  />
                </button>

                <!-- Dropdown Menu -->
                <Transition name="dropdown">
                  <div v-if="showLanguageDropdown" class="dark-mode-dropdown">
                    <button
                      v-for="option in languageOptions"
                      :key="option.value"
                      class="dropdown-item"
                      :class="{
                        'dropdown-item-active': settingsStore.settings.language === option.value,
                      }"
                      @click.stop="selectLanguage(option.value)"
                    >
                      <span class="flex-1 text-left">{{ option.label }}</span>
                      <Icon
                        v-if="settingsStore.settings.language === option.value"
                        icon="ri:check-line"
                        class="w-4 h-4 text-accent"
                      />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <template v-for="item in section.items" :key="item.id">
              <!-- 由扩展控制的设置项 (autoFocusSearch) -->
              <div
                v-if="item.type === 'toggle' && item.id === 'autoFocusSearch'"
                class="setting-item extension-controlled"
                @click="showExtensionHint = true"
              >
                <div class="setting-item-label">
                  <div class="extension-hint">
                    <Icon icon="ri:alert-fill" class="w-4 h-4 text-warning" />
                    <span class="text-warning">{{ t("generalSettings.extensionControlled") }}</span>
                  </div>
                  <span class="label-text text-muted">{{ item.label }}</span>
                </div>
                <button class="toggle-switch" :class="{ 'toggle-on': getSettingValue(item.id) }" disabled>
                  <span class="toggle-knob" />
                </button>
              </div>

              <!-- Toggle Switch Item -->
              <div v-else-if="item.type === 'toggle'" class="setting-item">
                <div class="setting-item-label">
                  <span class="label-text">{{ item.label }}</span>
                  <p v-if="item.description" class="label-description">{{ item.description }}</p>
                </div>
                <button
                  class="toggle-switch"
                  :class="{ 'toggle-on': getSettingValue(item.id) }"
                  @click="toggleSetting(item.id)"
                >
                  <span class="toggle-knob" />
                </button>
              </div>

              <!-- Custom Select Item (skip language, it's rendered separately) -->
              <div
                v-else-if="item.type === 'select' && item.id !== 'language'"
                class="flex flex-col gap-2 px-3 py-2.5 rounded-lg setting-item-bg"
              >
                <span class="text-sm text-secondary">{{ item.label }}</span>
                <div class="relative" ref="dropdownButton">
                  <button class="custom-select" @click.stop="toggleDropdown">
                    <span class="flex-1 text-left truncate">
                      {{ tabSwitchOptions.find(opt => opt.value === settingsStore.settings.tabSwitchBehavior)?.label }}
                    </span>
                    <Icon
                      icon="ri:arrow-down-s-line"
                      class="w-4 h-4 transition-transform duration-200 text-muted"
                      :class="{ 'rotate-180': showDropdown }"
                    />
                  </button>

                  <!-- Dropdown Menu -->
                  <Transition name="dropdown">
                    <div v-if="showDropdown" class="custom-dropdown">
                      <button
                        v-for="option in tabSwitchOptions"
                        :key="option.value"
                        class="dropdown-item"
                        :class="{
                          'dropdown-item-active': settingsStore.settings.tabSwitchBehavior === option.value,
                        }"
                        @click.stop="selectOption(option.value)"
                      >
                        <span class="flex-1 text-left">{{ option.label }}</span>
                        <Icon
                          v-if="settingsStore.settings.tabSwitchBehavior === option.value"
                          icon="ri:check-line"
                          class="w-4 h-4 text-accent"
                        />
                      </button>
                    </div>
                  </Transition>
                </div>
              </div>
            </template>

            <!-- Time Font Weight Select (only in Time section) -->
            <div
              v-if="section.name === t('generalSettings.time')"
              class="flex flex-col gap-2 px-3 py-2.5 rounded-lg setting-item-bg"
            >
              <span class="text-sm text-secondary">{{ t("generalSettings.timeFont") }}</span>
              <div class="relative" ref="fontWeightDropdownButton">
                <button class="custom-select" @click.stop="toggleFontWeightDropdown">
                  <span class="flex-1 text-left truncate">
                    {{ fontWeightOptions.find(opt => opt.value === settingsStore.settings.timeFontWeight)?.label }}
                  </span>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    class="w-4 h-4 transition-transform duration-200 text-muted"
                    :class="{ 'rotate-180': showFontWeightDropdown }"
                  />
                </button>

                <!-- Dropdown Menu -->
                <Transition name="dropdown">
                  <div v-if="showFontWeightDropdown" class="custom-dropdown">
                    <button
                      v-for="option in fontWeightOptions"
                      :key="option.value"
                      class="dropdown-item"
                      :class="{
                        'dropdown-item-active': settingsStore.settings.timeFontWeight === option.value,
                      }"
                      @click.stop="selectFontWeight(option.value)"
                    >
                      <span class="flex-1 text-left">{{ option.label }}</span>
                      <Icon
                        v-if="settingsStore.settings.timeFontWeight === option.value"
                        icon="ri:check-line"
                        class="w-4 h-4 text-accent"
                      />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Time Font Size Slider (only in Time section) -->
            <div
              v-if="section.name === t('generalSettings.time')"
              class="flex flex-col gap-2 px-3 py-2.5 rounded-lg setting-item-bg"
            >
              <div class="flex items-center justify-between">
                <span class="text-sm text-secondary">{{ t("generalSettings.timeFontSize") }}</span>
                <span class="text-sm text-muted">{{ settingsStore.settings.timeFontSize }}px</span>
              </div>
              <input
                type="range"
                min="24"
                max="120"
                step="2"
                :value="settingsStore.settings.timeFontSize"
                @input="(e) => settingsStore.updateSettings({ timeFontSize: Number((e.target as HTMLInputElement).value) })"
                class="time-font-size-slider"
              />
            </div>

            <!-- Username Input (only in Initialization section) -->
            <div
              v-if="section.name === t('generalSettings.initialization')"
              class="flex flex-col gap-2 px-3 py-2.5 rounded-lg setting-item-bg"
            >
              <span class="text-sm text-secondary">{{ t("generalSettings.username") }}</span>
              <input
                type="text"
                class="custom-input"
                :value="settingsStore.settings.username"
                @input="(e) => settingsStore.updateSettings({ username: (e.target as HTMLInputElement).value })"
                :placeholder="t('generalSettings.usernamePlaceholder')"
                maxlength="20"
              />
            </div>

            <!-- Wallpaper Resolution Select (only in Performance section) -->
            <div
              v-if="section.name === t('generalSettings.performance')"
              class="flex flex-col gap-2 px-3 py-2.5 rounded-lg setting-item-bg"
            >
              <span class="text-sm text-secondary">{{ t("generalSettings.wallpaperResolution") }}</span>
              <div class="relative" ref="resolutionDropdownButton">
                <button class="custom-select" @click.stop="toggleResolutionDropdown">
                  <span class="flex-1 text-left truncate">
                    {{ resolutionOptions.find(opt => opt.value === settingsStore.settings.wallpaperResolution)?.label }}
                  </span>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    class="w-4 h-4 transition-transform duration-200 text-muted"
                    :class="{ 'rotate-180': showResolutionDropdown }"
                  />
                </button>

                <!-- Dropdown Menu -->
                <Transition name="dropdown">
                  <div v-if="showResolutionDropdown" class="custom-dropdown">
                    <button
                      v-for="option in resolutionOptions"
                      :key="option.value"
                      class="dropdown-item"
                      :class="{
                        'dropdown-item-active': settingsStore.settings.wallpaperResolution === option.value,
                      }"
                      @click.stop="selectResolution(option.value)"
                    >
                      <span class="flex-1 text-left">{{ option.label }}</span>
                      <Icon
                        v-if="settingsStore.settings.wallpaperResolution === option.value"
                        icon="ri:check-line"
                        class="w-4 h-4 text-accent"
                      />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- Reset Shortcuts Button (only in Navigation section) -->
            <div v-if="section.name === t('generalSettings.navigation')" class="setting-item reset-item">
              <div class="setting-item-label">
                <span class="label-text">{{ t("generalSettings.resetShortcuts") }}</span>
                <p class="label-description">{{ t("generalSettings.resetShortcutsDesc") }}</p>
              </div>
              <button class="reset-button" @click="showResetConfirm = true">{{ t("common.reset") }}</button>
            </div>
          </div>
        </div>

        <!-- 颜色部分 (special layout) -->
        <div v-else>
          <h3 class="section-title">{{ section.name }}</h3>
          <div class="space-y-2">
            <!-- 主题色选择 -->
            <div class="setting-item">
              <div class="setting-item-label">
                <span class="label-text">{{ t("generalSettings.accentColor") }}</span>
              </div>
              <div class="flex gap-2">
                <button
                  v-for="option in accentColorOptions"
                  :key="option.value"
                  class="color-option"
                  :class="{ 'color-option-active': settingsStore.settings.accentColor === option.value }"
                  :style="{ backgroundColor: option.color }"
                  @click="selectAccentColor(option.value)"
                >
                  <Icon
                    v-if="settingsStore.settings.accentColor === option.value"
                    icon="ri:check-line"
                    class="w-4 h-4 text-white"
                  />
                </button>
              </div>
            </div>

            <!-- 深色主题下拉选择 -->
            <div class="setting-item">
              <div class="setting-item-label">
                <span class="label-text">{{ t("generalSettings.darkMode") }}</span>
              </div>
              <div class="relative" ref="darkModeDropdownButton">
                <button class="dark-mode-select" @click.stop="toggleDarkModeDropdown">
                  <span>{{ getDarkModeLabel() }}</span>
                  <Icon
                    icon="ri:arrow-down-s-line"
                    class="w-4 h-4 transition-transform duration-200 text-muted"
                    :class="{ 'rotate-180': showDarkModeDropdown }"
                  />
                </button>

                <!-- Dropdown Menu -->
                <Transition name="dropdown">
                  <div v-if="showDarkModeDropdown" class="dark-mode-dropdown">
                    <button
                      v-for="option in darkModeOptions"
                      :key="option.value"
                      class="dropdown-item"
                      :class="{
                        'dropdown-item-active': settingsStore.settings.theme === option.value,
                      }"
                      @click.stop="selectDarkMode(option.value)"
                    >
                      <span class="flex-1 text-left">{{ option.label }}</span>
                      <Icon
                        v-if="settingsStore.settings.theme === option.value"
                        icon="ri:check-line"
                        class="w-4 h-4 text-accent"
                      />
                    </button>
                  </div>
                </Transition>
              </div>
            </div>

            <!-- 为壁纸应用暗角滤镜 -->
            <div class="setting-item">
              <div class="setting-item-label">
                <span class="label-text">{{ t("generalSettings.wallpaperVignette") }}</span>
              </div>
              <button
                class="toggle-switch"
                :class="{ 'toggle-on': settingsStore.settings.wallpaperVignette }"
                @click="toggleSetting('wallpaperVignette')"
              >
                <span class="toggle-knob" />
              </button>
            </div>
          </div>
        </div>
      </template>

      <!-- No results -->
      <div v-if="filteredSections.length === 0" class="py-8 text-center">
        <Icon icon="ri:search-line" class="w-12 h-12 mx-auto mb-3 text-muted" />
        <p class="text-muted">{{ t("generalSettings.noResults") }}</p>
      </div>
    </div>

    <!-- Reset Confirmation Dialog -->
    <Transition name="fade">
      <div v-if="showResetConfirm" class="confirm-overlay" @click="showResetConfirm = false">
        <div class="confirm-dialog" @click.stop>
          <div class="confirm-header">
            <Icon icon="ri:alert-line" class="confirm-icon" />
            <h3 class="confirm-title">{{ t("generalSettings.resetShortcutsTitle") }}</h3>
          </div>
          <p class="confirm-message">{{ t("generalSettings.resetShortcutsConfirm") }}</p>
          <div class="confirm-actions">
            <button class="confirm-button confirm-button-cancel" @click="showResetConfirm = false">
              {{ t("common.cancel") }}
            </button>
            <button class="confirm-button confirm-button-primary" @click="handleResetShortcuts">
              {{ t("common.reset") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Extension Hint Dialog -->
    <Transition name="fade">
      <div v-if="showExtensionHint" class="confirm-overlay" @click="showExtensionHint = false">
        <div class="confirm-dialog" @click.stop>
          <div class="confirm-header">
            <Icon icon="ri:information-fill" class="confirm-icon info-icon" />
            <h3 class="confirm-title">{{ t("generalSettings.hint") }}</h3>
          </div>
          <p class="confirm-message">{{ t("generalSettings.extensionHint") }}</p>
          <div class="confirm-actions">
            <button class="confirm-button confirm-button-primary" @click="showExtensionHint = false">
              {{ t("generalSettings.ok") }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </SettingsDialog>
</template>

<style scoped>
@import "./settings-form.css";

/* 扩展控制的设置项 */
.extension-controlled {
  cursor: pointer;
}

.extension-hint {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-bottom: 0.125rem;
}

.text-warning {
  color: #f59e0b;
  font-size: 0.75rem;
  font-weight: 500;
}

.text-muted {
  color: rgb(var(--color-text-muted));
}

.info-icon {
  color: rgb(var(--color-accent)) !important;
}

/* 颜色选项 */
.color-option {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.color-option:hover {
  transform: scale(1.1);
}

.color-option-active {
  box-shadow: 0 0 0 2px rgb(var(--dialog-bg)), 0 0 0 4px currentColor;
}

/* 深色主题下拉按钮 */
.dark-mode-select {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: rgb(var(--color-text-secondary));
  background-color: rgb(var(--color-border) / 0.2);
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark-mode-select:hover {
  background-color: rgb(var(--color-border) / 0.3);
}

/* 深色主题下拉菜单 */
.dark-mode-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 0.25rem;
  min-width: 120px;
  background: rgb(var(--dropdown-bg));
  border: 1px solid rgb(var(--color-border) / 0.3);
  border-radius: 0.75rem;
  box-shadow: var(--shadow-lg);
  padding: 0.25rem;
  z-index: 50;
}

.reset-item {
  border-top: 1px solid rgb(var(--color-border) / 0.3);
  margin-top: 0.5rem;
  padding-top: 0.75rem;
}

.reset-button {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: white;
  background-color: rgb(var(--color-accent));
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  white-space: nowrap;
}

.reset-button:hover {
  background-color: rgb(var(--color-accent-hover));
}

.reset-button:active {
  transform: translateY(0);
}

/* Confirmation Dialog */
.confirm-overlay {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
}

.confirm-dialog {
  background: rgb(var(--dialog-item-bg));
  border: 1px solid rgb(var(--color-border) / 0.3);
  border-radius: 1rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
}

.confirm-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.confirm-icon {
  width: 1.5rem;
  height: 1.5rem;
  color: rgb(var(--color-accent));
}

.confirm-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin: 0;
}

.confirm-message {
  color: rgb(var(--color-text-secondary));
  margin-bottom: 1.5rem;
  line-height: 1.5;
}

.confirm-actions {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.confirm-button {
  padding: 0.5rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
}

.confirm-button-cancel {
  color: rgb(var(--color-text));
  background: rgb(var(--color-border) / 0.3);
}

.confirm-button-cancel:hover {
  background: rgb(var(--color-border) / 0.5);
}

.confirm-button-primary {
  color: white;
  background-color: rgb(var(--color-accent));
}

.confirm-button-primary:hover {
  background-color: rgb(var(--color-accent-hover));
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .confirm-dialog,
.fade-leave-active .confirm-dialog {
  transition: all 0.2s ease;
}

.fade-enter-from .confirm-dialog,
.fade-leave-to .confirm-dialog {
  transform: scale(0.95);
}

/* 时间字体大小滑块 */
.time-font-size-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 4px;
  background: rgb(var(--color-border) / 0.3);
  border-radius: 2px;
  outline: none;
  cursor: pointer;
}

.time-font-size-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 16px;
  height: 16px;
  background: rgb(var(--color-accent));
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.time-font-size-slider::-webkit-slider-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgb(var(--color-accent) / 0.5);
}

.time-font-size-slider::-moz-range-thumb {
  width: 16px;
  height: 16px;
  background: rgb(var(--color-accent));
  border: none;
  border-radius: 50%;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.time-font-size-slider::-moz-range-thumb:hover {
  transform: scale(1.1);
  box-shadow: 0 0 8px rgb(var(--color-accent) / 0.5);
}

.time-font-size-slider::-moz-range-track {
  background: rgb(var(--color-border) / 0.3);
  border-radius: 2px;
  height: 4px;
}
</style>