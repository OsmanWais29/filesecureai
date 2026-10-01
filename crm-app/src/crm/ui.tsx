// Small shared UI pieces reused across the CRM.
import { ReactNode } from "react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { Mail, Phone, Calendar, FileText, ClipboardList, CalendarCheck, Zap, CloudUpload, X, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Activity, Level, Stage } from "./data";

// "John Smith" -> "JS"
export const initials = (name: string) => name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

// Copy text with a toast either way
export const copy = (text: string, what = "Text") =>
  navigator.clipboard.writeText(text).then(() => toast.success(`${what} copied`), () => toast.error("Copy failed — select the text instead"));

// Tinted colours (light + dark mode). Written out in full so Tailwind can find the class names.
export const GOOD = "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
export const LEVEL_STYLE: Record<Level, string> = {
  low: GOOD,
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};
export const STAGE_STYLE: Record<Stage, string> = {
  "New lead": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "Consultation booked": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  Assessment: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  Filed: LEVEL_STYLE.medium,
  "In administration": "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  Discharged: GOOD,
};

const ACTIVITY_ICON: Record<Activity["type"], LucideIcon> = {
  email: Mail, call: Phone, meeting: Calendar, note: FileText, form: ClipboardList, booking: CalendarCheck, automation: Zap,
};

// Rounded label (stage, risk, status)
export const Pill = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>{children}</span>
);

// Row of toggle chips used as a filter
export function Chips<T extends string>({ options, value, onChange }: { options: readonly T[]; value: T; onChange: (v: T) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button key={o} onClick={() => onChange(o)}
          className={cn("rounded-full px-3 py-1 text-xs transition-colors", value === o ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70")}>
          {o}
        </button>
      ))}
    </div>
  );
}

// Labelled dropdown. `options` are values; `label` turns a value into display text.
export const SelectField = ({ id, label, value, onChange, options, placeholder = "Select…", show = (o) => o }: {
  id: string; label: string; value?: string; onChange: (v: string) => void;
  options: readonly string[]; placeholder?: string; show?: (o: string) => string;
}) => (
  <div className="space-y-1.5">
    <Label htmlFor={id}>{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id}><SelectValue placeholder={placeholder} /></SelectTrigger>
      <SelectContent>{options.map((o) => <SelectItem key={o} value={o}>{show(o)}</SelectItem>)}</SelectContent>
    </Select>
  </div>
);

// Drag-and-drop / click-to-browse file zone with the queued file list
export const FileDrop = ({ files, setFiles, disabled }: { files: File[]; setFiles: (f: File[]) => void; disabled?: boolean }) => (
  <div className="space-y-2">
    <label
      onDragOver={(e) => e.preventDefault()}
      onDrop={(e) => { e.preventDefault(); setFiles([...files, ...Array.from(e.dataTransfer.files)]); }}
      className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors hover:border-primary hover:bg-primary/5"
    >
      <CloudUpload className="h-8 w-8 text-primary" />
      <span className="text-sm font-medium">Drag files here or click to browse</span>
      <span className="text-xs text-muted-foreground">PDF, Word, Excel or images</span>
      <input type="file" multiple disabled={disabled} accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xls,.xlsx" className="hidden"
        onChange={(e) => setFiles([...files, ...Array.from(e.target.files ?? [])])} />
    </label>
    {files.map((f, i) => (
      <div key={i} className="flex items-center gap-3 rounded-lg border p-2.5 text-sm">
        <FileText className="h-4 w-4 text-muted-foreground" />
        <span className="flex-1 truncate">{f.name}</span>
        <span className="text-xs text-muted-foreground">{(f.size / 1048576).toFixed(1)} MB</span>
        <button aria-label={`Remove ${f.name}`} disabled={disabled} onClick={() => setFiles(files.filter((_, j) => j !== i))}><X className="h-4 w-4" /></button>
      </div>
    ))}
  </div>
);

// One timeline entry (icon, text, when, source)
export const ActivityRow = ({ a, who }: { a: Activity; who?: string }) => {
  const Icon = ACTIVITY_ICON[a.type];
  return (
    <div className="flex gap-3 text-left">
      <div className="h-fit rounded-full bg-muted p-2"><Icon className="h-3.5 w-3.5" /></div>
      <div className="min-w-0">
        <p className="text-sm">{who && <span className="font-medium">{who} · </span>}{a.text}</p>
        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(a.at), { addSuffix: true })}{a.source && ` · ${a.source}`}</p>
      </div>
    </div>
  );
};

// Headline number card
export const StatCard = ({ label, value, hint, icon: Icon }: { label: string; value: ReactNode; hint?: string; icon: LucideIcon }) => (
  <Card className="flex items-start gap-4 p-4">
    <div className="rounded-lg bg-primary/10 p-2.5 text-primary"><Icon className="h-5 w-5" /></div>
    <div className="min-w-0">
      <p className="text-2xl font-semibold leading-none tabular-nums">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground/80">{hint}</p>}
    </div>
  </Card>
);

// Card with an icon heading (optional right-hand slot)
export const Panel = ({ icon: Icon, title, right, className, children }: {
  icon: LucideIcon; title: ReactNode; right?: ReactNode; className?: string; children: ReactNode;
}) => (
  <Card className={cn("p-5", className)}>
    <div className="mb-3 flex items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" /> {title}</h3>
      {right}
    </div>
    {children}
  </Card>
);

// Placeholder shown when a list is empty
export const Empty = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground"><Icon className="h-8 w-8 opacity-40" /> {text}</div>
);
