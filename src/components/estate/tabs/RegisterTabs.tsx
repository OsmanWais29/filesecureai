import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEstateCompliance } from "@/hooks/useEstateCompliance";

export const ComplianceTab = ({ estateId }: { estateId?: string }) => {
  const { rules, failing, warning, passing } = useEstateCompliance(estateId);
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex flex-wrap items-center gap-2 text-base">
          Deterministic compliance rules
          <Badge variant="outline">{passing.length} passing</Badge>
          <Badge variant="outline">{warning.length} warnings</Badge>
          <Badge variant={failing.length ? "destructive" : "outline"}>{failing.length} failing</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {rules.length === 0 && (
          <p className="text-muted-foreground">No compliance rules evaluated for this estate yet.</p>
        )}
        {rules.map((c) => (
          <div key={c.id} className="flex items-start gap-3 rounded-md border p-3">
            {c.state === "pass" && <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />}
            {c.state === "warn" && <AlertTriangle className="mt-0.5 h-4 w-4 text-muted-foreground" />}
            {c.state === "fail" && <XCircle className="mt-0.5 h-4 w-4 text-destructive" />}
            <div>
              <div className="font-medium">{c.rule}</div>
              <div className="text-xs text-muted-foreground">{c.detail}</div>
              {c.source && <div className="text-xs text-muted-foreground">{c.source}</div>}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

const db = supabase as unknown as { from: (table: string) => any };

/** Audit trail read straight from the immutable `estate_events` log. */
export const ActivityTab = ({ estateId }: { estateId?: string }) => {
  const { data: events = [], isLoading } = useQuery({
    queryKey: ["estate_events", estateId],
    enabled: Boolean(estateId),
    queryFn: async () => {
      const { data, error } = await db
        .from("estate_events")
        .select("*")
        .eq("estate_id", estateId)
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return (data ?? []) as Record<string, any>[];
    },
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Human + SAFA audit history</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        {isLoading && (
          <p className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading audit trail…
          </p>
        )}
        {!isLoading && events.length === 0 && (
          <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
            No recorded activity for this estate yet.
          </p>
        )}
        {events.map((e) => (
          <div key={e.id} className="rounded-md border p-3">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{e.actor_type ?? "user"}</Badge>
              <span className="font-medium">{e.event_type}</span>
              <span className="ml-auto text-xs text-muted-foreground">
                {new Date(e.created_at).toLocaleString()}
              </span>
            </div>
            {(e.reason || e.source) && (
              <p className="mt-1 text-muted-foreground">{e.reason ?? e.source}</p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
