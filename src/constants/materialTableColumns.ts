export type TranslateFn = (key: string, ...args: unknown[]) => string;

export interface MaterialTableColumnDefinition {
  key: string;
  label: string;
  widthClass?: string;
  alignClass?: string;
}

export const getPlanningMaterialColumns = (t: TranslateFn): MaterialTableColumnDefinition[] => [
  {
    key: 'name',
    label: t('label.material.name'),
    widthClass: 'w-[200px]',
    alignClass: 'text-left',
  },
  {
    key: 'planningTotalQuantity',
    label: t('label.material.planning_total_quantity'),
    widthClass: 'w-[160px]',
  },
  { key: 'unit', label: t('label.material.unit'), widthClass: 'w-[70px]' },
  { key: 'unitPrice', label: t('label.material.unit_price'), widthClass: 'w-[140px]' },
  {
    key: 'planningTotalPrice',
    label: t('label.material.planning_total_price'),
    widthClass: 'w-[160px]',
  },
  { key: 'note', label: t('label.material.note'), widthClass: 'w-[320px]' },
  { key: 'action', label: t('label.action'), widthClass: 'w-[60px]' },
];

export const getMaterialUsageColumns = (t: TranslateFn): MaterialTableColumnDefinition[] => [
  {
    key: 'name',
    label: t('label.material.name'),
    widthClass: 'w-[160px]',
    alignClass: 'text-left',
  },
  { key: 'quantity', label: t('label.material.quantity'), widthClass: 'w-[120px]' },
  {
    key: 'cumulative',
    label: t('label.material.cumulative_completion_rate'),
    widthClass: 'w-[160px]',
  },
  { key: 'unit', label: t('label.material.unit'), widthClass: 'w-[60px]' },
  { key: 'unitPrice', label: t('label.material.unit_price'), widthClass: 'w-[110px]' },
  { key: 'amount', label: t('label.material.price_amount'), widthClass: 'w-[150px]' },
  { key: 'note', label: t('label.material.note'), widthClass: 'w-[320px]' },
  { key: 'receivedDate', label: t('label.material.received_date'), widthClass: 'w-[180px]' },
  { key: 'action', label: t('label.action'), widthClass: 'w-[80px]' },
];

export const getMaterialDefinitionColumns = (t: TranslateFn): MaterialTableColumnDefinition[] => [
  { key: 'name', label: t('label.material.name'), widthClass: 'w-[25%]', alignClass: 'text-left' },
  { key: 'unit', label: t('label.material.unit'), widthClass: 'w-[10%]' },
  {
    key: 'defaultUnitPrice',
    label: t('label.material.default_unit_price'),
    widthClass: 'w-[18%]',
  },
  { key: 'note', label: t('label.material.note'), widthClass: 'w-[30%]' },
  { key: 'action', label: t('label.action'), widthClass: 'w-[4%]' },
];
