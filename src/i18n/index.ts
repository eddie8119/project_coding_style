import { createI18n } from 'vue-i18n';

import { Language, messages } from './modules';

import { LanguageLabels } from '@/types/language';

const storedLanguage: Language = localStorage.getItem('language') as Language;
const defaultLocale: Language = storedLanguage || Language.ZH_TW;

const i18n = createI18n({
  legacy: false, // 使用 Composition API 模式
  locale: defaultLocale,
  fallbackLocale: Language.EN,
  messages,
});

export { Language, LanguageLabels };
export default i18n;
