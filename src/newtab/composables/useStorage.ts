/*
  * @Description: 存储 Composable，封装 localStorage 操作，支持扩展环境检测
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { ref, watch } from "vue";

// 检测是否在浏览器扩展环境中
declare const chrome:
  | {
      storage?: unknown;
    }
  | undefined;

const isExtension = typeof chrome !== "undefined" && chrome?.storage;

// localStorage 回退方案
function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 忽略存储错误
  }
}

// 动态导入 webextension-polyfill
type BrowserStorageAPI = {
  storage: {
    local: {
      get: (keys: string | string[]) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
    sync: {
      get: (keys: string | string[]) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
    onChanged: {
      addListener: (
        callback: (changes: Record<string, { newValue?: unknown; oldValue?: unknown }>, areaName: string) => void
      ) => void;
    };
  };
};

let browser: BrowserStorageAPI | null = null;

async function getBrowser(): Promise<BrowserStorageAPI | null> {
  if (!isExtension) return null;
  if (!browser) {
    try {
      const browserModule = await import("webextension-polyfill");
      browser = (browserModule.default || browserModule) as BrowserStorageAPI;
    } catch {
      return null;
    }
  }
  return browser;
}

export function useStorage<T>(key: string, defaultValue: T, sync = false) {
  const data = ref<T>(defaultValue);
  const loading = ref(true);

  async function load() {
    loading.value = true;
    try {
      const b = await getBrowser();
      if (b) {
        const storage = sync ? b.storage.sync : b.storage.local;
        const result = await storage.get(key);
        if (result[key] !== undefined) {
          data.value = result[key] as T;
        }
      } else {
        // 非扩展环境，使用 localStorage
        data.value = getLocalStorage(key, defaultValue);
      }
    } catch (e) {
      console.error(`Failed to load ${key} from storage:`, e);
      // 回退到 localStorage
      data.value = getLocalStorage(key, defaultValue);
    } finally {
      loading.value = false;
    }
  }

  async function save(value: T) {
    try {
      const b = await getBrowser();
      if (b) {
        const storage = sync ? b.storage.sync : b.storage.local;
        await storage.set({ [key]: value });
      } else {
        // 非扩展环境，使用 localStorage
        setLocalStorage(key, value);
      }
    } catch (e) {
      console.error(`Failed to save ${key} to storage:`, e);
      // 回退到 localStorage
      setLocalStorage(key, value);
    }
  }

  // Auto-save on change
  watch(
    data,
    async newValue => {
      if (!loading.value) {
        await save(newValue);
      }
    },
    { deep: true }
  );

  // Initial load
  load();

  // Listen for changes from other tabs/windows
  getBrowser().then(b => {
    if (b) {
      b.storage.onChanged.addListener((changes, areaName) => {
        const expectedArea = sync ? "sync" : "local";
        if (areaName === expectedArea && changes[key]) {
          data.value = changes[key].newValue as T;
        }
      });
    } else {
      // 非扩展环境，监听 storage 事件实现跨标签页同步
      window.addEventListener("storage", event => {
        if (event.key === key && event.newValue) {
          try {
            data.value = JSON.parse(event.newValue) as T;
          } catch {
            // 忽略解析错误
          }
        }
      });
    }
  });

  return {
    data,
    loading,
    load,
    save,
  };
}