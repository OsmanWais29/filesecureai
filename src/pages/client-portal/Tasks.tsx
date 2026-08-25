import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClientPortal, openRequests } from "@/data/clientPortal/store";
import { ClientPageHeading, EmptyState } from "@/components/client-portal/primitives";
import { ActionRequiredCard } from "@/components/client-portal/ClientRequestCard";
import { ClientRequestDetail } from "@/components/client-portal/ClientRequestDetail";
import { ClientRequest } from "@/data/clientPortal/types";
import { CheckCircle2 } from "lucide-react";

export const ClientTasksPage = () => {
  const state = useClientPortal();
  const [params, setParams] = useSearchParams();
  const [selected, setSelected] = useState<ClientRequest | null>(null);

  const requestId = params.get("request");
  useEffect(() => {
    if (!requestId) return;
    const found = state.requests.find((r) => r.id === requestId);
    if (found) setSelected(found);
  }, [requestId, state.requests]);

  const actionable = openRequests(state);
  const waiting = state.requests.filter((r) => r.status === "Submitted" || r.status === "Under Review" || r.status === "In Progress");
  const done = state.requests.filter((r) => r.status === "Completed" || r.status === "Cancelled");

  const close = () => {
    setSelected(null);
    if (requestId) {
      params.delete("request");
      setParams(params, { replace: true });
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="What I need to do"
        description="Each item below is a request from your trustee. Complete them here and we'll take it from there."
      />

      <Tabs defaultValue="action">
        <TabsList>
          <TabsTrigger value="action">Needs my action ({actionable.length})</TabsTrigger>
          <TabsTrigger value="waiting">With my trustee ({waiting.length})</TabsTrigger>
          <TabsTrigger value="done">Completed ({done.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="action" className="mt-5 space-y-3">
          {actionable.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="h-8 w-8 text-accent" />}
              title="Nothing needs your action"
              body="You'll be notified as soon as your trustee asks for something."
            />
          ) : (
            actionable.map((r) => <ActionRequiredCard key={r.id} request={r} onOpen={setSelected} />)
          )}
        </TabsContent>

        <TabsContent value="waiting" className="mt-5 space-y-3">
          {waiting.length === 0 ? (
            <EmptyState title="Nothing is waiting on your trustee" />
          ) : (
            waiting.map((r) => <ActionRequiredCard key={r.id} request={r} onOpen={setSelected} />)
          )}
        </TabsContent>

        <TabsContent value="done" className="mt-5 space-y-3">
          {done.length === 0 ? (
            <EmptyState title="No completed items yet" />
          ) : (
            done.map((r) => <ActionRequiredCard key={r.id} request={r} onOpen={setSelected} compact />)
          )}
        </TabsContent>
      </Tabs>

      <ClientRequestDetail request={selected} open={!!selected} onOpenChange={(v) => !v && close()} />
    </div>
  );
};

export default ClientTasksPage;
