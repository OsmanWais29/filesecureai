import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { staffDocumentUrl, useReviewSubmission, useStaffSubmissions } from "@/data/clientPortal/staff";
import { sectionByKey } from "@/data/clientPortal/intakeSpec";
import { ExternalLink, Loader2 } from "lucide-react";
import { toast } from "sonner";

const money = (n: number) =>
  new Intl.NumberFormat("en-CA", { style: "currency", currency: "CAD", maximumFractionDigits: 0 }).format(n || 0);

const reviewBadge = (state: string) => {
  if (state === "Accepted") return <Badge variant="outline" className="border-accent/40 bg-accent/10 text-accent">Accepted</Badge>;
  if (state === "Returned") return <Badge variant="outline" className="border-destructive/30 bg-destructive/10 text-destructive">Returned</Badge>;
  return <Badge variant="outline">Awaiting review</Badge>;
};

/**
 * Trustee review of everything the client submitted through the portal.
 * Accepting or returning here is the only way a client submission changes state.
 */
export const PortalSubmissionsReview = ({ estateId, staffName }: { estateId: string; staffName: string }) => {
  const { data, isLoading } = useStaffSubmissions(estateId);
  const review = useReviewSubmission();
  const [notes, setNotes] = useState<Record<string, string>>({});

  const act = async (target: "documents" | "intake" | "income", id: string, accept: boolean) => {
    try {
      await review.mutateAsync({ target, id, estateId, accept, note: notes[id]?.trim() || undefined, staffName });
      setNotes((p) => ({ ...p, [id]: "" }));
      toast.success(accept ? "Accepted" : "Returned to the client for more information");
    } catch (e) {
      toast.error("Review not saved", { description: (e as Error).message });
    }
  };

  const openDoc = async (path: string) => {
    try {
      window.open(await staffDocumentUrl(path), "_blank", "noopener");
    } catch (e) {
      toast.error("Could not open file", { description: (e as Error).message });
    }
  };

  const ReviewRow = ({
    id,
    target,
    primary,
    secondary,
    state,
    extra,
  }: {
    id: string;
    target: "documents" | "intake" | "income";
    primary: string;
    secondary?: string;
    state: string;
    extra?: React.ReactNode;
  }) => (
    <div className="space-y-2 border-b py-3 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{primary}</p>
          {secondary && <p className="text-sm text-muted-foreground">{secondary}</p>}
        </div>
        <div className="flex items-center gap-2">
          {extra}
          {reviewBadge(state)}
        </div>
      </div>
      {state !== "Accepted" && (
        <div className="flex flex-wrap items-center gap-2">
          <Input
            className="h-9 max-w-sm"
            placeholder="Note to the client (required to return)"
            value={notes[id] ?? ""}
            onChange={(e) => setNotes((p) => ({ ...p, [id]: e.target.value }))}
          />
          <Button size="sm" disabled={review.isPending} onClick={() => void act(target, id, true)}>
            Accept
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={review.isPending || !notes[id]?.trim()}
            onClick={() => void act(target, id, false)}
          >
            Return for more info
          </Button>
        </div>
      )}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex justify-center py-10 text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  const documents = data?.documents ?? [];
  const intake = data?.intake ?? [];
  const income = data?.income ?? [];
  const pending = (rows: Record<string, any>[]) => rows.filter((r) => r.review_state !== "Accepted").length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Client submissions</CardTitle>
        <p className="text-sm text-muted-foreground">
          Everything the client sent through the portal. Nothing is promoted into the estate record until you accept it.
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="documents">
          <TabsList>
            <TabsTrigger value="documents">Documents ({pending(documents)})</TabsTrigger>
            <TabsTrigger value="intake">Information ({pending(intake)})</TabsTrigger>
            <TabsTrigger value="income">Income ({pending(income)})</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="mt-4">
            {documents.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No uploads yet.</p>
            ) : (
              documents.map((d) => (
                <ReviewRow
                  key={d.id}
                  id={d.id}
                  target="documents"
                  primary={d.title}
                  secondary={`${d.doc_category ?? "Document"} · ${new Date(d.uploaded_at).toLocaleString()} · v${d.version}${d.content_hash ? ` · SHA-256 ${String(d.content_hash).slice(0, 12)}…` : ""}`}
                  state={d.review_state}
                  extra={
                    <Button size="sm" variant="ghost" onClick={() => void openDoc(d.storage_path)}>
                      <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Open
                    </Button>
                  }
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="intake" className="mt-4">
            {intake.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">The client has not started the questionnaire.</p>
            ) : (
              intake.map((s) => {
                const spec = sectionByKey(s.section_key);
                const answered = Object.values(s.data ?? {}).filter((v) => v !== null && v !== "" && v !== undefined).length;
                return (
                  <ReviewRow
                    key={s.id}
                    id={s.id}
                    target="intake"
                    primary={spec?.title ?? s.section_key}
                    secondary={`${s.status.replace(/_/g, " ")} · ${answered} answers${s.submitted_at ? ` · sent ${new Date(s.submitted_at).toLocaleDateString()}` : ""}`}
                    state={s.review_state}
                  />
                );
              })
            )}
          </TabsContent>

          <TabsContent value="income" className="mt-4">
            {income.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No income statements submitted yet.</p>
            ) : (
              income.map((p) => (
                <ReviewRow
                  key={p.id}
                  id={p.id}
                  target="income"
                  primary={p.period_label ?? p.period_month}
                  secondary={`Income ${money(Number(p.totals?.totalIncome ?? 0))} · Expenses ${money(Number(p.totals?.totalExpenses ?? 0))} · ${p.status.replace(/_/g, " ")}`}
                  state={p.review_state}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
