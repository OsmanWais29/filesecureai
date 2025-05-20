
export interface SheetMetadata {
  fileName: string;
  sheetNames: string[];
  totalSheets: number;
  totalRows: number;
  totalColumns: number;
}

export interface ExcelData {
  headers: string[];
  rows: any[][];
  metadata: SheetMetadata;
}

export interface ExcelSheetData {
  headers: string[];
  rows: any[][];
  metadata: SheetMetadata;
  name?: string;
  columns?: string[];
  data?: any[][];
}

export interface ExcelPreviewProps {
  fileUrl?: string;
  documentId: string;
  onDataLoaded?: (data: ExcelSheetData) => void;
  selectedSheet?: string;
  onSheetSelect?: (sheetName: string) => void;
}

export interface ExcelTableProps {
  data: any[];
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
  enableSorting?: boolean;
  enableFiltering?: boolean;
}

export interface ExcelHeaderActionsProps {
  sheetNames: string[];
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
  fileName: string;
  title?: string;
  onRefresh?: () => void;
  publicUrl?: string;
}

export interface ExcelErrorDisplayProps {
  error: string;
  onRetry: () => void;
  onRefresh?: () => void;
  publicUrl?: string;
}
