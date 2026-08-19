import { cn } from "@/lib/utils";
import { ESTATE_MODULES, getModule } from "./estateNavigation";

interface Props {
  module: string;
  page: string;
  onChange: (module: string, page: string) => void;
}

export const EstateNav = ({ module, page, onChange }: Props) => {
  const active = getModule(module);
  const showSub = active.pages.length > 1;

  return (
    <div className="border-b bg-background">
      <nav className="flex items-center gap-1 overflow-x-auto px-6">
        {ESTATE_MODULES.map((m) => (
          <button
            key={m.id}
            onClick={() => onChange(m.id, m.pages[0].id)}
            className={cn(
              "whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium transition-colors",
              m.id === module
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {m.label}
          </button>
        ))}
      </nav>

      {showSub && (
        <div className="flex items-center gap-1 overflow-x-auto border-t bg-muted/30 px-6 py-1.5">
          {active.pages.map((p) => (
            <button
              key={p.id}
              onClick={() => onChange(active.id, p.id)}
              className={cn(
                "whitespace-nowrap rounded-md px-2.5 py-1 text-[13px] font-medium transition-colors",
                p.id === page
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};