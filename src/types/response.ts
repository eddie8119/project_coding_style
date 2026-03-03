import type { CollaboratorRole } from './collaborator';
import type { ExcelCell, ExcelDateColumn, GanttDateRange } from './gantt';
export type { CollaboratorRole } from './collaborator';
import type { InvitationStatus, InvitationType } from './invitation';
import type { PinLocation } from './pin';
import type { ConstructionSelection, ProjectType } from './selection';
import type { TaskStatus } from './task';

// 平面圖項目
export interface FloorPlanItem {
  key: string;
  data: string; // base64 編碼的圖片資料
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt: Date;
  };
  access_token: string;
  refresh_token: string;
}

export interface CommonResponse {
  id: string;
  construction: ConstructionSelection[];
  unit: string[];
  projectType: string[];
}

export interface DraftResponse {
  id: string;
  createdAt: string;
  updatedAt: string;
  tasks: {
    id: string;
    content: string;
    completed: boolean;
    isMoved?: boolean;
  }[];
}

export interface ProjectResponse {
  constructionContainer: ConstructionSelection[] | null;
  id: string;
  title: string;
  type: ProjectType;
  userId: string;
  ownerName?: string;
  ownerEmail?: string;
  isShared: boolean;
  createdAt: Date;
  updatedAt: Date;
  tasks?: TaskResponse[];
  floorPlanUrls?: FloorPlanItem[];
  planningEndDate: string | null;
  planningStartDate: string | null;
  planningSegments?: GanttDateRange[] | null;
  planningDateColumns?: ExcelDateColumn[] | null;
  planningSpecialHolidays?: ExcelCell[] | null;
  planningPaymentRemittances?: ExcelCell[] | null;
  planningPreConstructionNotes?: ExcelCell[] | null;
}

// 任務
export interface TaskResponse {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  lastReminderSentAt: Date | null;
  lineReminderSent: boolean;
  emailReminderSent: boolean;
  status: TaskStatus;
  reminderDateTime?: string;
  endDateTime?: string;
  pinLocation: PinLocation[] | null;
  title: string;
  description: string;
  materials: MaterialResponse[];
  constructionType: string;
  projectId: string;
}

export interface MaterialDefinitionResponse {
  id: string;
  userId: string;
  name: string;
  unit: string | null;
  defaultUnitPrice: number | null;
  note: string | null;
  construction: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PlanningMaterialGroup {
  id: string;
  name: string;
  planningMaterials: PlanningMaterialResponse[];
}

export interface MaterialResponse {
  id: string;
  projectId: string;
  taskId?: string;
  createdAt: string;
  quantity: number | null;
  receivedDateTime: string | null;
  note: string | null;
  materialDefinitionId: string;
  planningMaterialId: string;
  unitPrice: number | null;
  // Joined from MaterialDefinitions
  materialDefinition?: Pick<MaterialDefinitionResponse, 'name' | 'unit'>;
}

export interface MaterialGroup {
  id: string;
  name: string;
  materials: MaterialResponse[];
  task?: TaskResponse;
  planningTotalPrice?: number;
}

export interface PlanningMaterialResponse {
  id: string;
  projectId: string;
  construction: string;
  materialDefinitionId: string;
  totalQuantity: number | null;
  totalPrice: number | null;
  note: string | null;
  createdAt: string;
  updatedAt: string;
  planningTotalQuantity: number | null;
  planningTotalPrice: number | null;
  unitPrice: number | null;
  // Joined from MaterialDefinitions
  materialDefinition?: Pick<MaterialDefinitionResponse, 'name' | 'unit' | 'defaultUnitPrice'>;
}

// Planning任務
export interface PlanningTaskResponse {
  id: string;
  projectId: string;
  constructionType: string | null;
  content: string;
  startDate: string | null;
  endDate: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// 專案協作者
export interface ProjectCollaboratorResponse {
  id: string;
  projectId: string;
  userId: string;
  collaboratorName?: string;
  collaboratorEmail: string;
  role: CollaboratorRole;
  isGlobal: boolean; // 是否為全域協作者
  globalRole: CollaboratorRole | null; // 全域角色（如果是全域協作者）
  createdAt: Date;
  updatedAt: Date;
}

// 全域協作者
export interface GlobalCollaboratorResponse {
  id: string;
  ownerId: string;
  collaboratorEmail: string;
  role: CollaboratorRole;
  createdAt: Date;
  updatedAt: Date;
}

// 協作者邀請
export interface CollaboratorInvitationResponse {
  id: string;
  invitationType: InvitationType;
  projectId: string | null;
  inviterId: string;
  inviteeEmail: string;
  role: CollaboratorRole;
  status: InvitationStatus;
  invitationToken: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
  acceptedAt: Date | null;
  // 關聯數據
  projects?: {
    title: string;
  };
  inviterName?: string;
}
