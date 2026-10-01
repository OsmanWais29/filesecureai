// "Ask your CRM": answers questions from the CRM's own data and offers one-click actions.
// Answers are computed locally (no AI service needed); swap `answer()` for an LLM call later.
import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Client, REQUIRED_DOCS, daysAgo, money, pretty } from "./data";
import { useCRM } from "./store";
import { EmailDialog } from "./EmailDialog";

type Store = ReturnType<typeof useCRM>;

interface Reply {
  text: string;
  clients?: Client[]; // clients the answer is about (clickable)
  email?: { templateId: string; label: string }; // optional "email these clients" action
}

const SUGGESTIONS = [
  "What's due this week?",
  "Which files have gone cold?",
  "Who is missing documents?",
  "Which lead source converts best?",
  "Show my biggest open opportunities",
  "Give me a practice summary",
];

const has = (q: string, ...words: string[]) => words.some((w) => q.includes(w));
const open = (c: Client) => c.stage !== "Discharged";

// Work out an answer from the question's keywords
function answer(question: string, s: Store): Reply {
  const q = question.toLowerCase();

  // A specific client by name
  const named = s.clients.find((c) => new RegExp(`\\b(${c.name}|${c.name.split(" ")[0]})\\b`, "i").test(q));
  if (named) {
    const missing = REQUIRED_DOCS.length - named.docsReceived.length;
    return {
      text: `${named.name}: ${named.fileType}, stage “${named.stage}” for ${daysAgo(named.stageSince)} days. Debt ${named.totalDebt ? money(named.totalDebt) : "not assessed"}. Last contact ${daysAgo(named.lastActivity)} days ago. ${missing} document(s) missing.`,
      clients: [named],
    };
  }

  if (has(q, "due", "deadline", "week", "overdue")) {
    const list = s.deadlines.filter((d) => !d.done && daysAgo(d.due) > -7).sort((a, b) => a.due.localeCompare(b.due));
    const lines = list.map((d) => `• ${new Date(d.due).toLocaleDateString("en-CA", { month: "short", day: "numeric" })} — ${d.title} (${s.clients.find((c) => c.id === d.clientId)?.name})${daysAgo(d.due) > 0 ? " OVERDUE" : ""}`);
    return { text: list.length ? `${list.length} deadline(s) in the next 7 days:\n${lines.join("\n")}` : "Nothing is due in the next 7 days." };
  }

  if (has(q, "cold", "stall", "stuck", "follow", "contact")) {
    const list = s.clients.filter((c) => open(c) && daysAgo(c.lastActivity) > 14);
    return {
      text: list.length ? `${list.length} open file(s) with no contact in over 14 days.` : "Every open file has been contacted in the last 14 days.",
      clients: list, email: list.length ? { templateId: "t1", label: "Email a check-in" } : undefined,
    };
  }

  if (has(q, "missing", "document", "docs")) {
    const list = s.clients.filter((c) => open(c) && c.stage !== "New lead" && c.docsReceived.length < REQUIRED_DOCS.length);
    return {
      text: list.length ? `${list.length} client(s) still owe documents.` : "No one is missing documents.",
      clients: list, email: list.length ? { templateId: "t2", label: "Send document reminders" } : undefined,
    };
  }

  if (has(q, "source", "marketing", "convert", "where")) {
    const rows = [...new Set(s.clients.map((c) => c.leadSource))].map((src) => {
      const all = s.clients.filter((c) => c.leadSource === src);
      const filed = all.filter((c) => ["Filed", "In administration", "Discharged"].includes(c.stage)).length;
      return { src, all: all.length, filed, rate: filed / all.length };
    }).sort((a, b) => b.rate - a.rate || b.all - a.all);
    return { text: `Lead sources by conversion:\n${rows.map((r) => `• ${pretty(r.src)}: ${r.filed}/${r.all} filed (${Math.round(r.rate * 100)}%)`).join("\n")}` };
  }

  if (has(q, "opportunit", "pipeline", "biggest", "debt")) {
    const list = s.clients.filter((c) => ["New lead", "Consultation booked", "Assessment"].includes(c.stage)).sort((a, b) => b.totalDebt - a.totalDebt);
    const value = list.reduce((sum, c) => sum + c.totalDebt, 0);
    return { text: `${list.length} file(s) not yet filed, with ${money(value)} of assessed debt. Largest first:`, clients: list };
  }

  if (has(q, "lead", "new")) {
    const list = s.clients.filter((c) => daysAgo(c.createdAt) <= 30);
    const waiting = list.filter((c) => c.stage === "New lead");
    return {
      text: `${list.length} new lead(s) in the last 30 days. ${waiting.length} still waiting for a first call.`,
      clients: waiting, email: waiting.length ? { templateId: "t1", label: "Send welcome email" } : undefined,
    };
  }

  if (has(q, "summary", "report", "overview", "how")) {
    const active = s.clients.filter((c) => ["Filed", "In administration"].includes(c.stage));
    return {
      text: [
        `• ${s.clients.length} clients, ${active.length} active estates/proposals`,
        `• ${money(active.reduce((x, c) => x + c.totalDebt, 0))} of debt under administration`,
        `• ${s.clients.filter((c) => c.stage === "New lead").length} new leads waiting for a call`,
        `• ${s.deadlines.filter((d) => !d.done && daysAgo(d.due) > 0).length} overdue deadline(s)`,
        `• ${s.automations.filter((a) => a.enabled).length} automations running`,
      ].join("\n"),
    };
  }

  return { text: "I can answer questions about deadlines, files that have gone cold, missing documents, lead sources, open opportunities, new leads, a practice summary, or any client by name." };
}

export const Assistant = ({ open, onOpenChange, openClient }: { open: boolean; onOpenChange: (o: boolean) => void; openClient: (id: string) => void }) => {
  const store = useCRM();
  const [q, setQ] = useState("");
  const [chat, setChat] = useState<{ q: string; r: Reply }[]>([]); // conversation so far
  const [email, setEmail] = useState<{ ids: string[]; tpl: string }>();

  const ask = (question: string) => {
    if (!question.trim()) return;
    setChat((c) => [...c, { q: question, r: answer(question, store) }]);
    setQ("");
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-4 sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2"><Bot className="h-5 w-5 text-primary" />Ask your CRM</SheetTitle>
          <SheetDescription>Answers come from your client, deadline and pipeline data.</SheetDescription>
        </SheetHeader>

        {/* Conversation */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {chat.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button key={s} onClick={() => ask(s)} className="rounded-full border px-3 py-1.5 text-left text-xs hover:bg-muted">{s}</button>
              ))}
            </div>
          )}
          {chat.map(({ q: question, r }, i) => (
            <div key={i} className="space-y-2">
              <p className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-3 py-2 text-sm text-primary-foreground">{question}</p>
              <div className="max-w-[95%] space-y-2 rounded-2xl rounded-bl-sm bg-muted px-3 py-2 text-sm">
                <p className="whitespace-pre-line">{r.text}</p>
                {/* Clients mentioned: click to open */}
                {!!r.clients?.length && (
                  <div className="flex flex-wrap gap-1.5">
                    {r.clients.map((c) => (
                      <button key={c.id} onClick={() => { openClient(c.id); onOpenChange(false); }} className="rounded-full bg-background px-2.5 py-1 text-xs hover:underline">
                        {c.name}{c.totalDebt ? ` · ${money(c.totalDebt)}` : ""}
                      </button>
                    ))}
                  </div>
                )}
                {/* One-click action */}
                {r.email && r.clients && (
                  <Button size="sm" onClick={() => setEmail({ ids: r.clients!.map((c) => c.id), tpl: r.email!.templateId })}>{r.email.label}</Button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Question box */}
        <form onSubmit={(e) => { e.preventDefault(); ask(q); }} className="flex gap-2">
          <Input id="assistant-q" placeholder="Ask about clients, deadlines, leads…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit" size="icon" aria-label="Ask"><Send className="h-4 w-4" /></Button>
        </form>

        <EmailDialog open={!!email} onOpenChange={(o) => !o && setEmail(undefined)} clientIds={email?.ids ?? []} templateId={email?.tpl} />
      </SheetContent>
    </Sheet>
  );
};
