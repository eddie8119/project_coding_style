import type {
  MaterialSnakeBody,
  PlanningMaterialSnakeBody,
  PlanningTaskSnakeBody,
  ProjectSnakeBody,
  TaskSnakeBody,
} from '@/types/requestBody';

// project
export const PROJECT_MUTABLE_COLUMNS = [
  'title',
  'type',
  'construction_container',
  'floor_plan_urls',
  'planning_start_date',
  'planning_end_date',
  'planning_segments',
  'planning_date_columns',
  'planning_special_holidays',
  'planning_payment_remittances',
  'planning_pre_construction_notes',
] as const satisfies readonly (keyof ProjectSnakeBody & string)[];

// task
export const TASK_MUTABLE_COLUMNS = [
  'title',
  'description',
  'construction_type',
  'reminder_date_time',
  'materials',
  'end_date_time',
  'pin_location',
  'status',
] as const satisfies readonly (keyof TaskSnakeBody & string)[];

// planning task
export const PLANNING_TASK_MUTABLE_COLUMNS = [
  'construction_type',
  'content',
  'start_date',
  'end_date',
] as const satisfies readonly (keyof PlanningTaskSnakeBody & string)[];

// material
export const MATERIAL_MUTABLE_COLUMNS = [
  'task_id',
  'quantity',
  'received_date_time',
  'note',
  'planning_material_id',
  'material_definition_id',
] as const satisfies readonly (keyof MaterialSnakeBody & string)[];

// planning material
export const PLANNING_MATERIAL_MUTABLE_COLUMNS = [
  'project_id',
  'construction',
  'material_definition_id',
  'planning_total_quantity',
  'unit_price',
  'note',
] as const satisfies readonly (keyof PlanningMaterialSnakeBody & string)[];
