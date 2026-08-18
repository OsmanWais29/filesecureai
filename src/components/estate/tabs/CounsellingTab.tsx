import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { counsellingSections } from "@/data/estateFormSpecs";
import {
  counsellingToValues,
  useCounsellingSessions,
  useSaveCounsellingSession,
  type CounsellingSessionRow,
} from "@/hooks/useEstateStatutory";

export const CounsellingTab = ({ estateId }: { estateId?: string }) => {
  const { data: sessions = [], isLoading } = useCounsellingSessions(estateId);
  const save = useSaveCounsellingSession(estateId);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<CounsellingSessionRow | null>(null);

  const completed = sessions.filter((s) => s.completed).length;

  return (
    <Register
      title="Counselling"
      description={`Statutory requirement: two sessions. Completed ${completed} of 2. Due dates are driven by the insolvency date in the statutory register.`}
      action={
        <Button size="sm" onClick={() => setAdding(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add session
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        {isLoading && <p className="text-muted-foreground">Loading sessions…</p>}
        {!isLoading && sessions.length === 0 && (
          <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
            No counselling sessions recorded yet.
          </p>
        )}
        {sessions.map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
            <span className="font-medium">{s.session_number || "Session"}</span>
            <span className="text-muted-foreground">
              {s.appointment_date ? `${s.appointment_date} ${s.appointment_time ?? ""}` : "Not scheduled"}
            </span>
            {s.counsellor && <Badge variant="outline">{s.counsellor}</Badge>}
            {s.refused && <Badge variant="destructive">Refused</Badge>}
            {s.neglected && <Badge variant="destructive">Neglected</Badge>}
            {s.certificate_generated && <Badge variant="secondary">Certificate</Badge>}
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
        open={adding || Boolean(editing)}
        onOpenChange={(o) => {
          if (!o) {
            setAdding(false);
            setEditing(null);
          }
        }}
        title={editing ? editing.session_number || "Counselling session" : "Counselling session"}
        sections={counsellingSections}
        initial={editing ? counsellingToValues(editing) : {}}
        submitLabel="Save session"
        onSubmit={(values) =>
          save.mutate(
            { values, id: editing?.id },
            {
              onSuccess: () => {
                setAdding(false);
                setEditing(null);
              },
            }
          )
        }
      />
    </Register>
  );
};
