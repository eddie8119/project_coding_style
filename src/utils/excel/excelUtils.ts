import * as XLSX from 'xlsx';

export const getCellText = (cell: XLSX.CellObject | undefined): string => {
  if (!cell || cell.v == null) return '';

  if (typeof cell.v === 'string') {
    return cell.v.trim();
  }

  return String(cell.v).trim();
};
