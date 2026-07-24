<!--
  * @Description: 一言诗词展示组件，随机显示经典诗词名句
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { useSearchStore } from "@/stores/search";

interface Poetry {
  content: string;
  origin: string;
}

const searchStore = useSearchStore();

const poetries: Poetry[] = [
  { content: "满目山河空念远，落花风雨更伤春。", origin: "浣溪沙·一向年光有限身" },
  { content: "人生若只如初见，何事秋风悲画扇。", origin: "木兰词·拟古决绝词柬友" },
  { content: "山有木兮木有枝，心悦君兮君不知。", origin: "越人歌" },
  { content: "曾经沧海难为水，除却巫山不是云。", origin: "离思五首·其四" },
  { content: "此情可待成追忆，只是当时已惘然。", origin: "锦瑟" },
  { content: "愿得一心人，白头不相离。", origin: "白头吟" },
  { content: "两情若是久长时，又岂在朝朝暮暮。", origin: "鹊桥仙·纤云弄巧" },
  { content: "春风得意马蹄疾，一日看尽长安花。", origin: "登科后" },
  { content: "海内存知己，天涯若比邻。", origin: "送杜少府之任蜀州" },
  { content: "但愿人长久，千里共婵娟。", origin: "水调歌头·明月几时有" },
  { content: "采菊东篱下，悠然见南山。", origin: "饮酒·其五" },
  { content: "会当凌绝顶，一览众山小。", origin: "望岳" },
  { content: "长风破浪会有时，直挂云帆济沧海。", origin: "行路难·其一" },
  { content: "天生我材必有用，千金散尽还复来。", origin: "将进酒" },
  { content: "桃李春风一杯酒，江湖夜雨十年灯。", origin: "寄黄几复" },
];

const currentPoetry = ref<Poetry>(poetries[0]);
const isHovered = ref(false);
const showMenu = ref(false);
let menuCloseTimeout: ReturnType<typeof setTimeout> | null = null;

function getRandomPoetry() {
  const index = Math.floor(Math.random() * poetries.length);
  currentPoetry.value = poetries[index];
}

function toggleMenu(e: MouseEvent) {
  e.stopPropagation();
  // 清除关闭定时器
  if (menuCloseTimeout) {
    clearTimeout(menuCloseTimeout);
    menuCloseTimeout = null;
  }
  showMenu.value = !showMenu.value;
}

function closeMenu() {
  // 延迟关闭，给用户时间移动到菜单
  if (menuCloseTimeout) {
    clearTimeout(menuCloseTimeout);
  }
  menuCloseTimeout = setTimeout(() => {
    showMenu.value = false;
    menuCloseTimeout = null;
  }, 200);
}

function cancelCloseMenu() {
  // 鼠标进入菜单区域，取消关闭
  if (menuCloseTimeout) {
    clearTimeout(menuCloseTimeout);
    menuCloseTimeout = null;
  }
}

function copyPoetry(e: MouseEvent) {
  e.stopPropagation();
  const text = `${currentPoetry.value.content} —— ${currentPoetry.value.origin}`;
  navigator.clipboard.writeText(text);
  closeMenu();
}

function searchPoetry(e: MouseEvent) {
  e.stopPropagation();
  searchStore.search(currentPoetry.value.content);
  closeMenu();
}

// 暴露刷新方法给父组件
defineExpose({
  refresh: getRandomPoetry,
});

onMounted(() => {
  getRandomPoetry();
});

onUnmounted(() => {
  // 清理定时器
  if (menuCloseTimeout) {
    clearTimeout(menuCloseTimeout);
    menuCloseTimeout = null;
  }
});
</script>

<template>
  <div
    class="poetry-wrapper"
    data-poetry-area
    @mouseenter="
      isHovered = true;
      cancelCloseMenu();
    "
    @mouseleave="
      isHovered = false;
      closeMenu();
    "
    @mousedown.prevent
  >
    <div class="poetry-container" :class="{ 'poetry-hovered': isHovered }" @click="getRandomPoetry">
      <div class="poetry-content">「{{ currentPoetry.content }}」</div>
      <div class="poetry-origin">—— {{ currentPoetry.origin }}</div>

      <!-- 三点菜单按钮 -->
      <Transition name="fade">
        <button v-if="isHovered" class="menu-btn" @click="toggleMenu">
          <Icon icon="ri:more-2-fill" class="w-4 h-4" />
        </button>
      </Transition>

      <!-- 下拉菜单 -->
      <Transition name="dropdown">
        <div v-if="showMenu" class="poetry-menu" @mouseenter="cancelCloseMenu()" @mouseleave="closeMenu()">
          <button class="menu-item" @click="copyPoetry">
            <Icon icon="ri:file-copy-line" class="w-4 h-4" />
            <span>复制</span>
          </button>
          <button class="menu-item" @click="searchPoetry">
            <Icon icon="ri:search-line" class="w-4 h-4" />
            <span>搜索</span>
          </button>
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>
.poetry-wrapper {
  position: relative;
}

.poetry-container {
  position: relative;
  text-align: center;
  cursor: pointer;
  user-select: none;
  color: rgba(255, 255, 255, 0.8);
  text-shadow: 0 1px 8px rgba(0, 0, 0, 0.2);
  letter-spacing: 0.05em;
  animation: poetryFadeIn 0.4s ease-out;
  padding: 12px 40px 12px 16px;
  max-width: 100%;
  border-radius: 12px;
  transition: background-color 0.2s ease, backdrop-filter 0.2s ease;
}

.poetry-hovered {
  background-color: rgba(255, 255, 255, 0.1);
}

.poetry-content {
  font-size: 12px;
  opacity: 0.9;
  line-height: 1.6;
}

@media (min-width: 640px) {
  .poetry-content {
    font-size: 14px;
  }
}

.poetry-origin {
  margin-top: 4px;
  font-size: 10px;
  opacity: 0.6;
}

@media (min-width: 640px) {
  .poetry-origin {
    margin-top: 6px;
    font-size: 12px;
  }
}

/* 三点菜单按钮 */
.menu-btn {
  position: absolute;
  top: 50%;
  right: 8px;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  color: rgba(255, 255, 255, 0.7);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.menu-btn:hover {
  background-color: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.9);
}

/* 下拉菜单 */
.poetry-menu {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 4px;
  padding: 4px;
  min-width: 100px;
  background-color: rgba(0, 0, 0, 0.6);
  border-radius: 10px;
  z-index: 50;
}

.menu-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 12px;
  font-size: 13px;
  color: white;
  border-radius: 6px;
  transition: background-color 0.15s ease;
}

.menu-item:hover {
  background-color: rgba(255, 255, 255, 0.15);
}

/* 动画 */
@keyframes poetryFadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.dropdown-enter-active {
  transition: all 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.dropdown-leave-active {
  transition: all 0.15s ease-in;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>