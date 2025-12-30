import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { 
  FileSpreadsheet, 
  FileText, 
  Files, 
  Copy, 
  ClipboardPaste,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  ImportWizardState, 
  ImportSource, 
  IMPORT_SOURCE_OPTIONS,
  ImportedFile,
  FileScanResult,
} from "@/types/creditor-import";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

interface ImportUploadStepProps {
  state: ImportWizardState;
  updateState: (updates: Partial<ImportWizardState>) => void;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileSpreadsheet,
  FileText,
  Files,
  Copy,
  ClipboardPaste,
};

export function ImportUploadStep({ state, updateState }: ImportUploadStepProps) {
  const [pastedData, setPastedData] = useState("");
  const [isScanning, setIsScanning] = useState(false);

  const selectedSource = IMPORT_SOURCE_OPTIONS.find(s => s.id === state.importSource);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const newFiles: ImportedFile[] = acceptedFiles.map(file => ({
      id: uuidv4(),
      name: file.name,
      size: file.size,
      type: file.type,
      file,
      status: 'pending' as const,
    }));

    updateState({ files: [...state.files, ...newFiles] });

    // Simulate AI scanning
    setIsScanning(true);
    for (const file of newFiles) {
      await simulateScan(file, state, updateState);
    }
    setIsScanning(false);
  }, [state.files, updateState]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedSource?.acceptedFormats.reduce((acc, format) => {
      if (format === '.csv') acc['text/csv'] = ['.csv'];
      if (format === '.xlsx') acc['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'] = ['.xlsx'];
      if (format === '.xls') acc['application/vnd.ms-excel'] = ['.xls'];
      if (format === '.pdf') acc['application/pdf'] = ['.pdf'];
      return acc;
    }, {} as Record<string, string[]>),
    disabled: !state.importSource || state.importSource === 'manual_paste' || state.importSource === 'system_copy',
  });

  const removeFile = (fileId: string) => {
    updateState({ files: state.files.filter(f => f.id !== fileId) });
  };

  const handleSourceSelect = (source: ImportSource) => {
    updateState({ 
      importSource: source, 
      files: [],
      fieldMappings: [],
      importedRows: [],
    });
  };

  const handlePasteData = () => {
    if (!pastedData.trim()) return;

    // Parse pasted data (tab or comma separated)
    const lines = pastedData.trim().split('\n');
    const headers = lines[0].split(/\t|,/).map(h => h.trim());
    const sampleData = lines.slice(1, 4).map(line => {
      const values = line.split(/\t|,/).map(v => v.trim());
      return headers.reduce((acc, header, idx) => {
        acc[header] = values[idx] || '';
        return acc;
      }, {} as Record<string, string>);
    });

    const scanResult: FileScanResult = {
      detectedType: 'Pasted Data',
      documentIntent: 'schedule',
      creditorCount: lines.length - 1,
      columns: headers,
      sampleData,
      warnings: [],
      aiInsights: [
        `Found ${lines.length - 1} rows of data`,
        `Detected ${headers.length} columns`,
      ],
    };

    const pastedFile: ImportedFile = {
      id: uuidv4(),
      name: 'Pasted Data',
      size: pastedData.length,
      type: 'text/plain',
      file: new File([pastedData], 'pasted-data.txt'),
      status: 'scanned',
      scanResult,
    };

    updateState({ files: [pastedFile] });
  };

  return (
    <div className="space-y-6">
      {/* Source Selection */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Select Import Source</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {IMPORT_SOURCE_OPTIONS.map((source) => {
            const Icon = iconMap[source.icon] || FileText;
            const isSelected = state.importSource === source.id;
            
            return (
              <Card 
                key={source.id}
                className={cn(
                  "cursor-pointer transition-all hover:border-primary/50",
                  isSelected && "border-primary bg-primary/5"
                )}
                onClick={() => handleSourceSelect(source.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-lg",
                      isSelected ? "bg-primary/10" : "bg-muted"
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm">{source.title}</h4>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                        {source.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Upload Area or Manual Paste */}
      {state.importSource && (
        <div>
          {state.importSource === 'manual_paste' ? (
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">Paste Your Data</h3>
              <p className="text-sm text-muted-foreground">
                Paste table data directly from Excel. Include headers in the first row.
              </p>
              <Textarea
                placeholder="Name&#9;Account #&#9;Amount&#9;Type&#10;John Smith&#9;12345&#9;5000&#9;Unsecured&#10;..."
                className="min-h-[200px] font-mono text-sm"
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
              />
              <Button onClick={handlePasteData} disabled={!pastedData.trim()}>
                <Sparkles className="h-4 w-4 mr-2" />
                Scan Pasted Data
              </Button>
            </div>
          ) : state.importSource === 'system_copy' ? (
            <div className="text-center py-8 text-muted-foreground">
              <Copy className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Estate copy feature coming soon</p>
            </div>
          ) : (
            <div>
              <h3 className="text-lg font-semibold mb-3">Upload Files</h3>
              <div
                {...getRootProps()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                  isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                <input {...getInputProps()} />
                <Upload className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                <p className="text-sm font-medium">
                  {isDragActive ? "Drop files here..." : "Drag & drop files, or click to browse"}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Accepted formats: {selectedSource?.acceptedFormats.join(', ')}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Uploaded Files List */}
      {state.files.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">Uploaded Files</h3>
          <div className="space-y-3">
            {state.files.map((file) => (
              <Card key={file.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        file.status === 'scanned' ? "bg-green-500/10" : 
                        file.status === 'scanning' ? "bg-amber-500/10" : 
                        file.status === 'error' ? "bg-destructive/10" : "bg-muted"
                      )}>
                        {file.status === 'scanning' ? (
                          <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
                        ) : file.status === 'scanned' ? (
                          <CheckCircle2 className="h-5 w-5 text-green-500" />
                        ) : file.status === 'error' ? (
                          <AlertCircle className="h-5 w-5 text-destructive" />
                        ) : (
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {(file.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeFile(file.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Scan Results */}
                  {file.scanResult && (
                    <div className="mt-4 pt-4 border-t border-border">
                      <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Scan Results</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Detected Type</p>
                          <p className="text-sm font-medium">{file.scanResult.detectedType}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Document Intent</p>
                          <p className="text-sm font-medium capitalize">{file.scanResult.documentIntent.replace('_', ' ')}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Creditors Found</p>
                          <p className="text-sm font-medium">{file.scanResult.creditorCount}</p>
                        </div>
                        <div className="bg-muted/50 rounded-lg p-2">
                          <p className="text-xs text-muted-foreground">Columns</p>
                          <p className="text-sm font-medium">{file.scanResult.columns.length}</p>
                        </div>
                      </div>

                      {/* AI Insights */}
                      {file.scanResult.aiInsights.length > 0 && (
                        <div className="space-y-1">
                          {file.scanResult.aiInsights.map((insight, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-sm">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                              <span>{insight}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Warnings */}
                      {file.scanResult.warnings.length > 0 && (
                        <div className="mt-3 space-y-1">
                          {file.scanResult.warnings.map((warning, idx) => (
                            <Badge key={idx} variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                              {warning}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      {state.files.some(f => f.scanResult) && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold">AI Pre-Scan Summary</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Total Creditors:</span>
              <span className="ml-2 font-medium">
                {state.files.reduce((sum, f) => sum + (f.scanResult?.creditorCount || 0), 0)}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Files Scanned:</span>
              <span className="ml-2 font-medium">
                {state.files.filter(f => f.status === 'scanned').length}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simulate AI scanning
async function simulateScan(
  file: ImportedFile, 
  state: ImportWizardState, 
  updateState: (updates: Partial<ImportWizardState>) => void
) {
  // Update status to scanning
  updateState({
    files: state.files.map(f => 
      f.id === file.id ? { ...f, status: 'scanning' as const } : f
    ),
  });

  // Simulate processing delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Generate mock scan result
  const isCSV = file.name.endsWith('.csv') || file.name.endsWith('.xlsx');
  const isPDF = file.name.endsWith('.pdf');

  const mockResult: FileScanResult = {
    detectedType: isCSV ? 'Spreadsheet' : isPDF ? 'PDF Document' : 'Unknown',
    documentIntent: isCSV ? 'schedule' : 'proof_of_claim',
    creditorCount: Math.floor(Math.random() * 20) + 5,
    columns: ['Creditor Name', 'Account Number', 'Amount', 'Type', 'Address'],
    sampleData: [
      { 'Creditor Name': 'TD Bank', 'Account Number': '12345', 'Amount': '25000', 'Type': 'Secured' },
      { 'Creditor Name': 'CRA', 'Account Number': 'GST-001', 'Amount': '15000', 'Type': 'Government' },
      { 'Creditor Name': 'Visa', 'Account Number': '9876', 'Amount': '8500', 'Type': 'Unsecured' },
    ],
    warnings: Math.random() > 0.5 ? ['3 rows appear to be duplicates'] : [],
    aiInsights: [
      `Found ${Math.floor(Math.random() * 3) + 1} government creditors`,
      'No claim amounts found for 5 creditors',
      '2 potential secured claims detected',
    ],
  };

  // Update with scan result
  const currentFiles = state.files;
  updateState({
    files: currentFiles.map(f => 
      f.id === file.id ? { ...f, status: 'scanned' as const, scanResult: mockResult } : f
    ),
    fieldMappings: mockResult.columns.map(col => ({
      sourceColumn: col,
      targetField: autoMapColumn(col),
      confidence: 0.85,
      isRequired: col.toLowerCase().includes('name'),
      sampleValues: mockResult.sampleData.map(row => row[col] || '').slice(0, 3),
    })),
  });
}

function autoMapColumn(columnName: string): import("@/types/creditor-import").CreditorImportField | null {
  const lowerCol = columnName.toLowerCase();
  if (lowerCol.includes('name') && !lowerCol.includes('contact')) return 'name';
  if (lowerCol.includes('account') || lowerCol.includes('reference')) return 'account_number';
  if (lowerCol.includes('amount') || lowerCol.includes('claim')) return 'claim_amount';
  if (lowerCol.includes('type')) return 'creditor_type';
  if (lowerCol.includes('priority') || lowerCol.includes('secured')) return 'priority';
  if (lowerCol.includes('address') && !lowerCol.includes('email')) return 'address';
  if (lowerCol.includes('city')) return 'city';
  if (lowerCol.includes('province') || lowerCol.includes('state')) return 'province';
  if (lowerCol.includes('postal') || lowerCol.includes('zip')) return 'postal_code';
  if (lowerCol.includes('email')) return 'email';
  if (lowerCol.includes('phone')) return 'phone';
  if (lowerCol.includes('contact')) return 'contact_person';
  if (lowerCol.includes('note')) return 'notes';
  return null;
}
