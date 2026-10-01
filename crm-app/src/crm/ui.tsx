// Tiny shared UI helpers reused by every CRM tab.
import { ReactNode } from "react";
import { Mail, Phone, Calendar, FileText, ClipboardList, LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { Activity, Level } from "./data";

// "John Smith" -> "JS"
export const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

// Soft tinted colours for low/medium/high (works in light + dark mode)
export const LEVEL_STYLE: Record<Level, string> = {
  low: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  medium: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  high: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

// Icon used for each activity type
export const ACTIVITY_ICON: Record<Activity["type"], LucideIcon> = {
  email: Mail,
  call: Phone,
  meeting: Calendar,
  note: FileText,
  form: ClipboardList,
};

// Small rounded pill (status, risk, tags)
export const Pill = ({ children, className }: { children: ReactNode; className?: string }) => (
  <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize", className)}>
    {children}
  </span>
);

// Headline number card used in the stats row
export const StatCard = ({ label, value, icon: Icon }: { label: string; value: ReactNode; icon: LucideIcon }) => (
  <Card className="flex items-center gap-4 p-4">
    <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
      <Icon className="h-5 w-5" />
    </div>
    <div>
      <p className="text-2xl font-semibold leading-none">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{label}</p>
    </div>
  </Card>
);

// Section heading inside a card
export const SectionTitle = ({ icon: Icon, children }: { icon: LucideIcon; children: ReactNode }) => (
  <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold">
    <Icon className="h-4 w-4 text-primary" /> {children}
  </h3>
);

// Placeholder shown when a list is empty
export const Empty = ({ icon: Icon, text }: { icon: LucideIcon; text: string }) => (
  <div className="flex flex-col items-center gap-2 py-10 text-sm text-muted-foreground">
    <Icon className="h-8 w-8 opacity-40" /> {text}
  </div>
);
