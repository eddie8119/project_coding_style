import { createI18n } from 'vue-i18n';

// import messages from './messages';
import enJson from '@/locales/en.json';
import jaJson from '@/locales/ja.json';
import zhTwJson from '@/locales/zh-TW.json';
import { Language } from '@/types/language';
import { LanguageLabels } from '@/types/language';

const storedLanguage = localStorage.getItem('language') as Language;
const browserLanguage = navigator.language.startsWith('zh') ? Language.ZH_TW : Language.EN;
const defaultLocale = storedLanguage || browserLanguage || Language.ZH_TW;

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: Language.EN,
  messages: {
    [Language.EN]: enJson,
    [Language.ZH_TW]: zhTwJson,
    [Language.JA]: jaJson,
  },
});

export { Language, LanguageLabels };
export default i18n;
