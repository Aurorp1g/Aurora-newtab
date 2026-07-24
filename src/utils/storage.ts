/*
  * @Description: 存储工具模块，提供应用数据、设置、壁纸、便笺的持久化操作
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import type { AppItem, Settings, WallpaperSettings, NoteItem } from "@/types";

// 检测是否在浏览器扩展环境中
declare const chrome:
  | {
      storage?: {
        local?: {
          get: (keys: string[]) => Promise<Record<string, unknown>>;
          set: (items: Record<string, unknown>) => Promise<void>;
        };
        sync?: {
          get: (keys: string[]) => Promise<Record<string, unknown>>;
          set: (items: Record<string, unknown>) => Promise<void>;
        };
      };
    }
  | undefined;

const isExtension = typeof chrome !== "undefined" && chrome?.storage;

// 动态导入 webextension-polyfill，仅在扩展环境中使用
type BrowserAPI = {
  storage: {
    local: {
      get: (keys: string | string[]) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
    sync: {
      get: (keys: string | string[]) => Promise<Record<string, unknown>>;
      set: (items: Record<string, unknown>) => Promise<void>;
    };
  };
};

let browser: BrowserAPI | null = null;

async function getBrowser(): Promise<BrowserAPI | null> {
  if (!isExtension) return null;
  if (!browser) {
    const browserModule = await import("webextension-polyfill");
    browser = (browserModule.default || browserModule) as BrowserAPI;
  }
  return browser;
}

const DEFAULT_SETTINGS: Settings = {
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
  timeFontSize: 64,
  blurIntensity: 20,
  dockSize: "medium",
  // Initialization settings
  autoFocusSearch: true, // 默认自动聚焦搜索栏
  autoShowAppGrid: false, // 默认不自动显示应用网格
  showGreeting: true, // 默认显示问候
  username: "", // 默认无用户名
  // Performance settings
  smoothMode: false, // 默认不开启流畅模式
  reduceMotion: false, // 默认不减弱动态效果
  searchBoxAnimation: false, // 默认关闭搜索栏伸缩动效
  overlayBlur: true, // 默认开启遮罩层毛玻璃
  shortcutBlur: false, // 默认不开启捷径毛玻璃
  wallpaperResolution: "1080p", // 默认 1080P
  wallpaperVignette: true, // 默认开启壁纸暗角滤镜
  // Search settings
  autoClearSearchBar: true,
  searchHistory: true,
  tabSwitchBehavior: "searchEngine",
  // Navigation settings
  showShortcutDock: true,
  openInNewTab: true,
  showMoreShortcutsPerRow: false,
  // Sync settings
  enableSync: false, // 默认不启用同步
};

const DEFAULT_WALLPAPER: WallpaperSettings = {
  type: "default",
  url: null,
  localData: null,
  localImages: [],
  defaultIndex: 0,
  dynamicIndex: 0,
  blur: true,
  blurAmount: 30,
  brightness: 100,
  dailyRandom: {
    enabled: false,
    lastDate: null,
    selectedType: "all",
  },
};

const DEFAULT_APPS: AppItem[] = [
  {
    id: "1",
    name: "翻译",
    url: "https://fanyi.qq.com/",
    icon: "ri:translate-2",
    iconType: "iconify",
    iconColor: "#4285f4",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 0,
    dockOrder: 0,
  },
  {
    id: "2",
    name: "AI 工具",
    url: "https://chat.openai.com",
    icon: "ri:openai-fill",
    iconType: "iconify",
    iconColor: "#10a37f",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 1,
    dockOrder: 1,
  },
  {
    id: "3",
    name: "图片",
    url: "https://unsplash.com",
    icon: "ri:image-line",
    iconType: "iconify",
    iconColor: "#e91e63",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 2,
    dockOrder: 2,
  },
  {
    id: "4",
    name: "便笺",
    url: "#notes",
    icon: "ri:sticky-note-line",
    iconType: "iconify",
    iconColor: "#fbbc04",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 3,
    dockOrder: 3,
  },
  {
    id: "5",
    name: "GitHub",
    url: "https://github.com",
    icon: "ri:github-fill",
    iconType: "iconify",
    iconColor: "#24292e",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 4,
    dockOrder: 4,
  },
  {
    id: "6",
    name: "QQ 邮箱",
    url: "https://mail.qq.com",
    icon: "ri:mail-line",
    iconType: "iconify",
    iconColor: "#ff5722",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 5,
    dockOrder: 5,
  },
  {
    id: "7",
    name: "云音乐",
    url: "https://music.163.com",
    icon: "ri:netease-cloud-music-line",
    iconType: "iconify",
    iconColor: "#e60026",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 6,
    dockOrder: 6,
  },
  {
    id: "8",
    name: "bilibili",
    url: "https://bilibili.com",
    icon: "ri:bilibili-line",
    iconType: "iconify",
    iconColor: "#fb7299",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 7,
    dockOrder: 7,
  },
  {
    id: "9",
    name: "壁纸",
    url: "https://wallhaven.cc",
    icon: "ri:gallery-line",
    iconType: "iconify",
    iconColor: "#00bcd4",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 8,
    dockOrder: 8,
  },
  {
    id: "10",
    name: "深色主题",
    url: "#theme-toggle",
    icon: "ri:sun-line",
    iconType: "iconify",
    iconColor: "#ff9800",
    backgroundColor: "#ffffff",
    isInDock: true,
    order: 9,
    dockOrder: 9,
  },
];

// localStorage 回退方案（用于开发环境）
function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      const parsed = JSON.parse(stored);
      // 对于数组，检查是否为空
      if (Array.isArray(parsed) && parsed.length === 0) {
        return defaultValue;
      }
      return parsed;
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

// Sync storage for settings (syncs across devices)
export async function getSettings(): Promise<Settings> {
  try {
    const b = await getBrowser();
    if (b) {
      const result = await b.storage.sync.get("settings");
      const stored = result.settings as Partial<Settings> | undefined;
      return { ...DEFAULT_SETTINGS, ...stored };
    }
    // 非扩展环境，使用 localStorage
    return getLocalStorage("settings", DEFAULT_SETTINGS);
  } catch {
    return getLocalStorage("settings", DEFAULT_SETTINGS);
  }
}

export async function saveSettings(settings: Partial<Settings>): Promise<void> {
  try {
    const b = await getBrowser();
    if (b) {
      const current = await getSettings();
      await b.storage.sync.set({ settings: { ...current, ...settings } });
    } else {
      const current = await getSettings();
      setLocalStorage("settings", { ...current, ...settings });
    }
  } catch {
    const current = getLocalStorage("settings", DEFAULT_SETTINGS);
    setLocalStorage("settings", { ...current, ...settings });
  }
}

// 迁移已保存的应用数据，更新默认应用的链接
function migrateApps(apps: AppItem[]): AppItem[] {
  // 确保 apps 是数组
  if (!Array.isArray(apps)) {
    console.error("migrateApps 接收到非数组数据:", apps);
    return DEFAULT_APPS;
  }

  return apps.map((app, index) => {
    let migratedApp = { ...app };

    // 迁移翻译应用链接（id: "1"）
    if (app.id === "1" && app.url === "https://translate.google.com") {
      migratedApp.url = "https://fanyi.qq.com/";
    }
    // 迁移空投快传为 GitHub（id: "5"）
    if (app.id === "5" && (app.url === "https://airportal.cn" || app.name === "空投快传")) {
      migratedApp = {
        ...migratedApp,
        name: "GitHub",
        url: "https://github.com",
        icon: "ri:github-fill",
        iconColor: "#24292e",
      };
    }

    // 为没有 dockOrder 的应用添加 dockOrder
    // 如果应用在 dock 中且没有 dockOrder，使用其在 dock 应用中的索引
    if (app.isInDock && app.dockOrder === undefined) {
      const dockApps = apps.filter(a => a.isInDock);
      const dockIndex = dockApps.findIndex(a => a.id === app.id);
      migratedApp.dockOrder = dockIndex >= 0 ? dockIndex : index;
    }

    return migratedApp;
  });
}

// 检查是否启用同步
async function isSyncEnabled(): Promise<boolean> {
  const settings = await getSettings();
  return settings.enableSync === true;
}

// Local storage for large data
export async function getApps(): Promise<AppItem[]> {
  try {
    const b = await getBrowser();
    const syncEnabled = await isSyncEnabled();

    if (b) {
      // 根据同步设置选择存储位置
      const storage = syncEnabled ? b.storage.sync : b.storage.local;
      const result = await storage.get("apps");
      let stored = result.apps as AppItem[] | undefined;

      // 如果存储为空，返回默认应用
      if (!stored) {
        return DEFAULT_APPS;
      }

      // 处理对象格式（某些情况下数组会被存储为对象）
      if (!Array.isArray(stored) && typeof stored === "object") {
        const keys = Object.keys(stored)
          .filter(key => !isNaN(Number(key)))
          .sort((a, b) => Number(a) - Number(b));
        stored = keys.map(key => (stored as any)[key]) as AppItem[];
      }

      // 确保是数组且不为空
      if (!Array.isArray(stored) || stored.length === 0) {
        return DEFAULT_APPS;
      }

      // 迁移已保存的应用数据
      const migrated = migrateApps(stored);
      // 如果数据有变化，保存迁移后的数据
      if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
        await saveApps(migrated);
      }
      return migrated;
    }
    // 非扩展环境，使用 localStorage
    const stored = getLocalStorage<AppItem[] | null>("apps", null);
    if (!stored || stored.length === 0) {
      return DEFAULT_APPS;
    }
    // 迁移已保存的应用数据
    const migrated = migrateApps(stored);
    // 如果数据有变化，保存迁移后的数据
    if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
      setLocalStorage("apps", migrated);
    }
    return migrated;
  } catch (error) {
    console.error("加载应用数据失败:", error);
    const stored = getLocalStorage<AppItem[] | null>("apps", null);
    if (!stored || stored.length === 0) {
      return DEFAULT_APPS;
    }
    const migrated = migrateApps(stored);
    if (JSON.stringify(migrated) !== JSON.stringify(stored)) {
      setLocalStorage("apps", migrated);
    }
    return migrated;
  }
}

export async function saveApps(apps: AppItem[]): Promise<void> {
  // 确保 apps 是数组
  if (!Array.isArray(apps)) {
    console.error("saveApps 接收到非数组数据:", apps);
    return;
  }

  try {
    const b = await getBrowser();
    const syncEnabled = await isSyncEnabled();

    if (b) {
      // 根据同步设置选择存储位置
      const storage = syncEnabled ? b.storage.sync : b.storage.local;
      await storage.set({ apps });
    } else {
      setLocalStorage("apps", apps);
    }
  } catch (error) {
    console.error("保存应用数据失败:", error);
    setLocalStorage("apps", apps);
  }
}

export async function getWallpaper(): Promise<WallpaperSettings> {
  try {
    const b = await getBrowser();
    const syncEnabled = await isSyncEnabled();

    if (b) {
      const storage = syncEnabled ? b.storage.sync : b.storage.local;
      const result = await storage.get("wallpaper");
      const stored = result.wallpaper as Partial<WallpaperSettings> | undefined;
      return { ...DEFAULT_WALLPAPER, ...stored };
    }
    // 非扩展环境，使用 localStorage
    return getLocalStorage("wallpaper", DEFAULT_WALLPAPER);
  } catch {
    return getLocalStorage("wallpaper", DEFAULT_WALLPAPER);
  }
}

export async function saveWallpaper(wallpaper: Partial<WallpaperSettings>): Promise<void> {
  try {
    const b = await getBrowser();
    const syncEnabled = await isSyncEnabled();

    if (b) {
      const storage = syncEnabled ? b.storage.sync : b.storage.local;
      const current = await getWallpaper();
      await storage.set({ wallpaper: { ...current, ...wallpaper } });
    } else {
      const current = await getWallpaper();
      setLocalStorage("wallpaper", { ...current, ...wallpaper });
    }
  } catch {
    const current = getLocalStorage("wallpaper", DEFAULT_WALLPAPER);
    setLocalStorage("wallpaper", { ...current, ...wallpaper });
  }
}

// Generate unique ID
export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Get default apps
export function getDefaultApps(): AppItem[] {
  return JSON.parse(JSON.stringify(DEFAULT_APPS));
}

// Bing 壁纸缓存接口
interface BingWallpaperCache {
  date: string; // YYYY-MM-DD 格式
  data: {
    url: string;
    title: string;
    copyright: string;
    copyrightLink?: string;
  };
}

// 获取 Bing 壁纸缓存
export async function getBingWallpaperCache(): Promise<BingWallpaperCache | null> {
  try {
    const b = await getBrowser();
    if (b) {
      const result = await b.storage.local.get("bingWallpaperCache");
      return (result.bingWallpaperCache as BingWallpaperCache) || null;
    }
    return getLocalStorage<BingWallpaperCache | null>("bingWallpaperCache", null);
  } catch {
    return getLocalStorage<BingWallpaperCache | null>("bingWallpaperCache", null);
  }
}

// 保存 Bing 壁纸缓存
export async function saveBingWallpaperCache(cache: BingWallpaperCache): Promise<void> {
  try {
    const b = await getBrowser();
    if (b) {
      await b.storage.local.set({ bingWallpaperCache: cache });
    } else {
      setLocalStorage("bingWallpaperCache", cache);
    }
  } catch {
    setLocalStorage("bingWallpaperCache", cache);
  }
}

// 获取今天的日期字符串 (YYYY-MM-DD)
export function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(
    2,
    "0"
  )}`;
}

// 便笺存储
export async function getNotes(): Promise<NoteItem[]> {
  try {
    const b = await getBrowser();
    const syncEnabled = await isSyncEnabled();

    if (b) {
      const storage = syncEnabled ? b.storage.sync : b.storage.local;
      const result = await storage.get("notes");
      let stored = result.notes as NoteItem[] | undefined;

      if (!stored) {
        return [];
      }

      // 处理对象格式
      if (!Array.isArray(stored) && typeof stored === "object") {
        const keys = Object.keys(stored)
          .filter(key => !isNaN(Number(key)))
          .sort((a, b) => Number(a) - Number(b));
        stored = keys.map(key => (stored as any)[key]) as NoteItem[];
      }

      if (!Array.isArray(stored)) {
        return [];
      }

      return stored;
    }
    return getLocalStorage<NoteItem[]>("notes", []);
  } catch (error) {
    console.error("加载便笺数据失败:", error);
    return getLocalStorage<NoteItem[]>("notes", []);
  }
}

export async function saveNotes(notes: NoteItem[]): Promise<void> {
  if (!Array.isArray(notes)) {
    console.error("saveNotes 接收到非数组数据:", notes);
    return;
  }

  try {
    const b = await getBrowser();
    const syncEnabled = await isSyncEnabled();

    if (b) {
      const storage = syncEnabled ? b.storage.sync : b.storage.local;
      await storage.set({ notes });
    } else {
      setLocalStorage("notes", notes);
    }
  } catch (error) {
    console.error("保存便笺数据失败:", error);
    setLocalStorage("notes", notes);
  }
}

// ============ 同步数据迁移 ============

/**
 * 将本地数据迁移到 sync storage
 * 在首次启用同步时调用
 */
export async function migrateLocalToSync(): Promise<void> {
  const b = await getBrowser();
  if (!b) {
    console.warn("非扩展环境，无法迁移数据到 sync storage");
    return;
  }

  console.log("开始迁移本地数据到 sync storage...");

  try {
    // 1. 获取本地存储的所有数据
    const localData = await b.storage.local.get(["apps", "wallpaper", "notes"]);

    // 2. 检查 sync storage 中是否已有数据
    const syncData = await b.storage.sync.get(["apps", "wallpaper", "notes"]);

    // 3. 只迁移 sync storage 中不存在的数据
    const dataToSync: Record<string, unknown> = {};

    // 迁移应用数据
    if (!syncData.apps && localData.apps) {
      dataToSync.apps = localData.apps;
      console.log("迁移应用数据到 sync storage");
    }

    // 迁移壁纸设置（排除本地图片数据，因为太大）
    if (!syncData.wallpaper && localData.wallpaper) {
      const wallpaper = localData.wallpaper as WallpaperSettings;
      // 不同步本地图片数据，因为可能超过 sync storage 限制
      const wallpaperToSync = {
        ...wallpaper,
        localData: null,
        localImages: [],
      };
      dataToSync.wallpaper = wallpaperToSync;
      console.log("迁移壁纸设置到 sync storage（排除本地图片）");
    }

    // 迁移便笺数据
    if (!syncData.notes && localData.notes) {
      dataToSync.notes = localData.notes;
      console.log("迁移便笺数据到 sync storage");
    }

    // 4. 将数据写入 sync storage
    if (Object.keys(dataToSync).length > 0) {
      await b.storage.sync.set(dataToSync);
      console.log("数据迁移完成:", Object.keys(dataToSync));
    } else {
      console.log("sync storage 中已有数据，无需迁移");
    }
  } catch (error) {
    console.error("数据迁移失败:", error);
    throw error;
  }
}

/**
 * 检查 sync storage 中是否已有用户数据
 */
export async function hasSyncData(): Promise<boolean> {
  const b = await getBrowser();
  if (!b) return false;

  try {
    const syncData = await b.storage.sync.get(["apps", "wallpaper", "notes"]);
    return !!(syncData.apps || syncData.wallpaper || syncData.notes);
  } catch {
    return false;
  }
}