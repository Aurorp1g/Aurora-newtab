<!--
  * @Description: 应用项组件，渲染单个应用图标，支持点击跳转和右键编辑
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { computed } from "vue";
import { Icon } from "@iconify/vue";
import type { AppItem } from "@/types";

const props = defineProps<{
  app: AppItem;
  size?: "dock" | "grid";
  editable?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
  (e: "edit"): void;
  (e: "delete"): void;
}>();

const sizeClasses = computed(() => {
  if (props.size === "grid") {
    return "w-20 h-20 rounded-2xl";
  }
  return "w-12 h-12 rounded-xl";
});

const iconSize = computed(() => {
  return props.size === "grid" ? "w-8 h-8" : "w-6 h-6";
});

const containerStyle = computed(() => ({
  backgroundColor: props.app.backgroundColor || "#ffffff",
}));

const iconStyle = computed(() => ({
  color: props.app.iconColor || "#333333",
}));

function getIconContent() {
  if (props.app.iconType === "text") {
    return props.app.name.charAt(0).toUpperCase();
  }
  return null;
}
</script>

<template>
  <div class="relative flex flex-col items-center gap-1 cursor-pointer group" @click="emit('click')">
    <!-- App icon -->
    <div
      class="relative flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110 hover:shadow-xl active:scale-95"
      :class="sizeClasses"
      :style="containerStyle"
    >
      <!-- Iconify icon -->
      <Icon v-if="app.iconType === 'iconify'" :icon="app.icon" :class="iconSize" :style="iconStyle" />

      <!-- URL icon (favicon) -->
      <img
        v-else-if="app.iconType === 'url'"
        :src="app.icon"
        :alt="app.name"
        :class="iconSize"
        class="object-contain"
      />

      <!-- Text icon -->
      <span v-else class="text-xl font-bold" :style="iconStyle">
        {{ getIconContent() }}
      </span>

      <!-- Edit/Delete buttons (only in grid mode with editable) -->
      <div
        v-if="editable"
        class="absolute flex gap-1 transition-opacity opacity-0 -top-2 -right-2 group-hover:opacity-100"
      >
        <button
          class="flex items-center justify-center w-6 h-6 text-gray-600 bg-white rounded-full shadow-md hover:text-primary-500 hover:bg-gray-50"
          @click.stop="emit('edit')"
        >
          <Icon icon="ri:edit-line" class="w-3.5 h-3.5" />
        </button>
        <button
          class="flex items-center justify-center w-6 h-6 text-gray-600 bg-white rounded-full shadow-md hover:text-red-500 hover:bg-gray-50"
          @click.stop="emit('delete')"
        >
          <Icon icon="ri:delete-bin-line" class="w-3.5 h-3.5" />
        </button>
      </div>
    </div>

    <!-- App name (only in grid mode) -->
    <span v-if="size === 'grid'" class="text-xs text-white/90 text-center max-w-[80px] truncate drop-shadow">
      {{ app.name }}
    </span>
  </div>
</template>