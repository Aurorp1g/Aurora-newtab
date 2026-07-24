/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "virtual:wallpaper-list" {
  export const STATIC_WALLPAPERS: string[];
  export const DYNAMIC_WALLPAPERS: string[];
  export const DYNAMIC_WALLPAPER_THUMBNAILS: string[];
}