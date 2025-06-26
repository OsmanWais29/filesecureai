
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CRMTabs } from '@/components/crm/page/CRMTabs';
import { CRMHeader } from '@/components/crm/page/CRMHeader';
import { ClientIntakeDialog } from '@/components/crm/intake-dialog/ClientIntakeDialog';
import { useClientIntake } from '@/components/crm/hooks/useClientIntake';

const TrusteeCRMPage = () => {
  const { 
    isClientDialogOpen, 
    setIsClientDialogOpen, 
    openClientDialog,
    currentStep,
    setCurrentStep,
    formProgress,
    formData,
    handleInputChange,
    handleSelectChange,
    handleEmploymentTypeChange,
    handleSubmitForm
  } = useClientIntake();

  return (
    <MainLayout>
      <div className="container mx-auto p-6 bg-background min-h-screen">
        <CRMHeader openClientDialog={openClientDialog} />
        <CRMTabs />
        
        <ClientIntakeDialog 
          isOpen={isClientDialogOpen}
          onClose={() => setIsClientDialogOpen(false)}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          formProgress={formProgress}
          formData={formData}
          handleInputChange={handleInputChange}
          handleSelectChange={handleSelectChange}
          handleEmploymentTypeChange={handleEmploymentTypeChange}
          handleSubmitForm={handleSubmitForm}
        />
      </div>
    </MainLayout>
  );
};

export default TrusteeCRMPage;
