
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TabContentComponents } from "./TabContentComponents";

interface FormTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  hasUnsavedChanges: boolean;
  formData: any;
  previousMonthData: any;
  historicalData: any[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFrequencyChange: (field: string, value: string) => void;
  handleSaveDraft: () => void;
  handleDocumentSubmit: (e: React.FormEvent) => void;
  isSubmitting: boolean;
  handleFieldSelectChange: (field: string, value: string) => void;
  isNewClientMode?: boolean;
  newClient?: any;
  onConsentChange?: (checked: boolean) => void;
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
  newClient,
  onConsentChange
}: FormTabsProps) => {
  // Handle consent change with default if not provided
  const handleConsentChange = (checked: boolean) => {
    if (onConsentChange) {
      onConsentChange(checked);
    } else {
      // Default implementation
      const consentEvent = {
        target: {
          name: 'consent_data_use',
          value: checked ? 'true' : 'false'
        }
      } as React.ChangeEvent<HTMLInputElement>;
      
      onChange(consentEvent);
      
      // Set consent date to today
      if (checked) {
        const todayDate = new Date().toISOString().split('T')[0];
        const dateEvent = {
          target: {
            name: 'consent_date',
            value: todayDate
          }
        } as React.ChangeEvent<HTMLInputElement>;
        
        onChange(dateEvent);
      }
    }
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid grid-cols-5 mb-6">
        <TabsTrigger value="client">Client</TabsTrigger>
        <TabsTrigger value="income">Income</TabsTrigger>
        <TabsTrigger value="expenses">Expenses</TabsTrigger>
        <TabsTrigger value="savings">Savings</TabsTrigger>
        <TabsTrigger value="signature">Sign</TabsTrigger>
      </TabsList>

      <TabsContent value="client">
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

      <TabsContent value="income">
        <TabContentComponents.IncomeTabContent
          formData={formData}
          previousMonthData={previousMonthData}
          onChange={onChange}
          onFrequencyChange={onFrequencyChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
        />
      </TabsContent>

      <TabsContent value="expenses">
        <TabContentComponents.ExpensesTabContent
          formData={formData}
          previousMonthData={previousMonthData}
          onChange={onChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
        />
      </TabsContent>

      <TabsContent value="savings">
        <TabContentComponents.SavingsTabContent
          formData={formData}
          previousMonthData={previousMonthData}
          onChange={onChange}
          onSaveDraft={handleSaveDraft}
          setActiveTab={setActiveTab}
        />
      </TabsContent>

      <TabsContent value="signature">
        <TabContentComponents.SignatureTabContent
          formData={formData}
          onChange={onChange}
          onConsentChange={handleConsentChange}
          onSaveDraft={handleSaveDraft}
          handleDocumentSubmit={handleDocumentSubmit}
          isSubmitting={isSubmitting}
          setActiveTab={setActiveTab}
        />
      </TabsContent>
    </Tabs>
  );
};
