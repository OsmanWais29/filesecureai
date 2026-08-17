import { cn } from "@/lib/utils";

interface Props {
  tabs: readonly { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export const SubTabs = ({ tabs, active, onChange }: Props) => (
  <div className="flex flex-wrap gap-1.5">
    {tabs.map((t) => (
      <button
        key={t.id}
        type="button"
        onClick={() => onChange(t.id)}
        className={cn(
          "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          active === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
        )}
      >
        {t.label}
      </button>
    ))}
  </div>
);