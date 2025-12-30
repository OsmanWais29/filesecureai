import { useState } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Building2,
  Landmark,
  User,
  Sparkles,
  ChevronDown,
  ChevronRight,
  GitMerge,
  Copy,
  Plus,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  ImportWizardState, 
  ImportedCreditorRow,
  DuplicateMatch,
} from "@/types/creditor-import";
import { cn } from "@/lib/utils";

interface ImportReviewStepProps {
  state: ImportWizardState;
  updateState: (updates: Partial<ImportWizardState>) => void;
}

export function ImportReviewStep({ state, updateState }: ImportReviewStepProps) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (idx: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(idx)) {
      newExpanded.delete(idx);
    } else {
      newExpanded.add(idx);
    }
    setExpandedRows(newExpanded);
  };

  const updateDuplicateResolution = (rowIndex: number, resolution: DuplicateMatch['resolution']) => {
    const newRows = state.importedRows.map((row, idx) => {
      if (idx === rowIndex && row.duplicateMatch) {
        return {
          ...row,
          duplicateMatch: { ...row.duplicateMatch, resolution },
        };
      }
      return row;
    });
    updateState({ importedRows: newRows });
  };

  const greenRows = state.importedRows.filter(r => r.validation.riskLevel === 'green');
  const yellowRows = state.importedRows.filter(r => r.validation.riskLevel === 'yellow');
  const redRows = state.importedRows.filter(r => r.validation.riskLevel === 'red');
  const governmentRows = state.importedRows.filter(r => r.aiClassification.isGovernment);
  const duplicateRows = state.importedRows.filter(r => r.duplicateMatch);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="bg-green-500/5 border-green-500/20">
          <CardContent className="p-4 text-center">
            <CheckCircle2 className="h-6 w-6 text-green-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-green-500">{greenRows.length}</div>
            <div className="text-xs text-muted-foreground">Ready to Import</div>
          </CardContent>
        </Card>
        <Card className="bg-amber-500/5 border-amber-500/20">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="h-6 w-6 text-amber-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-amber-500">{yellowRows.length}</div>
            <div className="text-xs text-muted-foreground">Review Later</div>
          </CardContent>
        </Card>
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-4 text-center">
            <XCircle className="h-6 w-6 text-destructive mx-auto mb-1" />
            <div className="text-2xl font-bold text-destructive">{redRows.length}</div>
            <div className="text-xs text-muted-foreground">Critical Issues</div>
          </CardContent>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20">
          <CardContent className="p-4 text-center">
            <Landmark className="h-6 w-6 text-blue-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-blue-500">{governmentRows.length}</div>
            <div className="text-xs text-muted-foreground">Government</div>
          </CardContent>
        </Card>
        <Card className="bg-purple-500/5 border-purple-500/20">
          <CardContent className="p-4 text-center">
            <GitMerge className="h-6 w-6 text-purple-500 mx-auto mb-1" />
            <div className="text-2xl font-bold text-purple-500">{duplicateRows.length}</div>
            <div className="text-xs text-muted-foreground">Duplicates</div>
          </CardContent>
        </Card>
      </div>

      {/* AI Classification Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Classification Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {governmentRows.length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
                {governmentRows.length} Government Creditors
              </Badge>
              <span className="text-muted-foreground">- Potential statutory priority applies</span>
            </div>
          )}
          {state.importedRows.filter(r => r.aiClassification.deemedTrustRisk).length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                {state.importedRows.filter(r => r.aiClassification.deemedTrustRisk).length} Deemed Trust Risk
              </Badge>
              <span className="text-muted-foreground">- CRA claims may have super-priority</span>
            </div>
          )}
          {state.importedRows.filter(r => r.aiClassification.suggestedPriority === 'secured').length > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="outline" className="bg-amber-500/10 text-amber-600 border-amber-500/20">
                {state.importedRows.filter(r => r.aiClassification.suggestedPriority === 'secured').length} Secured Claims
              </Badge>
              <span className="text-muted-foreground">- PPSA verification recommended</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Creditor List */}
      <div className="space-y-2">
        <h3 className="text-lg font-semibold">Creditors to Import</h3>
        
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {state.importedRows.map((row, idx) => (
            <Collapsible key={idx} open={expandedRows.has(idx)} onOpenChange={() => toggleRow(idx)}>
              <Card className={cn(
                "transition-colors",
                row.validation.riskLevel === 'red' && "border-destructive/50",
                row.validation.riskLevel === 'yellow' && "border-amber-500/50",
                row.validation.riskLevel === 'green' && "border-green-500/50",
              )}>
                <CollapsibleTrigger asChild>
                  <CardContent className="p-4 cursor-pointer hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      {/* Status Icon */}
                      <div className={cn(
                        "p-2 rounded-full",
                        row.validation.riskLevel === 'red' && "bg-destructive/10",
                        row.validation.riskLevel === 'yellow' && "bg-amber-500/10",
                        row.validation.riskLevel === 'green' && "bg-green-500/10",
                      )}>
                        {row.validation.riskLevel === 'red' ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : row.validation.riskLevel === 'yellow' ? (
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                        ) : (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        )}
                      </div>

                      {/* Creditor Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium truncate">
                            {row.mappedData.name || 'Unknown Creditor'}
                          </span>
                          {row.aiClassification.isGovernment && (
                            <Landmark className="h-4 w-4 text-blue-500" />
                          )}
                          {row.duplicateMatch && (
                            <Badge variant="outline" className="text-xs">Duplicate</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{row.aiClassification.suggestedType}</span>
                          <span>•</span>
                          <span className="capitalize">{row.aiClassification.suggestedPriority}</span>
                          {row.mappedData.claim_amount && (
                            <>
                              <span>•</span>
                              <span>${Number(row.mappedData.claim_amount).toLocaleString()}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Expand Icon */}
                      {expandedRows.has(idx) ? (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardContent>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="px-4 pb-4 space-y-4 border-t border-border pt-4">
                    {/* AI Classification */}
                    <div className="bg-primary/5 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">AI Analysis</span>
                        <Badge variant="outline" className="text-xs">
                          {Math.round(row.aiClassification.confidence * 100)}% confidence
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {row.aiClassification.reasoning}
                      </p>
                    </div>

                    {/* Validation Issues */}
                    {(row.validation.errors.length > 0 || row.validation.warnings.length > 0) && (
                      <div className="space-y-2">
                        {row.validation.errors.map((error, errIdx) => (
                          <div key={errIdx} className="flex items-start gap-2 text-sm text-destructive">
                            <XCircle className="h-4 w-4 mt-0.5 shrink-0" />
                            <span>{error.message}</span>
                          </div>
                        ))}
                        {row.validation.warnings.map((warning, warnIdx) => (
                          <div key={warnIdx} className="flex items-start gap-2 text-sm text-amber-600">
                            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                            <div>
                              <span>{warning.message}</span>
                              {warning.suggestion && (
                                <p className="text-muted-foreground text-xs mt-0.5">
                                  {warning.suggestion}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Duplicate Resolution */}
                    {row.duplicateMatch && (
                      <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-3">
                          <GitMerge className="h-4 w-4 text-purple-500" />
                          <span className="text-sm font-medium">Duplicate Detected</span>
                          <Badge variant="outline" className="text-xs capitalize">
                            {row.duplicateMatch.matchType.replace('_', ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">Resolution:</span>
                          <Select
                            value={row.duplicateMatch.resolution || 'review_later'}
                            onValueChange={(value) => 
                              updateDuplicateResolution(idx, value as DuplicateMatch['resolution'])
                            }
                          >
                            <SelectTrigger className="w-[180px]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="merge">
                                <div className="flex items-center gap-2">
                                  <GitMerge className="h-4 w-4" />
                                  Merge
                                </div>
                              </SelectItem>
                              <SelectItem value="skip">
                                <div className="flex items-center gap-2">
                                  <XCircle className="h-4 w-4" />
                                  Skip
                                </div>
                              </SelectItem>
                              <SelectItem value="create_new">
                                <div className="flex items-center gap-2">
                                  <Plus className="h-4 w-4" />
                                  Create New
                                </div>
                              </SelectItem>
                              <SelectItem value="review_later">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4" />
                                  Review Later
                                </div>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    )}

                    {/* Raw Data */}
                    <div>
                      <span className="text-sm font-medium mb-2 block">Original Data</span>
                      <div className="bg-muted/50 rounded-lg p-3 text-xs font-mono">
                        {Object.entries(row.rawData).map(([key, value]) => (
                          <div key={key} className="flex gap-2">
                            <span className="text-muted-foreground">{key}:</span>
                            <span>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          ))}
        </div>
      </div>
    </div>
  );
}
