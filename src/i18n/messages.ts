import merge from 'lodash-es/merge';

import { Language } from '@/types/language';

// 初始化一個空的 messages 物件，用於存放所有語言的翻譯
const messages: Record<Language, any> = {
  [Language.EN]: {},
  [Language.ZH_TW]: {},
  [Language.JA]: {},
};

// 使用 Vite 的 import.meta.glob 功能，動態、同步地載入所有模組檔案
const modules = import.meta.glob('@/locales/module/*.json', { eager: true });

// 遍歷載入的模組
for (const path in modules) {
  // 取得模組的預設匯出內容
  const moduleContent = (modules[path] as any).default || modules[path];

  // 使用 lodash 的 merge 功能，將模組內容深度合併到 messages 物件中
  merge(messages, moduleContent);
}

export default messages;
