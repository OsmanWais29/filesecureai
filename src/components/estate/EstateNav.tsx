import { cn } from "@/lib/utils";
import { ESTATE_MODULES, getModule } from "./estateNavigation";

interface Props {
  module: string;
  page: string;
  onChange: (module: string, page: string) => void;
  /** Open, actionable item counts. Absent or zero renders no badge. */
  moduleBadges?: Record<string, number>;
  pageBadges?: Record<string, number>;
  /** Opens the drilldown for the badge's scope. */
  onBadgeClick?: (module: string, page?: string) => void;
}

const Count = ({ n, onClick }: { n?: number; onClick?: () => void }) =>
  n ? (
    <span
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      title={onClick ? "View underlying records" : undefined}
      onClick={(e) => {
        if (!onClick) return;
        e.stopPropagation();
        onClick();
      }}
      onKeyDown={(e) => {
        if (!onClick) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          e.stopPropagation();
          onClick();
        }
      }}
      className={cn(
        "ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive/10 px-1 text-[10px] font-semibold text-destructive",
        onClick && "cursor-pointer hover:bg-destructive/20"
      )}
    >
      {n}
    </span>
  ) : null;

export const EstateNav = ({
  module,
  page,
  onChange,
  moduleBadges = {},
  pageBadges = {},
  onBadgeClick,
}: Props) => {
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
            <Count n={moduleBadges[m.id]} onClick={onBadgeClick ? () => onBadgeClick(m.id) : undefined} />
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
              <Count
                n={pageBadges[`${active.id}:${p.id}`]}
                onClick={onBadgeClick ? () => onBadgeClick(active.id, p.id) : undefined}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};