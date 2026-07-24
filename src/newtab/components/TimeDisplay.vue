<!--
  * @Description: 时间显示组件，支持 12/24 小时制、秒数和闪烁分隔符
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();

const hours = ref("");
const minutes = ref("");
const seconds = ref("");
const showColon = ref(true);

let timer: number | null = null;

const use24Hour = computed(() => settingsStore.settings.use24Hour);
const showSeconds = computed(() => settingsStore.settings.showSeconds);
const blinkSeparator = computed(() => settingsStore.settings.blinkSeparator);
const timeFontWeight = computed(() => settingsStore.settings.timeFontWeight);
const timeFontSize = computed(() => settingsStore.settings.timeFontSize);

// 字体粗细映射
const fontWeightMap = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

function updateTime() {
  const now = new Date();
  let h = now.getHours();
  const m = now.getMinutes();
  const s = now.getSeconds();

  if (!use24Hour.value) {
    h = h % 12 || 12;
  }

  hours.value = h.toString().padStart(2, "0");
  minutes.value = m.toString().padStart(2, "0");
  seconds.value = s.toString().padStart(2, "0");

  // 分隔符闪烁逻辑
  if (blinkSeparator.value) {
    showColon.value = s % 2 === 0;
  } else {
    showColon.value = true;
  }
}

onMounted(() => {
  updateTime();
  timer = window.setInterval(updateTime, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
  }
});
</script>

<template>
  <div class="time-container" data-time-display>
    <div class="time-display" :style="{ fontWeight: fontWeightMap[timeFontWeight], fontSize: `${timeFontSize}px` }">
      <span class="time-digit">{{ hours }}</span>
      <span class="time-colon" :class="{ 'colon-hidden': !showColon }">:</span>
      <span class="time-digit">{{ minutes }}</span>
      <template v-if="showSeconds">
        <span class="time-colon" :class="{ 'colon-hidden': !showColon }">:</span>
        <span class="time-digit">{{ seconds }}</span>
      </template>
    </div>
  </div>
</template>

<style scoped>
.time-container {
  position: relative;
  max-width: 280px;
  padding: 10px;
  user-select: none;
  animation: timeFadeIn 1s ease-out;
}

@media (min-width: 480px) {
  .time-container {
    max-width: 290px;
  }
}

@media (min-width: 640px) {
  .time-container {
    max-width: 300px;
  }
}

.time-display {
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  cursor: pointer;
  font-family: -apple-system, BlinkMacSystemFont;
  font-weight: 400;
  letter-spacing: -0.02em;
  text-align: center;
  text-overflow: ellipsis;
  text-shadow: 0 0 20px rgba(0, 0, 0, 0.35);
  white-space: nowrap;
  transition: color 0.25s, font-weight 0.25s, text-shadow 0.25s, font-size 0.25s;
}

.time-display:hover {
  opacity: 0.85;
}

.time-display:active {
  transform: scale(0.98);
}

/* 时间数字 */
.time-digit {
  line-height: 1;
  font-variant-numeric: tabular-nums;
}

/* 冒号 */
.time-colon {
  line-height: 1;
  margin: 0;
  opacity: 0.9;
  transform: translateY(-0.1em);
  transition: opacity 0.1s ease;
}

.time-colon.colon-hidden {
  opacity: 0;
}

/* 时间淡入动画 */
@keyframes timeFadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>