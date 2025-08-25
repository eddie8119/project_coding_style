import type { Menu } from '@/types/layout';

export const menu: Menu[] = [
  {
    group: 'nav.group.home',
    items: [
      // {
      //   key: 0,
      //   label: 'dashboard',
      //   name: 'dashboard',
      //   icon: 'ChartPieSlice',
      //   route: '/dashboard',
      // },
      // {
      //   key: 1,
      //   label: 'entitySearch',
      //   name: 'entitySearch',
      //   icon: 'FolderNotch',
      //   route: '/entity-search',
      // },
      // {
      //   key: 2,
      //   label: 'devices',
      //   name: 'devices',
      //   icon: 'EntitySearch',
      //   route: '/devices',
      // },
      {
        label: 'overview',
        name: 'overview',
        icon: 'Home',
        route: '/overview',
      },
    ],
  },
  {
    group: 'nav.group.observation_items',
    items: [
      {
        label: 'pH',
        name: 'ph',
        icon: 'PH',
        route: '/observation/ph/devices',
      },
      {
        label: 'ORP',
        name: 'orp',
        icon: 'ORP',
        route: '/observation/orp/devices',
      },
      {
        label: 'NH3-N',
        name: 'nh3n',
        icon: 'NH',
        route: '/observation/nh3n/devices',
      },
      {
        label: 'F-',
        name: 'flouride',
        icon: 'F-',
        route: '/observation/flouride/devices',
      },
      // {
      //   key: 4,
      //   label: 'SQM',
      //   name: 'sqm',
      //   icon: 'Water',
      //   route: '/observation/sqm/devices',
      // },
      // {
      //   key: 5,
      //   label: 'MAC',
      //   name: 'mac',
      //   icon: 'Water',
      //   route: '/observation/mac/devices',
      // },
    ],
  },
  // {
  //   group: 'nav.group.management',
  //   items: [
  //     {
  //       key: 0,
  //       label: 'Set Member',
  //       name: 'set-member',
  //       icon: 'ChartPieSlice',
  //       route: '/management/set-member',
  //     },
  //   ],
  // },
];
