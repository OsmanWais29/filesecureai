import { cn } from "@/lib/utils";

export const ESTATE_TABS = [
  { id: "overview", label: "Overview" },
  { id: "record", label: "Estate Record" },
  { id: "timeline", label: "Timeline" },
  { id: "workflow", label: "Workflow" },
  { id: "financials", label: "Financials" },
  { id: "creditors", label: "Creditors" },
  { id: "assets", label: "Assets" },
  { id: "additional", label: "Additional Info" },
  { id: "documents", label: "Documents" },
  { id: "forms", label: "Forms" },
  { id: "income", label: "Income" },
  { id: "tax", label: "Tax" },
  { id: "counselling", label: "Counselling" },
  { id: "notes", label: "Notes" },
  { id: "compliance", label: "Compliance" },
  { id: "discharge", label: "Discharge / s.170" },
  { id: "closing", label: "Closing" },
  { id: "activity", label: "Activity" },
] as const;

export type EstateTabId = (typeof ESTATE_TABS)[number]["id"];

interface Props {
  active: EstateTabId;
  onChange: (id: EstateTabId) => void;
}

export const EstateSubmoduleTabs = ({ active, onChange }: Props) => (
  <nav className="flex items-center gap-1 overflow-x-auto border-b bg-background px-4 py-1.5">
    {ESTATE_TABS.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={cn(
          "whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          active === tab.id
            ? "bg-primary/10 text-primary"
            : "text-muted-foreground hover:bg-muted hover:text-foreground"
        )}
      >
        {tab.label}
      </button>
    ))}
  </nav>
);
