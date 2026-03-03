import type { Menu } from '@/types/layout';

export const MENU: Menu[] = [
  {
    group: 'nav.group.construction_planning',
    items: [
      {
        label: 'planning_implementation',
        name: 'planning_implementation',
        icon: 'GanttChartSolid',
        route: '/planning/upload',
      },
    ],
  },
  {
    group: 'nav.group.construction_work',
    items: [
      {
        label: 'to_do',
        name: 'to_do',
        icon: 'Todo',
        route: '/todo/projects',
        activePrefixes: ['/todo/project', '/todo/plan'],
      },
    ],
  },
  {
    group: 'nav.group.schedule_assistant',
    items: [
      {
        label: 'overview',
        name: 'overview',
        icon: 'Overview',
        route: '/overview',
      },
      {
        label: 'schedule',
        name: 'schedule',
        icon: 'Calendar',
        route: '/schedule',
      },
    ],
  },
  {
    group: 'nav.group.setting',
    items: [
      {
        label: 'Set Common',
        name: 'set_common',
        icon: 'Palette',
        route: '/setting/common',
      },
      // {
      //   label: 'Set Member',
      //   name: 'set-member',
      //   icon: 'Users',
      //   route: '/setting/member',
      // },
      // {
      //   label: 'Notifications',
      //   name: 'notifications',
      //   icon: 'Bell',
      //   route: '/notifications',
      // },
    ],
  },
  {
    group: 'nav.group.other',
    items: [
      {
        label: 'Help Center',
        name: 'help_center',
        icon: 'ChalkboardSimple',
        route: '/other/help_center',
      },
      {
        label: 'Teaching',
        name: 'teaching',
        icon: 'YoutubeIcon',
        route: '/other/teaching',
      },
    ],
  },
];
