import type { Tab } from '@/types/layout';

import { TaskPinCondition, TaskTimeCondition } from '@/types/task';

export const USER_TAB_LIST: Tab[] = [
  {
    name: 'profile',
  },
  {
    name: 'change-password',
  },
  {
    name: 'pricing-menu',
  },
  {
    name: 'subscription',
  },
];

export const TO_DO_TAB_LIST: Tab[] = [
  {
    name: 'projects',
  },
];

export const PLANNING_TAB_LIST: Tab[] = [
  // {
  //   name: 'upload',
  // },
  // {
  //   name: 'gantt-chart',
  // },
];

export const OVERVIEW_TASK_CONDITION_TAB_LIST: Tab[] = [
  {
    name: TaskTimeCondition.ALL,
  },
  {
    name: TaskTimeCondition.UNSCHEDULED,
  },
  {
    name: TaskTimeCondition.OVERDUE,
  },
  {
    name: TaskTimeCondition.TODAY,
  },
  {
    name: TaskTimeCondition.THIS_WEEK,
  },
  {
    name: TaskTimeCondition.THIS_MONTH,
  },
];

export const TASK_PIN_CONDITION_TAB_LIST: Tab[] = [
  {
    name: TaskPinCondition.WITHOUT_PIN,
  },
  {
    name: TaskPinCondition.WITH_PIN,
  },
  {
    name: TaskPinCondition.ALL,
  },
];

export const SETTING_COMMON_TAB_LIST: Tab[] = [
  {
    name: 'all',
  },
];
