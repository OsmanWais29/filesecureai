
export interface ExcelErrorDisplayProps {
  error: string;
  onRefresh: () => void;
  publicUrl: string;
}

export interface ExcelHeaderActionsProps {
  title?: string;
  onRefresh: () => void;
  publicUrl: string;
}

export interface ExcelTableProps {
  data: Record<string, any>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface SheetMetadata {
  sheetNames: string[];
  totalRows: number;
  totalColumns: number;
}

export interface ExcelData {
  headers: string[];
  rows: (string | number | null)[][];
  metadata?: SheetMetadata;
}

export interface UseExcelPreviewReturn {
  excelData: ExcelData | null;
  loading: boolean;
  error: string | null;
  activeSheet: number;
  changeSheet: (index: number) => void;
  refresh: () => void;
}
