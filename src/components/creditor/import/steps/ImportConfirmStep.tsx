import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  FileText,
  Users,
  DollarSign,
  Shield,
  Landmark,
  Clock,
  ListChecks,
  Sparkles,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ImportWizardState, ImportSummary } from "@/types/creditor-import";
import { cn } from "@/lib/utils";

interface ImportConfirmStepProps {
  state: ImportWizardState;
}

export function ImportConfirmStep({ state }: ImportConfirmStepProps) {
  const validRows = state.importedRows.filter(
    r => r.validation.isValid && 
    (!r.duplicateMatch || r.duplicateMatch.resolution !== 'skip')
  );
  
  const skippedRows = state.importedRows.filter(
    r => !r.validation.isValid || 
    (r.duplicateMatch && r.duplicateMatch.resolution === 'skip')
  );

  const summary: ImportSummary = {
    totalCreditors: state.importedRows.length,
    newCreditors: validRows.length,
    duplicatesResolved: state.importedRows.filter(r => r.duplicateMatch && r.duplicateMatch.resolution).length,
    duplicatesSkipped: state.importedRows.filter(r => r.duplicateMatch?.resolution === 'skip').length,
    duplicatesMerged: state.importedRows.filter(r => r.duplicateMatch?.resolution === 'merge').length,
    missingClaimAmounts: state.importedRows.filter(r => !r.mappedData.claim_amount).length,
    missingProofsOfClaim: state.importedRows.length, // All new imports need POC
    priorityIssues: state.importedRows.filter(r => 
      r.validation.warnings.some(w => w.code.includes('PRIORITY'))
    ).length,
    lateFilingRisks: 0,
    governmentCreditors: state.importedRows.filter(r => r.aiClassification.isGovernment).length,
    greenCount: state.importedRows.filter(r => r.validation.riskLevel === 'green').length,
    yellowCount: state.importedRows.filter(r => r.validation.riskLevel === 'yellow').length,
    redCount: state.importedRows.filter(r => r.validation.riskLevel === 'red').length,
  };

  const totalClaimAmount = validRows.reduce((sum, r) => 
    sum + (Number(r.mappedData.claim_amount) || 0), 0
  );

  // Tasks that will be created
  const tasksToCreate = [
    ...validRows.filter(r => !r.mappedData.claim_amount).map(r => ({
      title: `Request proof of claim from ${r.mappedData.name}`,
      type: 'document_request',
    })),
    ...validRows.filter(r => r.aiClassification.isGovernment && r.aiClassification.governmentType === 'cra').map(r => ({
      title: `Review CRA priority breakdown for ${r.mappedData.name}`,
      type: 'compliance_review',
    })),
    ...validRows.filter(r => r.aiClassification.suggestedPriority === 'secured').map(r => ({
      title: `Verify secured claim documentation for ${r.mappedData.name}`,
      type: 'document_verification',
    })),
  ];

  return (
    <div className="space-y-6">
      {/* Main Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-primary" />
            Import Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-background rounded-lg">
              <Users className="h-6 w-6 mx-auto mb-1 text-primary" />
              <div className="text-2xl font-bold">{validRows.length}</div>
              <div className="text-xs text-muted-foreground">Creditors to Import</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <DollarSign className="h-6 w-6 mx-auto mb-1 text-green-500" />
              <div className="text-2xl font-bold">
                ${totalClaimAmount.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">Total Claims</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <Landmark className="h-6 w-6 mx-auto mb-1 text-blue-500" />
              <div className="text-2xl font-bold">{summary.governmentCreditors}</div>
              <div className="text-xs text-muted-foreground">Government Creditors</div>
            </div>
            <div className="text-center p-3 bg-background rounded-lg">
              <ListChecks className="h-6 w-6 mx-auto mb-1 text-amber-500" />
              <div className="text-2xl font-bold">{tasksToCreate.length}</div>
              <div className="text-xs text-muted-foreground">Tasks to Create</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Status Breakdown */}
      <div className="grid grid-cols-3 gap-4">
        <Card className={cn(
          "border-l-4",
          summary.greenCount > 0 ? "border-l-green-500" : "border-l-muted"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{summary.greenCount}</div>
                <div className="text-sm text-muted-foreground">Clean Records</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-l-4",
          summary.yellowCount > 0 ? "border-l-amber-500" : "border-l-muted"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-amber-500" />
              <div>
                <div className="text-2xl font-bold">{summary.yellowCount}</div>
                <div className="text-sm text-muted-foreground">Review Later</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={cn(
          "border-l-4",
          summary.redCount > 0 ? "border-l-destructive" : "border-l-muted"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <XCircle className="h-8 w-8 text-destructive" />
              <div>
                <div className="text-2xl font-bold">{summary.redCount}</div>
                <div className="text-sm text-muted-foreground">Critical Issues</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Import Details */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Import Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total records scanned</span>
              <span className="font-medium">{summary.totalCreditors}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Will be imported</span>
              <span className="font-medium text-green-600">{validRows.length}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Skipped (duplicates)</span>
              <span className="font-medium">{summary.duplicatesSkipped}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Will be merged</span>
              <span className="font-medium">{summary.duplicatesMerged}</span>
            </div>
            <Separator />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Missing claim amounts</span>
              <Badge variant="outline" className={cn(
                summary.missingClaimAmounts > 0 ? "bg-amber-500/10 text-amber-600" : "bg-green-500/10 text-green-600"
              )}>
                {summary.missingClaimAmounts}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Auto-Created Tasks */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              Tasks to be Created
            </CardTitle>
          </CardHeader>
          <CardContent>
            {tasksToCreate.length > 0 ? (
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {tasksToCreate.slice(0, 5).map((task, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="truncate">{task.title}</span>
                  </div>
                ))}
                {tasksToCreate.length > 5 && (
                  <p className="text-xs text-muted-foreground">
                    +{tasksToCreate.length - 5} more tasks
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No automated tasks needed</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Audit Trail Notice */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-primary mt-0.5" />
            <div>
              <h4 className="font-medium text-sm">Audit Trail</h4>
              <p className="text-sm text-muted-foreground mt-1">
                This import will be logged with source file hash, timestamp, field mappings used, 
                and all AI suggestions. OSB-ready audit trail will be automatically created.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Creditors Preview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Creditors to Import ({validRows.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {validRows.map((row, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-2 w-2 rounded-full",
                    row.validation.riskLevel === 'green' && "bg-green-500",
                    row.validation.riskLevel === 'yellow' && "bg-amber-500",
                    row.validation.riskLevel === 'red' && "bg-destructive",
                  )} />
                  <span className="font-medium text-sm">{row.mappedData.name}</span>
                  {row.aiClassification.isGovernment && (
                    <Badge variant="outline" className="text-xs">Gov</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="capitalize">{row.aiClassification.suggestedPriority}</span>
                  {row.mappedData.claim_amount && (
                    <span>${Number(row.mappedData.claim_amount).toLocaleString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
