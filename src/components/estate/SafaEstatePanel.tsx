import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Sparkles, MessageSquare, Wand2, PanelRightClose, PanelRightOpen } from "lucide-react";
import { EstateSummary, safaMessages, signals } from "@/data/estateWorkspace";

interface Props {
  estate: EstateSummary;
  context: string;
  /** Human-readable "Module › Subpage" the user is currently working in. */
  scope?: string;
  collapsed?: boolean;
  onToggle?: () => void;
}

export const SafaEstatePanel = ({ estate, context, scope, collapsed, onToggle }: Props) => {
  const actionable = signals.filter((s) => s.level !== "insight");

  if (collapsed) {
    return (
      <aside className="hidden w-12 shrink-0 border-l bg-card py-3 xl:block">
        <Button variant="ghost" size="icon" className="mx-auto flex" onClick={onToggle} aria-label="Open SAFA">
          <PanelRightOpen className="h-4 w-4" />
        </Button>
        <Sparkles className="mx-auto mt-3 h-4 w-4 text-primary" />
      </aside>
    );
  }

  return (
    <aside className="hidden w-80 shrink-0 border-l bg-card p-4 xl:block">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <span className="font-semibold">SAFA</span>
        <Button variant="ghost" size="icon" className="ml-auto h-7 w-7" onClick={onToggle} aria-label="Collapse SAFA">
          <PanelRightClose className="h-4 w-4" />
        </Button>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground">
        <Badge variant="outline" className="text-[10px]">
          #{estate.estateNumber}
        </Badge>
        {scope && <span className="truncate">{scope}</span>}
      </div>

      <Card className="mt-4 border-primary/20 bg-primary/5">
        <CardContent className="p-3 text-sm">{safaMessages[context] ?? safaMessages.overview}</CardContent>
      </Card>

      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">Estate health</span>
          <span className="text-muted-foreground">{estate.osbReadiness}%</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          {actionable.length} actions requiring a human decision
        </p>
      </div>

      <Separator className="my-4" />

      <ul className="space-y-3">
        {actionable.map((s) => (
          <li key={s.id} className="rounded-md border p-2">
            <div className="text-sm font-medium">{s.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">{s.source}</div>
          </li>
        ))}
      </ul>

      <div className="mt-4 space-y-2">
        <Button variant="outline" className="w-full justify-start" size="sm">
          <MessageSquare className="mr-2 h-4 w-4" /> Ask this estate
        </Button>
        <Button variant="outline" className="w-full justify-start" size="sm">
          <Wand2 className="mr-2 h-4 w-4" /> Prepare action
        </Button>
      </div>
    </aside>
  );
};
