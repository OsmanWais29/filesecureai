// Clients tab: "All clients" table, or one client's full profile (chosen via Client options).
import { useState } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  ArrowLeft, CalendarClock, CheckCircle2, ChevronLeft, ChevronRight, Circle, ClipboardList,
  FileCheck2, History, Mail, MapPin, Phone, Search, Sparkles, UserCheck, Users,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Client, REQUIRED_DOCS, STAGES, Stage, daysAgo, isLate, money, pretty } from "./data";
import { useCRM } from "./store";
import { EmailDialog } from "./EmailDialog";
import { ActivityRow, Chips, Empty, LEVEL_STYLE, Panel, Pill, STAGE_STYLE, initials } from "./ui";

const LATE = "font-medium text-rose-600 dark:text-rose-400";

export const ClientsTab = ({ selectedId, onSelect }: { selectedId: string | null; onSelect: (id: string | null) => void }) => {
  const client = useCRM().byId.get(selectedId ?? "");
  return client ? <ClientProfile client={client} onBack={() => onSelect(null)} /> : <AllClients onSelect={onSelect} />;
};

// ---------- Every client in one table ----------

const COLUMNS = ["Client", "File type", "Stage", "Total debt", "Source", "Trustee", "Next deadline", "Last contact"];

const AllClients = ({ onSelect }: { onSelect: (id: string) => void }) => {
  const { clients, openDeadlines } = useCRM();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState<"All" | Stage>("All");
  const [picked, setPicked] = useState<string[]>([]); // ticked rows for bulk email
  const [emailOpen, setEmailOpen] = useState(false);

  const q = query.toLowerCase();
  const rows = clients.filter((c) => (stage === "All" || c.stage === stage) && `${c.name} ${c.email} ${c.city} ${c.estateNumber}`.toLowerCase().includes(q));
  const nextDue = new Map([...openDeadlines].reverse().map((d) => [d.clientId, d])); // earliest open deadline per client
  const tick = (id: string) => setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center gap-3 border-b p-4">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search name, email, city or estate number…" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button variant="outline" disabled={!picked.length} onClick={() => setEmailOpen(true)}><Mail className="mr-2 h-4 w-4" />Email {picked.length || ""} selected</Button>
        <div className="w-full"><Chips options={["All", ...STAGES] as const} value={stage} onChange={setStage} /></div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead className="bg-muted/50 text-left text-xs text-muted-foreground">
            <tr><th className="w-10 p-3" />{COLUMNS.map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((c) => {
              const due = nextDue.get(c.id);
              return (
                <tr key={c.id} onClick={() => onSelect(c.id)} className="cursor-pointer border-t hover:bg-muted/40">
                  <td className="p-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" aria-label={`Select ${c.name}`} checked={picked.includes(c.id)} onChange={() => tick(c.id)} className="h-4 w-4 accent-[hsl(var(--primary))]" />
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8"><AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">{initials(c.name)}</AvatarFallback></Avatar>
                      <div><p className="whitespace-nowrap font-medium">{c.name}</p><p className="text-xs text-muted-foreground">{[c.city, c.province].filter(Boolean).join(", ")}</p></div>
                    </div>
                  </td>
                  <td className="p-3">{c.fileType}</td>
                  <td className="p-3"><Pill className={STAGE_STYLE[c.stage]}>{c.stage}</Pill></td>
                  <td className="p-3 tabular-nums">{c.totalDebt ? money(c.totalDebt) : "—"}</td>
                  <td className="p-3">{pretty(c.leadSource)}</td>
                  <td className="p-3 text-muted-foreground">{c.assignedTo.split(",")[0]}</td>
                  <td className={cn("p-3 text-xs", due && isLate(due) && LATE)}>
                    {due ? <>{format(new Date(due.due), "MMM d")}<span className="block font-normal text-muted-foreground">{due.title}</span></> : "—"}
                  </td>
                  <td className="p-3 text-xs text-muted-foreground">{formatDistanceToNow(new Date(c.lastActivity), { addSuffix: true })}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!rows.length && <Empty icon={Users} text="No clients match your filters" />}
      </div>

      <EmailDialog open={emailOpen} onOpenChange={setEmailOpen} clientIds={picked} />
    </Card>
  );
};

// ---------- One client's profile ----------

const ClientProfile = ({ client: c, onBack }: { client: Client; onBack: () => void }) => {
  const { activities, openDeadlines, shiftStage, toggleDoc, completeDeadline } = useCRM();
  const [email, setEmail] = useState<{ tpl?: string }>(); // open composer (with optional template)

  const timeline = activities.filter((a) => a.clientId === c.id);
  const due = openDeadlines.filter((d) => d.clientId === c.id);
  const missing = REQUIRED_DOCS.filter((d) => !c.docsReceived.includes(d));
  const step = STAGES.indexOf(c.stage);
  const idle = daysAgo(c.lastActivity);

  // Rule-based next steps (with an email template where one helps)
  const tips = ([
    idle > 14 && { text: `No contact in ${idle} days. Reach out before the file goes cold.`, tpl: "t1" },
    missing.length && c.stage !== "Discharged" && { text: `${missing.length} document(s) still missing.`, tpl: "t2" },
    due.some(isLate) && { text: "A deadline is overdue. Review it today." },
    c.stage === "New lead" && { text: "New lead: call back within the hour to book a free consultation.", tpl: "t1" },
  ].filter(Boolean)) as { text: string; tpl?: string }[];

  const facts = [
    ["Total debt", c.totalDebt ? money(c.totalDebt) : "Not assessed"], ["Monthly income", c.monthlyIncome ? money(c.monthlyIncome) : "—"],
    ["Lead source", pretty(c.leadSource)], ["Days in stage", daysAgo(c.stageSince)],
  ];

  return (
    <div className="space-y-6">
      <Button variant="ghost" size="sm" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />All clients</Button>

      <Card className="p-6">
        {/* Identity + contact */}
        <div className="flex flex-wrap items-start gap-4">
          <Avatar className="h-16 w-16"><AvatarFallback className="bg-primary text-lg font-semibold text-primary-foreground">{initials(c.name)}</AvatarFallback></Avatar>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-xl font-semibold">{c.name}</h2>
              <Pill className={STAGE_STYLE[c.stage]}>{c.stage}</Pill>
              <Pill className={LEVEL_STYLE[c.risk]}>{c.risk} risk</Pill>
            </div>
            <p className="mt-1 text-sm text-muted-foreground">{c.fileType}{c.estateNumber && ` · Estate ${c.estateNumber}`} · Client since {format(new Date(c.createdAt), "MMM yyyy")}</p>
            <div className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground [&>span]:flex [&>span]:items-center [&>span]:gap-1.5">
              <span><Mail className="h-3.5 w-3.5" />{c.email}</span>
              <span><Phone className="h-3.5 w-3.5" />{c.phone}</span>
              {c.city && <span><MapPin className="h-3.5 w-3.5" />{c.city}, {c.province}</span>}
              <span><UserCheck className="h-3.5 w-3.5" />{c.assignedTo}</span>
            </div>
          </div>
          <Button onClick={() => setEmail({})}><Mail className="mr-2 h-4 w-4" />Email</Button>
        </div>

        {/* Stage stepper */}
        <div className="mt-6 flex items-center gap-2">
          <Button size="icon" variant="outline" aria-label="Previous stage" disabled={!step} onClick={() => shiftStage(c, -1)}><ChevronLeft className="h-4 w-4" /></Button>
          <ol className="grid flex-1 grid-cols-6 gap-1">
            {STAGES.map((s, i) => (
              <li key={s} title={s} className="space-y-1">
                <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
                <p className={cn("hidden truncate text-[11px] sm:block", i === step ? "font-medium" : "text-muted-foreground")}>{s}</p>
              </li>
            ))}
          </ol>
          <Button size="icon" variant="outline" aria-label="Next stage" disabled={step === STAGES.length - 1} onClick={() => shiftStage(c, 1)}><ChevronRight className="h-4 w-4" /></Button>
        </div>

        {/* Key figures */}
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {facts.map(([k, v]) => <div key={k}><dt className="text-xs text-muted-foreground">{k}</dt><dd className="font-medium tabular-nums">{v}</dd></div>)}
        </dl>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel icon={CalendarClock} title="Deadlines">
          {!due.length && <Empty icon={CalendarClock} text="No open deadlines" />}
          {due.map((d) => (
            <div key={d.id} className="mb-2 flex items-start gap-2 text-sm">
              <button aria-label="Mark done" onClick={() => completeDeadline(d.id)} className="mt-0.5 text-muted-foreground hover:text-primary"><Circle className="h-4 w-4" /></button>
              <div>{d.title}<p className={cn("text-xs", isLate(d) ? LATE : "text-muted-foreground")}>{isLate(d) ? "Overdue · " : "Due "}{format(new Date(d.due), "MMM d")}{d.statutory && " · BIA"}</p></div>
            </div>
          ))}
        </Panel>

        <Panel icon={FileCheck2} title="Documents" right={<span className="text-xs tabular-nums text-muted-foreground">{c.docsReceived.length}/{REQUIRED_DOCS.length}</span>}>
          {REQUIRED_DOCS.map((d) => {
            const got = c.docsReceived.includes(d);
            const Icon = got ? CheckCircle2 : Circle;
            return (
              <button key={d} onClick={() => toggleDoc(c.id, d)} className="mb-2 flex w-full items-start gap-2 text-left text-sm">
                <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", got ? "text-emerald-500" : "text-muted-foreground")} />
                <span className={cn(got && "text-muted-foreground line-through")}>{d}</span>
              </button>
            );
          })}
          {!!missing.length && <Button variant="outline" size="sm" className="mt-2 w-full" onClick={() => setEmail({ tpl: "t2" })}>Request missing documents</Button>}
        </Panel>

        <Panel icon={Sparkles} title="Next steps">
          {!tips.length && <Empty icon={Sparkles} text="Nothing needs attention" />}
          {tips.map((t) => (
            <div key={t.text} className="mb-2 rounded-lg border-l-4 border-amber-500 bg-amber-500/10 p-3 text-sm">
              {t.text}
              {t.tpl && <button className="mt-1 block text-xs font-medium text-primary hover:underline" onClick={() => setEmail({ tpl: t.tpl })}>Draft email →</button>}
            </div>
          ))}
        </Panel>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Panel icon={History} title="Timeline">
          {!timeline.length && <Empty icon={History} text="No activity yet" />}
          <div className="space-y-3">{timeline.map((a) => <ActivityRow key={a.id} a={a} />)}</div>
        </Panel>

        <Panel icon={ClipboardList} title="Intake answers">
          {!c.intake ? <Empty icon={ClipboardList} text="This client was added before online intake" /> : (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {Object.entries(c.intake).filter(([, v]) => v).map(([k, v]) => (
                <div key={k} className="min-w-0">
                  <dt className="text-xs text-muted-foreground">{k === "sin" ? "SIN" : pretty(k.replace(/[A-Z]/g, (m) => ` ${m.toLowerCase()}`))}</dt>
                  <dd className="truncate">{k === "sin" ? `•••-•••-${v.slice(-3)}` : /^[a-z_]+$/.test(v) ? pretty(v) : v}</dd>
                </div>
              ))}
            </dl>
          )}
        </Panel>
      </div>

      <EmailDialog open={!!email} onOpenChange={(o) => !o && setEmail(undefined)} clientIds={[c.id]} templateId={email?.tpl} />
    </div>
  );
};
