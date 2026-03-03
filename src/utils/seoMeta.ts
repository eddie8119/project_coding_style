import type { RouteLocationNormalized, RouteRecordNormalized } from 'vue-router';

import i18n from '@/i18n';

const DEFAULT_TITLE_KEY = 'meta.defaults.title';
const DEFAULT_DESCRIPTION_KEY = 'meta.defaults.description';
const FALLBACK_TITLE = 'KaiJi 開工大吉｜室內工程管理軟體';
const FALLBACK_DESCRIPTION =
  'KaiJi 開工大吉，專為室內設計工程打造的線上軟體，提供工地記錄、任務追蹤與排程規劃。';

type SeoMetaKeys = {
  titleKey?: string;
  descriptionKey?: string;
};

const getSeoMeta = (route?: RouteRecordNormalized) => route?.meta?.seo as SeoMetaKeys | undefined;

const resolveMetaText = (key: string | undefined, fallback: string) => {
  if (!key) return fallback;
  const translated = i18n.global.t(key);
  return translated === key ? fallback : (translated as string);
};

const ensureMetaTag = (name: string, content: string) => {
  if (typeof document === 'undefined') return;
  const selector = `meta[name="${name}"]`;
  let tag = document.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

export const syncDocumentMeta = (to: RouteLocationNormalized) => {
  if (typeof document === 'undefined') return;
  const reversedMatches = [...to.matched].reverse();

  const defaultTitle = resolveMetaText(DEFAULT_TITLE_KEY, FALLBACK_TITLE);
  const defaultDescription = resolveMetaText(DEFAULT_DESCRIPTION_KEY, FALLBACK_DESCRIPTION);

  const titleRoute = reversedMatches.find((route) => !!getSeoMeta(route)?.titleKey);
  const descriptionRoute = reversedMatches.find((route) => !!getSeoMeta(route)?.descriptionKey);

  const title = resolveMetaText(getSeoMeta(titleRoute)?.titleKey, defaultTitle);
  document.title = title;

  const description = resolveMetaText(
    getSeoMeta(descriptionRoute)?.descriptionKey,
    defaultDescription
  );
  ensureMetaTag('description', description);
};
