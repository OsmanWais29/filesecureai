import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { noteSections } from "@/data/estateFormSpecs";
import { EstateNoteRow, noteToValues, useEstateNotes, useSaveNote } from "@/hooks/useEstateNotes";

export const NotesTab = ({ estateId }: { estateId?: string }) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<EstateNoteRow | null>(null);
  const { data: notes = [], isLoading } = useEstateNotes(estateId);
  const save = useSaveNote(estateId);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };

  const openEdit = (note: EstateNoteRow) => {
    setEditing(note);
    setOpen(true);
  };

  return (
    <Register
      title="Notes & communications"
      description="Typed, contact-linked communication records — persisted with an audit event per entry."
      action={
        <Button size="sm" onClick={openNew} disabled={!estateId}>
          <Plus className="mr-1.5 h-4 w-4" /> Add note
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        {isLoading && <p className="text-muted-foreground">Loading notes…</p>}
        {!isLoading && notes.length === 0 && (
          <p className="text-muted-foreground">No communications recorded for this estate yet.</p>
        )}
        {notes.map((n) => (
          <button
            key={n.id}
            onClick={() => openEdit(n)}
            className="w-full rounded-md border p-3 text-left transition-colors hover:bg-muted/50"
          >
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{n.channel ?? "Note"}</Badge>
              <span className="font-medium">{n.note_code ?? n.subject ?? "Entry"}</span>
              {n.follow_up_date && !n.reminder_done && (
                <Badge variant="destructive">Follow-up {n.follow_up_date}</Badge>
              )}
              <span className="ml-auto text-xs text-muted-foreground">
                {n.note_date ?? n.created_at.slice(0, 10)} {n.note_time ?? ""}
              </span>
            </div>
            <p className="mt-1 whitespace-pre-wrap text-muted-foreground">{n.body}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {[n.party, n.staff].filter(Boolean).join(" · ")}
            </p>
          </button>
        ))}
      </div>

      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={editing ? "Edit note" : "Note / communication"}
        sections={noteSections}
        initial={editing ? noteToValues(editing) : { date: new Date().toISOString().slice(0, 10) }}
        submitLabel="Save note"
        onSubmit={(values) => save.mutate({ values, id: editing?.id })}
      />
    </Register>
  );
};
