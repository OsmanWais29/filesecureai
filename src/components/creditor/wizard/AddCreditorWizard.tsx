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
  User, 
  FileText, 
  Upload, 
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { AddCreditorFormData } from "@/types/creditor";
import { CreditorIdentityStep } from "./steps/CreditorIdentityStep";
import { ClaimPriorityStep } from "./steps/ClaimPriorityStep";
import { DocumentsStep } from "./steps/DocumentsStep";
import { ReviewStep } from "./steps/ReviewStep";
import { cn } from "@/lib/utils";

interface AddCreditorWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estateId?: string;
  onComplete: (data: AddCreditorFormData) => Promise<void>;
}

const STEPS = [
  { id: 1, title: "Creditor Identity", icon: User, description: "Who is the creditor?" },
  { id: 2, title: "Claim & Priority", icon: FileText, description: "What is being claimed?" },
  { id: 3, title: "Documents", icon: Upload, description: "Supporting evidence" },
  { id: 4, title: "Review & AI", icon: CheckCircle2, description: "Final review" },
];

const initialFormData: AddCreditorFormData = {
  name: "",
  creditor_type: "other",
  country: "Canada",
  currency: "CAD",
  claim_filed: "not_yet_filed",
  priority: "unsecured",
};

export function AddCreditorWizard({ 
  open, 
  onOpenChange, 
  estateId,
  onComplete 
}: AddCreditorWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<AddCreditorFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<number, string[]>>({});

  const progress = (currentStep / STEPS.length) * 100;

  const updateFormData = (updates: Partial<AddCreditorFormData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const validateStep = (step: number): boolean => {
    const errors: string[] = [];

    switch (step) {
      case 1:
        if (!formData.name.trim()) errors.push("Creditor name is required");
        if (!formData.creditor_type) errors.push("Creditor type is required");
        break;
      case 2:
        if (formData.claim_filed === "yes" && !formData.claim_amount) {
          errors.push("Claim amount is required when claim is filed");
        }
        if (formData.priority === "secured" && !formData.security_type) {
          errors.push("Security type is required for secured claims");
        }
        break;
      case 3:
        // Documents are optional but recommended
        break;
      case 4:
        // Final review - no validation needed
        break;
    }

    setStepErrors(prev => ({ ...prev, [step]: errors }));
    return errors.length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    try {
      await onComplete(formData);
      handleClose();
    } catch (error) {
      console.error("Failed to create creditor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentStep(1);
    setFormData(initialFormData);
    setStepErrors({});
    onOpenChange(false);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <CreditorIdentityStep 
            formData={formData} 
            updateFormData={updateFormData}
            errors={stepErrors[1] || []}
          />
        );
      case 2:
        return (
          <ClaimPriorityStep 
            formData={formData} 
            updateFormData={updateFormData}
            errors={stepErrors[2] || []}
          />
        );
      case 3:
        return (
          <DocumentsStep 
            formData={formData} 
            updateFormData={updateFormData}
            errors={stepErrors[3] || []}
          />
        );
      case 4:
        return (
          <ReviewStep 
            formData={formData}
          />
        );
      default:
        return null;
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4 border-b border-border">
          <DialogTitle className="text-xl">Add New Creditor</DialogTitle>
          
          {/* Step Progress */}
          <div className="mt-4">
            <Progress value={progress} className="h-2 mb-4" />
            <div className="flex justify-between">
              {STEPS.map((step, index) => {
                const StepIcon = step.icon;
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                
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
            onClick={currentStep === 1 ? handleClose : handleBack}
            disabled={isSubmitting}
          >
            {currentStep === 1 ? (
              "Cancel"
            ) : (
              <>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </>
            )}
          </Button>

          {currentStep < STEPS.length ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Create Creditor
                </>
              )}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
