import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { ActivityTab, ComplianceTab } from "@/components/estate/tabs/RegisterTabs";
import { EstateRecordTab } from "@/components/estate/tabs/EstateRecordTab";
import { FormsTab } from "@/components/estate/tabs/FormsTab";
import { IncomeTab } from "@/components/estate/tabs/IncomeTab";
import { TaxTab } from "@/components/estate/tabs/TaxTab";
import { CounsellingTab } from "@/components/estate/tabs/CounsellingTab";
import { NotesTab } from "@/components/estate/tabs/NotesTab";
import { AdditionalInfoTab } from "@/components/estate/tabs/AdditionalInfoTab";
import { DischargeTab } from "@/components/estate/tabs/DischargeTab";
import { ClosingTab } from "@/components/estate/tabs/ClosingTab";
import { useEstate } from "@/data/estateStore";

const EstateWorkspacePage = () => {
  const { estateId } = useParams();
  const { estate, isLoading } = useEstate(estateId);
  const [tab, setTab] = useState<EstateTabId>("overview");

  const renderTab = () => {
    if (!estate) return null;
    switch (tab) {
      case "overview": return <OverviewTab estate={estate} />;
      case "record": return <EstateRecordTab estateId={estateId} />;
      case "timeline": return <TimelineTab estateId={estateId} />;
      case "workflow": return <WorkflowTab estateId={estateId} />;
      case "financials": return <FinancialsTab estateId={estateId} />;
      case "creditors": return <CreditorsTab estateId={estateId} />;
      case "assets": return <AssetsTab estateId={estateId} />;
      case "additional": return <AdditionalInfoTab />;
      case "documents": return <DocumentsTab />;
      case "forms": return <FormsTab estateId={estateId} />;
      case "income": return <IncomeTab estateId={estateId} />;
      case "tax": return <TaxTab estateId={estateId} />;
      case "counselling": return <CounsellingTab estateId={estateId} />;
      case "notes": return <NotesTab estateId={estateId} />;
      case "compliance": return <ComplianceTab estateId={estateId} />;
      case "discharge": return <DischargeTab estateId={estateId} />;
      case "closing": return <ClosingTab estateId={estateId} />;
      case "activity": return <ActivityTab />;
    }
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex h-full items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading estate…
        </div>
      </MainLayout>
    );
  }

  if (!estate) {
    return (
      <MainLayout>
        <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-center">
          <h1 className="text-lg font-semibold">Estate not found</h1>
          <p className="max-w-md text-sm text-muted-foreground">
            This estate does not exist, or your account does not have access to it.
          </p>
          <Button asChild variant="outline">
            <Link to="/estates">Back to estates</Link>
          </Button>
        </div>
      </MainLayout>
    );
  }

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
