import alarm from './alarm';
import button from './button';
import column from './column';
import common from './common';
import device from './device';
import dialog from './dialog';
import dropdown from './dropdown';
import label from './label';
import link from './link';
import management from './management';
import message from './message';
import nav from './nav';
import notification from './notification';
import observation from './observation';
import option from './option';
import pagination from './pagination';
import placeholder from './placeholder';
import tab from './tab';
import title from './title';

import { Language } from '@/types/language';

export const messages = {
  [Language.EN]: {
    ...alarm[Language.EN],
    ...nav[Language.EN],
    ...common[Language.EN],
    ...tab[Language.EN],
    ...title[Language.EN],
    ...column[Language.EN],
    ...dialog[Language.EN],
    ...dropdown[Language.EN],
    ...management[Language.EN],
    ...device[Language.EN],
    ...placeholder[Language.EN],
    ...button[Language.EN],
    ...message[Language.EN],
    ...link[Language.EN],
    ...notification[Language.EN],
    ...label[Language.EN],
    ...option[Language.EN],
    ...observation[Language.EN],
    ...pagination[Language.EN],
  },
  [Language.ZH_TW]: {
    ...alarm[Language.ZH_TW],
    ...nav[Language.ZH_TW],
    ...common[Language.ZH_TW],
    ...tab[Language.ZH_TW],
    ...title[Language.ZH_TW],
    ...column[Language.ZH_TW],
    ...dialog[Language.ZH_TW],
    ...dropdown[Language.ZH_TW],
    ...management[Language.ZH_TW],
    ...device[Language.ZH_TW],
    ...placeholder[Language.ZH_TW],
    ...button[Language.ZH_TW],
    ...message[Language.ZH_TW],
    ...link[Language.ZH_TW],
    ...notification[Language.ZH_TW],
    ...label[Language.ZH_TW],
    ...option[Language.ZH_TW],
    ...observation[Language.ZH_TW],
    ...pagination[Language.ZH_TW],
  },
  [Language.JA]: {
    ...alarm[Language.JA],
    ...nav[Language.JA],
    ...common[Language.JA],
    ...tab[Language.JA],
    ...title[Language.JA],
    ...column[Language.JA],
    ...dialog[Language.JA],
    ...dropdown[Language.JA],
    ...management[Language.JA],
    ...device[Language.JA],
    ...placeholder[Language.JA],
    ...button[Language.JA],
    ...message[Language.JA],
    ...link[Language.JA],
    ...notification[Language.JA],
    ...label[Language.JA],
    ...option[Language.JA],
    ...observation[Language.JA],
    ...pagination[Language.JA],
  },
};

export { Language };
export default messages;
