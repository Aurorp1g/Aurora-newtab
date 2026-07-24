/*
 * @Description: H5 构建配置
 * @Author: Aurorp1g
 * @Date: 2026-07-24
 */
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
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

export default defineConfig({
  plugins: [
    vue(),
    virtualWallpaperList(),
    viteStaticCopy({
      targets: [
        {
          src: "public/icons/*",
          dest: "icons",
        },
        {
          src: "icons/*",
          dest: "icons",
        },
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
      ],
    }),
    // Gzip + Brotli 压缩（服务器可直接返回预压缩文件）
    compression({
      exclude: [/\.(br)$/, /\.(gz)$/, /\.(png)$/, /\.(jpg)$/, /\.(webp)$/],
      threshold: 1024,
    }),
  ],
  publicDir: false,
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
  // 定义环境变量，用于检测是否是 H5 模式
  define: {
    __IS_H5__: JSON.stringify(true),
  },
  build: {
    outDir: "dist/h5",
    // 启用 CSS 代码分割
    cssCodeSplit: true,
    // 生成 sourcemap 便于调试
    sourcemap: false,
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
      },
      output: {
        // 优化分包策略
        manualChunks: {
          vue: ["vue", "pinia"],
        },
      },
    },
  },
  // 开发服务器配置
  server: {
    port: 3000,
    open: true,
  },
  // 预览服务器配置
  preview: {
    port: 4173,
    open: true,
  },
});