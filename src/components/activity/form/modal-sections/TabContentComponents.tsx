import React from "react";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { ClientProfileSection } from "../ClientProfileSection";
import { EnhancedIncomeSection } from "../EnhancedIncomeSection";
import { NonDiscretionaryExpensesSection } from "../NonDiscretionaryExpensesSection";
import { EssentialExpensesSection } from "../EssentialExpensesSection";
import { DiscretionaryExpensesSection } from "../DiscretionaryExpensesSection";
import { SavingsInsuranceSection } from "../SavingsInsuranceSection";
import { SurplusIncomeSection } from "../SurplusIncomeSection";
import { SignatureConsentSection } from "../SignatureConsentSection";
import { PrintButton } from "../PrintButton";
import { SmartCreateDocumentButton } from "../SmartCreateDocumentButton";
import { Client } from "../../types";
import { FileUploadSection } from "../upload/FileUploadSection";

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
      <EnhancedIncomeSection 
        formData={formData} 
        previousMonthData={previousMonthData}
        onChange={onChange}
        onFrequencyChange={onFrequencyChange}
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
      <NonDiscretionaryExpensesSection
        formData={formData}
        previousMonthData={previousMonthData}
        onChange={onChange}
      />
    
      <EssentialExpensesSection 
        formData={formData} 
        previousMonthData={previousMonthData}
        onChange={onChange}
      />
      
      <DiscretionaryExpensesSection 
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
      <SavingsInsuranceSection 
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
          <Button type="button" onClick={() => setActiveTab("uploads")}>
            Next: Documents
          </Button>
        </div>
      </div>
    </div>
  ),

  UploadsTabContent: ({ 
    formData, 
    clientName,
    onSaveDraft, 
    setActiveTab 
  }: any) => (
    <div className="space-y-6">
      <FileUploadSection 
        clientName={clientName}
        onDocumentUpload={(documentId) => {
          console.log("Document uploaded:", documentId);
          // Document was uploaded, could store this ID in the form data if needed
        }} 
      />
      
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setActiveTab("savings")}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <Button type="button" onClick={() => setActiveTab("signature")}>
            Next: Signature & Consent
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
    setActiveTab, 
    handleDocumentSubmit,
    selectedClient,
    isSubmitting
  }: any) => (
    <div className="space-y-6">
      <SignatureConsentSection
        formData={formData}
        onChange={onChange}
        onConsentChange={onConsentChange}
      />
      
      <div className="flex justify-between gap-2">
        <Button type="button" variant="outline" onClick={() => setActiveTab("uploads")}>
          Back
        </Button>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={onSaveDraft}>
            <Save className="h-4 w-4 mr-2" /> Save Draft
          </Button>
          <PrintButton formData={formData} />
          <Button 
            type="submit" 
            onClick={handleDocumentSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <div className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Creating...
              </>
            ) : (
              "Submit & Create Client"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
};
