/*
  * @Description: TypeScript 类型定义文件，包含 AppItem、Settings、NoteItem 等核心类型
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
export interface AppItem {
  id: string;
  name: string;
  url: string;
  icon: string;
  iconType: "iconify" | "url" | "text";
  iconColor?: string;
  backgroundColor?: string;
  isInDock: boolean;
  order: number; // AppGrid 中的排序
  dockOrder?: number; // DockBar 中的排序（独立）
}

export interface SearchEngine {
  id: string;
  name: string;
  icon: string;
  url: string;
  placeholder: string;
  isCustom?: boolean; // 是否为自定义搜索引擎
  isDefault?: boolean; // 是否为浏览器默认搜索引擎（使用 Chrome Search API）
}

export interface Settings {
  theme: "light" | "dark" | "system";
  accentColor: "green" | "cyan" | "purple" | "red" | "blue"; // 主题色
  language: "zh-CN" | "zh-TW" | "en"; // 语言
  showPoetry: boolean; // 一言
  showFullNote: boolean; // 完整显示固定到主屏幕的便笺内容
  searchEngine: string;
  // Time settings
  showSeconds: boolean;
  use24Hour: boolean;
  blinkSeparator: boolean;
  timeFontWeight: "normal" | "medium" | "semibold" | "bold";
  timeFontSize: number; // 时间字体大小 (24-120)
  blurIntensity: number;
  dockSize: "small" | "medium" | "large";
  // Initialization settings
  autoFocusSearch: boolean; // 加载时自动聚焦到搜索栏
  autoShowAppGrid: boolean; // 加载时自动显示二级界面（应用网格）
  showGreeting: boolean; // 登录后显示问候
  username: string; // 用户名
  // Performance settings
  smoothMode: boolean; // 流畅模式
  reduceMotion: boolean; // 减弱动态效果
  searchBoxAnimation: boolean; // 搜索栏伸缩动效
  overlayBlur: boolean; // 遮罩层毛玻璃效果
  shortcutBlur: boolean; // 捷径毛玻璃效果
  wallpaperResolution: "1080p" | "original"; // 每日壁纸分辨率
  wallpaperVignette: boolean; // 壁纸暗角滤镜
  // Search settings
  autoClearSearchBar: boolean;
  searchHistory: boolean;
  tabSwitchBehavior: "searchEngine" | "searchSuggestion" | "recentEngine" | "nextControl";
  // Navigation settings
  showShortcutDock: boolean;
  openInNewTab: boolean;
  showMoreShortcutsPerRow: boolean;
  // Sync settings
  enableSync?: boolean; // 是否启用账号同步
}

export interface WallpaperSettings {
  type: "default" | "local" | "url" | "bing" | "dynamic";
  url: string | null;
  localData: string | null; // 单张本地图片 (兼容旧数据)
  localImages: string[]; // 多张本地图片，每次随机显示一张
  defaultIndex: number; // 默认静态壁纸索引
  dynamicIndex: number; // 动态壁纸索引
  blur: boolean;
  blurAmount: number;
  brightness: number;
}

// Bing 今日壁纸信息
export interface BingWallpaperInfo {
  url: string;
  title: string;
  copyright: string;
  copyrightLink?: string;
}

export type ThemeMode = "light" | "dark" | "system";

export interface BookmarkNode {
  id: string;
  title: string;
  url?: string;
  children?: BookmarkNode[];
}

// 便笺类型
export interface NoteItem {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  isPinned: boolean;
}