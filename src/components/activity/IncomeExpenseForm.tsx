
import { Button } from "@/components/ui/button";
import { ClientProfileSection } from "./form/ClientProfileSection";
import { IncomeTable } from "./form/IncomeTable";
import { ExpenseTable } from "./form/ExpenseTable";
import { SavingsInsuranceTable } from "./form/SavingsInsuranceTable";
import { SurplusIncomeSection } from "./form/SurplusIncomeSection";
import { SignatureConsentSection } from "./form/SignatureConsentSection";
import { HistoricalComparison } from "./components/HistoricalComparison";
import { PrintButton } from "./form/PrintButton";
import { useIncomeExpenseForm } from "./hooks/useIncomeExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Client } from "./types";
import { FormAlerts } from "./form/FormAlerts";
import { NoClientSelected } from "./form/NoClientSelected";
import { PeriodSelection } from "./form/PeriodSelection";
import { useFormSubmission } from "./hooks/useFormSubmission";
import { useEditableFields } from "./hooks/useEditableFields";

interface IncomeExpenseFormProps {
  selectedClient: Client | null;
}

export const IncomeExpenseForm = ({ selectedClient }: IncomeExpenseFormProps) => {
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  
  const {
    formData,
    isSubmitting,
    currentRecordId,
    historicalData,
    previousMonthData,
    selectedPeriod,
    isDataLoading,
    handleChange,
    handleFrequencyChange,
    handleSubmit,
    handlePeriodChange,
    handleFieldSelectChange,
  } = useIncomeExpenseForm(selectedClient);
  
  const { formSubmitted, onSubmitForm } = useFormSubmission({
    handleSubmit,
    selectedClient
  });
  
  // Add use of the editable fields hook
  const { isFieldEditable, toggleFieldEdit, setAllFieldsToViewMode } = useEditableFields();

  const handleConsentChange = (checked: boolean) => {
    const consentEvent = {
      target: {
        name: 'consent_data_use',
        value: checked ? 'true' : 'false'
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    handleChange(consentEvent);
    
    // If consent is given, set the consent date to today
    if (checked) {
      const todayDate = new Date().toISOString().split('T')[0];
      const dateEvent = {
        target: {
          name: 'consent_date',
          value: todayDate
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      handleChange(dateEvent);
    }
  };

  useEffect(() => {
    if (!selectedClient) {
      const timer = setTimeout(() => {
        toast.info("Select a client to begin", {
          description: "Choose a client above to see their financial data",
          duration: 5000,
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [selectedClient]);
  
  // Set to view mode when client or period changes
  useEffect(() => {
    setAllFieldsToViewMode();
  }, [selectedClient, selectedPeriod, setAllFieldsToViewMode]);
  
  // Set first load flag to false after initial loading
  useEffect(() => {
    if (!isDataLoading && isFirstLoad) {
      setIsFirstLoad(false);
    }
  }, [isDataLoading, isFirstLoad]);

  if (!selectedClient) {
    return <NoClientSelected />;
  }

  return (
    <form onSubmit={onSubmitForm} className="space-y-6">
      <FormAlerts formSubmitted={formSubmitted} />
      
      {isDataLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
          <Skeleton className="h-[400px] w-full rounded-lg" />
        </div>
      ) : (
        <>
          {/* Print Button */}
          <div className="flex justify-end">
            <PrintButton formData={formData} />
          </div>
          
          <HistoricalComparison
            currentPeriod={historicalData.currentPeriod}
            previousPeriod={historicalData.previousPeriod}
          />

          <PeriodSelection 
            selectedPeriod={selectedPeriod}
            handlePeriodChange={handlePeriodChange}
          />
          
          {/* Client Profile Section */}
          <ClientProfileSection 
            formData={formData} 
            onChange={handleChange}
            onMaritalStatusChange={(value) => handleFieldSelectChange('marital_status', value)}
            isViewMode={!isFirstLoad}
            isFieldEditable={isFieldEditable}
            onToggleFieldEdit={toggleFieldEdit}
          />
          
          {/* Income Table */}
          <IncomeTable 
            formData={formData} 
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Expense Table */}
          <ExpenseTable
            formData={formData}
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Savings & Insurance Table */}
          <SavingsInsuranceTable 
            formData={formData} 
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Surplus Income Section */}
          <SurplusIncomeSection
            formData={formData}
            onChange={handleChange}
            isViewMode={!isFirstLoad}
            isFieldEditable={isFieldEditable}
            onToggleFieldEdit={toggleFieldEdit}
          />
          
          {/* Signature & Consent Section */}
          <SignatureConsentSection
            formData={formData}
            onChange={handleChange}
            onConsentChange={handleConsentChange}
            isViewMode={!isFirstLoad}
            isFieldEditable={isFieldEditable}
            onToggleFieldEdit={toggleFieldEdit}
            clientName={selectedClient.name}
          />
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Updating..." : currentRecordId ? "Update Financial Data" : "Submit Financial Data"}
          </Button>
        </>
      )}
    </form>
  );
};
