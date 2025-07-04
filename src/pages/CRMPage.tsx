
import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { CRMTabs } from '@/components/crm/page/CRMTabs';
import { CRMHeader } from '@/components/crm/page/CRMHeader';
import { useState } from 'react';
import { ClientDialog } from '@/components/crm/ClientDialog';

const CRMPage = () => {
  const [isClientDialogOpen, setIsClientDialogOpen] = useState(false);

  const openClientDialog = () => setIsClientDialogOpen(true);
  const closeClientDialog = () => setIsClientDialogOpen(false);

  return (
    <MainLayout>
      <div className="container mx-auto p-6 bg-background min-h-screen">
        <CRMHeader openClientDialog={openClientDialog} />
        <CRMTabs />
        
        <ClientDialog 
          isOpen={isClientDialogOpen}
          onClose={closeClientDialog}
        />
      </div>
    </MainLayout>
  );
};

export default CRMPage;
