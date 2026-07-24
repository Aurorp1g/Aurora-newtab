/*
  * @Description: 书签 Composable，提供本地书签存储和读取功能
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { ref } from "vue";
import type { BookmarkNode } from "@/types";

// 书签功能现在仅使用 localStorage 存储
// Chrome 扩展权限已移除 bookmarks 权限以符合 Chrome Web Store 政策

// localStorage 中存储的书签 key
const BOOKMARKS_STORAGE_KEY = "h5_bookmarks";

// 获取本地存储的书签
function getLocalBookmarks(): BookmarkNode[] {
  try {
    const stored = localStorage.getItem(BOOKMARKS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch {
    // 忽略错误
  }
  return [];
}

// 保存书签到本地存储
function saveLocalBookmarks(bookmarks: BookmarkNode[]): void {
  try {
    localStorage.setItem(BOOKMARKS_STORAGE_KEY, JSON.stringify(bookmarks));
  } catch {
    // 忽略错误
  }
}

export function useBookmarks() {
  const bookmarks = ref<BookmarkNode[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  // 书签功能现在统一使用 localStorage
  const isInExtension = ref(false);

  async function fetchBookmarks() {
    loading.value = true;
    error.value = null;

    try {
      // 从 localStorage 加载书签
      bookmarks.value = getLocalBookmarks();
      if (bookmarks.value.length === 0) {
        // 提供一些默认书签
        bookmarks.value = getDefaultBookmarks();
      }
    } catch (e) {
      console.error("Failed to fetch bookmarks:", e);
      error.value = "无法加载书签";
      bookmarks.value = [];
    } finally {
      loading.value = false;
    }
  }

  function flattenBookmarks(nodes: BookmarkNode[]): BookmarkNode[] {
    const result: BookmarkNode[] = [];

    function traverse(items: BookmarkNode[]) {
      for (const item of items) {
        if (item.url) {
          result.push(item);
        }
        if (item.children) {
          traverse(item.children);
        }
      }
    }

    traverse(nodes);
    return result;
  }

  function searchBookmarks(query: string): BookmarkNode[] {
    if (!query.trim()) return [];

    const flat = flattenBookmarks(bookmarks.value);
    const lowerQuery = query.toLowerCase();

    return flat.filter(
      bookmark => bookmark.title.toLowerCase().includes(lowerQuery) || bookmark.url?.toLowerCase().includes(lowerQuery)
    );
  }

  // 添加书签
  function addBookmark(bookmark: Omit<BookmarkNode, "id">) {
    const newBookmark: BookmarkNode = {
      ...bookmark,
      id: Date.now().toString(),
    };
    bookmarks.value.push(newBookmark);
    saveLocalBookmarks(bookmarks.value);
  }

  // 删除书签
  function removeBookmark(id: string) {
    const index = bookmarks.value.findIndex(b => b.id === id);
    if (index !== -1) {
      bookmarks.value.splice(index, 1);
      saveLocalBookmarks(bookmarks.value);
    }
  }

  // 获取默认书签
  function getDefaultBookmarks(): BookmarkNode[] {
    return [
      { id: "1", title: "Google", url: "https://www.google.com" },
      { id: "2", title: "GitHub", url: "https://github.com" },
      { id: "3", title: "Bilibili", url: "https://www.bilibili.com" },
      { id: "4", title: "知乎", url: "https://www.zhihu.com" },
      { id: "5", title: "掘金", url: "https://juejin.cn" },
    ];
  }

  return {
    bookmarks,
    loading,
    error,
    isInExtension,
    fetchBookmarks,
    flattenBookmarks,
    searchBookmarks,
    addBookmark,
    removeBookmark,
  };
}