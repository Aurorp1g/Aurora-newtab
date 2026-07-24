/*
  * @Description: Newtab 应用入口文件，初始化 Vue、Pinia 和 i18n
  * @Author: Aurorp1g
  * @Date: 2026-07-20
  * @LastEditTime: 2026-07-24
  * @LastEditors: Aurorp1g
*/
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import { i18n } from "../locales";
import "../styles/main.css";

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(i18n);
app.mount("#app");