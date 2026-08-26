import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { usePortalSession } from "@/data/clientPortal/session";
import { usePortalMessages, useSendPortalMessage } from "@/data/clientPortal/db";
import { ClientPageHeading, formatDateTime } from "@/components/client-portal/primitives";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const ClientMessages = () => {
  const { session } = usePortalSession();
  const actor = session ? { userId: session.userId, name: session.name } : undefined;
  const { data: messages = [] } = usePortalMessages(session?.estateId);
  const send = useSendPortalMessage(session?.estateId, actor);
  const [body, setBody] = useState("");

  const office = session?.firmName ?? "your trustee's office";
  const trustee = session?.trusteeName ?? "your trustee";

  const handleSend = async () => {
    if (!body.trim()) return;
    try {
      await send.mutateAsync({ body: body.trim() });
      setBody("");
      toast.success("Message sent to your trustee");
    } catch (e) {
      toast.error("Message not sent", { description: (e as Error).message });
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <ClientPageHeading title="Messages" description={`Talk directly with ${trustee} and the team at ${office}.`} />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">
                No messages yet. Start the conversation below.
              </p>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={cn("flex", m.senderRole === "client" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-lg px-4 py-3 text-sm",
                      m.senderRole === "client" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p className="mb-1 text-xs opacity-80">
                      {m.senderName} · {formatDateTime(m.sentAt)}
                    </p>
                    <p className="whitespace-pre-wrap">{m.body}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-2 border-t pt-4">
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={3}
              placeholder="Write a message to your trustee's office…"
            />
            <div className="flex justify-end">
              <Button className="h-11" disabled={!body.trim() || send.isPending} onClick={() => void handleSend()}>
                {send.isPending ? "Sending…" : "Send message"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientMessages;
