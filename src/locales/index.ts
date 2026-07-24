/*
  * @Description: Vue-i18n 国际化配置，集成 zh-CN、zh-TW、en 三种语言
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { createI18n } from "vue-i18n";
import zhCN from "./zh-CN";
import zhTW from "./zh-TW";
import en from "./en";

export type LocaleType = "zh-CN" | "zh-TW" | "en";

// 创建 i18n 实例
export const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  globalInjection: true, // 全局注入 $t 函数
  locale: "zh-CN", // 默认语言
  fallbackLocale: "zh-CN", // 回退语言
  messages: {
    "zh-CN": zhCN,
    "zh-TW": zhTW,
    en: en,
  },
});

// 设置语言
export function setLocale(locale: LocaleType) {
  i18n.global.locale.value = locale;
}

// 获取当前语言
export function getLocale(): LocaleType {
  return i18n.global.locale.value as LocaleType;
}

export default i18n;