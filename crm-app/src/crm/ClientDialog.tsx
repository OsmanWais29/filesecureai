// Add-client dialog. `intake` = full multi-step intake, otherwise a quick one-step form.
// Forms are described as data (STEPS) so adding a field is a one-line change.
import { useState } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Check } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import { CLIENTS_KEY } from "./useClients";
import { Client } from "./data";

// ---------- Form description ----------

interface Field {
  name: string;
  label: string;
  type?: "text" | "email" | "tel" | "date" | "textarea";
  options?: string[]; // present = render a select
  required?: boolean;
  wide?: boolean; // spans both columns
}
interface Step { title: string; fields: Field[] }

// Quick form (one step)
const QUICK: Step[] = [{
  title: "Client details",
  fields: [
    { name: "fullName", label: "Full name", required: true },
    { name: "email", label: "Email", type: "email", required: true },
    { name: "phone", label: "Phone", type: "tel" },
    { name: "companyName", label: "Company" },
    { name: "notes", label: "Notes", type: "textarea", wide: true },
  ],
}];

// Full intake (three steps)
const INTAKE: Step[] = [
  {
    title: "Personal",
    fields: [
      { name: "fullName", label: "Full name", required: true },
      { name: "email", label: "Email", type: "email", required: true },
      { name: "phone", label: "Phone", type: "tel", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date" },
      { name: "maritalStatus", label: "Marital status", options: ["single", "married", "common_law", "separated", "divorced", "widowed"] },
      { name: "address", label: "Address" },
      { name: "city", label: "City" },
      { name: "province", label: "Province" },
    ],
  },
  {
    title: "Employment",
    fields: [
      { name: "employmentType", label: "Employment type", options: ["full_time", "part_time", "self_employed", "contractor", "unemployed", "retired"] },
      { name: "employer", label: "Employer" },
      { name: "occupation", label: "Occupation" },
      { name: "monthlyIncome", label: "Monthly income ($)" },
      { name: "notes", label: "Notes", type: "textarea", wide: true },
    ],
  },
  {
    title: "Preferences",
    fields: [
      { name: "preferredContactMethod", label: "Preferred contact", options: ["email", "phone", "sms", "mail"] },
      { name: "preferredLanguage", label: "Language", options: ["english", "french", "spanish", "other"] },
      { name: "leadSource", label: "How they found us", options: ["referral", "google", "social_media", "advertisement", "website", "word_of_mouth", "other"] },
      { name: "accountStatus", label: "Account status", options: ["lead", "prospect", "client"] },
      { name: "leadDescription", label: "Case description", type: "textarea", wide: true },
    ],
  },
];

// "self_employed" -> "Self employed"
const pretty = (s: string) => s.charAt(0).toUpperCase() + s.slice(1).replace(/_/g, " ");

// ---------- Save to Supabase ----------

async function saveClient(form: Record<string, string>) {
  if (!supabase) return; // demo mode: nothing to persist
  // 1. Client record (all form answers kept in metadata)
  const { data: client, error } = await supabase
    .from("clients")
    .insert({
      name: form.fullName,
      email: form.email,
      phone: form.phone || null,
      status: form.accountStatus === "client" ? "active" : "lead",
      last_interaction: new Date().toISOString(),
      metadata: { company: form.companyName, intake_data: form, source: "crm_form" },
    })
    .select()
    .single();
  if (error) throw error;

  // 2. Client folder in Documents + 3. first interaction record
  await Promise.all([
    supabase.from("documents").insert({
      title: `${form.fullName} - Client Files`,
      is_folder: true,
      folder_type: "client",
      metadata: { client_id: client.id, client_name: form.fullName },
    }),
    supabase.from("client_interactions").insert({
      client_id: client.id,
      type: "intake_form",
      content: `Client added via CRM. Lead source: ${form.leadSource || "n/a"}`,
    }),
  ]);
}

// Demo mode: turn form answers into an in-memory client
const demoClient = (form: Record<string, string>): Client => ({
  id: crypto.randomUUID(),
  name: form.fullName,
  email: form.email,
  phone: form.phone ?? "",
  company: form.companyName ?? "",
  status: form.accountStatus === "client" ? "active" : "lead",
  risk: "medium",
  health: 50,
  progress: 0,
  assignedTo: "Unassigned",
  tags: ["New"],
  lastActivity: new Date().toISOString(),
});

// ---------- Component ----------

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  intake?: boolean;
}

export const ClientDialog = ({ open, onOpenChange, intake }: Props) => {
  const steps = intake ? INTAKE : QUICK;
  const [step, setStep] = useState(0); // current step index
  const [form, setForm] = useState<Record<string, string>>({}); // all answers
  const [saving, setSaving] = useState(false);
  const queryClient = useQueryClient();

  const set = (name: string, value: string) => setForm((f) => ({ ...f, [name]: value }));
  const isLast = step === steps.length - 1;
  const missing = steps[step].fields.some((f) => f.required && !form[f.name]?.trim()); // blocks Next

  // Close + reset
  const close = () => { onOpenChange(false); setStep(0); setForm({}); };

  // Next step, or save on the last one
  const next = async () => {
    if (!isLast) return setStep(step + 1);
    setSaving(true);
    try {
      await saveClient(form);
      toast.success(`${form.fullName} added`);
      if (supabase) queryClient.invalidateQueries({ queryKey: CLIENTS_KEY }); // reload from database
      else queryClient.setQueryData<Client[]>(CLIENTS_KEY, (old = []) => [...old, demoClient(form)]); // demo: add locally
      close();
    } catch (e) {
      console.error("Failed to add client:", e);
      toast.error("Could not save client. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => (o ? onOpenChange(true) : close())}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{intake ? "New client intake" : "Add client"}</DialogTitle>
          <DialogDescription>Fields marked * are required.</DialogDescription>
        </DialogHeader>

        {/* Step indicator (only for multi-step) */}
        {steps.length > 1 && (
          <ol className="flex gap-2">
            {steps.map((s, i) => (
              <li key={s.title} className="flex flex-1 flex-col gap-1.5">
                <div className={cn("h-1.5 rounded-full", i <= step ? "bg-primary" : "bg-muted")} />
                <span className={cn("flex items-center gap-1 text-xs", i === step ? "font-medium" : "text-muted-foreground")}>
                  {i < step && <Check className="h-3 w-3 text-primary" />}{s.title}
                </span>
              </li>
            ))}
          </ol>
        )}

        {/* Fields of the current step */}
        <div className="grid gap-4 sm:grid-cols-2">
          {steps[step].fields.map((f) => (
            <div key={f.name} className={cn("space-y-1.5", f.wide && "sm:col-span-2")}>
              <Label htmlFor={f.name}>{f.label}{f.required && " *"}</Label>
              {f.options ? (
                <Select value={form[f.name]} onValueChange={(v) => set(f.name, v)}>
                  <SelectTrigger id={f.name}><SelectValue placeholder="Select…" /></SelectTrigger>
                  <SelectContent>
                    {f.options.map((o) => <SelectItem key={o} value={o}>{pretty(o)}</SelectItem>)}
                  </SelectContent>
                </Select>
              ) : f.type === "textarea" ? (
                <Textarea id={f.name} rows={3} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
              ) : (
                <Input id={f.name} type={f.type ?? "text"} value={form[f.name] ?? ""} onChange={(e) => set(f.name, e.target.value)} />
              )}
            </div>
          ))}
        </div>

        {/* Navigation */}
        <div className="flex justify-between border-t pt-4">
          <Button variant="outline" onClick={() => (step ? setStep(step - 1) : close())}>{step ? "Back" : "Cancel"}</Button>
          <Button onClick={next} disabled={missing || saving}>
            {saving ? "Saving…" : isLast ? "Save client" : "Next"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
