
import { Button } from "@/components/ui/button";
import { ClientProfileSection } from "./form/ClientProfileSection";
import { EnhancedIncomeSection } from "./form/EnhancedIncomeSection";
import { NonDiscretionaryExpensesSection } from "./form/NonDiscretionaryExpensesSection";
import { EssentialExpensesSection } from "./form/EssentialExpensesSection";
import { DiscretionaryExpensesSection } from "./form/DiscretionaryExpensesSection";
import { SavingsInsuranceSection } from "./form/SavingsInsuranceSection";
import { SurplusIncomeSection } from "./form/SurplusIncomeSection";
import { SignatureConsentSection } from "./form/SignatureConsentSection";
import { HistoricalComparison } from "./components/HistoricalComparison";
import { PrintButton } from "./form/PrintButton";
import { useIncomeExpenseForm } from "./hooks/useIncomeExpenseForm";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect } from "react";
import { toast } from "sonner";
import { Client } from "./types";
import { FormAlerts } from "./form/FormAlerts";
import { NoClientSelected } from "./form/NoClientSelected";
import { PeriodSelection } from "./form/PeriodSelection";
import { useFormSubmission } from "./hooks/useFormSubmission";
import { supabase } from "@/lib/supabase";

interface IncomeExpenseFormProps {
  selectedClient: Client | null;
}

export const IncomeExpenseForm = ({ selectedClient }: IncomeExpenseFormProps) => {
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
          />
          
          {/* Enhanced Income Section */}
          <EnhancedIncomeSection 
            formData={formData} 
            previousMonthData={previousMonthData}
            onChange={handleChange}
            onFrequencyChange={handleFrequencyChange('income')}
          />
          
          {/* Non-Discretionary Expenses Section */}
          <NonDiscretionaryExpensesSection
            formData={formData}
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Essential Expenses Section */}
          <EssentialExpensesSection 
            formData={formData} 
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Discretionary Expenses Section */}
          <DiscretionaryExpensesSection 
            formData={formData} 
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Savings & Insurance Section */}
          <SavingsInsuranceSection 
            formData={formData} 
            previousMonthData={previousMonthData}
            onChange={handleChange}
          />
          
          {/* Surplus Income Section */}
          <SurplusIncomeSection
            formData={formData}
            onChange={handleChange}
          />
          
          {/* Signature & Consent Section */}
          <SignatureConsentSection
            formData={formData}
            onChange={handleChange}
            onConsentChange={handleConsentChange}
          />
          
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Submitting..." : "Submit Financial Data"}
          </Button>
        </>
      )}
    </form>
  );
};
