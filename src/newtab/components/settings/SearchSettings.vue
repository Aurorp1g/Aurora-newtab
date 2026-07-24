<!--
  * @Description: 搜索设置面板，包含搜索引擎选择、自定义引擎管理
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useSearchStore } from "@/stores/search";
import SettingsDialog from "./SettingsDialog.vue";
import type { SearchEngine } from "@/types";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const searchStore = useSearchStore();

// 自定义搜索引擎对话框状态
const showCustomEngineDialog = ref(false);
const editingEngine = ref<SearchEngine | null>(null);
const customEngineName = ref("");
const customEngineUrl = ref("");
const customEngineIcon = ref("ri:search-line");

// 打开添加自定义引擎对话框
function openAddCustomEngine() {
  editingEngine.value = null;
  customEngineName.value = "";
  customEngineUrl.value = "";
  customEngineIcon.value = "ri:search-line";
  showCustomEngineDialog.value = true;
}

// 打开编辑自定义引擎对话框
function openEditCustomEngine(engine: SearchEngine) {
  editingEngine.value = engine;
  customEngineName.value = engine.name;
  customEngineUrl.value = engine.url;
  customEngineIcon.value = engine.icon;
  showCustomEngineDialog.value = true;
}

// 保存自定义引擎
function saveCustomEngine() {
  const name = customEngineName.value.trim();
  const url = customEngineUrl.value.trim();

  if (!name || !url) {
    alert(t("searchSettings.fillRequired"));
    return;
  }

  // 验证 URL 格式
  if (!url.startsWith("https://") && !url.startsWith("http://")) {
    alert(t("searchSettings.urlInvalid"));
    return;
  }

  // 验证 URL 中是否包含 %s
  if (!url.includes("%s")) {
    alert(t("searchSettings.urlMissingPlaceholder"));
    return;
  }

  if (editingEngine.value) {
    // 编辑现有引擎
    searchStore.updateCustomEngine(editingEngine.value.id, {
      name,
      url,
      icon: customEngineIcon.value,
      placeholder: `在 ${name} 中搜索`,
    });
  } else {
    // 添加新引擎
    searchStore.addCustomEngine({
      name,
      url,
      icon: customEngineIcon.value,
      placeholder: `在 ${name} 中搜索`,
    });
  }

  closeCustomEngineDialog();
}

// 删除自定义引擎
function deleteCustomEngine(engine: SearchEngine) {
  if (confirm(t("searchSettings.confirmDelete", { name: engine.name }))) {
    searchStore.deleteCustomEngine(engine.id);
  }
}

// 关闭对话框
function closeCustomEngineDialog() {
  showCustomEngineDialog.value = false;
  editingEngine.value = null;
  customEngineName.value = "";
  customEngineUrl.value = "";
  customEngineIcon.value = "ri:search-line";
}
</script>

<template>
  <SettingsDialog
    :title="t('searchSettings.title')"
    :show-large-title="true"
    :show-search="false"
    @close="emit('close')"
  >
    <div class="space-y-2">
      <p class="mb-4 section-description">{{ t("searchSettings.selectDefault") }}</p>

      <button
        v-for="engine in searchStore.engines"
        :key="engine.id"
        class="w-full selection-card group"
        :class="{ 'selection-card-active': searchStore.currentEngine.id === engine.id }"
        @click="searchStore.setEngine(engine.id)"
      >
        <div
          class="flex items-center justify-center w-10 h-10 rounded-lg"
          :class="searchStore.currentEngine.id === engine.id ? 'bg-accent-light' : 'icon-bg'"
        >
          <Icon :icon="engine.icon" class="w-5 h-5 text-secondary" />
        </div>
        <div class="flex-1 text-left">
          <p class="font-medium text-secondary">
            {{ engine.isDefault ? t("searchSettings.browserDefault") : engine.name }}
          </p>
          <p class="text-xs truncate text-muted">
            {{ engine.isDefault ? t("searchSettings.browserDefaultDesc") : engine.url }}
          </p>
        </div>
        <div class="flex items-center gap-2">
          <!-- 编辑按钮（仅自定义引擎） -->
          <button
            v-if="engine.isCustom"
            class="opacity-0 custom-action-btn group-hover:opacity-100"
            :title="t('common.edit')"
            @click.stop="openEditCustomEngine(engine)"
          >
            <Icon icon="ri:edit-line" class="w-4 h-4" />
          </button>
          <!-- 删除按钮（仅自定义引擎） -->
          <button
            v-if="engine.isCustom"
            class="opacity-0 custom-action-btn custom-action-btn-danger group-hover:opacity-100"
            :title="t('common.delete')"
            @click.stop="deleteCustomEngine(engine)"
          >
            <Icon icon="ri:delete-bin-line" class="w-4 h-4" />
          </button>
          <!-- 选中标记 -->
          <Icon v-if="searchStore.currentEngine.id === engine.id" icon="ri:check-line" class="w-5 h-5 text-accent" />
        </div>
      </button>

      <!-- 添加自定义搜索引擎按钮 -->
      <button class="w-full add-custom-btn" @click="openAddCustomEngine">
        <Icon icon="ri:add-line" class="w-5 h-5" />
        <span>{{ t("searchSettings.addCustom") }}</span>
      </button>
    </div>

    <!-- 自定义搜索引擎对话框 -->
    <Teleport to="body">
      <Transition name="dialog-fade">
        <div
          v-if="showCustomEngineDialog"
          class="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          @click.self="closeCustomEngineDialog"
        >
          <div class="w-full max-w-md p-6 shadow-2xl dialog-bg rounded-2xl animate-scale-in" @click.stop>
            <h2 class="mb-4 text-xl font-semibold text-primary">
              {{ editingEngine ? t("searchSettings.editCustomTitle") : t("searchSettings.addCustomTitle") }}
            </h2>

            <form class="space-y-4" @submit.prevent="saveCustomEngine">
              <!-- 名称 -->
              <div>
                <label class="block mb-1 text-sm font-medium text-secondary">{{ t("searchSettings.name") }}</label>
                <input
                  v-model="customEngineName"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg input-bg border-color focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
                  :placeholder="t('searchSettings.namePlaceholder')"
                  required
                />
              </div>

              <!-- URL -->
              <div>
                <label class="block mb-1 text-sm font-medium text-secondary">{{ t("searchSettings.url") }}</label>
                <input
                  v-model="customEngineUrl"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg input-bg border-color focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
                  :placeholder="t('searchSettings.urlPlaceholder')"
                  required
                />
                <p class="mt-1 text-xs text-muted">{{ t("searchSettings.urlHint") }}</p>
              </div>

              <!-- 图标 -->
              <div>
                <label class="block mb-1 text-sm font-medium text-secondary">{{ t("searchSettings.icon") }}</label>
                <input
                  v-model="customEngineIcon"
                  type="text"
                  class="w-full px-4 py-2 border rounded-lg input-bg border-color focus:ring-2 focus:ring-accent focus:border-transparent text-primary"
                  placeholder="ri:search-line"
                />
                <p class="mt-1 text-xs text-muted">
                  <a href="https://icon-sets.iconify.design/" target="_blank" class="form-link">Iconify</a>
                  {{ t("searchSettings.iconHint") }}
                </p>
              </div>

              <!-- 操作按钮 -->
              <div class="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  class="px-4 py-2 transition-colors text-secondary hover:text-primary"
                  @click="closeCustomEngineDialog"
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
      </Transition>
    </Teleport>
  </SettingsDialog>
</template>

<style scoped>
@import "./settings-form.css";

.bg-accent-light {
  background-color: rgb(var(--color-accent) / 0.1);
}

.icon-bg {
  background-color: rgb(var(--color-border) / 0.3);
}

/* 自定义操作按钮 */
.custom-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.375rem;
  border-radius: 0.5rem;
  color: rgb(var(--color-text-secondary));
  transition: all 0.2s ease;
}

.custom-action-btn:hover {
  background-color: rgb(var(--color-border) / 0.2);
  color: rgb(var(--color-text-primary));
}

.custom-action-btn-danger:hover {
  background-color: rgb(239 68 68 / 0.1);
  color: rgb(239 68 68);
}

/* 添加自定义按钮 */
.add-custom-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.875rem 1rem;
  margin-top: 0.5rem;
  border: 2px dashed rgb(var(--color-border));
  border-radius: 0.75rem;
  color: rgb(var(--color-text-secondary));
  font-size: 0.875rem;
  font-weight: 500;
  transition: all 0.2s ease;
}

.add-custom-btn:hover {
  border-color: rgb(var(--color-accent));
  background-color: rgb(var(--color-accent) / 0.05);
  color: rgb(var(--color-accent));
}

/* 二级弹窗样式 - 与 EditAppDialog 保持一致 */
.dialog-bg {
  background: rgb(var(--dropdown-bg));
}

.text-primary {
  color: rgb(var(--color-text));
}

.text-secondary {
  color: rgb(var(--color-text-secondary));
}

.text-muted {
  color: rgb(var(--color-text-muted));
}

.input-bg {
  background: rgb(var(--color-bg));
}

.border-color {
  border-color: rgb(var(--color-border));
}

.focus\:ring-accent:focus {
  --tw-ring-color: rgb(var(--color-accent));
}

.btn-accent {
  background-color: rgb(var(--color-accent));
}

.btn-accent:hover {
  background-color: rgb(var(--color-accent-hover));
}

/* 表单链接 */
.form-link {
  color: rgb(var(--color-accent));
  text-decoration: underline;
  transition: opacity 0.2s ease;
}

.form-link:hover {
  opacity: 0.8;
}

/* 对话框动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
</style>