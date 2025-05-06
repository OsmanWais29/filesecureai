
import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClientIntakeDialog } from "@/components/crm/intake-dialog/ClientIntakeDialog";
import { ClientDashboard } from "@/components/crm/ClientDashboard";
import { useClientIntake } from "@/components/crm/hooks/useClientIntake";
import { CRMHeader } from "@/components/crm/page/CRMHeader";

export const CRMPage = () => {
  const {
    isClientDialogOpen,
    setIsClientDialogOpen,
    currentStep,
    setCurrentStep,
    formProgress,
    formData,
    openClientDialog,
    handleInputChange,
    handleSelectChange,
    handleEmploymentTypeChange,
    handleSubmitForm
  } = useClientIntake();

  return (
    <MainLayout>
      <div className="container mx-auto p-6 space-y-8">
        {/* CRM Header with Add New Client button */}
        <CRMHeader openClientDialog={openClientDialog} />
        
        {/* Client Dashboard with improved navigation */}
        <ClientDashboard />
      </div>

      {/* Enhanced AI-Powered Client Intake Dialog */}
      <ClientIntakeDialog
        open={isClientDialogOpen}
        onOpenChange={setIsClientDialogOpen}
        onSubmit={handleSubmitForm}
        formData={formData}
        formProgress={formProgress}
        currentStep={currentStep}
        setCurrentStep={setCurrentStep}
        handleInputChange={handleInputChange}
        handleSelectChange={handleSelectChange}
        handleEmploymentTypeChange={handleEmploymentTypeChange}
      />
    </MainLayout>
  );
};

export default CRMPage;
