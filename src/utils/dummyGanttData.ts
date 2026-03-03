import type { GanttProject } from '@/types/gantt';
import type { TaskResponse } from '@/types/response';

import i18n from '@/i18n';

/**
 * 生成測試用的甘特圖資料
 */
type DummyGanttProject = GanttProject & { onsiteTask: TaskResponse[] };

export const createDummyGanttData = (): DummyGanttProject => {
  const today = new Date();
  const baseDate = new Date(today);
  baseDate.setDate(baseDate.getDate() - 12);
  const startDate = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const endDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 30);
  const createDate = (monthOffset: number, dayOfMonth: number) => {
    const date = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth() + monthOffset,
      baseDate.getDate()
    );
    date.setDate(date.getDate() + (dayOfMonth - 1));
    return date;
  };

  const { t } = i18n.global;
  const onsiteTask: TaskResponse[] = [
    {
      id: 'onsite-task-1',
      title: t('label.planning.demo_task_note'),
      description: t('label.planning.demo_task_note'),
      projectId: 'dummy-project-1',
      constructionType: 'category-1',
      status: 'todo',
      materials: [],
      reminderDateTime: createDate(0, 7).toISOString(),
      endDateTime: undefined,
      pinLocation: null,
      createdAt: createDate(0, 6),
      updatedAt: createDate(0, 6),
      lastReminderSentAt: null,
      lineReminderSent: false,
      emailReminderSent: false,
    },
    {
      id: 'onsite-task-2',
      title: t('label.planning.demo_task_note'),
      description: t('label.planning.demo_task_note'),
      projectId: 'dummy-project-1',
      constructionType: 'category-2',
      status: 'todo',
      materials: [],
      reminderDateTime: createDate(0, 20).toISOString(),
      endDateTime: createDate(0, 14).toISOString(),
      pinLocation: null,
      createdAt: createDate(0, 18),
      updatedAt: createDate(0, 19),
      lastReminderSentAt: null,
      lineReminderSent: false,
      emailReminderSent: false,
    },
  ];
  const paymentRemittances = [
    {
      value: t('label.planning.demo_planning_note'),
      startDate: createDate(0, 5),
      endDate: createDate(0, 5),
    },
    {
      value: t('label.planning.demo_planning_note'),
      startDate: createDate(0, 25),
      endDate: createDate(0, 25),
    },
  ];
  const preConstructionNotes = [
    {
      value: t('label.planning.demo_planning_note'),
      startDate: createDate(0, 19),
      endDate: createDate(0, 19),
    },
    {
      value: t('label.planning.demo_planning_note'),
      startDate: createDate(0, 11),
      endDate: createDate(0, 11),
    },
  ];

  return {
    id: 'dummy-project-1',
    name: t('label.planning.demo_project_name'),
    dateRange: { startDate, endDate },
    paymentRemittances,
    preConstructionNotes,
    categories: [
      {
        id: 'category-1',
        name: t('label.construction_type.3D_Drawing'),
        tasks: [
          {
            id: 'task-1-1',
            name: t('label.construction_type.3D_Drawing'),
            category: '3D_Drawing',
            categoryId: 'category-1',
            schedules: [
              {
                id: 'schedule-1-1-exec',
                startDate: createDate(0, 1),
                endDate: createDate(0, 4),
                type: 'execution',
              },
              {
                id: 'schedule-1-1-exec-2',
                startDate: createDate(0, 6),
                endDate: createDate(0, 7),
                type: 'execution',
              },
              {
                id: 'schedule-1-1-exec-3',
                startDate: createDate(0, 8),
                endDate: createDate(0, 10),
                type: 'execution',
              },
              {
                id: 'schedule-1-1-note',
                startDate: createDate(0, 2),
                endDate: createDate(0, 3),
                type: 'note',
              },
            ],
            content: t('label.planning.demo_planning_note'),
          },
        ],
      },
      {
        id: 'category-2',
        name: t('label.construction_type.protection_demolition'),
        tasks: [
          {
            id: 'task-2-1',
            name: t('label.construction_type.protection_demolition'),
            category: 'protection_demolition',
            categoryId: 'category-2',
            schedules: [
              {
                id: 'schedule-2-1-exec',
                startDate: createDate(0, 6),
                endDate: createDate(0, 11),
                type: 'execution',
              },
              {
                id: 'schedule-2-1-exec-2',
                startDate: createDate(0, 12),
                endDate: createDate(0, 15),
                type: 'execution',
              },
              {
                id: 'schedule-2-1-note',
                startDate: createDate(0, 7),
                endDate: createDate(0, 8),
                type: 'note',
              },
            ],
            content: t('label.planning.demo_planning_note'),
          },
        ],
      },
      {
        id: 'category-3',
        name: t('label.construction_type.electromechanical'),
        tasks: [
          {
            id: 'task-3-1',
            name: t('label.construction_type.electromechanical'),
            category: 'electromechanical',
            categoryId: 'category-3',
            schedules: [
              {
                id: 'schedule-3-1-exec',
                startDate: createDate(0, 13),
                endDate: createDate(0, 20),
                type: 'execution',
              },
            ],
            content: t('label.planning.demo_planning_note'),
          },
        ],
      },
      {
        id: 'category-4',
        name: t('label.construction_type.hydropower'),
        tasks: [
          {
            id: 'task-4-1',
            name: t('label.construction_type.hydropower'),
            category: 'hydropower',
            categoryId: 'category-4',
            schedules: [
              {
                id: 'schedule-4-1-exec',
                startDate: createDate(0, 19),
                endDate: createDate(0, 26),
                type: 'execution',
              },
            ],
            content: t('label.planning.demo_planning_note'),
          },
        ],
      },
      {
        id: 'category-5',
        name: t('label.construction_type.flooring'),
        tasks: [
          {
            id: 'task-5-1',
            name: t('label.construction_type.flooring'),
            category: 'flooring',
            categoryId: 'category-5',
            schedules: [
              {
                id: 'schedule-5-1-exec',
                startDate: createDate(1, 1),
                endDate: createDate(1, 7),
                type: 'execution',
              },
            ],
            content: t('label.planning.demo_planning_note'),
          },
        ],
      },
    ],
    onsiteTask,
  } as DummyGanttProject;
};
