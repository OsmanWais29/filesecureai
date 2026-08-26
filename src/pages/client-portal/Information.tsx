import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ClientPageHeading, ClientStatusBadge } from "@/components/client-portal/primitives";
import { usePortalSession } from "@/data/clientPortal/session";
import { usePortalIntake, usePortalIntakeActions } from "@/data/clientPortal/db";
import { INTAKE_SECTIONS, IntakeField, IntakeSection, sectionCompletion } from "@/data/clientPortal/intakeSpec";
import { ArrowLeft, ArrowRight, Check, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const statusLabel: Record<string, string> = {
  not_started: "Not started",
  draft: "Draft",
  submitted: "Submitted",
  changes_requested: "More Information Needed",
  accepted: "Accepted",
};

/**
 * Guided intake — "My information".
 *
 * One question at a time in plain language, saved per section as a real record
 * on the estate authorized by the invite. Answers stay editable while in draft
 * or when the trustee asks for changes, and lock once accepted.
 */
export const ClientInformation = () => {
  const { session } = usePortalSession();
  const actor = session ? { userId: session.userId, name: session.name } : undefined;
  const { data: records = [], isLoading } = usePortalIntake(session?.estateId);
  const { save } = usePortalIntakeActions(session?.estateId, actor);

  const [index, setIndex] = useState(0);
  const [drafts, setDrafts] = useState<Record<string, Record<string, any>>>({});

  const section = INTAKE_SECTIONS[index];
  const record = records.find((r) => r.sectionKey === section.key);
  const locked = record?.status === "accepted" || record?.reviewState === "Accepted";
  const data = drafts[section.key] ?? record?.data ?? {};

  const overall = useMemo(() => {
    const done = INTAKE_SECTIONS.filter((s) => {
      const r = records.find((x) => x.sectionKey === s.key);
      return r?.status === "submitted" || r?.status === "accepted";
    }).length;
    return Math.round((done / INTAKE_SECTIONS.length) * 100);
  }, [records]);

  const setField = (key: string, value: any) =>
    setDrafts((prev) => ({ ...prev, [section.key]: { ...data, [key]: value } }));

  const persist = async (submit: boolean) => {
    try {
      await save.mutateAsync({ sectionKey: section.key, data, submit });
      toast.success(submit ? "Section sent to your trustee" : "Saved");
      if (submit && index < INTAKE_SECTIONS.length - 1) setIndex(index + 1);
    } catch (e) {
      toast.error("Could not save", { description: (e as Error).message });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-muted-foreground">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl">
      <ClientPageHeading
        title="My information"
        description="A few guided questions about you, your household and your finances. Save as you go — nothing has to be finished in one sitting."
      />

      <div className="mb-6 space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Sections completed</span>
          <span className="font-medium">{overall}%</span>
        </div>
        <Progress value={overall} className="h-2" />
      </div>

      <div className="grid gap-6 md:grid-cols-[220px_1fr]">
        <nav className="space-y-1">
          {INTAKE_SECTIONS.map((s, i) => {
            const r = records.find((x) => x.sectionKey === s.key);
            const done = r?.status === "submitted" || r?.status === "accepted";
            return (
              <button
                key={s.key}
                onClick={() => setIndex(i)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors",
                  i === index ? "bg-primary text-primary-foreground" : "hover:bg-muted",
                )}
              >
                <span className="truncate">{s.title}</span>
                {done && <Check className={cn("h-4 w-4 shrink-0", i === index ? "" : "text-accent")} />}
              </button>
            );
          })}
        </nav>

        <Card>
          <CardHeader className="space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">{section.title}</CardTitle>
              <ClientStatusBadge label={statusLabel[record?.status ?? "not_started"]} />
            </div>
            <p className="text-sm text-muted-foreground">{section.purpose}</p>
            {record?.reviewNote && record.status === "changes_requested" && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                Your trustee asked for a change: {record.reviewNote}
              </p>
            )}
          </CardHeader>

          <CardContent className="space-y-5">
            {section.fields.map((f) => (
              <FieldInput key={f.key} field={f} value={data[f.key]} disabled={locked} onChange={(v) => setField(f.key, v)} />
            ))}

            <p className="border-t pt-4 text-xs text-muted-foreground">Why we ask: {section.usedFor}</p>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <Button variant="ghost" disabled={index === 0} onClick={() => setIndex(index - 1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" className="h-11" disabled={locked || save.isPending} onClick={() => void persist(false)}>
                  Save for later
                </Button>
                <Button className="h-11" disabled={locked || save.isPending} onClick={() => void persist(true)}>
                  {save.isPending ? "Saving…" : "Send this section"}
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </div>
            </div>

            {locked && (
              <p className="text-xs text-muted-foreground">
                Your trustee has accepted this section. Send a message if something needs to change.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

/* --------------------------------------------------------------- field ui */

const FieldInput = ({
  field,
  value,
  disabled,
  onChange,
}: {
  field: IntakeField;
  value: any;
  disabled?: boolean;
  onChange: (v: any) => void;
}) => {
  if (field.repeatOf) return <RepeatingGroup field={field} value={value} disabled={disabled} onChange={onChange} />;

  const id = `intake-${field.key}`;

  if (field.type === "boolean") {
    return (
      <div className="flex items-start justify-between gap-4 rounded-md border p-3">
        <Label htmlFor={id} className="text-sm font-normal leading-relaxed">
          {field.label}
          {field.help && <span className="mt-0.5 block text-xs text-muted-foreground">{field.help}</span>}
        </Label>
        <Switch id={id} checked={!!value} disabled={disabled} onCheckedChange={onChange} />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>
        {field.label}
        {field.required && <span className="ml-1 text-destructive">*</span>}
      </Label>
      {field.help && <p className="text-xs text-muted-foreground">{field.help}</p>}
      {field.type === "textarea" ? (
        <Textarea id={id} rows={3} value={value ?? ""} disabled={disabled} onChange={(e) => onChange(e.target.value)} />
      ) : field.type === "select" ? (
        <Select value={value ?? ""} disabled={disabled} onValueChange={onChange}>
          <SelectTrigger id={id} className="h-11">
            <SelectValue placeholder="Choose one" />
          </SelectTrigger>
          <SelectContent>
            {(field.options ?? []).map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ) : (
        <Input
          id={id}
          className="h-11"
          type={field.type === "money" || field.type === "number" ? "number" : field.type === "date" ? "date" : field.type === "email" ? "email" : field.type === "tel" ? "tel" : "text"}
          inputMode={field.type === "money" || field.type === "number" ? "decimal" : undefined}
          value={value ?? ""}
          disabled={disabled}
          onChange={(e) => onChange(field.type === "money" || field.type === "number" ? (e.target.value === "" ? null : Number(e.target.value)) : e.target.value)}
        />
      )}
    </div>
  );
};

const RepeatingGroup = ({
  field,
  value,
  disabled,
  onChange,
}: {
  field: IntakeField;
  value: any;
  disabled?: boolean;
  onChange: (v: any) => void;
}) => {
  const rows: Record<string, any>[] = Array.isArray(value) ? value : [];
  const update = (i: number, key: string, v: any) =>
    onChange(rows.map((r, idx) => (idx === i ? { ...r, [key]: v } : r)));

  return (
    <div className="space-y-3">
      <Label>{field.label}</Label>
      {rows.length === 0 && <p className="text-sm text-muted-foreground">Nothing added yet.</p>}
      {rows.map((row, i) => (
        <div key={i} className="space-y-3 rounded-md border p-3">
          <div className="flex justify-end">
            <Button
              variant="ghost"
              size="icon"
              disabled={disabled}
              onClick={() => onChange(rows.filter((_, idx) => idx !== i))}
              aria-label="Remove"
            >
              <Trash2 className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
          {(field.repeatOf ?? []).map((sub) => (
            <FieldInput
              key={sub.key}
              field={sub}
              value={row[sub.key]}
              disabled={disabled}
              onChange={(v) => update(i, sub.key, v)}
            />
          ))}
        </div>
      ))}
      <Button variant="outline" disabled={disabled} onClick={() => onChange([...rows, {}])}>
        <Plus className="mr-1.5 h-4 w-4" /> Add
      </Button>
    </div>
  );
};

export default ClientInformation;
