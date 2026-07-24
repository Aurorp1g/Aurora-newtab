<!--
  * @Description: 壁纸设置面板，支持默认、本地、URL、Bing 每日壁纸
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
-->
<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Icon } from "@iconify/vue";
import { useI18n } from "vue-i18n";
import {
  useWallpaperStore,
  DEFAULT_WALLPAPERS,
  DYNAMIC_WALLPAPERS,
  DYNAMIC_WALLPAPER_THUMBNAILS,
  isVideoUrl,
  preloadAndCacheWallpaper,
  getCachedWallpaperUrl,
} from "@/stores/wallpaper";
import SettingsDialog from "./SettingsDialog.vue";

const { t } = useI18n();

const emit = defineEmits<{
  (e: "close"): void;
}>();

const wallpaperStore = useWallpaperStore();
const fileInput = ref<HTMLInputElement | null>(null);
const showUrlDialog = ref(false);
const urlInput = ref("");

// 缓存后的图片 URL 映射
const cachedImageUrls = ref<Map<string, string>>(new Map());
// 缓存加载状态
const cacheLoading = ref(true);
// 创建的 blob URL 列表，用于清理
const createdBlobUrls = ref<string[]>([]);

// 获取缓存后的图片 URL
function getCachedUrl(originalUrl: string): string {
  return cachedImageUrls.value.get(originalUrl) || originalUrl;
}

// 图片加载完成时缓存
async function handleImageLoad(url: string) {
  // 如果已经缓存过，跳过
  if (cachedImageUrls.value.has(url)) return;

  // 只缓存远程 URL
  if (url.startsWith("http://") || url.startsWith("https://")) {
    try {
      const cachedUrl = await preloadAndCacheWallpaper(url);
      if (cachedUrl !== url) {
        cachedImageUrls.value.set(url, cachedUrl);
        // 记录创建的 blob URL
        if (cachedUrl.startsWith("blob:")) {
          createdBlobUrls.value.push(cachedUrl);
        }
      }
    } catch (error) {
      console.warn("Failed to cache wallpaper thumbnail:", error);
    }
  }
}

// 初始化时预先检查所有壁纸的缓存状态
async function initializeCachedUrls() {
  cacheLoading.value = true;

  // 收集所有需要检查缓存的 URL
  const urlsToCheck: string[] = [
    ...DEFAULT_WALLPAPERS.filter(url => url.startsWith("http")),
    ...DYNAMIC_WALLPAPER_THUMBNAILS,
  ];

  // 并行检查所有 URL 的缓存状态
  const results = await Promise.all(
    urlsToCheck.map(async url => {
      try {
        const cachedUrl = await getCachedWallpaperUrl(url);
        return { url, cachedUrl };
      } catch {
        return { url, cachedUrl: null };
      }
    })
  );

  // 将缓存的 URL 存入映射
  for (const { url, cachedUrl } of results) {
    if (cachedUrl && cachedUrl !== url) {
      cachedImageUrls.value.set(url, cachedUrl);
      if (cachedUrl.startsWith("blob:")) {
        createdBlobUrls.value.push(cachedUrl);
      }
    }
  }

  cacheLoading.value = false;
}

// 初始化时获取 Bing 壁纸并检查缓存
onMounted(async () => {
  // 先检查缓存
  await initializeCachedUrls();

  if (!wallpaperStore.bingWallpaper) {
    wallpaperStore.fetchBingWallpaper();
  }
});

// 组件卸载时清理 blob URL
onUnmounted(() => {
  for (const blobUrl of createdBlobUrls.value) {
    URL.revokeObjectURL(blobUrl);
  }
});

// 当前自定义壁纸预览 (本地图片中的第一张或当前 URL)
const customPreview = computed(() => {
  const localImages = wallpaperStore.settings.localImages;
  if (Array.isArray(localImages) && localImages.length > 0) {
    return localImages[0];
  }
  if (wallpaperStore.settings.localData) {
    return wallpaperStore.settings.localData;
  }
  if (wallpaperStore.settings.url) {
    return wallpaperStore.settings.url;
  }
  return null;
});

// 自定义预览是否是视频
const isCustomPreviewVideo = computed(() => {
  return isVideoUrl(customPreview.value);
});

// 是否使用自定义壁纸
const isCustom = computed(() => {
  return wallpaperStore.settings.type === "local" || wallpaperStore.settings.type === "url";
});

// 是否选中今日壁纸
const isBingSelected = computed(() => {
  return wallpaperStore.settings.type === "bing";
});

// 选择本地图片/视频
function handleSelectLocal() {
  fileInput.value?.click();
}

// 处理文件选择
async function handleFileChange(event: Event) {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const dataUrls: string[] = [];

  for (const file of files) {
    const dataUrl = await readFileAsDataUrl(file);
    if (dataUrl) {
      dataUrls.push(dataUrl);
    }
  }

  if (dataUrls.length > 0) {
    await wallpaperStore.addLocalImages(dataUrls);
  }

  // 清空 input 以便再次选择相同文件
  target.value = "";
}

function readFileAsDataUrl(file: File): Promise<string | null> {
  return new Promise(resolve => {
    const reader = new FileReader();
    reader.onload = e => {
      resolve(e.target?.result as string);
    };
    reader.onerror = () => {
      resolve(null);
    };
    reader.readAsDataURL(file);
  });
}

// 打开在线图片链接对话框
function handleOpenUrlDialog() {
  urlInput.value = wallpaperStore.settings.url || "";
  showUrlDialog.value = true;
}

// 应用在线图片链接
function handleApplyUrl() {
  if (urlInput.value.trim()) {
    wallpaperStore.setUrl(urlInput.value.trim());
  }
  showUrlDialog.value = false;
}

// 取消 URL 对话框
function handleCancelUrl() {
  showUrlDialog.value = false;
  urlInput.value = "";
}

// AI 作图 - 打开 Nano Banana
function handleAiGenerate() {
  window.open("https://nanobanana.im/zh", "_blank");
}

// 选择默认壁纸
function selectDefaultWallpaper(index: number) {
  wallpaperStore.setDefaultIndex(index);
}

// 检查是否选中某个默认壁纸
function isDefaultSelected(index: number) {
  return wallpaperStore.settings.type === "default" && wallpaperStore.settings.defaultIndex === index;
}

// 选择动态壁纸
function selectDynamicWallpaper(index: number) {
  wallpaperStore.setDynamicIndex(index);
}

// 检查是否选中某个动态壁纸
function isDynamicSelected(index: number) {
  return wallpaperStore.settings.type === "dynamic" && wallpaperStore.settings.dynamicIndex === index;
}

// 选择今日壁纸
function selectBingWallpaper() {
  wallpaperStore.selectBingWallpaper();
}

// 下载今日壁纸
function downloadBingWallpaper() {
  wallpaperStore.downloadBingWallpaper();
}

// 每日随机壁纸相关
const dailyRandomEnabled = computed(() => {
  return wallpaperStore.settings.dailyRandom?.enabled ?? false;
});

const dailyRandomType = computed(() => {
  return wallpaperStore.settings.dailyRandom?.selectedType ?? "all";
});

function toggleDailyRandom() {
  wallpaperStore.setDailyRandomEnabled(!dailyRandomEnabled.value);
}

function setDailyRandomType(type: "default" | "dynamic" | "all") {
  wallpaperStore.setDailyRandomType(type);
}
</script>

<template>
  <SettingsDialog
    :title="t('wallpaperSettings.title')"
    :show-large-title="true"
    :show-search="false"
    @close="emit('close')"
  >
    <div class="wallpaper-settings">
      <!-- 自定义区域 -->
      <section class="custom-section">
        <h3 class="section-label">{{ t("wallpaperSettings.custom") }}</h3>
        <div class="custom-content">
          <!-- 预览图/视频 -->
          <div class="custom-preview" :class="{ 'custom-preview-selected': isCustom }">
            <!-- 视频预览 -->
            <video
              v-if="customPreview && isCustomPreviewVideo"
              :src="customPreview"
              class="preview-media"
              autoplay
              loop
              muted
              playsinline
            />
            <!-- 图片预览 -->
            <img
              v-else-if="customPreview"
              :src="customPreview"
              :alt="t('wallpaperSettings.custom')"
              class="preview-media"
            />
            <!-- 空状态占位符 -->
            <div v-else class="preview-placeholder">
              <Icon icon="ri:image-add-line" class="placeholder-icon" />
            </div>
            <!-- 视频图标 (如果是视频) -->
            <div v-if="customPreview && isCustomPreviewVideo" class="video-indicator">
              <Icon icon="ri:play-circle-fill" class="video-icon" />
            </div>
            <!-- 选中标记 (如果使用自定义壁纸) -->
            <Transition name="check-fade">
              <div v-if="isCustom" class="selected-badge">
                <Icon icon="ri:check-line" class="check-icon" />
              </div>
            </Transition>
          </div>

          <!-- 右侧内容 -->
          <div class="custom-info">
            <h4 class="custom-title">{{ t("wallpaperSettings.customTitle") }}</h4>
            <p class="custom-desc">{{ t("wallpaperSettings.customDesc") }}</p>
            <div class="custom-actions">
              <button class="action-btn" @click="handleSelectLocal">
                <Icon icon="ri:folder-image-line" class="btn-icon" />
                <span>{{ t("wallpaperSettings.localImage") }}</span>
              </button>
              <button class="action-btn" @click="handleOpenUrlDialog">
                <Icon icon="ri:link" class="btn-icon" />
                <span>{{ t("wallpaperSettings.onlineImage") }}</span>
              </button>
              <button class="action-btn action-btn-ai" @click="handleAiGenerate">
                <Icon icon="ri:palette-line" class="btn-icon" />
                <span>{{ t("wallpaperSettings.aiGenerate") }}</span>
                <Icon icon="ri:arrow-right-s-line" class="arrow-icon" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 今日壁纸区域 (Bing 每日壁纸) -->
      <section class="today-section">
        <h3 class="section-label">{{ t("wallpaperSettings.today") }}</h3>
        <div class="today-content" :class="{ 'today-content-selected': isBingSelected }" @click="selectBingWallpaper">
          <!-- 预览图 -->
          <div class="today-preview">
            <img
              v-if="wallpaperStore.bingWallpaper?.url"
              :src="wallpaperStore.bingWallpaper.url"
              :alt="t('wallpaperSettings.today')"
            />
            <div v-else class="preview-placeholder">
              <Icon v-if="wallpaperStore.loading" icon="ri:loader-4-line" class="placeholder-icon spinning" />
              <Icon v-else icon="ri:image-line" class="placeholder-icon" />
            </div>
            <!-- 选中标记 -->
            <Transition name="check-fade">
              <div v-if="isBingSelected" class="selected-badge">
                <Icon icon="ri:check-line" class="check-icon" />
              </div>
            </Transition>
          </div>

          <!-- 右侧信息 -->
          <div class="today-info">
            <h4 class="today-title">{{ wallpaperStore.bingWallpaper?.title || t("common.loading") }}</h4>
            <p class="today-copyright">{{ wallpaperStore.bingWallpaper?.copyright || "" }}</p>
            <div class="today-actions">
              <button class="today-action-btn" @click.stop="downloadBingWallpaper">
                <Icon icon="ri:download-line" class="btn-icon" />
                <span>{{ t("wallpaperSettings.downloadOriginal") }}</span>
              </button>
              <span class="today-source">{{ t("wallpaperSettings.imageSource") }}</span>
            </div>
          </div>
        </div>
      </section>

      <!-- 每日随机壁纸区域 -->
      <section class="daily-random-section">
        <div class="daily-random-header">
          <div class="daily-random-info">
            <h3 class="section-label">{{ t("wallpaperSettings.dailyRandom") }}</h3>
            <p class="daily-random-desc">{{ t("wallpaperSettings.dailyRandomDesc") }}</p>
          </div>
          <button
            class="toggle-switch"
            :class="{ 'toggle-switch-active': dailyRandomEnabled }"
            @click="toggleDailyRandom"
          >
            <span class="toggle-slider" />
          </button>
        </div>
        <div v-if="dailyRandomEnabled" class="daily-random-options">
          <span class="daily-random-type-label">{{ t("wallpaperSettings.dailyRandomType") }}:</span>
          <div class="daily-random-type-buttons">
            <button
              class="type-btn"
              :class="{ 'type-btn-active': dailyRandomType === 'all' }"
              @click="setDailyRandomType('all')"
            >
              {{ t("wallpaperSettings.dailyRandomAll") }}
            </button>
            <button
              class="type-btn"
              :class="{ 'type-btn-active': dailyRandomType === 'default' }"
              @click="setDailyRandomType('default')"
            >
              {{ t("wallpaperSettings.dailyRandomStatic") }}
            </button>
            <button
              class="type-btn"
              :class="{ 'type-btn-active': dailyRandomType === 'dynamic' }"
              @click="setDailyRandomType('dynamic')"
            >
              {{ t("wallpaperSettings.dailyRandomDynamic") }}
            </button>
          </div>
        </div>
      </section>

      <!-- 动态壁纸区域 -->
      <section class="dynamic-section">
        <h3 class="section-label">{{ t("wallpaperSettings.dynamic") }}</h3>
        <div class="wallpaper-grid wallpaper-grid-3">
          <button
            v-for="(_, index) in DYNAMIC_WALLPAPERS"
            :key="`dynamic-${index}-${cacheLoading}`"
            class="wallpaper-item"
            :class="{ 'wallpaper-item-selected': isDynamicSelected(index) }"
            @click="selectDynamicWallpaper(index)"
          >
            <img
              v-if="!cacheLoading"
              :src="getCachedUrl(DYNAMIC_WALLPAPER_THUMBNAILS[index])"
              :alt="`动态壁纸 ${index + 1}`"
              loading="lazy"
              @load="handleImageLoad(DYNAMIC_WALLPAPER_THUMBNAILS[index])"
            />
            <div v-else class="thumbnail-loading" />
            <Transition name="check-fade">
              <div v-if="isDynamicSelected(index)" class="selected-badge">
                <Icon icon="ri:check-line" class="check-icon" />
              </div>
            </Transition>
          </button>
        </div>
      </section>

      <!-- 默认静态壁纸区域 -->
      <section class="default-section">
        <h3 class="section-label">{{ t("wallpaperSettings.default") }}</h3>
        <div class="wallpaper-grid">
          <button
            v-for="(url, index) in DEFAULT_WALLPAPERS"
            :key="`default-${index}-${cacheLoading}`"
            class="wallpaper-item"
            :class="{ 'wallpaper-item-selected': isDefaultSelected(index) }"
            @click="selectDefaultWallpaper(index)"
          >
            <img
              v-if="!cacheLoading"
              :src="getCachedUrl(url)"
              :alt="`默认壁纸 ${index + 1}`"
              loading="lazy"
              @load="handleImageLoad(url)"
            />
            <div v-else class="thumbnail-loading" />
            <Transition name="check-fade">
              <div v-if="isDefaultSelected(index)" class="selected-badge">
                <Icon icon="ri:check-line" class="check-icon" />
              </div>
            </Transition>
          </button>
        </div>
      </section>

      <!-- 隐藏的文件输入 -->
      <input
        ref="fileInput"
        type="file"
        accept="image/*,video/*"
        multiple
        class="hidden-input"
        @change="handleFileChange"
      />

      <!-- URL 输入对话框 -->
      <Transition name="dialog-fade">
        <div v-if="showUrlDialog" class="url-dialog-overlay" @click.self="handleCancelUrl">
          <div class="url-dialog">
            <h4 class="url-dialog-title">{{ t("wallpaperSettings.onlineImageTitle") }}</h4>
            <input
              v-model="urlInput"
              type="url"
              placeholder="https://example.com/image.jpg"
              class="url-input"
              @keyup.enter="handleApplyUrl"
            />
            <div class="url-dialog-actions">
              <button class="dialog-btn dialog-btn-cancel" @click="handleCancelUrl">{{ t("common.cancel") }}</button>
              <button class="dialog-btn dialog-btn-confirm" @click="handleApplyUrl">{{ t("common.confirm") }}</button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </SettingsDialog>
</template>

<style scoped>
.wallpaper-settings {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 区域标签 */
.section-label {
  font-size: 14px;
  font-weight: 500;
  color: rgb(var(--color-text-muted));
  margin-bottom: 12px;
}

/* ================================
 * 自定义区域
 * ================================ */
.custom-section {
  display: flex;
  flex-direction: column;
}

.custom-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

/* 预览图 */
.custom-preview {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 80px;
  border-radius: 12px;
  overflow: hidden;
  background-color: rgb(var(--color-border) / 0.3);
  border: 2px solid transparent;
  transition: all 0.2s ease;
  cursor: pointer;
}

.custom-preview-selected {
  border-color: rgb(var(--color-accent));
  box-shadow: 0 0 0 2px rgb(var(--color-accent) / 0.2);
}

.preview-media {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* 视频指示器 */
.video-indicator {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.video-icon {
  width: 24px;
  height: 24px;
  color: white;
  filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.3));
  opacity: 0.9;
}

.preview-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgb(var(--color-border) / 0.3) 0%, rgb(var(--color-border) / 0.5) 100%);
}

.placeholder-icon {
  width: 32px;
  height: 32px;
  color: rgb(var(--color-text-muted));
}

.placeholder-icon.spinning {
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

/* 右侧内容 */
.custom-info {
  flex: 1;
  min-width: 0;
}

.custom-title {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 4px;
  line-height: 1.4;
}

.custom-desc {
  font-size: 13px;
  color: rgb(var(--color-text-muted));
  margin-bottom: 12px;
  line-height: 1.5;
}

/* 操作按钮组 */
.custom-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--color-text-secondary));
  background-color: rgb(var(--dialog-item-bg));
  border: 1px solid rgb(var(--color-border) / 0.4);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.action-btn:hover {
  background-color: rgb(var(--color-border) / 0.2);
  border-color: rgb(var(--color-border) / 0.6);
}

.action-btn:active {
  transform: scale(0.98);
}

.btn-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.action-btn-ai {
  color: rgb(var(--color-accent));
}

.action-btn-ai .btn-icon {
  color: rgb(var(--color-accent));
}

.arrow-icon {
  width: 14px;
  height: 14px;
  margin-left: -2px;
}

/* ================================
 * 今日壁纸区域
 * ================================ */
.today-section {
  display: flex;
  flex-direction: column;
}

.today-content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  padding: 12px;
  border-radius: 12px;
  border: 2px solid transparent;
  background-color: rgb(var(--dialog-item-bg));
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-content:hover {
  background-color: rgb(var(--color-border) / 0.1);
}

.today-content-selected {
  border-color: rgb(var(--color-accent));
  box-shadow: 0 0 0 2px rgb(var(--color-accent) / 0.2);
}

.today-preview {
  position: relative;
  flex-shrink: 0;
  width: 120px;
  height: 80px;
  border-radius: 10px;
  overflow: hidden;
  background-color: rgb(var(--color-border) / 0.3);
}

.today-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.today-info {
  flex: 1;
  min-width: 0;
}

.today-title {
  font-size: 15px;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 4px;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 1;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.today-copyright {
  font-size: 13px;
  color: rgb(var(--color-text-muted));
  margin-bottom: 10px;
  line-height: 1.4;
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.today-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.today-action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: rgb(var(--color-text-secondary));
  background-color: rgb(var(--color-border) / 0.2);
  border: 1px solid rgb(var(--color-border) / 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.today-action-btn:hover {
  background-color: rgb(var(--color-border) / 0.4);
}

.today-source {
  font-size: 12px;
  color: rgb(var(--color-text-muted));
}

/* ================================
 * 每日随机壁纸区域
 * ================================ */
.daily-random-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background-color: rgb(var(--dialog-item-bg));
  border-radius: 12px;
  border: 1px solid rgb(var(--color-border) / 0.3);
}

.daily-random-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.daily-random-info {
  flex: 1;
  min-width: 0;
}

.daily-random-info .section-label {
  margin-bottom: 4px;
}

.daily-random-desc {
  font-size: 13px;
  color: rgb(var(--color-text-muted));
  line-height: 1.4;
  margin: 0;
}

.daily-random-options {
  display: flex;
  align-items: center;
  gap: 12px;
  padding-top: 8px;
  border-top: 1px solid rgb(var(--color-border) / 0.2);
}

.daily-random-type-label {
  font-size: 13px;
  color: rgb(var(--color-text-secondary));
  flex-shrink: 0;
}

.daily-random-type-buttons {
  display: flex;
  gap: 8px;
}

.type-btn {
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: rgb(var(--color-text-secondary));
  background-color: rgb(var(--color-border) / 0.2);
  border: 1px solid rgb(var(--color-border) / 0.3);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  background-color: rgb(var(--color-border) / 0.4);
}

.type-btn-active {
  color: white;
  background-color: rgb(var(--color-accent));
  border-color: rgb(var(--color-accent));
}

.type-btn-active:hover {
  background-color: rgb(var(--color-accent));
  opacity: 0.9;
}

/* 切换开关样式 */
.toggle-switch {
  position: relative;
  width: 48px;
  height: 26px;
  background-color: rgb(var(--color-border) / 0.5);
  border: none;
  border-radius: 13px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  flex-shrink: 0;
}

.toggle-switch-active {
  background-color: rgb(var(--color-accent));
}

.toggle-slider {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.toggle-switch-active .toggle-slider {
  transform: translateX(22px);
}

/* ================================
 * 动态壁纸区域
 * ================================ */
.dynamic-section {
  display: flex;
  flex-direction: column;
}

/* ================================
 * 默认壁纸网格
 * ================================ */
.default-section {
  display: flex;
  flex-direction: column;
}

.wallpaper-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 10px;
}

.wallpaper-grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 500px) {
  .wallpaper-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  .wallpaper-grid-3 {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 400px) {
  .wallpaper-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

.wallpaper-item {
  position: relative;
  aspect-ratio: 16 / 10;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  background-color: rgb(var(--color-border) / 0.3);
  padding: 0;
  margin: 0;
  display: block;
  line-height: 0;
}

.wallpaper-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  display: block;
  margin: 0;
  padding: 0;
  transition: transform 0.3s ease;
}

.thumbnail-loading {
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgb(var(--color-border) / 0.3) 25%,
    rgb(var(--color-border) / 0.5) 50%,
    rgb(var(--color-border) / 0.3) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.wallpaper-item:hover img {
  transform: scale(1.05);
}

.wallpaper-item-selected {
  border-color: rgb(var(--color-accent));
  box-shadow: 0 0 0 2px rgb(var(--color-accent) / 0.2);
}

/* 选中标记 */
.selected-badge {
  position: absolute;
  right: 6px;
  bottom: 6px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: rgb(var(--color-accent));
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.check-icon {
  width: 14px;
  height: 14px;
  color: white;
}

/* 选中标记动画 */
.check-fade-enter-active {
  transition: all 0.2s ease-out;
}

.check-fade-leave-active {
  transition: all 0.15s ease-in;
}

.check-fade-enter-from,
.check-fade-leave-to {
  opacity: 0;
  transform: scale(0.5);
}

/* 隐藏的文件输入 */
.hidden-input {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* ================================
 * URL 对话框
 * ================================ */
.url-dialog-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(4px);
}

.url-dialog {
  width: 100%;
  max-width: 400px;
  margin: 16px;
  padding: 20px;
  background-color: rgb(var(--dialog-bg));
  border-radius: 16px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.url-dialog-title {
  font-size: 16px;
  font-weight: 600;
  color: rgb(var(--color-text));
  margin-bottom: 16px;
}

.url-input {
  width: 100%;
  padding: 12px 14px;
  font-size: 14px;
  color: rgb(var(--color-text));
  background-color: rgb(var(--dialog-item-bg));
  border: 1px solid rgb(var(--color-border) / 0.4);
  border-radius: 10px;
  outline: none;
  transition: all 0.2s ease;
}

.url-input:focus {
  border-color: rgb(var(--color-accent));
  box-shadow: 0 0 0 3px rgb(var(--color-accent) / 0.15);
}

.url-input::placeholder {
  color: rgb(var(--color-text-muted));
}

.url-dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.dialog-btn {
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dialog-btn-cancel {
  color: rgb(var(--color-text-secondary));
  background-color: rgb(var(--color-border) / 0.3);
}

.dialog-btn-cancel:hover {
  background-color: rgb(var(--color-border) / 0.5);
}

.dialog-btn-confirm {
  color: white;
  background-color: rgb(var(--color-accent));
}

.dialog-btn-confirm:hover {
  background-color: rgb(var(--color-accent-hover));
}

/* 对话框动画 */
.dialog-fade-enter-active {
  transition: opacity 0.2s ease-out;
}

.dialog-fade-leave-active {
  transition: opacity 0.15s ease-in;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-active .url-dialog {
  animation: dialog-pop 0.2s ease-out;
}

@keyframes dialog-pop {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>