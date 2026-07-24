/*
  * @Description: 繁體中文語言包
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
// 繁體中文語言包
export default {
  // 通用
  common: {
    save: "儲存",
    cancel: "取消",
    delete: "刪除",
    edit: "編輯",
    add: "新增",
    reset: "重設",
    confirm: "確定",
    close: "關閉",
    search: "搜尋",
    loading: "載入中...",
    noData: "暫無資料",
  },

  // 搜尋框
  search: {
    placeholder: "搜尋",
    clearHistory: "清除歷史記錄",
  },

  // 問候語
  greeting: {
    morning: "早安",
    noon: "午安",
    afternoon: "下午好",
    evening: "晚上好",
    night: "夜深了",
  },

  // 應用網格
  appGrid: {
    add: "新增",
    confirmDelete: "確定要刪除「{name}」嗎？",
  },

  // 編輯應用對話框
  editApp: {
    addApp: "新增應用",
    editApp: "編輯應用",
    name: "名稱",
    namePlaceholder: "應用名稱",
    url: "連結",
    urlPlaceholder: "https://example.com",
    icon: "圖示",
    iconColor: "圖示顏色",
    addToDock: "新增到 Dock 列",
  },

  // 設定選單
  settingsMenu: {
    general: "一般設定",
    search: "搜尋引擎偏好",
    wallpaper: "桌布偏好",
    sync: "帳號同步",
    helpFeedback: "說明與回饋",
    about: "關於",
  },

  // 一般設定
  generalSettings: {
    title: "一般設定",
    searchPlaceholder: "搜尋設定",

    // 顏色分類
    color: "顏色",
    accentColor: "主題色",
    darkMode: "深色主題",
    darkModeSystem: "跟隨系統",
    darkModeOn: "開啟",
    darkModeOff: "關閉",
    wallpaperVignette: "為桌布套用暗角濾鏡",

    // 通用分類
    general: "通用",
    language: "語言",
    poetry: "「一言」",
    poetryDesc: "聚焦到搜尋列時，在其下方空白處隨機顯示一句格言或詩詞。",
    showFullNote: "完整顯示固定到主螢幕的便箋內容",

    // 時間分類
    time: "時間",
    use24Hour: "24 小時制",
    showSeconds: "顯示秒數",
    blinkSeparator: "閃爍時間分隔符",
    timeFont: "時間字型",
    timeFontSize: "時間字型大小",
    fontNormal: "常規",
    fontMedium: "中等",
    fontSemibold: "半粗",
    fontBold: "粗體",

    // 初始化分類
    initialization: "初始化",
    autoFocusSearch: "小魚起始頁載入時自動聚焦到搜尋列",
    autoShowAppGrid: "小魚起始頁載入時自動顯示二級介面",
    showGreeting: "登入後顯示問候",
    username: "使用者名稱",
    usernamePlaceholder: "設定你的使用者名稱",

    // 控制提示
    extensionControlled: "由擴充功能控制",
    extensionHint: "請前往小魚起始頁擴充功能的設定中更改此選項。",
    hint: "提示",
    ok: "好的",

    // 視效和效能分類
    performance: "視效和效能",
    smoothMode: "流暢模式",
    smoothModeDesc: "調整或關閉大部分視覺特效以提升效能。",
    reduceMotion: "減弱動態效果",
    reduceMotionDesc: "動效顯示不流暢或影響您的滑鼠操作時，可以開啟此項。",
    searchBoxAnimation: "為搜尋列套用伸縮動效",
    overlayBlur: "為遮罩層套用毛玻璃效果",
    overlayBlurDesc: "關閉此項可提升效能。",
    shortcutBlur: "為捷徑套用毛玻璃效果",
    shortcutBlurDesc: "關閉此項可提升效能。",
    wallpaperResolution: "每日桌布解析度",
    resolution1080p: "1080P",
    resolutionOriginal: "原圖",

    // 搜尋分類
    searchSection: "搜尋",
    autoClearSearchBar: "自動清空搜尋列",
    searchHistory: "搜尋歷史記錄",
    tabSwitchBehavior: "在搜尋列按 Tab / Shift + Tab 鍵時，切換到",
    tabSwitchEngine: "清單中的下一個 / 上一個搜尋引擎",
    tabSwitchSuggestion: "搜尋建議",
    tabSwitchRecent: "最近使用的上一個搜尋引擎",
    tabSwitchControl: "介面中的下一個 / 上一個控制項",

    // 導航分類
    navigation: "導航",
    showShortcutDock: "捷徑塢",
    openInNewTab: "在新頁面開啟搜尋結果和網站捷徑",
    showMoreShortcuts: "在每行顯示更多捷徑",
    showMoreShortcutsDesc: "僅在您裝置螢幕的邏輯解析度寬度 ≥ 1280 像素時生效。",

    // 重設
    resetShortcuts: "重設預設捷徑",
    resetShortcutsDesc: "將預設捷徑還原為初始狀態。",
    resetShortcutsTitle: "重設預設捷徑",
    resetShortcutsConfirm: "確定要將捷徑重設為初始狀態嗎？此操作將清除所有自訂捷徑。",

    // 搜尋結果
    noResults: "沒有找到匹配的設定",
  },

  // 搜尋設定
  searchSettings: {
    title: "搜尋引擎偏好",
    selectDefault: "選擇預設搜尋引擎",
    browserDefault: "瀏覽器預設",
    browserDefaultDesc: "使用瀏覽器設定的預設搜尋引擎",
    addCustom: "自訂搜尋引擎",
    addCustomTitle: "新增自訂搜尋引擎",
    editCustomTitle: "編輯自訂搜尋引擎",
    name: "名稱",
    namePlaceholder: "例如：Google",
    url: "URL",
    urlPlaceholder: "https://www.google.com/search?q=%s",
    urlHint: "以 https:// 開頭，用 %s 代替搜尋詞",
    icon: "圖示",
    iconHint: "Iconify 圖示名稱，例如：ri:google-fill",
    fillRequired: "請填寫名稱和 URL",
    urlInvalid: "URL 必須以 https:// 或 http:// 開頭",
    urlMissingPlaceholder: "URL 中必須包含 %s 作為搜尋詞佔位符",
    confirmDelete: "確定要刪除「{name}」嗎？",
  },

  // 桌布設定
  wallpaperSettings: {
    title: "桌布偏好",
    custom: "自訂",
    customTitle: "將您喜愛的圖片或影片設為桌布。",
    customDesc: "支援選擇多張本機圖片，起始頁每次載入時隨機顯示一張。",
    localImage: "本機圖片 / 影片",
    onlineImage: "線上圖片連結",
    aiGenerate: "AI 作圖",
    aiGenerateHint: "使用 Nano Banana AI 生成桌布",
    today: "今日",
    downloadOriginal: "下載原圖",
    imageSource: "圖片來源：必應",
    dynamic: "動態",
    default: "預設",
    onlineImageTitle: "線上圖片連結",
    dailyRandom: "每日隨機",
    dailyRandomDesc: "每天自動更換桌布（從預設和動態桌布中隨機選擇）",
    dailyRandomType: "隨機範圍",
    dailyRandomAll: "全部",
    dailyRandomStatic: "僅靜態桌布",
    dailyRandomDynamic: "僅動態桌布",
    dailyRandomApplied: "已為今日隨機更換桌布",
  },

  // 帳號同步設定
  syncSettings: {
    title: "帳號同步",
    enable: "啟用帳號同步",
    enableDesc: "啟用後，你的設定、應用和桌布將自動同步到你的瀏覽器帳號",
    syncing: "正在同步資料...",
    checkingData: "正在檢查雲端資料...",
    migratingData: "正在遷移本機資料到雲端...",
    enablingSync: "正在啟用同步...",
    chromeEdge: "Chrome/Edge：",
    chromeEdgeDesc: "自動同步到你的 Google 或 Microsoft 帳號",
    firefox: "Firefox：",
    firefoxDesc: "自動同步到你的 Firefox 帳號",
    note: "注意：",
    noteDesc: "需要登入瀏覽器帳號並啟用同步功能",
    limits: "同步限制",
    limitStorage: "同步儲存限制：約 100KB",
    limitItem: "單個項目限制：約 8KB",
    limitExceed: "超出限制將自動切換回本機儲存",
  },

  // 關於
  about: {
    title: "關於",
    appName: "小魚起始頁",
    version: "版本",
    description: "一個簡潔、美觀、可自訂的瀏覽器起始頁。",
    github: "GitHub",
    website: "官網",
    feedback: "回饋",
    builtWith: "使用 Vue 3 + TypeScript + TailwindCSS 構建",
  },

  // 便箋
  notes: {
    title: "便箋",
    newNote: "新便箋",
    noNotes: "暫無便箋",
    selectOrCreate: "選擇或建立一個便箋",
    placeholder: "在此鍵入以建立新的便箋",
    wordCount: "{count} 個字",
    saved: "已儲存",
    saving: "儲存中...",
    fullscreen: "全螢幕",
    exitFullscreen: "退出全螢幕",
    pin: "固定到主螢幕",
    unpin: "取消固定",
    preview: "Markdown 預覽",
    splitView: "分割預覽",
    maxPinned: "最多只能固定 {count} 個便箋",
  },

  // Dock 列
  dock: {
    apps: "應用",
  },
};