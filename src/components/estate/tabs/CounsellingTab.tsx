import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { counsellingSections } from "@/data/estateFormSpecs";

const sessions = [
  { id: "cs1", session: "First session (Stage 1)", due: "2026-08-21", appointment: "", counsellor: "Mark Lee", completed: false },
  { id: "cs2", session: "Second session (Stage 2)", due: "2026-11-12", appointment: "", counsellor: "—", completed: false },
];

export const CounsellingTab = () => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<(typeof sessions)[number] | null>(null);

  return (
    <Register
      title="Counselling"
      description="Due dates are computed from the insolvency date by the rule engine."
      action={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add session
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        {sessions.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
            <span className="font-medium">{s.session}</span>
            <Badge variant="outline">Due {s.due}</Badge>
            <span className="text-muted-foreground">{s.appointment || "Not scheduled"}</span>
            <Badge variant={s.completed ? "secondary" : "destructive"} className="ml-auto">
              {s.completed ? "Completed" : "Outstanding"}
            </Badge>
            <Button size="sm" variant="outline" onClick={() => setEditing(s)}>
              Edit
            </Button>
          </div>
        ))}
      </div>

      <RecordDrawer
        open={open || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setOpen(false);
            setEditing(null);
          }
        }}
        title={editing ? editing.session : "Counselling session"}
        sections={counsellingSections}
        initial={editing ? { counsellor: editing.counsellor } : {}}
        submitLabel="Save session"
        onSubmit={() => toast({ title: "Counselling session saved" })}
      />
    </Register>
  );
};
