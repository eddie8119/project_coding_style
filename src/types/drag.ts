export interface DragSourceOptions {
  groupName: string;
  [key: string]: unknown;
}

export interface MaterialDragItem {
  id?: string | number;
  name?: string;
  planningMaterialId?: string;
  materialDefinitionId?: string;
  unit?: string | null;
  unitPrice?: number | null;
}
