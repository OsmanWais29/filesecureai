import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, RecordValues } from "@/components/estate/forms/RecordForm";
import {
  consumerIdentitySection,
  corporateIdentitySection,
  estateClassificationSection,
  estateCourtSection,
  estateDatesSection,
  estateResponsibilitySection,
} from "@/data/estateFormSpecs";
import { estateStore, useEstateList } from "@/data/estateStore";

const newEstateSections = [
  estateClassificationSection,
  consumerIdentitySection,
  corporateIdentitySection,
  estateDatesSection,
  estateResponsibilitySection,
  estateCourtSection,
];

const str = (v: RecordValues[string]) => (v === undefined || v === null ? "" : String(v)).trim();

const EstatesListPage = () => {
  const estates = useEstateList();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreate = (values: RecordValues) => {
    const isCorporate = str(values.estateType) === "Corporate";
    const debtorName = isCorporate
      ? str(values.corporateName) || "Unnamed corporation"
      : [str(values.firstName), str(values.middleName), str(values.lastName)]
          .filter(Boolean)
          .join(" ") || "Unnamed debtor";
    const estateNumber = str(values.osbEstateNumber) || `NEW-${Date.now().toString().slice(-6)}`;

    if (estates.some((e) => e.estateNumber === estateNumber)) {
      toast({
        title: "Estate number already in use",
        description: "OSB estate numbers must be unique.",
        variant: "destructive",
      });
      return;
    }

    estateStore.add({
      id: estateNumber,
      debtorName,
      estateNumber,
      proceeding: str(values.proceedingType) || "Consumer Proposal",
      division: str(values.division) || "Division II",
      status: str(values.estateStatus) || "Draft",
      trustee: str(values.trustee) || "Unassigned",
      administrator: str(values.estateAdministrator) || "Unassigned",
      office: str(values.trusteeOffice) || "Unassigned",
      osbStatus: "attention",
      openIssues: 0,
      nextDeadline: "Complete estate record to generate statutory dates",
      stage: "Intake",
      stageProgress: 5,
      osbReadiness: 10,
    });

    toast({ title: "Estate created", description: `${debtorName} · ${estateNumber}` });
    navigate(`/estates/${estateNumber}`);
  };

  return (
    <MainLayout>
      <div className="p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Estates</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Open an estate to enter its workspace — every record, deadline and SAFA action belongs to the estate.
            </p>
          </div>
          <Button onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> New estate
          </Button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {estates.map((e) => (
            <Link key={e.id} to={`/estates/${e.id}`}>
              <Card className="h-full transition-colors hover:border-primary/40">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{e.debtorName}</CardTitle>
                  <p className="text-xs text-muted-foreground">
                    #{e.estateNumber} · {e.proceeding}
                  </p>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{e.status}</Badge>
                    {e.openIssues > 0 && <Badge variant="destructive">{e.openIssues} issues</Badge>}
                  </div>
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{e.stage}</span>
                      <span>{e.stageProgress}%</span>
                    </div>
                    <Progress value={e.stageProgress} className="mt-1 h-1.5" />
                  </div>
                  <p className="text-xs text-muted-foreground">Next: {e.nextDeadline}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <RecordDrawer
          open={open}
          onOpenChange={setOpen}
          title="New estate"
          description="Complete the identity section that matches the estate type. Remaining records are entered inside the workspace."
          sections={newEstateSections}
          initial={{ estateType: "Consumer", estateStatus: "Draft" }}
          submitLabel="Create estate"
          onSubmit={handleCreate}
        />
      </div>
    </MainLayout>
  );
};

export default EstatesListPage;
