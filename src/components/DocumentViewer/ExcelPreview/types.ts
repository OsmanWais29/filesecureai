
export interface SheetMetadata {
  fileName: string;
  sheetNames: string[];
  totalSheets: number;
  totalRows: number;
  totalColumns: number;
}

export interface ExcelSheetData {
  headers: string[];
  rows: any[][];
  metadata: SheetMetadata;
}

export interface ExcelPreviewProps {
  fileUrl?: string;
  documentId: string;
  onDataLoaded?: (data: ExcelSheetData) => void;
  selectedSheet?: string;
  onSheetSelect?: (sheetName: string) => void;
}

export interface ExcelTableProps {
  data: ExcelSheetData;
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
}

export interface ExcelHeaderActionsProps {
  sheetNames: string[];
  selectedSheet: string;
  onSheetSelect: (sheetName: string) => void;
  fileName: string;
}

export interface ExcelErrorDisplayProps {
  error: string;
  onRetry: () => void;
}
