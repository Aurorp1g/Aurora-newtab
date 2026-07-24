<!--
  * @Description: 关于面板，展示应用信息、版本号和相关链接
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import SettingsDialog from "./SettingsDialog.vue";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const version = "1.0.0";
const links = computed(() => [
  { label: t("about.github"), icon: "ri:github-fill", url: "https://github.com" },
  { label: t("about.website"), icon: "ri:global-line", url: "https://Aurorp1g.github.io" },
  { label: t("about.feedback"), icon: "ri:feedback-line", url: "https://github.com" },
]);
</script>

<template>
  <SettingsDialog :title="t('about.title')" :show-large-title="false" :show-search="false" @close="emit('close')">
    <div class="text-center">
      <!-- Logo -->
      <div class="flex items-center justify-center w-20 h-20 mx-auto mb-4 shadow-lg rounded-2xl logo-bg">
        <img src="/icons/favicon.ico" alt="logo" class="w-12 h-12" />
      </div>

      <!-- App name -->
      <h2 class="mb-1 text-xl font-semibold text-primary">{{ t("about.appName") }}</h2>
      <p class="mb-4 text-sm text-muted">{{ t("about.version") }} {{ version }}</p>

      <!-- Description -->
      <p class="mb-6 text-sm text-secondary">{{ t("about.description") }}</p>

      <!-- Links -->
      <div class="flex justify-center gap-6 mb-6">
        <a
          v-for="link in links"
          :key="link.label"
          :href="link.url"
          target="_blank"
          class="flex flex-col items-center gap-1 transition-colors text-muted hover:text-accent"
        >
          <Icon :icon="link.icon" class="w-6 h-6" />
          <span class="text-xs">{{ link.label }}</span>
        </a>
      </div>

      <!-- Tech stack -->
      <div class="mb-4 text-xs text-muted">{{ t("about.builtWith") }}</div>

      <!-- Copyright -->
      <p class="text-xs text-muted">© {{ new Date().getFullYear() }} Aurorp1g. All rights reserved.</p>
    </div>
  </SettingsDialog>
</template>

<style scoped>
@import "./settings-form.css";

.logo-bg {
  background: var(--color-accent);
}

.hover\:text-accent:hover {
  color: rgb(var(--color-accent));
}
</style>