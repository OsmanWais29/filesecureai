
export interface ExcelPreviewProps {
  url: string;
  documentId?: string;
  title?: string;
}

export interface ExcelData {
  headers: string[];
  rows: any[][];
  metadata?: {
    fileName?: string;
    sheetNames?: string[];
    totalSheets?: number;
    [key: string]: any;
  };
}

export interface ExcelSheetData {
  name: string;
  data: any[][];
  columns: string[];
}

export interface ExcelTableProps {
  data: Record<string, any>[];
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface ExcelHeaderActionsProps {
  title?: string;
  onRefresh: () => void;
  publicUrl: string;
}

export interface ExcelErrorDisplayProps {
  error: string;
  onRefresh: () => void;
  publicUrl: string;
}
