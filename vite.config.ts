import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import webExtension from "vite-plugin-web-extension";
import { resolve } from "path";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { compression } from "vite-plugin-compression2";

export default defineConfig(({ mode }) => {
  const browser = mode === "firefox" ? "firefox" : "chrome";

  return {
    plugins: [
      vue(),
      webExtension({
        browser,
        manifest: "manifest.json",
      }),
      // 复制静态壁纸
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
          // 复制静态壁纸
          {
            src: "public/wallpaper/static/*",
            dest: "wallpaper/static",
          },
          // 复制动态壁纸（视频和缩略图）
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
    // 禁用默认 public 目录复制
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