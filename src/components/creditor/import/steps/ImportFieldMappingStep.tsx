import { 
  ArrowRight, 
  Check, 
  AlertCircle,
  Sparkles,
} from "lucide-react";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  ImportWizardState, 
  FieldMapping,
  FIELD_MAPPING_OPTIONS,
  CreditorImportField,
  ImportedCreditorRow,
  AICreditorClassification,
} from "@/types/creditor-import";
import { cn } from "@/lib/utils";

interface ImportFieldMappingStepProps {
  state: ImportWizardState;
  updateState: (updates: Partial<ImportWizardState>) => void;
}

export function ImportFieldMappingStep({ state, updateState }: ImportFieldMappingStepProps) {
  const updateFieldMapping = (sourceColumn: string, targetField: CreditorImportField | null) => {
    const newMappings = state.fieldMappings.map(mapping => 
      mapping.sourceColumn === sourceColumn 
        ? { ...mapping, targetField } 
        : mapping
    );
    updateState({ fieldMappings: newMappings });

    // Generate imported rows when mappings change
    generateImportedRows(newMappings, state, updateState);
  };

  const hasNameMapping = state.fieldMappings.some(m => m.targetField === 'name');
  const mappedCount = state.fieldMappings.filter(m => m.targetField !== null).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Map Your Fields</h3>
          <p className="text-sm text-muted-foreground">
            Match your source columns to SecureFiles AI fields
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={hasNameMapping ? "default" : "destructive"}>
            {mappedCount} of {state.fieldMappings.length} mapped
          </Badge>
        </div>
      </div>

      {/* AI Assist Banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-primary mt-0.5" />
        <div>
          <p className="font-medium text-sm">AI Auto-Mapping Applied</p>
          <p className="text-sm text-muted-foreground">
            We've automatically mapped common column names. Review and adjust as needed.
          </p>
        </div>
      </div>

      {/* Mapping Table */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {/* Header Row */}
            <div className="grid grid-cols-[1fr,40px,1fr,120px] gap-4 p-4 bg-muted/50 font-medium text-sm">
              <div>Source Column</div>
              <div></div>
              <div>SecureFiles AI Field</div>
              <div>Sample Values</div>
            </div>

            {/* Mapping Rows */}
            {state.fieldMappings.map((mapping) => (
              <div 
                key={mapping.sourceColumn} 
                className="grid grid-cols-[1fr,40px,1fr,120px] gap-4 p-4 items-center"
              >
                {/* Source Column */}
                <div className="flex items-center gap-2">
                  <span className="font-medium">{mapping.sourceColumn}</span>
                  {mapping.isRequired && (
                    <Badge variant="outline" className="text-xs">Required</Badge>
                  )}
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <ArrowRight className={cn(
                    "h-4 w-4",
                    mapping.targetField ? "text-primary" : "text-muted-foreground"
                  )} />
                </div>

                {/* Target Field Select */}
                <div>
                  <Select
                    value={mapping.targetField || 'skip'}
                    onValueChange={(value) => 
                      updateFieldMapping(
                        mapping.sourceColumn, 
                        value === 'skip' ? null : value as CreditorImportField
                      )
                    }
                  >
                    <SelectTrigger className={cn(
                      mapping.targetField && "border-primary"
                    )}>
                      <SelectValue placeholder="Skip this field" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">
                        <span className="text-muted-foreground">Skip this field</span>
                      </SelectItem>
                      {FIELD_MAPPING_OPTIONS.map((option) => {
                        const isUsed = state.fieldMappings.some(
                          m => m.targetField === option.field && m.sourceColumn !== mapping.sourceColumn
                        );
                        return (
                          <SelectItem 
                            key={option.field} 
                            value={option.field}
                            disabled={isUsed}
                          >
                            <div className="flex items-center gap-2">
                              <span>{option.label}</span>
                              {option.required && (
                                <span className="text-xs text-destructive">*</span>
                              )}
                              {isUsed && (
                                <span className="text-xs text-muted-foreground">(in use)</span>
                              )}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                {/* Sample Values */}
                <div className="text-xs text-muted-foreground truncate">
                  {mapping.sampleValues.slice(0, 2).join(', ')}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Validation Messages */}
      {!hasNameMapping && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="h-4 w-4" />
          <span>Creditor Name is required. Please map a column to "Creditor Name".</span>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">
              {state.files.reduce((sum, f) => sum + (f.scanResult?.creditorCount || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {mappedCount}
            </div>
            <div className="text-sm text-muted-foreground">Fields Mapped</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-muted-foreground">
              {state.fieldMappings.length - mappedCount}
            </div>
            <div className="text-sm text-muted-foreground">Fields Skipped</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function generateImportedRows(
  mappings: FieldMapping[],
  state: ImportWizardState,
  updateState: (updates: Partial<ImportWizardState>) => void
) {
  const importedRows: ImportedCreditorRow[] = [];
  
  state.files.forEach(file => {
    if (!file.scanResult) return;
    
    file.scanResult.sampleData.forEach((row, idx) => {
      const mappedData: Record<string, string> = {};
      
      mappings.forEach(mapping => {
        if (mapping.targetField && row[mapping.sourceColumn]) {
          mappedData[mapping.targetField] = row[mapping.sourceColumn];
        }
      });

      const classification = classifyCreditor(mappedData);

      importedRows.push({
        rowIndex: idx,
        rawData: row,
        mappedData: mappedData as any,
        aiClassification: classification,
        validation: validateRow(mappedData, mappings),
        linkedDocuments: [],
      });
    });
  });

  updateState({ importedRows });
}

function classifyCreditor(data: Record<string, string>): AICreditorClassification {
  const name = (data.name || '').toLowerCase();
  const type = (data.creditor_type || '').toLowerCase();
  
  const isGovernment = name.includes('cra') || 
    name.includes('canada revenue') || 
    name.includes('service canada') ||
    type.includes('government');
  
  const isCRA = name.includes('cra') || name.includes('canada revenue');
  
  return {
    suggestedType: isGovernment ? 'government' : 
      name.includes('bank') || name.includes('td') || name.includes('rbc') ? 'financial_institution' : 
      'other',
    suggestedPriority: type.includes('secured') ? 'secured' : 
      isGovernment ? 'preferred' : 'unsecured',
    claimNature: isCRA ? 'tax' : 'general',
    isGovernment,
    governmentType: isCRA ? 'cra' : undefined,
    deemedTrustRisk: isCRA,
    confidence: 0.85,
    reasoning: isGovernment 
      ? 'Government creditor detected - potential statutory priority applies'
      : 'Standard commercial creditor',
  };
}

function validateRow(data: Record<string, string>, mappings: FieldMapping[]) {
  const errors: { field: string; message: string; code: string }[] = [];
  const warnings: { field: string; message: string; code: string; suggestion?: string }[] = [];

  if (!data.name || !data.name.trim()) {
    errors.push({ field: 'name', message: 'Creditor name is required', code: 'MISSING_NAME' });
  }

  if (!data.claim_amount) {
    warnings.push({ 
      field: 'claim_amount', 
      message: 'No claim amount provided', 
      code: 'MISSING_AMOUNT',
      suggestion: 'Consider adding claim amount before distribution',
    });
  }

  const riskLevel = errors.length > 0 ? 'red' : warnings.length > 0 ? 'yellow' : 'green';

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    riskLevel: riskLevel as 'green' | 'yellow' | 'red',
  };
}
