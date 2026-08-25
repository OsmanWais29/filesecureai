import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useClientPortal, sendClientMessage } from "@/data/clientPortal/store";
import { ClientPageHeading, formatDateTime } from "@/components/client-portal/primitives";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export const ClientMessages = () => {
  const state = useClientPortal();
  const [body, setBody] = useState("");

  const send = () => {
    if (!body.trim()) return;
    sendClientMessage(body.trim());
    setBody("");
    toast.success("Message sent to your trustee");
  };

  return (
    <div className="mx-auto max-w-3xl">
      <ClientPageHeading
        title="Messages"
        description={`Talk directly with ${state.profile.trusteeName} and the team at ${state.profile.firmName}.`}
      />

      <Card>
        <CardContent className="space-y-4 p-5">
          <div className="max-h-[50vh] space-y-3 overflow-y-auto pr-1">
            {state.messages.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">No messages yet. Start the conversation below.</p>
            ) : (
              state.messages.map((m) => (
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
            <Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write a message…" />
            <div className="flex justify-end">
              <Button className="h-11" onClick={send} disabled={!body.trim()}>
                Send message
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Messages are part of your file. For urgent matters, please call your trustee's office.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ClientMessages;
