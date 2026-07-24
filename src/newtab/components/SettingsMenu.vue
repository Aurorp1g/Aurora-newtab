<!--
  * @Description: 设置菜单组件，提供通用、搜索、壁纸、同步、关于等设置入口
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, computed, defineAsyncComponent } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";

// 懒加载设置组件，减小初始包体积
const GeneralSettings = defineAsyncComponent(() => import("./settings/GeneralSettings.vue"));
const SearchSettings = defineAsyncComponent(() => import("./settings/SearchSettings.vue"));
const WallpaperSettings = defineAsyncComponent(() => import("./settings/WallpaperSettings.vue"));
const SyncSettings = defineAsyncComponent(() => import("./settings/SyncSettings.vue"));
const AboutDialog = defineAsyncComponent(() => import("./settings/AboutDialog.vue"));

const { t } = useI18n();
const showMenu = ref(false);
const currentDialog = ref<string | null>(null);

interface MenuItem {
  id: string;
  labelKey: string;
  icon: string;
  external?: string;
  divider?: boolean;
}

const menuItemsConfig: MenuItem[] = [
  { id: "general", labelKey: "settingsMenu.general", icon: "ri:settings-3-line" },
  { id: "search", labelKey: "settingsMenu.search", icon: "ri:search-line" },
  { id: "wallpaper", labelKey: "settingsMenu.wallpaper", icon: "ri:image-line" },
  { id: "sync", labelKey: "settingsMenu.sync", icon: "ri:cloud-line" },
  { id: "divider1", labelKey: "", icon: "", divider: true },
  { id: "help", labelKey: "settingsMenu.helpFeedback", icon: "ri:question-line", external: "https://github.com" },
  { id: "about", labelKey: "settingsMenu.about", icon: "ri:information-line" },
];

const menuItems = computed(() =>
  menuItemsConfig.map(item => ({
    ...item,
    label: item.labelKey ? t(item.labelKey) : "",
  }))
);

function handleMenuClick(item: { id: string; external?: string; divider?: boolean }) {
  if (item.divider) return;

  if (item.external) {
    window.open(item.external, "_blank");
  } else {
    currentDialog.value = item.id;
  }
  showMenu.value = false;
}

function closeDialog() {
  currentDialog.value = null;
}

function toggleMenu() {
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  showMenu.value = false;
}
</script>

<template>
  <div class="relative">
    <!-- Top buttons -->
    <div class="flex items-center gap-2">
      <button
        :class="[
          'flex items-center justify-center transition-all duration-300 rounded-full shadow-sm w-9 h-9 settings-button backdrop-blur-md',
          { active: showMenu },
        ]"
        @click="toggleMenu"
      >
        <Icon icon="ri:settings-3-line" :class="['settings-icon w-[22px] h-[22px]', { active: showMenu }]" />
      </button>
    </div>

    <!-- Dropdown menu -->
    <Transition name="menu-expand">
      <div v-if="showMenu" class="absolute right-0 z-50 mt-2 settings-menu w-44 top-full" @mouseleave="closeMenu">
        <div class="px-2 py-2">
          <template v-for="item in menuItems" :key="item.id">
            <div v-if="item.divider" class="h-px mx-2 my-2 divider-bg" />
            <button
              v-else
              class="flex items-center w-full gap-3 px-3 py-2 text-left settings-item text-secondary"
              @click="handleMenuClick(item)"
            >
              <Icon :icon="item.icon" class="w-[18px] h-[18px] text-muted" />
              <span class="text-[14px]">{{ item.label }}</span>
            </button>
          </template>
        </div>
      </div>
    </Transition>

    <!-- Dialogs -->
    <GeneralSettings v-if="currentDialog === 'general'" @close="closeDialog" />
    <SearchSettings v-if="currentDialog === 'search'" @close="closeDialog" />
    <WallpaperSettings v-if="currentDialog === 'wallpaper'" @close="closeDialog" />
    <SyncSettings v-if="currentDialog === 'sync'" @close="closeDialog" />
    <AboutDialog v-if="currentDialog === 'about'" @close="closeDialog" />
  </div>
</template>

<style scoped>
.text-muted {
  color: rgb(var(--color-text-muted));
}

.text-secondary {
  color: rgb(var(--color-text-secondary));
}

.button-bg {
  background: var(--button-bg);
}

.hover\:button-bg-solid:hover {
  background: rgb(var(--dropdown-bg));
}

.divider-bg {
  background-color: rgb(var(--color-border) / 0.5);
}

/* 设置按钮样式 */
.settings-button {
  transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.settings-button:hover,
.settings-button.active {
  background: rgba(255, 255, 255, 0.15);
}

/* 设置图标样式 */
.settings-icon {
  color: rgba(255, 255, 255, 0.65);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Hover 时的效果：图标颜色、缩放和旋转 */
.settings-button:hover .settings-icon,
.settings-icon.active {
  color: rgba(255, 255, 255, 1);
  transform: rotate(90deg) scale(1.05);
}

/* 菜单从设置按钮下方展开的动画 */
.settings-menu {
  /* 按钮宽度36px，中心在18px；从菜单顶部中心位置展开 */
  transform-origin: calc(100% - 18px) 0;
  /* GPU 加速优化 */
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

.menu-expand-enter-active {
  transition: opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1), transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.menu-expand-leave-active {
  transition: opacity 0.15s cubic-bezier(0.4, 0, 1, 1), transform 0.15s cubic-bezier(0.4, 0, 1, 1);
}

.menu-expand-enter-from {
  opacity: 0;
  transform: scale(0.8);
}

.menu-expand-enter-to {
  opacity: 1;
  transform: scale(1);
}

.menu-expand-leave-from {
  opacity: 1;
  transform: scale(1);
}

.menu-expand-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>