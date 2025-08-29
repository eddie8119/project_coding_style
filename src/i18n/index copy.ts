import { createI18n } from 'vue-i18n';

// 直接導入所有翻譯模塊
import alarm from './modules/alarm';
import button from './modules/button';
import column from './modules/column';
import common from './modules/common';
import device from './modules/device';
import dialog from './modules/dialog';
import dropdown from './modules/dropdown';
import label from './modules/label';
import link from './modules/link';
import management from './modules/management';
import message from './modules/message';
import nav from './modules/nav';
import notification from './modules/notification';
import observation from './modules/observation';
import option from './modules/option';
import pagination from './modules/pagination';
import placeholder from './modules/placeholder';
import tab from './modules/tab';
import title from './modules/title';

import { Language } from '@/types/language';

// 確保所有翻譯資源被正確打包
// 創建消息對象
const messages = {
  [Language.EN]: {
    ...alarm[Language.EN],
    ...button[Language.EN],
    ...column[Language.EN],
    ...common[Language.EN],
    ...device[Language.EN],
    ...dialog[Language.EN],
    ...dropdown[Language.EN],
    ...label[Language.EN],
    ...link[Language.EN],
    ...management[Language.EN],
    ...message[Language.EN],
    ...nav[Language.EN],
    ...notification[Language.EN],
    ...observation[Language.EN],
    ...option[Language.EN],
    ...pagination[Language.EN],
    ...placeholder[Language.EN],
    ...tab[Language.EN],
    ...title[Language.EN],
  },
  [Language.ZH_TW]: {
    ...alarm[Language.ZH_TW],
    ...button[Language.ZH_TW],
    ...column[Language.ZH_TW],
    ...common[Language.ZH_TW],
    ...device[Language.ZH_TW],
    ...dialog[Language.ZH_TW],
    ...dropdown[Language.ZH_TW],
    ...label[Language.ZH_TW],
    ...link[Language.ZH_TW],
    ...management[Language.ZH_TW],
    ...message[Language.ZH_TW],
    ...nav[Language.ZH_TW],
    ...notification[Language.ZH_TW],
    ...observation[Language.ZH_TW],
    ...option[Language.ZH_TW],
    ...pagination[Language.ZH_TW],
    ...placeholder[Language.ZH_TW],
    ...tab[Language.ZH_TW],
    ...title[Language.ZH_TW],
  },
  [Language.JA]: {
    ...alarm[Language.JA],
    ...button[Language.JA],
    ...column[Language.JA],
    ...common[Language.JA],
    ...device[Language.JA],
    ...dialog[Language.JA],
    ...dropdown[Language.JA],
    ...label[Language.JA],
    ...link[Language.JA],
    ...management[Language.JA],
    ...message[Language.JA],
    ...nav[Language.JA],
    ...notification[Language.JA],
    ...observation[Language.JA],
    ...option[Language.JA],
    ...pagination[Language.JA],
    ...placeholder[Language.JA],
    ...tab[Language.JA],
    ...title[Language.JA],
  },
};

// 安全地獲取存儲的語言設置
let storedLanguage: Language | null = null;
try {
  // 在瀏覽器環境中才嘗試訪問 localStorage
  if (typeof window !== 'undefined' && window.localStorage) {
    const stored = localStorage.getItem('language');
    // 確保獲取的值是有效的 Language 枚舉值
    if (stored && Object.values(Language).includes(stored as Language)) {
      storedLanguage = stored as Language;
    }
  }
} catch (error) {
  console.error('Error accessing localStorage:', error);
}

// 設置默認語言
const defaultLocale: Language = storedLanguage || Language.ZH_TW;

// 創建 i18n 實例
const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: Language.EN,
  messages,
});

export { Language };
export default i18n;
