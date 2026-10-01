// "Ask your CRM": the backend agent (Claude on Bedrock) answers from live CRM data.
// Emails it writes come back as drafts; nothing is sent until you press Send.
// If the agent is unreachable, the local rule-based `answer()` replies instead.
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, REQUIRED_DOCS, daysAgo, isActive, isConverted, isLate, money, pretty, sumDebt } from "./data";
import { api } from "./api";
import { useCRM } from "./store";
import { EmailDialog } from "./EmailDialog";
import { DraftCard } from "./DraftCard";

type Store = ReturnType<typeof useCRM>;
interface Reply { text: string; clients?: Client[]; email?: { tpl: string; label: string }; draftIds?: string[]; offline?: boolean }

const SUGGESTIONS = ["What's due this week?", "Which files have gone cold?", "Who is missing documents?", "Which lead source converts best?", "Show my biggest open opportunities", "Give me a practice summary"];
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // make a name safe inside a RegExp
const shortDate = (iso: string) => new Date(iso).toLocaleDateString("en-CA", { month: "short", day: "numeric" });

// Keyword -> answer. First matching rule wins.
function answer(question: string, s: Store): Reply {
  const q = question.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));
  const open = s.clients.filter((c) => c.stage !== "Discharged");
  const list = (text: string, clients: Client[], tpl?: string, label = "") => ({ text, clients, email: tpl && clients.length ? { tpl, label } : undefined });

  // A client by full or first name
  const named = s.clients.find((c) => new RegExp(`\\b(${esc(c.name)}|${esc(c.name.split(" ")[0])})\\b`, "i").test(q));
  if (named) return list(
    `${named.name}: ${named.fileType}, “${named.stage}” for ${daysAgo(named.stageSince)} days. Debt ${named.totalDebt ? money(named.totalDebt) : "not assessed"}. ` +
    `Last contact ${daysAgo(named.lastActivity)} days ago. ${REQUIRED_DOCS.length - named.docsReceived.length} document(s) missing.`, [named]);

  if (has("due", "deadline", "week", "overdue")) {
    const due = s.openDeadlines.filter((d) => daysAgo(d.due) > -7);
    return { text: due.length ? `${due.length} deadline(s) in the next 7 days:\n${due.map((d) => `• ${shortDate(d.due)} — ${d.title} (${s.nameOf(d.clientId)})${isLate(d) ? " OVERDUE" : ""}`).join("\n")}` : "Nothing is due in the next 7 days." };
  }
  if (has("cold", "stall", "stuck", "follow", "contact")) {
    const cold = open.filter((c) => daysAgo(c.lastActivity) > 14);
    return list(cold.length ? `${cold.length} open file(s) with no contact in over 14 days.` : "Every open file was contacted in the last 14 days.", cold, "check_in", "Email a check-in");
  }
  if (has("missing", "document", "docs")) {
    const owing = open.filter((c) => c.stage !== "New lead" && c.docsReceived.length < REQUIRED_DOCS.length);
    return list(owing.length ? `${owing.length} client(s) still owe documents.` : "No one is missing documents.", owing, "documents", "Send document reminders");
  }
  if (has("source", "marketing", "convert", "where")) {
    const rows = [...new Set(s.clients.map((c) => c.leadSource))].map((src) => {
      const all = s.clients.filter((c) => c.leadSource === src), filed = all.filter(isConverted).length;
      return { src, all: all.length, filed, rate: filed / all.length };
    }).sort((a, b) => b.rate - a.rate || b.all - a.all);
    return { text: `Lead sources by conversion:\n${rows.map((r) => `• ${pretty(r.src)}: ${r.filed}/${r.all} filed (${Math.round(r.rate * 100)}%)`).join("\n")}` };
  }
  if (has("opportunit", "pipeline", "biggest", "debt")) {
    const pre = s.clients.filter((c) => ["New lead", "Consultation booked", "Assessment"].includes(c.stage)).sort((a, b) => b.totalDebt - a.totalDebt);
    return list(`${pre.length} file(s) not yet filed, with ${money(sumDebt(pre))} of assessed debt. Largest first:`, pre);
  }
  if (has("lead", "new")) {
    const fresh = s.clients.filter((c) => daysAgo(c.createdAt) < 30), waiting = fresh.filter((c) => c.stage === "New lead");
    return list(`${fresh.length} new lead(s) in the last 30 days. ${waiting.length} still waiting for a first call.`, waiting, "welcome", "Send welcome email");
  }
  if (has("summary", "report", "overview", "how")) {
    const active = s.clients.filter(isActive);
    return { text: [
      `• ${s.clients.length} clients, ${active.length} active estates/proposals`,
      `• ${money(sumDebt(active))} of debt under administration`,
      `• ${s.clients.filter((c) => c.stage === "New lead").length} new leads waiting for a call`,
      `• ${s.deadlines.filter(isLate).length} overdue deadline(s)`,
      `• ${s.automations.filter((a) => a.enabled).length} automations running`,
    ].join("\n") };
  }
  return { text: "Ask me about deadlines, files gone cold, missing documents, lead sources, open opportunities, new leads, a practice summary, or any client by name." };
}

export const Assistant = ({ open, onOpenChange, openClient }: { open: boolean; onOpenChange: (o: boolean) => void; openClient: (id: string) => void }) => {
  const store = useCRM();
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ q: string; r: Reply }[]>([]);
  const [email, setEmail] = useState<{ ids: string[]; tpl: string }>();

  const [busy, setBusy] = useState(false);

  // Send the conversation so far to the agent; fall back to local rules on failure
  const ask = async (question: string) => {
    if (!question.trim() || busy) return;
    setQ("");
    setBusy(true);
    const messages = [...chat.flatMap((t) => [
      { role: "user" as const, text: t.q }, { role: "assistant" as const, text: t.r.text },
    ]), { role: "user" as const, text: question }];
    let r: Reply;
    try {
      r = await api.ask(messages);
      if (r.draftIds?.length) await store.refresh(); // load the new drafts
    } catch {
      r = { ...answer(question, store), offline: true };
    }
    setChat((c) => [...c, { q: question, r }]);
    setBusy(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" />Ask your CRM</SheetTitle>
          <SheetDescription>Answers come from your client, deadline and pipeline data.</SheetDescription>
        </SheetHeader>

        <div className="flex-1 space-y-4 overflow-y-auto">
          {!chat.length && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => <button key={s} onClick={() => ask(s)} className="rounded-full border px-3 py-1.5 text-left text-xs hover:bg-muted">{s}</button>)}
            </div>
          )}
          {chat.map(({ q: question, r }, i) => (
            <div key={i} className="space-y-2">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{question}</p>
              <div className="max-w-[95%] space-y-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                <p className="whitespace-pre-line">{r.text}</p>
                {!!r.clients?.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.clients.map((c) => (
                      <button key={c.id} onClick={() => { openClient(c.id); onOpenChange(false); }} className="rounded-full bg-background px-2.5 py-1 text-xs hover:underline">
                        {c.name}{c.totalDebt ? ` · ${money(c.totalDebt)}` : ""}
                      </button>
                    ))}
                  </div>
                )}
                {r.draftIds?.map((id) => <DraftCard key={id} id={id} />)}
                {r.offline && <p className="text-xs text-muted-foreground">Quick answer (the AI assistant is offline).</p>}
                {r.email && <Button size="sm" onClick={() => setEmail({ ids: r.clients!.map((c) => c.id), tpl: r.email!.tpl })}>{r.email.label}</Button>}
              </div>
            </div>
          ))}
          {busy && <p className="w-fit animate-pulse rounded-2xl bg-muted px-3 py-2 text-sm text-muted-foreground">Thinking…</p>}
        </div>

        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
          <Input id="assistant-q" placeholder="Ask about clients, deadlines, leads…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit" size="icon" aria-label="Ask" disabled={busy}><Send className="h-4 w-4" /></Button>
        </form>

        <EmailDialog open={!!email} onOpenChange={(o) => !o && setEmail(undefined)} clientIds={email?.ids ?? []} templateKey={email?.tpl} />
      </SheetContent>
    </Sheet>
  );
};
