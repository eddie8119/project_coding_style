import Aura from '@primevue/themes/aura';
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import { createPinia } from 'pinia';
import PrimeVue from 'primevue/config';
import * as vue from 'vue';

import './style.css';
import App from './App.vue';
import i18n from './i18n';
import router from './router';

import { setupClearLocalStorageOnUnload } from '@/utils/storage/clearLocalStorage';

const app = vue.createApp(App);

const queryClient = new QueryClient();
const pinia = createPinia();

app.use(VueQueryPlugin, { queryClient });
app.use(pinia);
app.use(router);
app.use(i18n);
app.use(ElementPlus);
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: 'light',
      cssLayer: false,
    },
  },
});
// 設置在網頁關閉時清除所有項目相關的 localStorage
setupClearLocalStorageOnUnload();

app.mount('#app');
