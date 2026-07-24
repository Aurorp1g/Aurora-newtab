<!--
  * @Description: 编辑应用对话框组件，用于添加和编辑应用信息
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, watch } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import type { AppItem } from "@/types";

const { t } = useI18n();

const props = defineProps<{
  app: AppItem;
  isNew: boolean;
}>();

const emit = defineEmits<{
  (e: "save", app: AppItem): void;
  (e: "close"): void;
}>();

const form = ref<AppItem>({ ...props.app });

watch(
  () => props.app,
  newApp => {
    form.value = { ...newApp };
  },
  { immediate: true }
);

// Common Remix icons for quick selection
const commonIcons = [
  "ri:home-line",
  "ri:search-line",
  "ri:settings-3-line",
  "ri:user-line",
  "ri:heart-line",
  "ri:star-line",
  "ri:bookmark-line",
  "ri:folder-line",
  "ri:file-line",
  "ri:image-line",
  "ri:video-line",
  "ri:music-line",
  "ri:mail-line",
  "ri:message-line",
  "ri:notification-line",
  "ri:calendar-line",
  "ri:time-line",
  "ri:map-pin-line",
  "ri:shopping-cart-line",
  "ri:wallet-line",
  "ri:bank-card-line",
  "ri:gift-line",
  "ri:trophy-line",
  "ri:gamepad-line",
  "ri:code-line",
  "ri:terminal-line",
  "ri:github-fill",
  "ri:twitter-x-line",
  "ri:instagram-line",
  "ri:youtube-line",
  "ri:bilibili-line",
  "ri:netease-cloud-music-line",
  "ri:spotify-line",
  "ri:apple-fill",
  "ri:google-fill",
  "ri:microsoft-fill",
  "ri:amazon-fill",
  "ri:facebook-circle-fill",
  "ri:linkedin-fill",
  "ri:discord-fill",
  "ri:telegram-fill",
  "ri:whatsapp-line",
  "ri:wechat-line",
  "ri:qq-line",
  "ri:weibo-line",
  "ri:zhihu-line",
  "ri:douban-line",
  "ri:dribbble-line",
  "ri:behance-line",
];

// Common colors
const commonColors = [
  "#333333",
  "#666666",
  "#999999",
  "#e91e63",
  "#9c27b0",
  "#673ab7",
  "#3f51b5",
  "#2196f3",
  "#03a9f4",
  "#00bcd4",
  "#009688",
  "#4caf50",
  "#8bc34a",
  "#cddc39",
  "#ffeb3b",
  "#ffc107",
  "#ff9800",
  "#ff5722",
  "#795548",
];

function handleSubmit() {
  if (!form.value.name || !form.value.url) {
    return;
  }
  emit("save", form.value);
}

function selectIcon(icon: string) {
  form.value.icon = icon;
}

function selectColor(color: string) {
  form.value.iconColor = color;
}
</script>

<template>
  <div class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" @click.self="emit('close')">
    <div class="w-full max-w-md p-6 shadow-2xl dialog-bg rounded-2xl animate-scale-in" @click.stop>
      <h2 class="mb-4 text-xl font-semibold text-primary">
        {{ isNew ? t("editApp.addApp") : t("editApp.editApp") }}
      </h2>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Name -->
        <div>
          <label class="block mb-1 text-sm font-medium text-secondary">{{ t("editApp.name") }}</label>
          <input
            v-model="form.name"
            type="text"
            class="w-full px-4 py-2 border rounded-lg input-bg border-color focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
            :placeholder="t('editApp.namePlaceholder')"
            required
          />
        </div>

        <!-- URL -->
        <div>
          <label class="block mb-1 text-sm font-medium text-secondary">{{ t("editApp.url") }}</label>
          <input
            v-model="form.url"
            type="url"
            class="w-full px-4 py-2 border rounded-lg input-bg border-color focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
            :placeholder="t('editApp.urlPlaceholder')"
            required
          />
        </div>

        <!-- Icon selection -->
        <div>
          <label class="block mb-1 text-sm font-medium text-secondary">{{ t("editApp.icon") }}</label>
          <div class="flex items-center gap-2 mb-2">
            <div
              class="flex items-center justify-center w-12 h-12 rounded-xl"
              :style="{ backgroundColor: form.backgroundColor }"
            >
              <Icon :icon="form.icon" class="w-6 h-6" :style="{ color: form.iconColor }" />
            </div>
            <input
              v-model="form.icon"
              type="text"
              class="flex-1 px-4 py-2 text-sm border rounded-lg input-bg border-color focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
              placeholder="ri:home-line"
            />
          </div>
          <div class="icon-grid-wrapper">
            <div class="icon-grid">
              <button
                v-for="icon in commonIcons"
                :key="icon"
                type="button"
                class="icon-btn"
                :class="{ 'icon-btn-selected': form.icon === icon }"
                @click="selectIcon(icon)"
              >
                <Icon :icon="icon" class="w-5 h-5 text-secondary" />
              </button>
            </div>
          </div>
        </div>

        <!-- Icon color -->
        <div>
          <label class="block mb-1 text-sm font-medium text-secondary">{{ t("editApp.iconColor") }}</label>
          <div class="flex flex-wrap gap-1">
            <button
              v-for="color in commonColors"
              :key="color"
              type="button"
              class="w-6 h-6 transition-all border-2 rounded-full"
              :class="form.iconColor === color ? 'border-primary scale-110' : 'border-transparent'"
              :style="{ backgroundColor: color }"
              @click="selectColor(color)"
            />
          </div>
        </div>

        <!-- Add to dock -->
        <div class="flex items-center gap-2">
          <input id="isInDock" v-model="form.isInDock" type="checkbox" class="w-4 h-4 rounded checkbox-accent" />
          <label for="isInDock" class="text-sm text-secondary">{{ t("editApp.addToDock") }}</label>
        </div>

        <!-- Actions -->
        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            class="px-4 py-2 transition-colors text-secondary hover:text-primary"
            @click="emit('close')"
          >
            {{ t("common.cancel") }}
          </button>
          <button type="submit" class="px-6 py-2 text-white transition-colors rounded-lg btn-accent">
            {{ t("common.save") }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.dialog-bg {
  background: rgb(var(--dropdown-bg));
}

.text-primary {
  color: rgb(var(--color-text));
}

.text-secondary {
  color: rgb(var(--color-text-secondary));
}

.input-bg {
  background: rgb(var(--color-bg));
}

.border-color {
  border-color: rgb(var(--color-border));
}

.border-primary {
  border-color: rgb(var(--color-text));
}

.focus\:ring-accent:focus {
  --tw-ring-color: rgb(var(--color-accent));
}

.hover-bg:hover {
  background-color: var(--hover-bg);
}

.bg-accent-light {
  background-color: rgb(var(--color-accent-light));
}

.ring-accent {
  --tw-ring-color: rgb(var(--color-accent));
}

.checkbox-accent {
  color: rgb(var(--color-accent));
}

.checkbox-accent:focus {
  --tw-ring-color: rgb(var(--color-accent));
}

.btn-accent {
  background-color: rgb(var(--color-accent));
}

.btn-accent:hover {
  background-color: rgb(var(--color-accent-hover));
}

/* 图标网格容器 */
.icon-grid-wrapper {
  max-height: 120px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 4px;
  margin: -4px;
  scrollbar-width: thin;
  scrollbar-color: rgb(var(--color-border)) transparent;
}

.icon-grid-wrapper::-webkit-scrollbar {
  width: 4px;
}

.icon-grid-wrapper::-webkit-scrollbar-track {
  background: transparent;
}

.icon-grid-wrapper::-webkit-scrollbar-thumb {
  background: rgb(var(--color-border));
  border-radius: 2px;
}

/* 自适应图标网格 */
.icon-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(32px, 1fr));
  gap: 4px;
}

/* 图标按钮 */
.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  transition: background-color 0.15s ease;
}

.icon-btn:hover {
  background-color: var(--hover-bg);
}

.icon-btn-selected {
  background-color: rgb(var(--color-accent-light));
  box-shadow: 0 0 0 2px rgb(var(--color-accent));
}
</style>