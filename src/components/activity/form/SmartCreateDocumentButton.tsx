
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileText, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IncomeExpenseData } from "../types";
import { toast } from "sonner";

interface SmartCreateDocumentButtonProps {
  formData: IncomeExpenseData;
  selectedClient: { id: string; name: string } | null;
  isSubmitting: boolean;
  onSubmit: (e: React.FormEvent) => void;
  isUpdate?: boolean;
}

export const SmartCreateDocumentButton = ({ 
  formData, 
  selectedClient, 
  isSubmitting,
  onSubmit,
  isUpdate = false
}: SmartCreateDocumentButtonProps) => {
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Validate required fields
  const validateForm = (): { isValid: boolean; missingFields: string[] } => {
    const requiredFields: Array<{key: keyof IncomeExpenseData; label: string}> = [
      { key: 'full_name', label: 'Full Name' },
      { key: 'residential_address', label: 'Residential Address' },
      { key: 'employment_income', label: 'Employment Income' },
      { key: 'total_monthly_income', label: 'Total Monthly Income' },
      { key: 'total_essential_expenses', label: 'Total Essential Expenses' }
    ];
    
    const missingFields = requiredFields.filter(field => 
      !formData[field.key] || formData[field.key] === '0' || formData[field.key] === '0.00'
    ).map(field => field.label);
    
    return { 
      isValid: missingFields.length === 0,
      missingFields
    };
  };
  
  const isButtonDisabled = (): boolean => {
    if (!selectedClient) return true;
    if (isSubmitting || isProcessing) return true;
    
    const { isValid } = validateForm();
    return !isValid;
  };
  
  const handleCreateDocument = async () => {
    const { isValid, missingFields } = validateForm();
    
    if (!selectedClient) {
      toast.error("Please select a client first");
      return;
    }
    
    if (!isValid) {
      toast.error(`Please complete the following required fields: ${missingFields.join(', ')}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // Call the submit handler first
      onSubmit(new Event('submit') as unknown as React.FormEvent);
      
      // Simulate document creation and categorization
      setTimeout(() => {
        toast.success(isUpdate ? "Document updated successfully" : "Document created and categorized successfully", {
          description: `${isUpdate ? "Updated in" : "Added to"} ${selectedClient.name}'s Financial Statements folder`,
          action: {
            label: "View Document",
            onClick: () => navigate(`/client/${selectedClient.id}/documents`)
          }
        });
        
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Error with document:", error);
      toast.error(isUpdate ? "Failed to update document" : "Failed to create document");
      setIsProcessing(false);
    }
  };
  
  return (
    <Button
      onClick={handleCreateDocument}
      disabled={isButtonDisabled()}
      className={`${isButtonDisabled() ? 'opacity-70' : 'opacity-100'} flex items-center gap-2`}
      size="lg"
    >
      {isProcessing ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {isUpdate ? "Updating..." : "Processing..."}
        </>
      ) : (
        <>
          {validateForm().isValid ? (
            <CheckCircle className="h-4 w-4" />
          ) : (
            <FileText className="h-4 w-4" />
          )}
          {isUpdate ? "Update Income & Expense Document" : "Create Income & Expense Document"}
        </>
      )}
    </Button>
  );
};
