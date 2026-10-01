// Tiny shared UI helpers reused by every CRM tab.
import { ReactNode } from "react";
import { Mail, Phone, Calendar, FileText, ClipboardList, CalendarCheck, Zap, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, Level, Stage } from "./data";

// "John Smith" -> "JS"
export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

// Soft tinted colours for low/medium/high (work in light + dark mode)
export const LEVEL_STYLE: Record<Level, string> = {
  low: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  high: "bg-rose-500/10 text-rose-700 dark:text-rose-400",
};

// One colour per pipeline stage
export const STAGE_STYLE: Record<Stage, string> = {
  "New lead": "bg-sky-500/10 text-sky-700 dark:text-sky-400",
  "Consultation booked": "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  Assessment: "bg-violet-500/10 text-violet-700 dark:text-violet-400",
  Filed: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  "In administration": "bg-teal-500/10 text-teal-700 dark:text-teal-400",
  Discharged: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
};

// Icon used for each activity type
export const ACTIVITY_ICON: Record<Activity["type"], LucideIcon> = {
  email: Mail, call: Phone, meeting: Calendar, note: FileText,
  form: ClipboardList, booking: CalendarCheck, automation: Zap,
};

// Small rounded pill (status, stage, risk, tags)
export const Pill = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", className)}>
    {children}
  </span>
);

// Row of toggle chips used as a filter
export function Chips<T extends string>({ options, value, onChange, label = (o: T) => o }: {
  options: readonly T[]; value: T; onChange: (v: T) => void; label?: (o: T) => string;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cn(
            "rounded-full px-3 py-1 text-xs capitalize transition-colors",
            value === o ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/70",
          )}
        >
          {label(o)}
        </button>
      ))}
    </div>
  );
}

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

// Section heading inside a card (optional right-hand slot for a button)
export const SectionTitle = ({ icon: Icon, children, right }: { icon: LucideIcon; children: ReactNode; right?: ReactNode }) => (
  <div className="mb-3 flex items-center justify-between gap-2">
    <h3 className="flex items-center gap-2 text-sm font-semibold"><Icon className="h-4 w-4 text-primary" /> {children}</h3>
    {right}
  </div>
);

// Placeholder shown when a list is empty
export const Empty = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-muted-foreground">
    <Icon className="h-8 w-8 opacity-40" /> {text}
  </div>
);
