<!--
  * @Description: 便笺对话框组件，提供 Markdown 编辑和预览功能
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useNotesStore } from "@/stores/notes";
import { useSettingsStore } from "@/stores/settings";
const { t } = useI18n();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const notesStore = useNotesStore();
const settingsStore = useSettingsStore();

// 编辑器内容
const editorContent = ref("");
// Markdown 预览模式
const showPreview = ref(false);
// 分屏模式
const showSplitView = ref(true);
// 全屏模式
const isFullscreen = ref(false);
// 保存状态
const saveStatus = ref<"saved" | "saving" | "idle">("idle");
// 保存防抖定时器
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
// marked 模块（延迟加载）
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let markedModule: any = null;

// 动态加载 marked 库（仅在需要预览时加载）
async function parseMarkdown(content: string): Promise<string> {
  if (!markedModule) {
    markedModule = await import("marked");
  }
  return markedModule.marked(content) as string;
}

// 当前选中便笺的字数
const wordCount = computed(() => {
  return editorContent.value.length;
});

// 渲染后的 Markdown HTML（异步加载 marked 库）
const markdownHtml = ref("");

// 监听编辑器内容和预览模式变化，异步渲染 Markdown
watch(
  [() => editorContent.value, () => showPreview.value],
  async ([content, preview]) => {
    if (!content || !preview) {
      markdownHtml.value = "";
      return;
    }
    try {
      markdownHtml.value = await parseMarkdown(content);
    } catch (error) {
      console.error("Failed to render markdown:", error);
      markdownHtml.value = content;
    }
  },
  { immediate: true }
);

// 监听选中便笺变化，更新编辑器内容
watch(
  () => notesStore.selectedNote,
  note => {
    if (note) {
      editorContent.value = note.content;
      saveStatus.value = "saved";
    } else {
      editorContent.value = "";
      saveStatus.value = "idle";
    }
  },
  { immediate: true }
);

// 监听编辑器内容变化，自动保存
watch(editorContent, newContent => {
  if (!notesStore.selectedNoteId) return;

  // 清除之前的定时器
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveStatus.value = "saving";

  // 防抖保存
  saveTimeout = setTimeout(async () => {
    await notesStore.updateNote(notesStore.selectedNoteId!, newContent);
    saveStatus.value = "saved";
  }, 500);
});

// 初始化
onMounted(async () => {
  await notesStore.init();
  // 如果有便笺，默认选中第一个
  if (notesStore.sortedNotes.length > 0 && !notesStore.selectedNoteId) {
    notesStore.selectNote(notesStore.sortedNotes[0].id);
  }
});

// 新建便笺
async function handleNewNote() {
  const note = await notesStore.addNote("");
  notesStore.selectNote(note.id);
  showPreview.value = false;
  await nextTick();
  // 聚焦到编辑器
  const textarea = document.querySelector(".note-editor") as HTMLTextAreaElement;
  textarea?.focus();
}

// 选中便笺
function handleSelectNote(id: string) {
  notesStore.selectNote(id);
  showPreview.value = false;
}

// 删除便笺
async function handleDelete() {
  if (!notesStore.selectedNoteId) return;

  const currentIndex = notesStore.sortedNotes.findIndex(n => n.id === notesStore.selectedNoteId);
  await notesStore.deleteNote(notesStore.selectedNoteId);

  // 选中下一个或上一个便笺
  if (notesStore.sortedNotes.length > 0) {
    const newIndex = Math.min(currentIndex, notesStore.sortedNotes.length - 1);
    notesStore.selectNote(notesStore.sortedNotes[newIndex].id);
  }
}

// 切换固定状态
async function handleTogglePin() {
  if (!notesStore.selectedNoteId) return;
  const success = await notesStore.togglePin(notesStore.selectedNoteId);
  if (!success) {
    // 可以显示提示：已达到固定上限
    console.warn(`最多只能固定 ${notesStore.MAX_PINNED_NOTES} 个便笺`);
  }
}

// 切换预览模式
function handleTogglePreview() {
  showPreview.value = !showPreview.value;
}

// 切换分屏模式
function handleToggleSplitView() {
  showSplitView.value = !showSplitView.value;
}

// 切换全屏模式
function handleToggleFullscreen() {
  isFullscreen.value = !isFullscreen.value;
}

// 点击背景关闭弹窗
function handleBackdropClick(e: MouseEvent) {
  if (e.target === e.currentTarget) {
    emit("close");
  }
}
</script>

<template>
  <div
    class="fixed inset-0 z-50 flex dialog-backdrop dialog-perspective"
    :class="{ 'items-center justify-center': !isFullscreen }"
    @click.stop="handleBackdropClick"
  >
    <div
      class="relative w-full h-full shadow-2xl dialog-bg sm:rounded-2xl overflow-hidden flex flex-col dialog-card sm:w-[800px] sm:h-[550px]"
      :class="{
        'no-tilt': settingsStore.settings.reduceMotion,
        'dialog-fullscreen': isFullscreen,
      }"
      @click.stop
    >
      <!-- Header -->
      <div class="relative flex items-center justify-between h-12 px-5 border-b shrink-0 border-color">
        <h2 class="text-base font-semibold text-primary">{{ t("notes.title") }}</h2>
        <div class="flex items-center gap-2">
          <!-- 全屏按钮 -->
          <button
            class="header-btn"
            :title="isFullscreen ? t('notes.exitFullscreen') : t('notes.fullscreen')"
            @click="handleToggleFullscreen"
          >
            <Icon :icon="isFullscreen ? 'ri:fullscreen-exit-line' : 'ri:fullscreen-line'" class="w-4 h-4" />
          </button>
          <!-- 关闭按钮 -->
          <button class="header-btn" :title="t('common.close')" @click="emit('close')">
            <Icon icon="ri:close-line" class="w-5 h-5" />
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="flex flex-1 min-h-0">
        <!-- Left: Notes List -->
        <div class="w-[280px] shrink-0 border-r border-color flex flex-col">
          <!-- New Note Button -->
          <button class="new-note-btn" @click="handleNewNote">
            <Icon icon="ri:add-line" class="w-4 h-4" />
            <span>{{ t("notes.newNote") }}</span>
          </button>

          <!-- Notes List -->
          <div class="flex-1 overflow-y-auto notes-list">
            <div
              v-for="note in notesStore.sortedNotes"
              :key="note.id"
              class="note-item"
              :class="{ 'note-item-active': notesStore.selectedNoteId === note.id }"
              @click="handleSelectNote(note.id)"
            >
              <div class="note-item-content">
                <span class="note-item-preview">{{ notesStore.getNotePreview(note) }}</span>
                <span class="note-item-date">{{ notesStore.formatDate(note.updatedAt) }}</span>
              </div>
            </div>

            <!-- Empty State -->
            <div v-if="notesStore.sortedNotes.length === 0" class="empty-state">
              <Icon icon="ri:sticky-note-line" class="w-12 h-12 text-muted" />
              <p class="text-muted">{{ t("notes.noNotes") }}</p>
            </div>
          </div>
        </div>

        <!-- Right: Editor & Preview -->
        <div class="flex flex-col flex-1 min-w-0">
          <!-- Toolbar -->
          <div class="flex items-center gap-1 px-3 py-2 border-b border-color toolbar">
            <!-- Pin Button -->
            <button
              class="toolbar-btn"
              :class="{ 'toolbar-btn-active': notesStore.selectedNote?.isPinned }"
              :disabled="!notesStore.selectedNoteId"
              :title="notesStore.selectedNote?.isPinned ? t('notes.unpin') : t('notes.pin')"
              @click="handleTogglePin"
            >
              <Icon icon="ri:pushpin-line" class="w-4 h-4" />
            </button>

            <!-- Preview Toggle Button -->
            <button
              class="toolbar-btn"
              :class="{ 'toolbar-btn-active': showPreview }"
              :disabled="!notesStore.selectedNoteId"
              :title="t('notes.preview')"
              @click="handleTogglePreview"
            >
              <Icon icon="ri:markdown-line" class="w-4 h-4" />
            </button>

            <!-- Split View Button (when preview is on) -->
            <button
              v-if="showPreview"
              class="toolbar-btn"
              :class="{ 'toolbar-btn-active': showSplitView }"
              :disabled="!notesStore.selectedNoteId"
              :title="t('notes.splitView')"
              @click="handleToggleSplitView"
            >
              <Icon icon="ri:layout-column-line" class="w-4 h-4" />
            </button>

            <!-- Delete Button -->
            <button
              class="toolbar-btn toolbar-btn-danger"
              :disabled="!notesStore.selectedNoteId"
              :title="t('common.delete')"
              @click="handleDelete"
            >
              <Icon icon="ri:delete-bin-line" class="w-4 h-4" />
            </button>

            <!-- Spacer -->
            <div class="flex-1" />

            <!-- Word Count & Save Status -->
            <div v-if="notesStore.selectedNoteId" class="flex items-center gap-3 text-xs text-muted">
              <span>{{ t("notes.wordCount", { count: wordCount }) }}</span>
              <span class="flex items-center gap-1">
                <Icon v-if="saveStatus === 'saved'" icon="ri:cloud-line" class="w-3.5 h-3.5" />
                <Icon v-else-if="saveStatus === 'saving'" icon="ri:loader-4-line" class="w-3.5 h-3.5 animate-spin" />
                {{ saveStatus === "saved" ? t("notes.saved") : saveStatus === "saving" ? t("notes.saving") : "" }}
              </span>
            </div>
          </div>

          <!-- Editor & Preview Area -->
          <div class="flex flex-1 min-h-0">
            <!-- Editor (hide when preview is on and split view is off) -->
            <div
              v-if="!showPreview || showSplitView"
              class="flex-1 min-w-0 editor-container"
              :class="{ 'border-r border-color': showPreview && showSplitView }"
            >
              <textarea
                v-if="notesStore.selectedNoteId"
                v-model="editorContent"
                class="note-editor"
                :placeholder="t('notes.placeholder')"
              />
              <div v-else class="flex items-center justify-center h-full empty-editor">
                <div class="text-center">
                  <Icon icon="ri:sticky-note-line" class="w-16 h-16 mx-auto mb-4 text-muted" />
                  <p class="text-muted">{{ t("notes.selectOrCreate") }}</p>
                </div>
              </div>
            </div>

            <!-- Preview -->
            <div
              v-if="showPreview && notesStore.selectedNoteId"
              class="flex-1 min-w-0 overflow-y-auto preview-container"
            >
              <div class="p-4 prose-sm prose markdown-preview" v-html="markdownHtml" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* 3D Perspective Container */
.dialog-perspective {
  perspective: 1200px;
}

/* 背景遮罩动画 */
.dialog-backdrop {
  background-color: rgba(0, 0, 0, 0.4);
  animation: backdrop-fade-in 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes backdrop-fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* 弹窗卡片动画 */
.dialog-card {
  transform-style: preserve-3d;
  transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  animation: dialog-enter 0.35s cubic-bezier(0.16, 1, 0.3, 1);
  will-change: transform, opacity;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
}

@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.dialog-card.no-tilt {
  transform: none !important;
}

/* 全屏模式样式 */
.dialog-card.dialog-fullscreen {
  width: calc(100% - 32px) !important;
  height: calc(100% - 32px) !important;
  max-width: none !important;
  max-height: none !important;
  margin: 16px;
  align-self: flex-start;
  margin-top: 16px;
  margin-left: 16px;
  margin-right: 16px;
  margin-bottom: 16px;
}

/* 移动端全屏模式 */
@media (max-width: 639px) {
  .dialog-card.dialog-fullscreen {
    width: calc(100% - 24px) !important;
    height: calc(100% - 24px) !important;
    margin: 12px;
    margin-top: 12px;
    margin-left: 12px;
    margin-right: 12px;
    margin-bottom: 12px;
  }
}

.dialog-bg {
  background: rgb(var(--dialog-bg));
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

.border-color {
  border-color: rgb(var(--color-border) / 0.3);
}

/* Header Button */
.header-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: rgb(var(--color-text-muted));
  transition: all 0.2s ease;
}

.header-btn:hover {
  background-color: rgb(var(--color-border) / 0.3);
  color: rgb(var(--color-text-secondary));
}

/* New Note Button */
.new-note-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 12px;
  padding: 10px 16px;
  font-size: 0.875rem;
  font-weight: 500;
  color: rgb(var(--color-accent));
  background-color: rgb(var(--color-accent) / 0.1);
  border-radius: 10px;
  transition: all 0.2s ease;
}

.new-note-btn:hover {
  background-color: rgb(var(--color-accent) / 0.2);
}

/* Notes List */
.notes-list {
  padding: 0 8px 8px;
}

.note-item {
  padding: 12px;
  margin-bottom: 4px;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.note-item:hover {
  background-color: rgb(var(--color-border) / 0.2);
}

.note-item-active {
  background-color: rgb(var(--color-accent) / 0.15) !important;
}

.note-item-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.note-item-preview {
  font-size: 0.875rem;
  color: rgb(var(--color-text));
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
}

.note-item-active .note-item-preview {
  color: rgb(var(--color-accent));
}

.note-item-date {
  font-size: 0.75rem;
  color: rgb(var(--color-text-muted) / 0.8);
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 12px;
}

/* Toolbar */
.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  color: rgb(var(--color-text-muted));
  transition: all 0.2s ease;
}

.toolbar-btn:hover:not(:disabled) {
  background-color: rgb(var(--color-border) / 0.3);
  color: rgb(var(--color-text-secondary));
}

.toolbar-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.toolbar-btn-active {
  background-color: rgb(var(--color-accent) / 0.15);
  color: rgb(var(--color-accent));
}

.toolbar-btn-active:hover:not(:disabled) {
  background-color: rgb(var(--color-accent) / 0.25);
}

.toolbar-btn-danger:hover:not(:disabled) {
  background-color: rgb(239 68 68 / 0.15);
  color: rgb(239 68 68);
}

/* Editor Container */
.editor-container {
  background-color: rgb(var(--color-border) / 0.12);
  position: relative;
}

.editor-container::after {
  content: "";
  position: absolute;
  top: 8px;
  left: 8px;
  right: 8px;
  bottom: 8px;
  background-color: rgb(255 255 255 / 0.6);
  border-radius: 12px;
  border: 1.5px solid rgb(var(--color-accent) / 0.3);
  pointer-events: none;
  z-index: 0;
}

:global(.dark) .editor-container {
  background-color: rgb(0 0 0 / 0.3);
}

:global(.dark) .editor-container::after {
  background-color: rgb(30 30 30 / 0.6);
  border-color: rgb(var(--color-accent) / 0.25);
}

.empty-editor {
  background-color: transparent;
}

.empty-editor::after {
  display: none;
}

/* Note Editor */
.note-editor {
  width: 100%;
  height: 100%;
  padding: 20px;
  font-size: 0.9375rem;
  line-height: 1.6;
  color: rgb(var(--color-text));
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  position: relative;
  z-index: 1;
}

.note-editor::placeholder {
  color: rgb(var(--color-text-muted) / 0.7);
}

/* Preview Container */
.preview-container {
  background-color: rgb(var(--dialog-bg));
}

/* Markdown Preview */
.markdown-preview {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: rgb(var(--color-text));
}

.markdown-preview :deep(h1),
.markdown-preview :deep(h2),
.markdown-preview :deep(h3),
.markdown-preview :deep(h4),
.markdown-preview :deep(h5),
.markdown-preview :deep(h6) {
  color: rgb(var(--color-text));
  margin-top: 1.5em;
  margin-bottom: 0.5em;
  font-weight: 600;
}

.markdown-preview :deep(h1) {
  font-size: 1.5rem;
}

.markdown-preview :deep(h2) {
  font-size: 1.25rem;
}

.markdown-preview :deep(h3) {
  font-size: 1.125rem;
}

.markdown-preview :deep(p) {
  margin-bottom: 1em;
}

.markdown-preview :deep(ul),
.markdown-preview :deep(ol) {
  padding-left: 1.5em;
  margin-bottom: 1em;
}

.markdown-preview :deep(li) {
  margin-bottom: 0.25em;
}

.markdown-preview :deep(code) {
  padding: 0.2em 0.4em;
  font-size: 0.875em;
  background-color: rgb(var(--color-border) / 0.3);
  border-radius: 4px;
}

.markdown-preview :deep(pre) {
  padding: 1em;
  margin-bottom: 1em;
  background-color: rgb(var(--color-border) / 0.2);
  border-radius: 8px;
  overflow-x: auto;
}

.markdown-preview :deep(pre code) {
  padding: 0;
  background: transparent;
}

.markdown-preview :deep(blockquote) {
  padding-left: 1em;
  margin-bottom: 1em;
  border-left: 3px solid rgb(var(--color-accent));
  color: rgb(var(--color-text-secondary));
}

.markdown-preview :deep(a) {
  color: rgb(var(--color-accent));
}

.markdown-preview :deep(hr) {
  margin: 1.5em 0;
  border: none;
  border-top: 1px solid rgb(var(--color-border) / 0.3);
}

/* Custom scrollbar */
.notes-list::-webkit-scrollbar,
.note-editor::-webkit-scrollbar,
.markdown-preview::-webkit-scrollbar {
  width: 6px;
}

.notes-list::-webkit-scrollbar-track,
.note-editor::-webkit-scrollbar-track,
.markdown-preview::-webkit-scrollbar-track {
  background: transparent;
}

.notes-list::-webkit-scrollbar-thumb,
.note-editor::-webkit-scrollbar-thumb,
.markdown-preview::-webkit-scrollbar-thumb {
  background-color: rgb(var(--color-border) / 0.4);
  border-radius: 10px;
}

.notes-list::-webkit-scrollbar-thumb:hover,
.note-editor::-webkit-scrollbar-thumb:hover,
.markdown-preview::-webkit-scrollbar-thumb:hover {
  background-color: rgb(var(--color-border) / 0.6);
}

/* Mobile Responsive */
@media (max-width: 639px) {
  .dialog-card {
    border-radius: 0;
  }

  @keyframes dialog-enter {
    from {
      opacity: 0;
      transform: translateY(100%);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
}

/* Animation */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>