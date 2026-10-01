// One email the AI agent (in-app or via MCP) drafted. A person reviews it here,
// then presses Send or Discard; drafts never send on their own.
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCRM } from "./store";

export const DraftCard = ({ id }: { id: string }) => {
  const { drafts, nameOf, sendDraft, discardDraft } = useCRM();
  const d = drafts.find((x) => x.id === id);
  if (!d) return <p className="text-xs text-muted-foreground">Draft handled.</p>;
  return (
    <div className="space-y-2 rounded-lg border bg-background p-3">
      <p className="flex items-center gap-1.5 text-xs font-medium"><Mail className="h-3.5 w-3.5" />Draft to {d.clientIds.map(nameOf).join(", ")}</p>
      <p className="text-sm font-medium">{d.subject}</p>
      <p className="line-clamp-4 whitespace-pre-line text-xs text-muted-foreground">{d.body}</p>
      <div className="flex gap-2">
        <Button size="sm" onClick={() => sendDraft(d.id)}>Send</Button>
        <Button size="sm" variant="outline" onClick={() => discardDraft(d.id)}>Discard</Button>
      </div>
    </div>
  );
};
