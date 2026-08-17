import { useState } from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { EstateWorkspaceHeader } from "@/components/estate/EstateWorkspaceHeader";
import { EstateSubmoduleTabs, EstateTabId } from "@/components/estate/EstateSubmoduleTabs";
import { SafaEstatePanel } from "@/components/estate/SafaEstatePanel";
import { OverviewTab } from "@/components/estate/tabs/OverviewTab";
import { TimelineTab } from "@/components/estate/tabs/TimelineTab";
import { WorkflowTab } from "@/components/estate/tabs/WorkflowTab";
import { FinancialsTab } from "@/components/estate/tabs/FinancialsTab";
import { CreditorsTab } from "@/components/estate/tabs/CreditorsTab";
import { AssetsTab } from "@/components/estate/tabs/AssetsTab";
import { DocumentsTab } from "@/components/estate/tabs/DocumentsTab";
import {
  ActivityTab,
  CommunicationsTab,
  ComplianceTab,
  FormsTab,
  IncomeTab,
} from "@/components/estate/tabs/RegisterTabs";
import { getEstate } from "@/data/estateWorkspace";

const EstateWorkspacePage = () => {
  const { estateId } = useParams();
  const estate = getEstate(estateId);
  const [tab, setTab] = useState<EstateTabId>("overview");

  const renderTab = () => {
    switch (tab) {
      case "overview": return <OverviewTab estate={estate} />;
      case "timeline": return <TimelineTab />;
      case "workflow": return <WorkflowTab />;
      case "financials": return <FinancialsTab />;
      case "creditors": return <CreditorsTab />;
      case "assets": return <AssetsTab />;
      case "documents": return <DocumentsTab />;
      case "forms": return <FormsTab />;
      case "income": return <IncomeTab />;
      case "communications": return <CommunicationsTab />;
      case "compliance": return <ComplianceTab />;
      case "activity": return <ActivityTab />;
    }
  };

  return (
    <MainLayout>
      <div className="flex h-full flex-col">
        <EstateWorkspaceHeader estate={estate} />
        <EstateSubmoduleTabs active={tab} onChange={setTab} />
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 overflow-auto p-6">{renderTab()}</div>
          <SafaEstatePanel estate={estate} context={tab} />
        </div>
      </div>
    </MainLayout>
  );
};

export default EstateWorkspacePage;
