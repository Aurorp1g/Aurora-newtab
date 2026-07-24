<!--
  * @Description: 固定便笺组件，展示固定到主屏幕的便笺预览
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import { useNotesStore } from "@/stores/notes";
import { useSettingsStore } from "@/stores/settings";
import type { NoteItem } from "@/types";

const emit = defineEmits<{
  (e: "open-notes", noteId?: string): void;
}>();

const notesStore = useNotesStore();
const settingsStore = useSettingsStore();

// 是否显示完整内容
const showFullContent = computed(() => settingsStore.settings.showFullNote);

// 获取便笺显示内容
function getNoteDisplayContent(note: NoteItem): string {
  if (showFullContent.value) {
    // 完整显示，但限制最大长度
    if (note.content.length > 200) {
      return note.content.substring(0, 200) + "...";
    }
    return note.content || "空便笺";
  }
  // 预览模式：显示第一行
  return notesStore.getNotePreview(note);
}

// 取消固定
async function handleUnpin(e: MouseEvent, noteId: string) {
  e.stopPropagation();
  await notesStore.unpin(noteId);
}

// 点击便笺打开弹窗
function handleNoteClick(noteId: string) {
  emit("open-notes", noteId);
}
</script>

<template>
  <div v-if="notesStore.pinnedNotes.length > 0" class="pinned-notes-container">
    <TransitionGroup name="pinned-note">
      <div
        v-for="note in notesStore.pinnedNotes"
        :key="note.id"
        class="pinned-note"
        :class="{ 'pinned-note-full': showFullContent }"
        @click="handleNoteClick(note.id)"
      >
        <!-- Close button -->
        <button class="pinned-note-close" @click="handleUnpin($event, note.id)" title="取消固定">
          <Icon icon="ri:close-line" class="w-3.5 h-3.5" />
        </button>

        <!-- Content -->
        <div class="pinned-note-content">
          <p class="pinned-note-text" :class="{ 'pinned-note-text-full': showFullContent }">
            {{ getNoteDisplayContent(note) }}
          </p>
          <span class="pinned-note-date">{{ notesStore.formatDate(note.updatedAt) }}</span>
        </div>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.pinned-notes-container {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 25;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 280px;
}

@media (max-width: 640px) {
  .pinned-notes-container {
    top: 12px;
    left: 12px;
    max-width: 200px;
  }
}

.pinned-note {
  position: relative;
  padding: 10px 12px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  cursor: pointer;
  transition: all 0.2s ease;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}

:global(.dark) .pinned-note {
  background: rgba(30, 30, 30, 0.9);
}

.pinned-note:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.pinned-note-full {
  max-width: 280px;
}

/* Close button - hidden by default, show on hover */
.pinned-note-close {
  position: absolute;
  top: -6px;
  right: -6px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border-radius: 50%;
  opacity: 0;
  transition: all 0.2s ease;
  z-index: 1;
}

.pinned-note:hover .pinned-note-close {
  opacity: 1;
}

.pinned-note-close:hover {
  background: rgba(239, 68, 68, 0.9);
  transform: scale(1.1);
}

/* Content */
.pinned-note-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.pinned-note-text {
  font-size: 0.8125rem;
  line-height: 1.4;
  color: rgba(0, 0, 0, 0.85);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  margin: 0;
}

:global(.dark) .pinned-note-text {
  color: rgba(255, 255, 255, 0.9);
}

.pinned-note-text-full {
  white-space: pre-wrap;
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 6;
  -webkit-box-orient: vertical;
}

.pinned-note-date {
  font-size: 0.6875rem;
  color: rgba(0, 0, 0, 0.45);
}

:global(.dark) .pinned-note-date {
  color: rgba(255, 255, 255, 0.5);
}

/* Transition animations */
.pinned-note-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.pinned-note-leave-active {
  transition: all 0.2s ease-in;
}

.pinned-note-enter-from {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}

.pinned-note-leave-to {
  opacity: 0;
  transform: translateX(-20px) scale(0.9);
}

.pinned-note-move {
  transition: transform 0.3s ease;
}
</style>