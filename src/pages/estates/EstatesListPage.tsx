import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus } from "lucide-react";
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
import { useEstateList } from "@/data/estateStore";
import { useCreateEstateRecord } from "@/hooks/useEstateRecords";

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
  const { estates, isLoading, error } = useEstateList();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const clientId = params.get("clientId") ?? undefined;
  const createEstate = useCreateEstateRecord();

  const handleCreate = async (values: RecordValues) => {
    const estateNumber = str(values.osbEstateNumber);
    if (estateNumber && estates.some((e) => e.estateNumber === estateNumber)) {
      toast({
        title: "Estate number already in use",
        description: "OSB estate numbers must be unique.",
        variant: "destructive",
      });
      return;
    }

    try {
      const created = await createEstate.mutateAsync({ values, clientId });
      setOpen(false);
      toast({ title: "Estate created", description: String(created.debtor_name ?? "") });
      navigate(`/estates/${created.id}`);
    } catch {
      // Errors are surfaced by the mutation's onError toast.
    }
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
          <Button onClick={() => setOpen(true)} disabled={createEstate.isPending}>
            {createEstate.isPending ? (
              <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-1.5 h-4 w-4" />
            )}
            New estate
          </Button>
        </div>

        {isLoading && (
          <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading estates…
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-8 rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
            Estates could not be loaded. Sign in and try again.
          </div>
        )}

        {!isLoading && !error && estates.length === 0 && (
          <div className="mt-8 rounded-md border border-dashed p-8 text-center">
            <p className="text-sm font-medium">No estates yet</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Create an estate to open its workspace. Estates are persisted to your account.
            </p>
          </div>
        )}

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
          initial={{ estateType: "Consumer", estateStatus: "Open" }}
          submitLabel="Create estate"
          onSubmit={handleCreate}
        />
      </div>
    </MainLayout>
  );
};

export default EstatesListPage;
