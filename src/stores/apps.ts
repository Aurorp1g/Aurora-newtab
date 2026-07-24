/*
  * @Description: 应用管理 Store，负责应用列表的增删改查和排序
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { AppItem } from "@/types";
import { getApps, saveApps, generateId, getDefaultApps } from "@/utils/storage";

export const useAppsStore = defineStore("apps", () => {
  const apps = ref<AppItem[]>([]);

  const dockApps = computed(() =>
    [...apps.value].filter(app => app.isInDock).sort((a, b) => (a.dockOrder ?? a.order) - (b.dockOrder ?? b.order))
  );

  const allApps = computed(() => [...apps.value].sort((a, b) => a.order - b.order));

  async function init() {
    apps.value = await getApps();
  }

  async function addApp(app: Omit<AppItem, "id" | "order">) {
    const newApp: AppItem = {
      ...app,
      id: generateId(),
      order: apps.value.length,
    };
    apps.value.push(newApp);
    await saveApps(apps.value);
  }

  async function updateApp(id: string, updates: Partial<AppItem>) {
    const index = apps.value.findIndex(app => app.id === id);
    if (index !== -1) {
      apps.value[index] = { ...apps.value[index], ...updates };
      await saveApps(apps.value);
    }
  }

  async function deleteApp(id: string) {
    apps.value = apps.value.filter(app => app.id !== id);
    await saveApps(apps.value);
  }

  async function reorderApps(newOrder: AppItem[]) {
    apps.value = newOrder.map((app, index) => ({
      ...app,
      order: index,
    }));
    await saveApps(apps.value);
  }

  async function toggleDock(id: string) {
    const app = apps.value.find(app => app.id === id);
    if (app) {
      app.isInDock = !app.isInDock;
      await saveApps(apps.value);
    }
  }

  async function moveToDock(id: string) {
    const app = apps.value.find(app => app.id === id);
    if (app && !app.isInDock) {
      app.isInDock = true;
      // 设置为 dock 的最后位置
      const maxDockOrder = Math.max(...apps.value.filter(a => a.isInDock).map(a => a.dockOrder ?? 0), -1);
      app.dockOrder = maxDockOrder + 1;
      await saveApps(apps.value);
    }
  }

  async function removeFromDock(id: string) {
    const app = apps.value.find(app => app.id === id);
    if (app && app.isInDock) {
      app.isInDock = false;
      await saveApps(apps.value);
    }
  }

  async function reorderDockApps(newOrder: AppItem[]) {
    // 创建一个映射，用于快速查找应用
    const appMap = new Map(apps.value.map(app => [app.id, app]));

    // 只更新 dockOrder，不影响 order（AppGrid 的排序）
    newOrder.forEach((app, index) => {
      const existingApp = appMap.get(app.id);
      if (existingApp && existingApp.isInDock) {
        existingApp.dockOrder = index;
      }
    });

    // 保存到存储
    await saveApps(apps.value);
  }

  async function resetToDefault() {
    apps.value = getDefaultApps();
    await saveApps(apps.value);
  }

  return {
    apps,
    dockApps,
    allApps,
    init,
    addApp,
    updateApp,
    deleteApp,
    reorderApps,
    toggleDock,
    moveToDock,
    removeFromDock,
    reorderDockApps,
    resetToDefault,
  };
});