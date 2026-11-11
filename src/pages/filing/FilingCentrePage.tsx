import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOsbFilings, type OsbFiling } from "@/hooks/useOsbFilings";
import { STATUS_LABEL, type FilingStatus } from "@/lib/filing/types";

export const statusVariant = (s: FilingStatus): "default" | "secondary" | "destructive" | "outline" =>
  s === "accepted" ? "default" : s === "rejected" ? "destructive" : s === "signed" || s === "checked" ? "secondary" : "outline";

const Row = ({ f }: { f: OsbFiling }) => (
  <Link to={`/filing/${f.id}`} className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm hover:bg-muted/40">
    <div className="min-w-0 flex-1">
      <p className="font-medium">{f.form_number} · {f.estates?.debtor_name ?? "Estate"} {f.amends_filing_id && <Badge variant="outline" className="ml-1">Amended</Badge>}</p>
      <p className="text-xs text-muted-foreground">{f.version_label}{f.deadline ? ` · Due ${f.deadline}` : ""} · Updated {f.updated_at.slice(0, 10)}</p>
      {f.readiness?.issues?.length ? <p className="mt-1 text-xs text-destructive">{f.readiness.issues[0].message}{f.readiness.issues.length > 1 ? ` (+${f.readiness.issues.length - 1} more)` : ""}</p> : null}
    </div>
    <Badge variant={statusVariant(f.status)}>{STATUS_LABEL[f.status]}</Badge>
  </Link>
);

const List = ({ rows, empty }: { rows: OsbFiling[]; empty: string }) =>
  rows.length ? <div className="space-y-2">{rows.map((f) => <Row key={f.id} f={f} />)}</div> : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">{empty}</p>;

const FilingCentrePage = () => {
  const { data = [], isLoading, error } = useOsbFilings();
  const [tab, setTab] = useState("work");
  const g = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return {
      work: data.filter((f) => ["drafted", "checked"].includes(f.status)),
      ready: data.filter((f) => ["signed", "queued", "submitted", "acknowledged"].includes(f.status)),
      rejected: data.filter((f) => f.status === "rejected"),
      done: data.filter((f) => f.status === "accepted"),
      deadlines: data.filter((f) => f.deadline && f.status !== "accepted").sort((a, b) => a.deadline!.localeCompare(b.deadline!)),
      overdue: data.filter((f) => f.deadline && f.deadline < today && f.status !== "accepted").length,
    };
  }, [data]);
  const stat = (label: string, n: number, warn = false) => (
    <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">{label}</p><p className={`text-2xl font-semibold ${warn && n ? "text-destructive" : ""}`}>{n}</p></CardContent></Card>
  );
  return (
    <MainLayout>
      <div className="container mx-auto space-y-6 py-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Filing Centre</h1>
            <p className="text-sm text-muted-foreground">Every OSB filing across your estates: checks, signing, responses and evidence.</p>
          </div>
          <Button asChild variant="outline"><Link to="/filing/studio">Schema &amp; Mapping Studio</Link></Button>
        </header>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {stat("Needs work", g.work.length)}{stat("Signed / awaiting OSB", g.ready.length)}{stat("Rejected", g.rejected.length, true)}{stat("Accepted", g.done.length)}{stat("Overdue", g.overdue, true)}
        </div>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">OSB e-filing connection</CardTitle>
            <CardDescription>Not connected. Filings stop at "Signed"; file through the OSB as usual and record the OSB reference here. Outage tracking, automatic resubmission and batch submission switch on once SecureFiles has OSB vendor access.</CardDescription>
          </CardHeader>
        </Card>
        {error && <p className="text-sm text-destructive">Could not load filings: {(error as Error).message}</p>}
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <Tabs value={tab} onValueChange={setTab}>
            <TabsList>
              <TabsTrigger value="work">Needs work ({g.work.length})</TabsTrigger>
              <TabsTrigger value="ready">Awaiting OSB ({g.ready.length})</TabsTrigger>
              <TabsTrigger value="rejected">Rejections ({g.rejected.length})</TabsTrigger>
              <TabsTrigger value="deadlines">Deadlines ({g.deadlines.length})</TabsTrigger>
              <TabsTrigger value="done">Accepted ({g.done.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="work"><List rows={g.work} empty="No filings need work. Start one from an estate's Forms page." /></TabsContent>
            <TabsContent value="ready"><List rows={g.ready} empty="Nothing waiting on the OSB." /></TabsContent>
            <TabsContent value="rejected"><List rows={g.rejected} empty="No rejections." /></TabsContent>
            <TabsContent value="deadlines"><List rows={g.deadlines} empty="No open filing deadlines." /></TabsContent>
            <TabsContent value="done"><List rows={g.done} empty="No accepted filings yet." /></TabsContent>
          </Tabs>
        )}
      </div>
    </MainLayout>
  );
};
export default FilingCentrePage;
