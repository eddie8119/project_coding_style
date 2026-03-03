import type { Language } from '@frontend/types/language';

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

// auth
export type RefreshRequestBody = {
  refresh_token?: string;
};

export type SSOCallbackBody = {
  access_token?: string;
  refresh_token?: string | null;
};

// project
export type ProjectSnakeBody = {
  title: string;
  type: string;
  construction_container: JsonValue;
  floor_plan_urls?: JsonValue | null;
  planning_start_date?: string | null;
  planning_end_date?: string | null;
  planning_segments?: JsonValue | null;
  planning_date_columns?: JsonValue | null;
  planning_special_holidays?: JsonValue | null;
  planning_payment_remittances?: JsonValue | null;
  planning_pre_construction_notes?: JsonValue | null;
};

export type ProjectPatchSnakeBody = Partial<ProjectSnakeBody>;

// planningTasks
export type PlanningTaskSnakeBody = {
  construction_type?: string | null;
  content?: string;
  start_date?: string | null;
  end_date?: string | null;
};

// tasks
export type MaterialDefinitionSnakeBody = {
  id?: string;
  user_id: string;
  name: string;
  unit?: string | null;
  default_unit_price?: number | null;
  note?: string | null;
  construction?: string | null;
};

export type PlanningMaterialSnakeBody = {
  id?: string;
  project_id: string;
  construction: string;
  material_definition_id: string;
  planning_total_quantity?: number | null;
  planning_total_price?: number | null;
  unit_price?: number | null;
  note?: string | null;
};

export type MaterialSnakeBody = {
  id?: string;
  user_id: string;
  task_id?: string | null;
  material_definition_id: string;
  planning_material_id: string;
  quantity?: number | null;
  received_date_time?: string | null;
  note?: string | null;
};

export type PinLocation = {
  x_percent: number;
  y_percent: number;
  floor_plan_key: string;
};

export type TaskSnakeBody = {
  title?: string;
  description?: string | null;
  construction_type?: string | null;
  reminder_date_time?: string | null;
  materials?: MaterialSnakeBody[] | null;
  end_date_time?: string | null;
  pin_location?: PinLocation[] | null;
  status?: string | null;
};

// user settings
export type UserSettingsSnakeBody = {
  line_notify_token?: string | null;
  email_notifications_enabled?: boolean | null;
  line_notifications_enabled?: boolean | null;
};

// user
export type RegisterSnakeBody = {
  email: string;
  password: string;
  name: string;
};

export type ProfileUpdateSnakeBody = {
  name?: string | null;
  phone_number?: string | null;
  company?: string | null;
};

// collaborators
export type CollaboratorRole = 'owner' | 'manager' | 'viewer';

export type ProjectCollaboratorSnakeBody = {
  collaborator_email?: string;
  role?: CollaboratorRole | null;
  locale?: Language | null;
};

export type GlobalCollaboratorSnakeBody = {
  collaborator_email?: string;
  role?: CollaboratorRole | null;
  locale?: Language | null;
};

// common
export type CommonSnakeBody = {
  construction?: string | null;
  unit?: string | null;
  project_type?: string | null;
};

// drafts
export type DraftSnakeBody = {
  tasks?: JsonValue;
};
