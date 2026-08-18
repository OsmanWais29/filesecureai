// Phase 7 — communications register (notes, calls, emails, reminders).
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import { logEstateEvent } from "@/hooks/useEstateRecords";

const db = supabase as unknown as { from: (table: string) => any };
const str = (v: RecordValues[string]) => (v == null || v === "" ? null : String(v));

export interface EstateNoteRow {
  id: string;
  estate_id: string;
  note_date: string | null;
  note_time: string | null;
  channel: string | null;
  subject: string | null;
  party: string | null;
  contact_address: string | null;
  body: string | null;
  billable: boolean;
  minutes: number | null;
  follow_up_date: string | null;
  priority: string | null;
  reminder_text: string | null;
  reminder_done: boolean;
  reminder_from: string | null;
  reminder_to: string | null;
  note_code: string | null;
  staff: string | null;
  created_at: string;
}

export const useEstateNotes = (estateId?: string) =>
  useQuery({
    queryKey: ["estate_notes", estateId],
    enabled: Boolean(estateId),
    queryFn: async (): Promise<EstateNoteRow[]> => {
      const { data, error } = await db
        .from("estate_notes")
        .select("*")
        .eq("estate_id", estateId)
        .order("note_date", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as EstateNoteRow[];
    },
  });

export const noteToValues = (n: EstateNoteRow): RecordValues => ({
  entryType: n.channel ?? "",
  date: n.note_date ?? "",
  time: n.note_time ?? "",
  user: n.staff ?? "",
  noteCode: n.note_code ?? "",
  contact: n.party ?? "",
  text: n.body ?? "",
  done: n.reminder_done,
  priority: n.priority ?? "",
  dueDate: n.follow_up_date ?? "",
  from: n.reminder_from ?? "",
  to: n.reminder_to ?? "",
  reminderText: n.reminder_text ?? "",
});

export const useSaveNote = (estateId?: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ values, id }: { values: RecordValues; id?: string }) => {
      if (!estateId) throw new Error("No estate selected.");
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) throw new Error("You must be signed in to work on estates.");
      const row = {
        channel: str(values.entryType),
        note_date: str(values.date),
        note_time: str(values.time),
        staff: str(values.user),
        note_code: str(values.noteCode),
        party: str(values.contact),
        subject: str(values.noteCode) ?? str(values.entryType),
        body: str(values.text),
        reminder_done: Boolean(values.done),
        priority: str(values.priority),
        follow_up_date: str(values.dueDate),
        reminder_from: str(values.from),
        reminder_to: str(values.to),
        reminder_text: str(values.reminderText),
      };
      const query = id
        ? db.from("estate_notes").update(row).eq("id", id)
        : db.from("estate_notes").insert({ ...row, estate_id: estateId, user_id: auth.user.id });
      const { data, error } = await query.select().single();
      if (error) throw error;
      await logEstateEvent({
        estateId,
        eventType: `estate.note.${id ? "updated" : "created"}`,
        after: row,
      });
      return data as EstateNoteRow;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["estate_notes", estateId] });
      qc.invalidateQueries({ queryKey: ["estate-events", estateId] });
      toast({ title: "Note saved" });
    },
    onError: (e: Error) =>
      toast({ title: "Could not save note", description: e.message, variant: "destructive" }),
  });
};