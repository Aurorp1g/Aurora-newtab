/*
 * @Description:
 * @Author: Aurorp1g
 * @Date: 2026-07-20
 * @LastEditTime: 2026-07-24
 * @LastEditors: Aurorp1g
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import webExtension from "vite-plugin-web-extension";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { compression } from "vite-plugin-compression2";
import { readdirSync } from "fs";

function virtualWallpaperList(): import("vite").Plugin {
  return {
    name: "virtual-wallpaper-list",
    resolveId(id) {
      if (id === "virtual:wallpaper-list") return id;
    },
    load(id) {
      if (id !== "virtual:wallpaper-list") return;
      const staticDir = resolve(__dirname, "public/wallpaper/static");
      const dynamicDir = resolve(__dirname, "public/wallpaper/dynamic");

      const staticFiles = readdirSync(staticDir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort()
        .map(f => `/wallpaper/static/${f}`);

      const imageExts = [".jpg", ".jpeg", ".png", ".webp"];
      const dynamicFiles: { video: string; thumbnail: string }[] = [];
      try {
        const files = readdirSync(dynamicDir);
        const videos = files.filter(f => /\.mp4$/i.test(f));
        for (const video of videos) {
          let thumbnail = "";
          for (const imgExt of imageExts) {
            const thumbPath = video.replace(".mp4", `_thumb${imgExt}`);
            if (files.includes(thumbPath)) {
              thumbnail = `/wallpaper/dynamic/${thumbPath}`;
              break;
            }
          }
          dynamicFiles.push({ video: `/wallpaper/dynamic/${video}`, thumbnail });
        }
      } catch {}

      return `export const STATIC_WALLPAPERS = ${JSON.stringify(staticFiles)};\nexport const DYNAMIC_WALLPAPERS = ${JSON.stringify(dynamicFiles.map(d => d.video))};\nexport const DYNAMIC_WALLPAPER_THUMBNAILS = ${JSON.stringify(dynamicFiles.map(d => d.thumbnail))};`;
    },
  };
}

export default defineConfig(({ mode }) => {
  const browser = mode === "firefox" ? "firefox" : "chrome";

  return {
    plugins: [
      vue(),
      webExtension({
        browser,
        manifest: "manifest.json",
      }),
      virtualWallpaperList(),
      viteStaticCopy({
        targets: [
          {
            src: "public/icons/*",
            dest: "icons",
          },
          {
            src: "icons/*.png",
            dest: "icons",
          },
          // 复制 PWA 所需文件
          {
            src: "public/site.webmanifest",
            dest: ".",
          },
          {
            src: "public/wallpaper/static/*",
            dest: "wallpaper/static",
          },
          {
            src: "public/wallpaper/dynamic/*",
            dest: "wallpaper/dynamic",
          },
          // 复制多语言文件
          {
            src: "_locales",
            dest: ".",
          },
        ],
      }),
      // Gzip + Brotli 压缩（对 H5 部署有效，扩展打包时 zip 会自动压缩）
      compression({
        exclude: [/\.(br)$/, /\.(gz)$/, /\.(png)$/, /\.(jpg)$/, /\.(webp)$/],
        threshold: 1024, // 只压缩大于 1KB 的文件
      }),
    ],
    publicDir: false,
    resolve: {
      alias: {
        "@": resolve(__dirname, "src"),
      },
    },
    build: {
      outDir: `dist/${browser}`,
      // 禁用 sourcemap 减小体积（开发时可开启）
      sourcemap: false,
      // 压缩配置
      minify: "esbuild", // 使用 esbuild 压缩，速度更快
      // chunk 大小警告阈值
      chunkSizeWarningLimit: 1000,
    },
  };
});