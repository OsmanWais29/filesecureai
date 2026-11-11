import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOsbFilings, useOsbSchemas, type OsbFiling } from "@/hooks/useOsbFilings";
import { STATUS_LABEL, type FilingStatus } from "@/lib/filing/types";
import { actionBucket, byRisk, isDueSoon, isOverdue } from "@/lib/filing/queue";
import { cn } from "@/lib/utils";

export const statusVariant = (s: FilingStatus): "default" | "secondary" | "destructive" | "outline" =>
  s === "accepted" ? "default" : s === "rejected" ? "destructive" : s === "signed" || s === "checked" ? "secondary" : "outline";

type CountKey = "sign" | "fix" | "debtor" | "soon" | "overdue";
const today = () => new Date().toISOString().slice(0, 10);

const actionLabel = (f: OsbFiling) => {
  const b = actionBucket(f);
  return b === "sign" ? "Sign" : b === "fix" ? "Fix" : b === "osb" ? "Record OSB reference" : "View";
};

const Row = ({ f, t }: { f: OsbFiling; t: string }) => {
  const issue = f.readiness?.issues?.[0]?.message;
  const blocker = f.status === "rejected" ? "Rejected by OSB" : issue ?? (actionBucket(f) === "sign" ? "Checks passed, ready to sign" : actionBucket(f) === "osb" ? "Signed, waiting to be filed with the OSB" : "Checks not run yet");
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-md border p-3 text-sm">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{f.estates?.debtor_name ?? "Estate"}{f.estates?.file_number ? ` · ${f.estates.file_number}` : ""} — Form {f.form_number}
          {f.amends_filing_id && <Badge variant="outline" className="ml-2">Amended</Badge>}</p>
        <p className="text-xs text-muted-foreground">{f.version_label}{f.deadline ? ` · Due ${f.deadline}` : " · No deadline recorded"}{isOverdue(f, t) && <span className="ml-1 font-medium text-destructive">· Overdue</span>}</p>
        <p className={cn("mt-1 text-xs", issue || f.status === "rejected" ? "text-destructive" : "text-muted-foreground")}>{blocker}</p>
      </div>
      <Badge variant={statusVariant(f.status)}>{STATUS_LABEL[f.status]}</Badge>
      <Button asChild size="sm" variant={actionBucket(f) === "sign" ? "default" : "outline"}><Link to={`/filing/${f.id}`}>{actionLabel(f)}</Link></Button>
    </div>
  );
};

const FilingCentrePage = () => {
  const { data = [], isLoading, error } = useOsbFilings();
  const { data: schemaData } = useOsbSchemas();
  const schemas = schemaData?.versions ?? [];
  const [q, setQ] = useState("");
  const [type, setType] = useState("all");
  const [count, setCount] = useState<CountKey | null>(null);
  const [showFiled, setShowFiled] = useState(false);
  const t = today();

  const types = useMemo(() => Array.from(new Set(data.map((f) => f.estates?.estate_type).filter(Boolean))) as string[], [data]);
  const scoped = useMemo(() => {
    const s = q.trim().toLowerCase();
    return data.filter((f) => (type === "all" || f.estates?.estate_type === type) &&
      (!s || (f.estates?.debtor_name ?? "").toLowerCase().includes(s) || (f.estates?.file_number ?? "").toLowerCase().includes(s)));
  }, [data, q, type]);
  const estatesInScope = new Set(scoped.map((f) => f.estate_id));
  const oneEstate = q.trim() && estatesInScope.size === 1 ? scoped[0].estates : null;

  const counts: Record<CountKey, OsbFiling[]> = {
    sign: scoped.filter((f) => actionBucket(f) === "sign"),
    fix: scoped.filter((f) => actionBucket(f) === "fix"),
    debtor: [],
    soon: scoped.filter((f) => isDueSoon(f, t)),
    overdue: scoped.filter((f) => isOverdue(f, t)),
  };
  const open = scoped.filter((f) => actionBucket(f) !== "filed");
  const filed = scoped.filter((f) => actionBucket(f) === "filed");
  const rows = (count ? counts[count] : showFiled || oneEstate ? scoped : open).slice().sort(byRisk(t));

  const latestSchema = schemas.map((s) => s.loaded_at).sort().pop();
  const cards: { k: CountKey; label: string; who: string }[] = [
    { k: "sign", label: "Ready to sign", who: "Trustee acts" },
    { k: "fix", label: "Needs a fix", who: "Staff act" },
    { k: "debtor", label: "Waiting on debtor", who: "Client acts" },
    { k: "soon", label: "Due in 7 days", who: "Urgent" },
    { k: "overdue", label: "Overdue", who: "Past deadline" },
  ];

  return (
    <MainLayout>
      <div className="container mx-auto space-y-5 py-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Filing Centre</h1>
            <p className="text-sm text-muted-foreground">What every estate owes the OSB, and who has to act next.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild><Button variant="outline" size="sm" className="h-7 rounded-full text-xs">Manual filing mode</Button></PopoverTrigger>
              <PopoverContent className="w-80 text-sm">SecureFiles isn't connected to OSB e-filing yet. Filings stop at "Signed": file with the OSB as you do today, then record the OSB reference on the filing. Deadlines and checks still work.</PopoverContent>
            </Popover>
            <Button asChild variant="outline" size="sm" className="h-7 rounded-full text-xs">
              <Link to="/filing/studio">{latestSchema ? `Schemas loaded · ${latestSchema.slice(0, 10)}` : "OSB schemas not loaded"}</Link>
            </Button>
          </div>
        </header>

        <div className="flex flex-wrap gap-2">
          <Input value={q} onChange={(e) => { setQ(e.target.value); setCount(null); }} placeholder="Load an estate: debtor name or estate number" className="max-w-sm" />
          <Select value={type} onValueChange={(v) => { setType(v); setCount(null); }}>
            <SelectTrigger className="w-48"><SelectValue placeholder="Estate type" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All estate types</SelectItem>{types.map((x) => <SelectItem key={x} value={x}>{x.replace(/_/g, " ")}</SelectItem>)}</SelectContent>
          </Select>
          {(q || type !== "all") && <Button variant="ghost" onClick={() => { setQ(""); setType("all"); setCount(null); }}>Clear</Button>}
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
          {cards.map(({ k, label, who }) => {
            const n = counts[k].length;
            const notTracked = k === "debtor";
            return (
              <button key={k} type="button" disabled={notTracked} onClick={() => setCount(count === k ? null : k)}
                className={cn("text-left", notTracked && "cursor-not-allowed")} aria-pressed={count === k}>
                <Card className={cn("h-full transition-colors", count === k && "border-primary", k === "overdue" && n > 0 && "border-destructive")}>
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className={cn("text-2xl font-semibold", k === "overdue" && n > 0 && "text-destructive")}>{notTracked ? "—" : n}</p>
                    <p className="text-xs text-muted-foreground">{notTracked ? "Not linked to portal requests yet" : who}</p>
                  </CardContent>
                </Card>
              </button>
            );
          })}
        </div>

        {oneEstate && (
          <Card><CardContent className="p-4 text-sm">
            <p className="font-medium">{oneEstate.debtor_name}{oneEstate.file_number ? ` · ${oneEstate.file_number}` : ""}</p>
            <p className="text-xs text-muted-foreground">{scoped.length} filings · {filed.length} accepted · {open.length} outstanding · {counts.overdue.length} overdue — full timeline below, newest deadline risk first.</p>
          </CardContent></Card>
        )}

        {error && <p className="text-sm text-destructive">Could not load filings: {(error as Error).message}</p>}
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">{count ? cards.find((c) => c.k === count)!.label : oneEstate ? "Estate filing timeline" : showFiled ? "All filings" : "Outstanding filings"} ({rows.length})</h2>
              {!count && !oneEstate && <Button variant="link" size="sm" onClick={() => setShowFiled(!showFiled)}>{showFiled ? "Hide filed" : `Include filed (${filed.length})`}</Button>}
              {count && <Button variant="link" size="sm" onClick={() => setCount(null)}>Show all outstanding</Button>}
            </div>
            {rows.length ? rows.map((f) => <Row key={f.id} f={f} t={t} />) : (
              <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
                {data.length === 0 ? "No filings yet. Start one from an estate's Forms page." : q || type !== "all" ? "No filings match this estate or filter." : "Nothing outstanding here."}
              </p>
            )}
          </section>
        )}
      </div>
    </MainLayout>
  );
};
export default FilingCentrePage;
