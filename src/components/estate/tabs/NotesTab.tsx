import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { noteSections } from "@/data/estateFormSpecs";
import { communications } from "@/data/estateWorkspace";

export const NotesTab = () => {
  const [open, setOpen] = useState(false);

  return (
    <Register
      title="Notes & communications"
      description="Typed, contact-linked communication records — searchable and reportable."
      action={
        <Button size="sm" onClick={() => setOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Add note
        </Button>
      }
    >
      <div className="space-y-2 text-sm">
        {communications.map((c) => (
          <div key={c.id} className="rounded-md border p-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline">{c.channel}</Badge>
              <span className="font-medium">{c.subject}</span>
              <span className="ml-auto text-xs text-muted-foreground">{c.date}</span>
            </div>
            <p className="mt-1 text-muted-foreground">
              {c.party} · {c.address}
            </p>
          </div>
        ))}
      </div>

      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title="Note / communication"
        sections={noteSections}
        submitLabel="Save note"
        onSubmit={() => toast({ title: "Note saved" })}
      />
    </Register>
  );
};
