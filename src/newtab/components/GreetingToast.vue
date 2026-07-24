<!--
  * @Description: 问候语提示组件，根据时间段显示不同的问候语
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import { useSettingsStore } from "@/stores/settings";

const { t } = useI18n();
const settingsStore = useSettingsStore();
const show = ref(false);

// 根据插件主题设置判断是否深色模式
const isDarkMode = computed(() => {
  const theme = settingsStore.settings.theme;
  if (theme === "system") {
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  return theme === "dark";
});

// 根据时间判断问候语
const greeting = computed(() => {
  const hour = new Date().getHours();
  let textKey = "";
  let icon = "";
  let color = "";

  if (hour >= 5 && hour < 12) {
    textKey = "greeting.morning";
    icon = "ri:sun-line";
    color = "#f59e0b";
  } else if (hour >= 12 && hour < 14) {
    textKey = "greeting.noon";
    icon = "ri:sun-fill";
    color = "#f97316";
  } else if (hour >= 14 && hour < 18) {
    textKey = "greeting.afternoon";
    icon = "ri:cloudy-line";
    color = "#3b82f6";
  } else if (hour >= 18 && hour < 22) {
    textKey = "greeting.evening";
    icon = "ri:moon-line";
    color = "#8b5cf6";
  } else {
    textKey = "greeting.night";
    icon = "ri:moon-clear-line";
    color = "#6366f1";
  }

  let text = t(textKey);

  // 如果设置了用户名，添加到问候语中
  const username = settingsStore.settings.username.trim();
  if (username) {
    // 根据语言决定分隔符
    const lang = settingsStore.settings.language;
    const separator = lang === "en" ? ", " : "，";
    text = `${text}${separator}${username}`;
  }

  return { text, icon, color };
});

onMounted(() => {
  // 使用 sessionStorage 确保在整个浏览器会话中只显示一次问候
  const GREETING_FLAG = "Aurora_greeting_shown";
  const hasShownGreeting = sessionStorage.getItem(GREETING_FLAG);

  if (!hasShownGreeting) {
    // 页面加载后显示问候
    setTimeout(() => {
      show.value = true;
      sessionStorage.setItem(GREETING_FLAG, "true");
    }, 800);

    // 3秒后自动消失
    setTimeout(() => {
      show.value = false;
    }, 4000);
  }
});
</script>

<template>
  <Transition name="toast">
    <div v-if="show" class="greeting-toast" :class="{ dark: isDarkMode }">
      <Icon :icon="greeting.icon" class="greeting-icon" :style="{ color: greeting.color }" />
      <span class="greeting-text">{{ greeting.text }}</span>
    </div>
  </Transition>
</template>

<style scoped>
.greeting-toast {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 100;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-radius: 9999px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  color: #1f2937;
  font-size: 0.875rem;
  font-weight: 500;
  user-select: none;
  pointer-events: none;
}

.greeting-toast.dark {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.2);
  color: #f3f4f6;
}

.greeting-icon {
  width: 1.25rem;
  height: 1.25rem;
  flex-shrink: 0;
}

.greeting-text {
  white-space: nowrap;
}

/* Toast transition */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.9);
}

.toast-enter-to {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

.toast-leave-from {
  opacity: 1;
  transform: translateX(-50%) translateY(0) scale(1);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(-20px) scale(0.9);
}

@media (max-width: 640px) {
  .greeting-toast {
    top: 16px;
    padding: 0.625rem 1.25rem;
    font-size: 0.8125rem;
  }

  .greeting-icon {
    width: 1.125rem;
    height: 1.125rem;
  }
}
</style>