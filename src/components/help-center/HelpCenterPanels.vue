<template>
  <section class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
    <div v-for="(panel, pi) in panelList" :key="pi" class="panel-container">
      <LabelText :title="panel.title" />
      <ul class="description-text mt-2 space-y-1">
        <li v-for="(item, ii) in panel.items" :key="ii" class="list-item-bullet">
          <template v-if="typeof item === 'string'">
            {{ item }}
          </template>
          <template v-else>
            <template v-if="item.type === 'email'">
              <div class="flex flex-col gap-0.5">
                <span>{{ t('helpCenter.contact.email') }}</span>
                <span
                  class="contact-link font-mono text-primary-500 hover:text-primary-600 inline-block cursor-pointer break-all underline underline-offset-4"
                  role="button"
                  tabindex="0"
                  :title="t('helpCenter.actions.open_email')"
                  :aria-label="email"
                  @click="openUrl(gmailUrl)"
                  @keyup.enter="openUrl(gmailUrl)"
                >
                  {{ email }}
                </span>
              </div>
            </template>
            <template v-else-if="item.type === 'website'">
              <span class="inline-flex items-center gap-2">
                <span>{{ t('helpCenter.contact.website') }}</span>
                <button
                  type="button"
                  :class="contactButtonClass"
                  :title="t(buttonConfig.website.titleKey)"
                  :aria-label="t(buttonConfig.website.titleKey)"
                  @click="openUrl(item.url)"
                >
                  <img
                    :src="buttonConfig.website.icon"
                    :alt="buttonConfig.website.alt"
                    class="h-6 w-6"
                    width="24"
                    height="24"
                  />
                </button>
              </span>
            </template>
            <template v-else-if="item.type === 'socials'">
              <span class="inline-flex flex-wrap items-center gap-2">
                <span>{{ t('helpCenter.contact.socials') }}</span>
                <div class="inline-flex flex-wrap items-center gap-2">
                  <button
                    v-for="social in item.accounts"
                    :key="`${social.type}-${social.handle ?? social.url}`"
                    type="button"
                    :class="contactButtonClass"
                    :title="t(buttonConfig[social.type].titleKey)"
                    :aria-label="
                      social.handle ? social.handle : t(buttonConfig[social.type].titleKey)
                    "
                    @click="openUrl(social.url)"
                  >
                    <img
                      :src="buttonConfig[social.type].icon"
                      :alt="buttonConfig[social.type].alt"
                      class="h-6 w-6"
                      width="24"
                      height="24"
                    />
                  </button>
                </div>
              </span>
            </template>
          </template>
        </li>
      </ul>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import GlobalIcon from '@/assets/icons/Global.svg';
import InstagramIcon from '@/assets/icons/InstagramLogo.svg';
import YoutubeIcon from '@/assets/icons/YoutubeIcon.svg';
import LabelText from '@/components/core/input/LabelText.vue';
import { BRAND_LINK } from '@/constants/link';

const { t } = useI18n();

type SocialButtonType = 'instagram' | 'youtube';
type ButtonType = SocialButtonType | 'website';

type ContactItem =
  | string
  | { type: 'email' }
  | { type: 'website'; url: string }
  | { type: 'socials'; accounts: Account[] };

type Account = {
  type: SocialButtonType;
  handle?: string;
  url: string;
};

interface PanelConfig {
  title: string;
  items: ContactItem[];
}

const socialAccounts: Account[] = [
  {
    type: 'instagram',
    handle: '@funsugar8119',
    url: BRAND_LINK.instagram,
  },
  {
    type: 'youtube',
    handle: '@funsugar8119',
    url: BRAND_LINK.youtube,
  },
];

const panelList = computed<PanelConfig[]>(() => [
  {
    title: t('helpCenter.title.contact'),
    items: [
      { type: 'email' },
      {
        type: 'website',
        url: BRAND_LINK.website,
      },
      {
        type: 'socials',
        accounts: socialAccounts,
      },
    ],
  },
  {
    title: t('helpCenter.title.suggestion'),
    items: [
      t('helpCenter.suggestion.issue_detail'),
      t('helpCenter.suggestion.expected_vs_actual'),
      t('helpCenter.suggestion.attachments'),
    ],
  },
  {
    title: t('helpCenter.title.timeline'),
    items: [t('helpCenter.timeline.normal'), t('helpCenter.timeline.high_priority')],
  },
]);

const email = BRAND_LINK.email;
const gmailUrl =
  'https://mail.google.com/mail/?view=cm&fs=1&to=' +
  encodeURIComponent(email) +
  '&body=' +
  encodeURIComponent('詢問: ');

const iframeLoaded = ref(false);
const showAssist = ref(false);
let assistTimer: number | undefined;

const openUrl = (url: string) => {
  window.open(url, '_blank');
};

const buttonConfig: Record<ButtonType, { icon: string; alt: string; titleKey: string }> = {
  website: {
    icon: GlobalIcon,
    alt: 'Website',
    titleKey: 'helpCenter.actions.open_website',
  },
  instagram: {
    icon: InstagramIcon,
    alt: 'Instagram',
    titleKey: 'helpCenter.actions.open_instagram',
  },
  youtube: {
    icon: YoutubeIcon,
    alt: 'Youtube',
    titleKey: 'helpCenter.actions.open_youtube',
  },
};

const contactButtonClass =
  'inline-flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-sm hover:bg-gray-50 focus:outline-none';

onMounted(() => {
  assistTimer = window.setTimeout(() => {
    if (!iframeLoaded.value) showAssist.value = true;
  }, 2500);
});

onBeforeUnmount(() => {
  if (assistTimer) window.clearTimeout(assistTimer);
});
</script>

<style scoped>
.contact-email {
  word-break: break-word;
  overflow-wrap: anywhere;
}

.list-item-bullet {
  position: relative;
  padding-left: 1.25rem;
  list-style: none;
}

.list-item-bullet::before {
  content: '';
  position: absolute;
  top: 0.65em;
  left: 0.25rem;
  width: 0.35rem;
  height: 0.35rem;
  border-radius: 9999px;
  background-color: rgb(148 163 184 / 1); /* slate-400 */
}
@media (prefers-color-scheme: dark) {
  .list-item-bullet::before {
    background-color: rgb(148 163 184 / 0.7);
  }
}
</style>
