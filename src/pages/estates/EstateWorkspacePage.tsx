import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/MainLayout";
import { EstateWorkspaceHeader } from "@/components/estate/EstateWorkspaceHeader";
import { EstateNav } from "@/components/estate/EstateNav";
import { getModule, getPage } from "@/components/estate/estateNavigation";
import { PageHeading } from "@/components/estate/PageHeading";
import { SafaEstatePanel } from "@/components/estate/SafaEstatePanel";
import { OverviewTab } from "@/components/estate/tabs/OverviewTab";
import { TimelineTab } from "@/components/estate/tabs/TimelineTab";
import { WorkflowTab } from "@/components/estate/tabs/WorkflowTab";
import { FinancialsTab } from "@/components/estate/tabs/FinancialsTab";
import {
  CreditorList,
  CreditorDividends,
  CreditorMeetings,
  ProofsOfClaim,
} from "@/components/estate/tabs/CreditorsTab";
import { AssetsTab } from "@/components/estate/tabs/AssetsTab";
import { DocumentsTab } from "@/components/estate/tabs/DocumentsTab";
import { ActivityTab, ComplianceTab } from "@/components/estate/tabs/RegisterTabs";
import { EstateRecordTab } from "@/components/estate/tabs/EstateRecordTab";
import { FormsTab } from "@/components/estate/tabs/FormsTab";
import { IncomeTab } from "@/components/estate/tabs/IncomeTab";
import { RequiredDocumentsRegister, TaxReturnsRegister } from "@/components/estate/tabs/TaxTab";
import { CounsellingTab } from "@/components/estate/tabs/CounsellingTab";
import { NotesTab } from "@/components/estate/tabs/NotesTab";
import { AdditionalInfoTab } from "@/components/estate/tabs/AdditionalInfoTab";
import { DischargeTab } from "@/components/estate/tabs/DischargeTab";
import { ClosingTab } from "@/components/estate/tabs/ClosingTab";
import { OfficeTeamTab } from "@/components/estate/tabs/OfficeTeamTab";
import {
  ComplianceExceptions,
  ComplianceOverview,
  CreditorsOverview,
  FinancialsSummary,
  WorkflowSummary,
} from "@/components/estate/tabs/SummaryViews";
import {
  DocumentVersionsTab,
  GeneratedDocumentsTab,
} from "@/components/estate/tabs/GeneratedDocumentsTab";
import { useEstate } from "@/data/estateStore";

const EstateWorkspacePage = () => {
  const { estateId } = useParams();
  const { estate, row, isLoading } = useEstate(estateId);
  const [module, setModule] = useState("overview");
  const [page, setPage] = useState("overview");
  const [safaCollapsed, setSafaCollapsed] = useState(false);

  const activeModule = getModule(module);
  const activePage = getPage(module, page);
  const heading = { title: activePage.label, description: activePage.description };

  /** Pages whose component owns its own heading. */
  const withHeading = (node: React.ReactNode) => (
    <>
      <PageHeading title={heading.title} description={heading.description} />
      {node}
    </>
  );

  const renderPage = () => {
    if (!estate) return null;
    const key = `${module}:${page}`;
    switch (key) {
      case "overview:overview":
        return withHeading(<OverviewTab estate={estate} />);

      case "record:record":
      case "record:statutory":
      case "record:dates":
        return withHeading(<EstateRecordTab estateId={estateId} sub={page as any} />);
      case "record:additional":
        return withHeading(<AdditionalInfoTab />);

      case "office:history":
      default:
        break;
    }

    if (module === "office") {
      return <OfficeTeamTab estateId={estateId} page={page} title={heading.title} description={heading.description} />;
    }

    switch (key) {
      case "workflow:summary":
        return <WorkflowSummary estateId={estateId} {...heading} />;
      case "workflow:tasks":
        return withHeading(<NotesTab estateId={estateId} />);
      case "workflow:deadlines":
        return withHeading(<TimelineTab estateId={estateId} />);
      case "workflow:milestones":
        return withHeading(<WorkflowTab estateId={estateId} />);
      case "workflow:counselling":
        return withHeading(<CounsellingTab estateId={estateId} />);
      case "workflow:closing":
        return withHeading(<ClosingTab estateId={estateId} />);

      case "financials:summary":
        return <FinancialsSummary estateId={estateId} {...heading} />;
      case "financials:income":
        return withHeading(<IncomeTab estateId={estateId} />);
      case "financials:assets":
        return withHeading(<AssetsTab estateId={estateId} />);
      case "financials:trust":
        return withHeading(<FinancialsTab estateId={estateId} />);
      case "financials:tax":
        return withHeading(<TaxReturnsRegister estateId={estateId} />);
      case "financials:distributions":
        return withHeading(<CreditorDividends estateId={estateId} />);

      case "creditors:overview":
        return <CreditorsOverview estateId={estateId} {...heading} />;
      case "creditors:register":
        return withHeading(<CreditorList estateId={estateId} />);
      case "creditors:claims":
        return withHeading(<ProofsOfClaim estateId={estateId} />);
      case "creditors:meetings":
        return withHeading(<CreditorMeetings estateId={estateId} />);
      case "creditors:distributions":
        return withHeading(<CreditorDividends estateId={estateId} />);

      case "documents:all":
        return withHeading(<DocumentsTab />);
      case "documents:required":
        return withHeading(<RequiredDocumentsRegister estateId={estateId} />);
      case "documents:forms":
        return withHeading(<FormsTab estateId={estateId} />);
      case "documents:generated":
        return <GeneratedDocumentsTab estateId={estateId} {...heading} />;
      case "documents:versions":
        return <DocumentVersionsTab {...heading} />;

      case "compliance:overview":
        return <ComplianceOverview estateId={estateId} {...heading} />;
      case "compliance:requirements":
        return withHeading(<ComplianceTab estateId={estateId} />);
      case "compliance:exceptions":
        return <ComplianceExceptions estateId={estateId} {...heading} />;
      case "compliance:deadlines":
        return withHeading(<TimelineTab estateId={estateId} />);
      case "compliance:discharge":
        return withHeading(<DischargeTab estateId={estateId} />);
      case "compliance:audit":
        return withHeading(<ActivityTab />);
      default:
        return withHeading(<OverviewTab estate={estate} />);
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
        <EstateWorkspaceHeader
          estate={estate}
          estateId={estateId}
          officeManager={(row as Record<string, any> | undefined)?.office_manager ?? undefined}
        />
        <EstateNav
          module={module}
          page={page}
          onChange={(m, p) => {
            setModule(m);
            setPage(p);
          }}
        />
        <div className="flex flex-1 overflow-hidden">
          <div className="min-w-0 flex-1 overflow-auto px-6 py-5">{renderPage()}</div>
          <SafaEstatePanel
            estate={estate}
            context={module}
            scope={`${activeModule.label} › ${activePage.label}`}
            collapsed={safaCollapsed}
            onToggle={() => setSafaCollapsed((v) => !v)}
          />
        </div>
      </div>
    </MainLayout>
  );
};

export default EstateWorkspacePage;
