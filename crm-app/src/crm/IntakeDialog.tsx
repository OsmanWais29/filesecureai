// "Add client" intake: 4 steps — Personal, Employment, Documents, Consultation.
// Steps 1-2 are described as data (field lists), so adding a field is a one-line change.
import { useState } from "react";
import { format, isWeekend } from "date-fns";
import { toast } from "sonner";
import { Check, FileText, Info, MapPin, Phone, Video } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { LEAD_SOURCES, PROVINCES, REQUIRED_DOCS, Appointment, pretty } from "./data";
import { useCRM } from "./store";
import { FileDrop, SelectField } from "./ui";

// ---------- Field lists ----------

interface Field {
  name: string;
  label: string;
  placeholder?: string;
  type?: "text" | "email" | "tel" | "date" | "number" | "textarea";
  options?: string[]; // present = render a select
  required?: boolean;
  wide?: boolean; // spans both columns
}

const PERSONAL: Field[] = [
  { name: "fullName", label: "Full Name", placeholder: "Enter full name", required: true },
  { name: "email", label: "Email Address", placeholder: "Enter email address", type: "email", required: true },
  { name: "phone", label: "Phone Number", placeholder: "Enter phone number", type: "tel", required: true },
  { name: "mobilePhone", label: "Mobile Phone", placeholder: "Enter mobile phone number", type: "tel" },
  { name: "dateOfBirth", label: "Date of Birth", type: "date" },
  { name: "sin", label: "Social Insurance Number (SIN)", placeholder: "Enter SIN" },
  { name: "maritalStatus", label: "Marital Status", placeholder: "Select marital status", options: ["single", "married", "divorced", "widowed", "separated", "common_law"] },
  { name: "preferredContactMethod", label: "How do you prefer to be contacted?", options: ["email", "phone", "sms", "mail"] },
  { name: "address", label: "Address", placeholder: "Enter street address", wide: true },
  { name: "city", label: "City", placeholder: "Enter city" },
  { name: "province", label: "Province", placeholder: "Select province", options: PROVINCES },
  { name: "postalCode", label: "Postal Code", placeholder: "Enter postal code" },
  { name: "preferredLanguage", label: "What language do you prefer to communicate in?", options: ["english", "french", "spanish", "other"] },
  { name: "leadSource", label: "How did you hear about us?", placeholder: "Select lead source", options: LEAD_SOURCES },
  { name: "accountStatus", label: "Account Status", options: ["lead", "prospect", "client", "former_client"] },
  { name: "leadDescription", label: "Lead Description", placeholder: "Enter additional details about how this lead was acquired", type: "textarea", wide: true },
];

const EMPLOYMENT: Field[] = [
  { name: "employmentType", label: "Employment Type", placeholder: "Select employment type", options: ["full_time", "part_time", "self_employed", "contractor", "unemployed", "retired"], wide: true },
  { name: "employer", label: "Employer", placeholder: "Enter employer name" },
  { name: "occupation", label: "Occupation/Position", placeholder: "Enter occupation or position" },
  { name: "employerAddress", label: "Employer Address", placeholder: "Enter employer street address", wide: true },
  { name: "employerCity", label: "City", placeholder: "Enter city" },
  { name: "employerProvince", label: "Province", placeholder: "Select province", options: PROVINCES },
  { name: "employerPostalCode", label: "Postal Code", placeholder: "Enter postal code" },
  { name: "monthlyIncome", label: "Monthly Income", placeholder: "Enter monthly income", type: "number" },
  { name: "notes", label: "Additional Notes", placeholder: "Any additional employment information...", type: "textarea", wide: true },
];

const STEPS = ["Personal", "Employment", "Documents", "Consultation"];
const DEFAULTS = { preferredContactMethod: "email", preferredLanguage: "english", accountStatus: "lead" };
const EMAIL_OK = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 9:00 AM–5:30 PM on weekdays, 10:00 AM–3:30 PM on weekends, every 30 minutes
const slotsFor = (d: Date) => {
  const [start, end] = isWeekend(d) ? [10, 16] : [9, 18];
  return Array.from({ length: (end - start) * 2 }, (_, i) =>
    format(new Date(2000, 0, 1, start + Math.floor(i / 2), (i % 2) * 30), "h:mm a"));
};

const MEETING_KINDS: { kind: Appointment["kind"]; label: string; icon: typeof Video }[] = [
  { kind: "video", label: "Video call", icon: Video },
  { kind: "phone", label: "Phone call", icon: Phone },
  { kind: "in_person", label: "In person", icon: MapPin },
];

// ---------- Component ----------

export const IntakeDialog = ({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) => {
  const { addClient } = useCRM();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<Record<string, string>>(DEFAULTS); // steps 1-2 answers
  const [files, setFiles] = useState<File[]>([]); // step 3
  const [day, setDay] = useState<Date>(); // step 4
  const [time, setTime] = useState("");
  const [kind, setKind] = useState<Appointment["kind"]>();
  const [saving, setSaving] = useState(false);

  const set = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));

  // Step 1 needs the required fields + a valid email; other steps are optional
  const blocked = step === 0 && (PERSONAL.some((f) => f.required && !form[f.name]?.trim()) || !EMAIL_OK.test(form.email ?? ""));

  // Close + reset everything
  const close = () => {
    onOpenChange(false);
    setStep(0); setForm(DEFAULTS); setFiles([]); setDay(undefined); setTime(""); setKind(undefined);
  };

  // Save on the last step
  const save = async () => {
    setSaving(true);
    try {
      const consult = day && time && kind ? { date: day.toISOString(), time, kind } : undefined;
      await addClient({ form, files, consult });
      toast.success(`${form.fullName} added${consult ? " and consultation booked" : ""}`);
      close();
    } catch (e) {
      console.error("Failed to add client:", e);
      toast.error("Could not save the client. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>New client intake</DialogTitle>
          <DialogDescription>Fields marked * are required. Everything else can be completed later.</DialogDescription>
        </DialogHeader>

        {/* Step indicator — click a finished step to go back to it */}
        <ol className="grid grid-cols-4 gap-2">
          {STEPS.map((s, i) => (
            <li key={s}>
              <button disabled={i > step} onClick={() => setStep(i)} className="flex w-full flex-col gap-1.5 text-left disabled:cursor-default">
                <span className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
                <span className={cn("flex items-center gap-1 text-xs", i === step ? "font-medium" : "text-muted-foreground")}>
                  {i < step && <Check className="h-3 w-3 text-primary" />}{s}
                </span>
              </button>
            </li>
          ))}
        </ol>

        {/* Current step */}
        {step === 0 && <FieldGrid title="Personal Information" fields={PERSONAL} form={form} set={set} />}
        {step === 1 && <FieldGrid title="Employment Information" fields={EMPLOYMENT} form={form} set={set} />}
        {step === 2 && <DocumentsStep files={files} setFiles={setFiles} />}
        {step === 3 && (
          <ConsultationStep day={day} setDay={(d) => { setDay(d); setTime(""); }} time={time} setTime={setTime} kind={kind} setKind={setKind} />
        )}

        {/* Navigation */}
        <div className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={() => (step ? setStep(step - 1) : close())}>{step ? "Previous" : "Cancel"}</Button>
          {step < STEPS.length - 1
            ? <Button onClick={() => setStep(step + 1)} disabled={blocked}>Next</Button>
            : <Button onClick={save} disabled={saving}>{saving ? "Saving…" : "Complete intake"}</Button>}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ---------- Steps ----------

// Steps 1 + 2: render a field list as a two-column form
const FieldGrid = ({ title, fields, form, set }: {
  title: string; fields: Field[]; form: Record<string, string>; set: (n: string, v: string) => void;
}) => (
  <section className="space-y-4">
    <h3 className="text-sm font-semibold">{title}</h3>
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => { const label = f.label + (f.required ? " *" : ""); return (
        <div key={f.name} className={cn("space-y-1.5", f.wide && "sm:col-span-2")}>
          {f.options ? (
            <SelectField id={f.name} label={label} value={form[f.name]} onChange={(v) => set(f.name, v)} options={f.options} placeholder={f.placeholder} show={f.options === PROVINCES ? undefined : pretty} />
          ) : <>
            <Label htmlFor={f.name}>{label}</Label>
            {f.type === "textarea"
              ? <Textarea id={f.name} rows={3} placeholder={f.placeholder} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
              : <Input id={f.name} type={f.type ?? "text"} placeholder={f.placeholder} autoComplete={f.name === "sin" ? "off" : undefined} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />}
          </>}
        </div>
      ); })}
    </div>
  </section>
);

// Step 3: instructions, recommended documents, and the shared drop zone
const DocumentsStep = ({ files, setFiles }: { files: File[]; setFiles: (f: File[]) => void }) => (
  <section className="space-y-4">
    <div className="flex gap-3 rounded-lg bg-primary/5 p-4">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>
        <h3 className="text-sm font-semibold">Upload Supporting Documents</h3>
        <p className="text-sm text-muted-foreground">Please upload any relevant financial documents, statements, or forms that might help us understand your situation better.</p>
      </div>
    </div>
    <div className="grid gap-4 sm:grid-cols-[2fr_3fr]">
      <div className="rounded-lg border p-4">
        <h4 className="mb-2 text-sm font-medium">Recommended Documents</h4>
        <ul className="space-y-1.5 text-sm text-muted-foreground">
          {REQUIRED_DOCS.map((d) => <li key={d} className="flex gap-2"><FileText className="mt-0.5 h-3.5 w-3.5 shrink-0" />{d}</li>)}
        </ul>
      </div>
      <FileDrop files={files} setFiles={setFiles} />
    </div>
  </section>
);

// Step 4: pick a date, a time slot and how to meet
const ConsultationStep = ({ day, setDay, time, setTime, kind, setKind }: {
  day?: Date; setDay: (d?: Date) => void; time: string; setTime: (t: string) => void;
  kind?: Appointment["kind"]; setKind: (k: Appointment["kind"]) => void;
}) => (
  <section className="space-y-4">
    <div>
      <h3 className="text-sm font-semibold">Schedule Your Consultation</h3>
      <p className="text-sm text-muted-foreground">The first consultation is free. Pick a date, a time and how to meet, or skip this and book later.</p>
    </div>

    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      {/* Date (past days disabled) */}
      <div className="rounded-lg border">
        <Calendar mode="single" selected={day} onSelect={setDay} disabled={{ before: new Date() }} />
      </div>

      <div className="space-y-4">
        {/* Time slots for the chosen day */}
        <div>
          <Label className="mb-2 block">Available times</Label>
          {!day ? <p className="text-sm text-muted-foreground">Select a date first.</p> : (
            <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-4">
              {slotsFor(day).map((t) => (
                <Button key={t} size="sm" variant={time === t ? "default" : "outline"} onClick={() => setTime(t)}>{t}</Button>
              ))}
            </div>
          )}
        </div>

        {/* Meeting type */}
        <div>
          <Label className="mb-2 block">How would you like to meet?</Label>
          <div className="grid grid-cols-3 gap-2">
            {MEETING_KINDS.map(({ kind: k, label, icon: Icon }) => (
              <Button key={k} variant={kind === k ? "default" : "outline"} onClick={() => setKind(k)} className="h-auto flex-col gap-1 py-3">
                <Icon className="h-4 w-4" />{label}
              </Button>
            ))}
          </div>
        </div>

        {/* Summary */}
        {day && time && kind && (
          <p className="rounded-lg bg-primary/5 p-3 text-sm">
            <span className="font-medium">Booked:</span> {format(day, "EEEE, MMMM d")} at {time} · {MEETING_KINDS.find((m) => m.kind === kind)?.label}
          </p>
        )}
      </div>
    </div>
  </section>
);
