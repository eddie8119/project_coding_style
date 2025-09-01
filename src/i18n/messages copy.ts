import { Language } from '@/types/language';

// 定義需要加載的翻譯文件名稱
export const localeFiles = [
  'alarm',
  'button',
  'column',
  'common',
  'device',
  'dialog',
  'dropdown',
  'label',
  'link',
  'management',
  'message',
  'nav',
  'notification',
  'observation',
  'option',
  'pagination',
  'placeholder',
  'tab',
  'title',
];

// 初始空的翻譯內容
export const messages: Record<Language, Record<string, string>> = {
  [Language.EN]: {},
  [Language.ZH_TW]: {},
  [Language.JA]: {},
};

// 動態加載翻譯文件
export const loadLocaleMessages = async (): Promise<Record<Language, Record<string, string>>> => {
  try {
    // 對每個翻譯文件進行加載
    for (const file of localeFiles) {
      try {
        // 使用fetch動態加載JSON文件
        const response = await fetch(`/locales/${file}.json`);
        if (!response.ok) {
          console.error(`Failed to load locale file: ${file}.json`);
          continue;
        }

        const data = await response.json();

        // 合併翻譯內容
        Object.keys(data).forEach((lang) => {
          if (messages[lang as Language]) {
            messages[lang as Language] = { ...messages[lang as Language], ...data[lang] };
          }
        });
      } catch (error) {
        console.error(`Error loading locale file ${file}.json:`, error);
      }
    }

    return messages;
  } catch (error) {
    console.error('Failed to load locale messages:', error);
    return messages;
  }
};

export { Language };
export default messages;
