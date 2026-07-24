<!--
  * @Description: 同步设置面板，支持 Chrome 账号数据同步
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";
import { migrateLocalToSync, hasSyncData } from "@/utils/storage";
import SettingsDialog from "./SettingsDialog.vue";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const settingsStore = useSettingsStore();
const enableSync = ref(false);
const isSyncing = ref(false);
const syncStatus = ref("");

onMounted(() => {
  enableSync.value = settingsStore.settings.enableSync ?? false;
});

async function handleToggleSync() {
  enableSync.value = !enableSync.value;

  if (enableSync.value) {
    isSyncing.value = true;
    syncStatus.value = t("syncSettings.checkingData");

    try {
      // 检查 sync storage 中是否已有数据
      const hasExistingData = await hasSyncData();

      if (!hasExistingData) {
        // 如果 sync storage 为空，先迁移本地数据
        syncStatus.value = t("syncSettings.migratingData");
        await migrateLocalToSync();
      }

      // 启用同步
      syncStatus.value = t("syncSettings.enablingSync");
      await settingsStore.updateSettings({ enableSync: true });

      await new Promise(resolve => setTimeout(resolve, 500));
      window.location.reload();
    } catch (error) {
      console.error("启用同步失败:", error);
      enableSync.value = false;
      syncStatus.value = "";
    } finally {
      isSyncing.value = false;
    }
  } else {
    await settingsStore.updateSettings({ enableSync: false });
  }
}
</script>

<template>
  <SettingsDialog :title="t('syncSettings.title')" :show-large-title="true" :show-search="false" @close="emit('close')">
    <div class="space-y-6">
      <!-- 同步开关 -->
      <div class="setting-item">
        <div class="setting-item-label">
          <div class="font-medium label-text">{{ t("syncSettings.enable") }}</div>
          <div class="label-description">{{ t("syncSettings.enableDesc") }}</div>
        </div>
        <button
          class="toggle-switch"
          :class="{ 'toggle-on': enableSync }"
          :disabled="isSyncing"
          @click="handleToggleSync"
        >
          <span class="toggle-knob" />
        </button>
      </div>

      <!-- 同步状态提示 -->
      <div v-if="isSyncing" class="info-box info-box-accent">
        <div class="flex items-center gap-3">
          <Icon icon="ri:loader-4-line" class="w-5 h-5 animate-spin text-accent" />
          <span class="text-sm text-accent">{{ syncStatus || t("syncSettings.syncing") }}</span>
        </div>
      </div>

      <!-- 同步说明 -->
      <div class="info-box">
        <div class="flex items-start gap-3">
          <Icon icon="ri:information-line" class="w-5 h-5 flex-shrink-0 mt-0.5 text-muted" />
          <div class="flex-1 space-y-2 text-sm text-secondary">
            <p>
              <strong class="text-primary">{{ t("syncSettings.chromeEdge") }}</strong>
              {{ t("syncSettings.chromeEdgeDesc") }}
            </p>
            <p>
              <strong class="text-primary">{{ t("syncSettings.firefox") }}</strong>
              {{ t("syncSettings.firefoxDesc") }}
            </p>
            <p>
              <strong class="text-primary">{{ t("syncSettings.note") }}</strong>
              {{ t("syncSettings.noteDesc") }}
            </p>
          </div>
        </div>
      </div>

      <!-- 数据限制说明 -->
      <div class="p-4 space-y-2 border rounded-xl border-color">
        <h3 class="text-sm font-medium text-primary">{{ t("syncSettings.limits") }}</h3>
        <ul class="space-y-1 text-sm list-disc list-inside text-secondary">
          <li>{{ t("syncSettings.limitStorage") }}</li>
          <li>{{ t("syncSettings.limitItem") }}</li>
          <li>{{ t("syncSettings.limitExceed") }}</li>
        </ul>
      </div>
    </div>
  </SettingsDialog>
</template>

<style scoped>
@import "./settings-form.css";
</style>