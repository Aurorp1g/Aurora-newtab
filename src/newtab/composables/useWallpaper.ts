/*
  * @Description: 壁纸 Composable，处理壁纸设置和 URL 计算
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { ref, computed } from "vue";
import type { WallpaperSettings } from "@/types";

const DEFAULT_WALLPAPER = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1920&q=80";

export function useWallpaper() {
  const settings = ref<WallpaperSettings>({
    type: "default",
    url: null,
    localData: null,
    localImages: [],
    defaultIndex: 0,
    dynamicIndex: 0,
    blur: true,
    blurAmount: 30,
    brightness: 100,
  });

  const loading = ref(false);
  const bingUrl = ref<string | null>(null);

  const currentUrl = computed(() => {
    switch (settings.value.type) {
      case "local":
        return settings.value.localData;
      case "url":
        return settings.value.url;
      case "bing":
        return bingUrl.value;
      default:
        return DEFAULT_WALLPAPER;
    }
  });

  const wallpaperStyle = computed(() => {
    const url = currentUrl.value;
    if (!url) return {};

    return {
      backgroundImage: `url(${url})`,
      backgroundSize: "cover",
      backgroundPosition: "center",
      filter: settings.value.blur ? `blur(${settings.value.blurAmount}px)` : "none",
      opacity: settings.value.brightness / 100,
    };
  });

  async function fetchBingWallpaper() {
    loading.value = true;
    try {
      const response = await fetch("https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN");
      const data = await response.json();
      if (data.images && data.images[0]) {
        bingUrl.value = `https://www.bing.com${data.images[0].url}`;
      }
    } catch (error) {
      console.error("Failed to fetch Bing wallpaper:", error);
      bingUrl.value = DEFAULT_WALLPAPER;
    } finally {
      loading.value = false;
    }
  }

  function setLocalImage(dataUrl: string) {
    settings.value.localData = dataUrl;
    settings.value.type = "local";
  }

  function setUrl(url: string) {
    settings.value.url = url;
    settings.value.type = "url";
  }

  function setBlur(enabled: boolean) {
    settings.value.blur = enabled;
  }

  function setBlurAmount(amount: number) {
    settings.value.blurAmount = amount;
  }

  function setBrightness(brightness: number) {
    settings.value.brightness = brightness;
  }

  return {
    settings,
    loading,
    currentUrl,
    wallpaperStyle,
    fetchBingWallpaper,
    setLocalImage,
    setUrl,
    setBlur,
    setBlurAmount,
    setBrightness,
  };
}