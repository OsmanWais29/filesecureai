import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Upload, 
  GitMerge, 
  Search,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { 
  ImportWizardState, 
  ImportSource, 
  ImportedFile, 
  FieldMapping,
  ImportedCreditorRow,
  ImportSummary,
} from "@/types/creditor-import";
import { ImportUploadStep } from "./steps/ImportUploadStep";
import { ImportFieldMappingStep } from "./steps/ImportFieldMappingStep";
import { ImportReviewStep } from "./steps/ImportReviewStep";
import { ImportConfirmStep } from "./steps/ImportConfirmStep";
import { cn } from "@/lib/utils";

interface ImportCreditorWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estateId?: string;
  onComplete: (creditors: ImportedCreditorRow[]) => Promise<void>;
}

const STEPS = [
  { id: 1, title: "Upload & Scan", icon: Upload, description: "Select source and upload files" },
  { id: 2, title: "Map Fields", icon: GitMerge, description: "Match columns to fields" },
  { id: 3, title: "Review AI Findings", icon: Search, description: "Check duplicates and classifications" },
  { id: 4, title: "Confirm Import", icon: CheckCircle2, description: "Final review and import" },
];

const initialState: ImportWizardState = {
  currentStep: 1,
  importSource: null,
  estateId: null,
  files: [],
  fieldMappings: [],
  importedRows: [],
  summary: null,
  isProcessing: false,
  error: null,
};

export function ImportCreditorWizard({ 
  open, 
  onOpenChange, 
  estateId,
  onComplete 
}: ImportCreditorWizardProps) {
  const [state, setState] = useState<ImportWizardState>({
    ...initialState,
    estateId: estateId || null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const progress = (state.currentStep / STEPS.length) * 100;

  const updateState = (updates: Partial<ImportWizardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const canProceed = (): boolean => {
    switch (state.currentStep) {
      case 1:
        return state.importSource !== null && 
          (state.importSource === 'manual_paste' || state.files.length > 0);
      case 2:
        return state.fieldMappings.some(m => m.targetField === 'name');
      case 3:
        return state.importedRows.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (canProceed()) {
      setState(prev => ({ ...prev, currentStep: Math.min(prev.currentStep + 1, STEPS.length) }));
    }
  };

  const handleBack = () => {
    setState(prev => ({ ...prev, currentStep: Math.max(prev.currentStep - 1, 1) }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const creditorToImport = state.importedRows.filter(
        row => row.validation.isValid && 
        (!row.duplicateMatch || row.duplicateMatch.resolution !== 'skip')
      );
      await onComplete(creditorToImport);
      handleClose();
    } catch (error) {
      console.error("Failed to import creditors:", error);
      updateState({ error: "Failed to import creditors. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setState({ ...initialState, estateId: estateId || null });
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (state.currentStep) {
      case 1:
        return (
          <ImportUploadStep 
            state={state}
            updateState={updateState}
          />
        );
      case 2:
        return (
          <ImportFieldMappingStep 
            state={state}
            updateState={updateState}
          />
        );
      case 3:
        return (
          <ImportReviewStep 
            state={state}
            updateState={updateState}
          />
        );
      case 4:
        return (
          <ImportConfirmStep 
            state={state}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl">Import Creditors</DialogTitle>
          
          {/* Step Progress */}
          <div className="mt-4">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = state.currentStep === step.id;
                const isCompleted = state.currentStep > step.id;
                
                return (
                  <div 
                    key={step.id}
                    className={cn(
                      "flex flex-col items-center gap-1 flex-1",
                      index < STEPS.length - 1 && "relative"
                    )}
                  >
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors",
                        isActive && "border-primary bg-primary text-primary-foreground",
                        isCompleted && "border-primary bg-primary/10 text-primary",
                        !isActive && !isCompleted && "border-muted-foreground/30 text-muted-foreground"
                      )}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </div>
                    <span className={cn(
                      "text-xs font-medium text-center hidden sm:block",
                      isActive && "text-primary",
                      !isActive && "text-muted-foreground"
                    )}>
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </DialogHeader>

        {/* Step Content */}
        <div className="flex-1 overflow-y-auto py-6 px-1">
          {renderStepContent()}
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={state.currentStep === 1 ? handleClose : handleBack}
            disabled={isSubmitting}
          >
            {state.currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </>
            )}
          </Button>

          {state.currentStep < STEPS.length ? (
            <Button onClick={handleNext} disabled={!canProceed()}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Import {state.importedRows.filter(r => 
                    r.validation.isValid && 
                    (!r.duplicateMatch || r.duplicateMatch.resolution !== 'skip')
                  ).length} Creditors
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
