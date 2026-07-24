/*
  * @Description: 设置管理 Store，负责主题、语言、搜索等全局设置
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { defineStore } from "pinia";
import { ref } from "vue";
import type { Settings, ThemeMode } from "@/types";
import { getSettings, saveSettings } from "@/utils/storage";
import { setLocale, type LocaleType } from "@/locales";

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref<Settings>({
    theme: "system",
    accentColor: "blue", // 默认蓝色主题
    language: "zh-CN", // 默认简体中文
    showPoetry: true, // 默认开启一言
    showFullNote: false, // 默认关闭完整显示便笺
    searchEngine: "default", // 默认使用浏览器默认搜索引擎
    // Time settings
    showSeconds: false,
    use24Hour: true,
    blinkSeparator: true,
    timeFontWeight: "normal",
    timeFontSize: 42, // 默认字体大小
    blurIntensity: 20,
    dockSize: "medium",
    // Initialization settings
    autoFocusSearch: true,
    autoShowAppGrid: false,
    showGreeting: true,
    username: "",
    // Performance settings
    smoothMode: false,
    reduceMotion: false,
    searchBoxAnimation: false,
    overlayBlur: true,
    shortcutBlur: false,
    wallpaperResolution: "1080p",
    wallpaperVignette: true, // 默认开启暗角滤镜
    // Search settings
    autoClearSearchBar: true,
    searchHistory: true,
    tabSwitchBehavior: "searchEngine",
    // Navigation settings
    showShortcutDock: true,
    openInNewTab: true,
    showMoreShortcutsPerRow: false,
  });

  const currentTheme = ref<"light" | "dark">("light");
  let isSaving = false;

  async function init() {
    settings.value = await getSettings();
    applyTheme();
    applyLanguage();
    watchSystemTheme();
  }

  function applyLanguage() {
    setLocale(settings.value.language as LocaleType);
  }

  function watchSystemTheme() {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (settings.value.theme === "system") {
        applyTheme();
      }
    });
  }

  function applyTheme() {
    const theme = settings.value.theme;
    let isDark = false;

    if (theme === "system") {
      isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    } else {
      isDark = theme === "dark";
    }

    currentTheme.value = isDark ? "dark" : "light";

    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }

  async function updateSettings(newSettings: Partial<Settings>) {
    // 防止重复保存
    if (isSaving) return;
    isSaving = true;

    try {
      settings.value = { ...settings.value, ...newSettings };
      await saveSettings(settings.value);
      if ("theme" in newSettings) {
        applyTheme();
      }
      if ("language" in newSettings) {
        applyLanguage();
      }
    } finally {
      isSaving = false;
    }
  }

  async function setTheme(theme: ThemeMode) {
    await updateSettings({ theme });
  }

  async function toggleTheme() {
    // 简化为只在 light 和 dark 之间切换
    const nextTheme: ThemeMode = currentTheme.value === "dark" ? "light" : "dark";
    await setTheme(nextTheme);
  }

  return {
    settings,
    currentTheme,
    init,
    updateSettings,
    setTheme,
    toggleTheme,
  };
});