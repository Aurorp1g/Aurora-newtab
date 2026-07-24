/*
  * @Description: 便笺管理 Store，负责便笺的增删改查和固定功能
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { NoteItem } from "@/types";
import { getNotes, saveNotes, generateId } from "@/utils/storage";

// 最大固定便笺数量
const MAX_PINNED_NOTES = 5;

export const useNotesStore = defineStore("notes", () => {
  const notes = ref<NoteItem[]>([]);
  const selectedNoteId = ref<string | null>(null);
  const isInitialized = ref(false);

  // 当前选中的便笺
  const selectedNote = computed(() => {
    if (!selectedNoteId.value) return null;
    return notes.value.find(note => note.id === selectedNoteId.value) || null;
  });

  // 固定的便笺列表（按创建时间倒序，新创建的在前）
  const pinnedNotes = computed(() => {
    return notes.value
      .filter(note => note.isPinned)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // 所有便笺按创建时间倒序排列（新创建的在前，选中或编辑不会改变顺序）
  const sortedNotes = computed(() => {
    return [...notes.value].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // 已固定便笺数量
  const pinnedCount = computed(() => pinnedNotes.value.length);

  // 是否可以继续固定
  const canPin = computed(() => pinnedCount.value < MAX_PINNED_NOTES);

  // 初始化
  async function init() {
    if (isInitialized.value) return;
    notes.value = await getNotes();
    isInitialized.value = true;
  }

  // 添加便笺
  async function addNote(content: string = ""): Promise<NoteItem> {
    const now = new Date().toISOString();
    const newNote: NoteItem = {
      id: generateId(),
      content,
      createdAt: now,
      updatedAt: now,
      isPinned: false,
    };
    notes.value.push(newNote);
    await saveNotes(notes.value);
    return newNote;
  }

  // 更新便笺内容
  async function updateNote(id: string, content: string) {
    const note = notes.value.find(n => n.id === id);
    if (note) {
      note.content = content;
      note.updatedAt = new Date().toISOString();
      await saveNotes(notes.value);
    }
  }

  // 删除便笺
  async function deleteNote(id: string) {
    const index = notes.value.findIndex(n => n.id === id);
    if (index !== -1) {
      notes.value.splice(index, 1);
      await saveNotes(notes.value);
      // 如果删除的是当前选中的便笺，清空选中状态
      if (selectedNoteId.value === id) {
        selectedNoteId.value = null;
      }
    }
  }

  // 切换固定状态
  async function togglePin(id: string): Promise<boolean> {
    const note = notes.value.find(n => n.id === id);
    if (!note) return false;

    // 如果要固定，检查是否超过限制
    if (!note.isPinned && !canPin.value) {
      return false; // 达到固定上限
    }

    note.isPinned = !note.isPinned;
    note.updatedAt = new Date().toISOString();
    await saveNotes(notes.value);
    return true;
  }

  // 取消固定
  async function unpin(id: string) {
    const note = notes.value.find(n => n.id === id);
    if (note && note.isPinned) {
      note.isPinned = false;
      note.updatedAt = new Date().toISOString();
      await saveNotes(notes.value);
    }
  }

  // 选中便笺
  function selectNote(id: string | null) {
    selectedNoteId.value = id;
  }

  // 获取便笺预览（第一行或前50个字符）
  function getNotePreview(note: NoteItem): string {
    if (!note.content) return "空便笺";
    const firstLine = note.content.split("\n")[0];
    if (firstLine.length > 50) {
      return firstLine.substring(0, 50) + "...";
    }
    return firstLine || "空便笺";
  }

  // 格式化日期显示
  function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
    }

    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return {
    notes,
    selectedNoteId,
    selectedNote,
    pinnedNotes,
    sortedNotes,
    pinnedCount,
    canPin,
    isInitialized,
    init,
    addNote,
    updateNote,
    deleteNote,
    togglePin,
    unpin,
    selectNote,
    getNotePreview,
    formatDate,
    MAX_PINNED_NOTES,
  };
});