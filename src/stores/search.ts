/*
  * @Description: 搜索引擎管理 Store，提供多种搜索引擎选项和搜索功能
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { SearchEngine } from "@/types";
import { useSettingsStore } from "./settings";

// Chrome Search API 类型定义
declare const chrome:
  | {
      search?: {
        query: (queryInfo: { text: string; disposition?: "CURRENT_TAB" | "NEW_TAB" | "NEW_WINDOW" }) => Promise<void>;
      };
    }
  | undefined;

// 检测是否在 Chrome 扩展环境中且有 search API
const hasChromSearchAPI = typeof chrome !== "undefined" && chrome?.search?.query;

const SEARCH_ENGINES: SearchEngine[] = [
  {
    id: "default",
    name: "默认搜索引擎",
    icon: "ri:search-line",
    url: "",
    placeholder: "使用浏览器默认搜索引擎搜索",
    isDefault: true,
  },
  {
    id: "google",
    name: "Google",
    icon: "ri:google-fill",
    url: "https://www.google.com/search?q=",
    placeholder: "在 Google 中搜索",
  },
  {
    id: "bing",
    name: "Bing",
    icon: "ri:microsoft-fill",
    url: "https://www.bing.com/search?q=",
    placeholder: "在 Bing 中搜索",
  },
  {
    id: "baidu",
    name: "百度",
    icon: "ri:baidu-fill",
    url: "https://www.baidu.com/s?wd=",
    placeholder: "在百度中搜索",
  },
  {
    id: "github",
    name: "GitHub",
    icon: "ri:github-fill",
    url: "https://github.com/search?q=",
    placeholder: "在 GitHub 中搜索",
  },
];

const CUSTOM_ENGINES_KEY = "Aurora_custom_search_engines";

export const useSearchStore = defineStore("search", () => {
  const engines = ref<SearchEngine[]>([...SEARCH_ENGINES]);

  const settingsStore = useSettingsStore();

  // 加载自定义搜索引擎
  function loadCustomEngines() {
    try {
      const stored = localStorage.getItem(CUSTOM_ENGINES_KEY);
      if (stored) {
        const customEngines = JSON.parse(stored) as SearchEngine[];
        // 合并默认引擎和自定义引擎
        engines.value = [...SEARCH_ENGINES, ...customEngines];
      }
    } catch {
      // ignore storage errors
    }
  }

  // 保存自定义搜索引擎
  function saveCustomEngines() {
    try {
      const customEngines = engines.value.filter(e => e.isCustom);
      localStorage.setItem(CUSTOM_ENGINES_KEY, JSON.stringify(customEngines));
    } catch {
      // ignore storage errors
    }
  }

  const currentEngine = computed(() => {
    const engineId = settingsStore.settings.searchEngine;
    return engines.value.find(e => e.id === engineId) || engines.value[0];
  });

  async function search(query: string) {
    if (!query.trim()) return;

    const engine = currentEngine.value;

    // 如果选择了默认搜索引擎或在 Chrome 扩展环境中使用 Chrome Search API
    if (engine.isDefault && hasChromSearchAPI) {
      try {
        await chrome!.search!.query({
          text: query,
          disposition: settingsStore.settings.openInNewTab ? "NEW_TAB" : "CURRENT_TAB",
        });
        return;
      } catch (e) {
        console.error("Chrome Search API error:", e);
        // 回退到传统方式
      }
    }

    // 非默认搜索引擎或 H5 模式，使用传统 URL 跳转方式
    // 如果是默认引擎但不在扩展环境，回退到 Google
    const searchUrl = engine.isDefault ? "https://www.google.com/search?q=" : engine.url;
    const url = searchUrl + encodeURIComponent(query);

    // 根据设置决定在新标签页还是当前页面打开
    if (settingsStore.settings.openInNewTab) {
      window.open(url, "_blank");
    } else {
      window.location.href = url;
    }
  }

  async function setEngine(engineId: string) {
    await settingsStore.updateSettings({ searchEngine: engineId });
  }

  // 添加自定义搜索引擎
  function addCustomEngine(engine: Omit<SearchEngine, "id" | "isCustom">) {
    const newEngine: SearchEngine = {
      ...engine,
      id: `custom_${Date.now()}`,
      isCustom: true,
    };
    engines.value.push(newEngine);
    saveCustomEngines();
    return newEngine;
  }

  // 更新自定义搜索引擎
  function updateCustomEngine(id: string, updates: Partial<SearchEngine>) {
    const index = engines.value.findIndex(e => e.id === id && e.isCustom);
    if (index !== -1) {
      engines.value[index] = { ...engines.value[index], ...updates };
      saveCustomEngines();
    }
  }

  // 删除自定义搜索引擎
  async function deleteCustomEngine(id: string) {
    const engine = engines.value.find(e => e.id === id);
    if (!engine?.isCustom) return;

    engines.value = engines.value.filter(e => e.id !== id);
    saveCustomEngines();

    // 如果删除的是当前引擎，切换到默认引擎
    if (currentEngine.value.id === id) {
      await setEngine(engines.value[0].id);
    }
  }

  // 初始化时加载自定义引擎
  loadCustomEngines();

  return {
    engines,
    currentEngine,
    search,
    setEngine,
    addCustomEngine,
    updateCustomEngine,
    deleteCustomEngine,
  };
});