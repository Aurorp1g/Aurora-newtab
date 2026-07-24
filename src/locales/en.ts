/*
  * @Description: 英文语言包
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
// English Language Pack
export default {
  // Common
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    reset: "Reset",
    confirm: "Confirm",
    close: "Close",
    search: "Search",
    loading: "Loading...",
    noData: "No data",
  },

  // Search Box
  search: {
    placeholder: "Search",
    clearHistory: "Clear History",
  },

  // Greeting
  greeting: {
    morning: "Good morning",
    noon: "Good noon",
    afternoon: "Good afternoon",
    evening: "Good evening",
    night: "Good night",
  },

  // App Grid
  appGrid: {
    add: "Add",
    confirmDelete: 'Are you sure you want to delete "{name}"?',
  },

  // Edit App Dialog
  editApp: {
    addApp: "Add App",
    editApp: "Edit App",
    name: "Name",
    namePlaceholder: "App name",
    url: "URL",
    urlPlaceholder: "https://example.com",
    icon: "Icon",
    iconColor: "Icon Color",
    addToDock: "Add to Dock",
  },

  // Settings Menu
  settingsMenu: {
    general: "General Settings",
    search: "Search Engine Preferences",
    wallpaper: "Wallpaper Preferences",
    sync: "Account Sync",
    helpFeedback: "Help & Feedback",
    about: "About",
  },

  // General Settings
  generalSettings: {
    title: "General Settings",
    searchPlaceholder: "Search settings",

    // Color Category
    color: "Color",
    accentColor: "Accent Color",
    darkMode: "Dark Mode",
    darkModeSystem: "System",
    darkModeOn: "On",
    darkModeOff: "Off",
    wallpaperVignette: "Apply vignette filter to wallpaper",

    // General Category
    general: "General",
    language: "Language",
    poetry: "Poetry",
    poetryDesc: "Display a random quote or poem below the search bar when focused.",
    showFullNote: "Show full content of pinned notes",

    // Time Category
    time: "Time",
    use24Hour: "24-hour format",
    showSeconds: "Show seconds",
    blinkSeparator: "Blink time separator",
    timeFont: "Time font",
    timeFontSize: "Time font size",
    fontNormal: "Normal",
    fontMedium: "Medium",
    fontSemibold: "Semibold",
    fontBold: "Bold",

    // Initialization Category
    initialization: "Initialization",
    autoFocusSearch: "Auto focus search bar on load",
    autoShowAppGrid: "Auto show app grid on load",
    showGreeting: "Show greeting after login",
    username: "Username",
    usernamePlaceholder: "Set your username",

    // Control Hint
    extensionControlled: "Controlled by extension",
    extensionHint: "Please change this option in the extension settings.",
    hint: "Hint",
    ok: "OK",

    // Performance Category
    performance: "Visual Effects & Performance",
    smoothMode: "Smooth Mode",
    smoothModeDesc: "Adjust or disable most visual effects to improve performance.",
    reduceMotion: "Reduce Motion",
    reduceMotionDesc: "Enable this if animations are choppy or affect your mouse operations.",
    searchBoxAnimation: "Apply stretch animation to search bar",
    overlayBlur: "Apply blur effect to overlay",
    overlayBlurDesc: "Disable to improve performance.",
    shortcutBlur: "Apply blur effect to shortcuts",
    shortcutBlurDesc: "Disable to improve performance.",
    wallpaperResolution: "Daily wallpaper resolution",
    resolution1080p: "1080P",
    resolutionOriginal: "Original",

    // Search Category
    searchSection: "Search",
    autoClearSearchBar: "Auto clear search bar",
    searchHistory: "Search history",
    tabSwitchBehavior: "When pressing Tab / Shift + Tab in search bar, switch to",
    tabSwitchEngine: "Next / previous search engine in list",
    tabSwitchSuggestion: "Search suggestions",
    tabSwitchRecent: "Last used search engine",
    tabSwitchControl: "Next / previous control in interface",

    // Navigation Category
    navigation: "Navigation",
    showShortcutDock: "Shortcut Dock",
    openInNewTab: "Open search results and shortcuts in new tab",
    showMoreShortcuts: "Show more shortcuts per row",
    showMoreShortcutsDesc: "Only effective when screen width ≥ 1280 pixels.",

    // Reset
    resetShortcuts: "Reset Shortcuts",
    resetShortcutsDesc: "Restore shortcuts to initial state.",
    resetShortcutsTitle: "Reset Shortcuts",
    resetShortcutsConfirm: "Are you sure you want to reset shortcuts? This will clear all custom shortcuts.",

    // Search Results
    noResults: "No matching settings found",
  },

  // Search Settings
  searchSettings: {
    title: "Search Engine Preferences",
    selectDefault: "Select default search engine",
    browserDefault: "Browser Default",
    browserDefaultDesc: "Use your browser's default search engine",
    addCustom: "Custom Search Engine",
    addCustomTitle: "Add Custom Search Engine",
    editCustomTitle: "Edit Custom Search Engine",
    name: "Name",
    namePlaceholder: "e.g., Google",
    url: "URL",
    urlPlaceholder: "https://www.google.com/search?q=%s",
    urlHint: "Start with https://, use %s as search term placeholder",
    icon: "Icon",
    iconHint: "Iconify icon name, e.g., ri:google-fill",
    fillRequired: "Please fill in name and URL",
    urlInvalid: "URL must start with https:// or http://",
    urlMissingPlaceholder: "URL must contain %s as search term placeholder",
    confirmDelete: 'Are you sure you want to delete "{name}"?',
  },

  // Wallpaper Settings
  wallpaperSettings: {
    title: "Wallpaper Preferences",
    custom: "Custom",
    customTitle: "Set your favorite image or video as wallpaper.",
    customDesc: "Support multiple local images, randomly display one each time the start page loads.",
    localImage: "Local Image / Video",
    onlineImage: "Online Image URL",
    aiGenerate: "AI Generate",
    aiGenerateHint: "Generate wallpaper with Nano Banana AI",
    today: "Today",
    downloadOriginal: "Download Original",
    imageSource: "Source: Bing",
    dynamic: "Dynamic",
    default: "Default",
    onlineImageTitle: "Online Image URL",
  },

  // Sync Settings
  syncSettings: {
    title: "Account Sync",
    enable: "Enable Account Sync",
    enableDesc: "When enabled, your settings, apps, and wallpaper will sync to your browser account",
    syncing: "Syncing data...",
    checkingData: "Checking cloud data...",
    migratingData: "Migrating local data to cloud...",
    enablingSync: "Enabling sync...",
    chromeEdge: "Chrome/Edge:",
    chromeEdgeDesc: "Auto sync to your Google or Microsoft account",
    firefox: "Firefox:",
    firefoxDesc: "Auto sync to your Firefox account",
    note: "Note:",
    noteDesc: "Requires browser account login and sync enabled",
    limits: "Sync Limits",
    limitStorage: "Sync storage limit: ~100KB",
    limitItem: "Single item limit: ~8KB",
    limitExceed: "Will auto switch to local storage if exceeded",
  },

  // About
  about: {
    title: "About",
    appName: "Aurora New Tab",
    version: "Version",
    description: "A clean, beautiful, and customizable browser start page.",
    github: "GitHub",
    website: "Website",
    feedback: "Feedback",
    builtWith: "Built with Vue 3 + TypeScript + TailwindCSS",
  },

  // Notes
  notes: {
    title: "Notes",
    newNote: "New Note",
    noNotes: "No notes yet",
    selectOrCreate: "Select or create a note",
    placeholder: "Type here to create a new note",
    wordCount: "{count} characters",
    saved: "Saved",
    saving: "Saving...",
    fullscreen: "Fullscreen",
    exitFullscreen: "Exit Fullscreen",
    pin: "Pin to Home",
    unpin: "Unpin",
    preview: "Markdown Preview",
    splitView: "Split View",
    maxPinned: "Maximum {count} notes can be pinned",
  },

  // Dock Bar
  dock: {
    apps: "Apps",
  },
};