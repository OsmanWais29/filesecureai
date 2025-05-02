
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TabContentComponents } from "./TabContentComponents";
import { IncomeExpenseData, Client } from "../../types";

interface FormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasUnsavedChanges: boolean;
  formData: IncomeExpenseData;
  previousMonthData: IncomeExpenseData;
  historicalData: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFrequencyChange: (field: string, value: string) => void;
  handleSaveDraft: () => void;
  handleDocumentSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  handleFieldSelectChange: (field: string, value: string) => void;
  isNewClientMode?: boolean;
  newClient?: Client;
}

export const FormTabs = ({
  activeTab,
  setActiveTab,
  hasUnsavedChanges,
  formData,
  previousMonthData,
  historicalData,
  onChange,
  onFrequencyChange,
  handleSaveDraft,
  handleDocumentSubmit,
  isSubmitting,
  handleFieldSelectChange,
  isNewClientMode = false,
  newClient
}: FormTabsProps) => {
  const handleConsentChange = (checked: boolean) => {
    const consentEvent = {
      target: {
        name: "consent_signature",
        value: checked ? "signed" : ""
      }
    } as React.ChangeEvent<HTMLInputElement>;
    
    onChange(consentEvent);
  };
  
  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 w-full mb-8">
        <TabsTrigger value="client">Client Profile</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="savings">Savings/Calc</TabsTrigger>
        <TabsTrigger value="signature">Signature & Submit</TabsTrigger>
      </TabsList>
      
      <TabsContent value="client" className="space-y-6">
        <TabContentComponents.ClientProfileTabContent 
          formData={formData}
          onChange={onChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
          handleFieldSelectChange={handleFieldSelectChange}
          isNewClientMode={isNewClientMode}
          newClient={newClient}
        />
      </TabsContent>
      
      <TabsContent value="income" className="space-y-6">
        <TabContentComponents.IncomeTabContent 
          formData={formData} 
          previousMonthData={previousMonthData}
          onChange={onChange}
          onFrequencyChange={onFrequencyChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="expenses" className="space-y-6">
        <TabContentComponents.ExpensesTabContent 
          formData={formData} 
          previousMonthData={previousMonthData}
          onChange={onChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="savings" className="space-y-6">
        <TabContentComponents.SavingsTabContent 
          formData={formData} 
          previousMonthData={previousMonthData}
          onChange={onChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
      
      <TabsContent value="signature" className="space-y-6">
        <TabContentComponents.SignatureTabContent 
          formData={formData}
          onConsentChange={handleConsentChange}
          onChange={onChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
          handleDocumentSubmit={handleDocumentSubmit}
          selectedClient={newClient}
          isSubmitting={isSubmitting}
        />
      </TabsContent>
    </Tabs>
  );
};
