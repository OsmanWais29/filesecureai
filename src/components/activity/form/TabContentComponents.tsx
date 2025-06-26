
import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ClientProfileSection } from "../ClientProfileSection";
import { IncomeTable } from "./IncomeTable";
import { ExpenseTable } from "./ExpenseTable";
import { SavingsInsuranceTable } from "./SavingsInsuranceTable";
import { SurplusIncomeSection } from "../SurplusIncomeSection";
import { SignatureConsentSection } from "../SignatureConsentSection";

// Create the TabContentComponents object with all components
export const TabContentComponents = {
  ClientProfileTabContent: ({ 
    formData, 
    onChange, 
    onSaveDraft, 
    setActiveTab,
    handleFieldSelectChange,
    isNewClientMode,
    newClient
  }: any) => (
    <div className="space-y-6">
      <ClientProfileSection 
        formData={formData} 
        onChange={onChange}
        onMaritalStatusChange={(value) => handleFieldSelectChange('marital_status', value)}
        isNewClientMode={isNewClientMode}
        newClient={newClient}
      />
      
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onSaveDraft}>
          <Save className="h-4 w-4 mr-2" /> Save Draft
        </Button>
        <Button type="button" onClick={() => setActiveTab("income")}>
          Next: Income Details
        </Button>
      </div>
    </div>
  ),

  IncomeTabContent: ({ 
    formData, 
    previousMonthData, 
    onChange, 
    onFrequencyChange, 
    onSaveDraft, 
    setActiveTab 
  }: any) => (
    <div className="space-y-6">
      <IncomeTable 
        formData={formData} 
        previousMonthData={previousMonthData}
        onChange={onChange}
      />
      
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setActiveTab("client")}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button type="button" onClick={() => setActiveTab("expenses")}>
            Next: Expenses
          </Button>
        </div>
      </div>
    </div>
  ),

  ExpensesTabContent: ({ 
    formData, 
    previousMonthData, 
    onChange, 
    onSaveDraft, 
    setActiveTab 
  }: any) => (
    <div className="space-y-6">
      <ExpenseTable
        formData={formData}
        previousMonthData={previousMonthData}
        onChange={onChange}
      />
      
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setActiveTab("income")}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button type="button" onClick={() => setActiveTab("savings")}>
            Next: Savings & Insurance
          </Button>
        </div>
      </div>
    </div>
  ),

  SavingsTabContent: ({ 
    formData, 
    previousMonthData, 
    onChange, 
    onSaveDraft, 
    setActiveTab 
  }: any) => (
    <div className="space-y-6">
      <SavingsInsuranceTable 
        formData={formData} 
        previousMonthData={previousMonthData}
        onChange={onChange}
      />
      
      <SurplusIncomeSection
        formData={formData}
        onChange={onChange}
      />
      
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setActiveTab("expenses")}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button type="button" onClick={() => setActiveTab("signature")}>
            Next: Sign & Submit
          </Button>
        </div>
      </div>
    </div>
  ),

  SignatureTabContent: ({ 
    formData, 
    onChange, 
    onConsentChange,
    onSaveDraft, 
    handleDocumentSubmit,
    isSubmitting,
    setActiveTab 
  }: any) => (
    <div className="space-y-6">
      <SignatureConsentSection
        formData={formData}
        onChange={onChange}
        onConsentChange={onConsentChange}
      />
      
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setActiveTab("savings")}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting} onClick={handleDocumentSubmit}>
            {isSubmitting ? "Submitting..." : "Submit Form"}
          </Button>
        </div>
      </div>
    </div>
  )
};
