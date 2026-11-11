import { useEffect, useMemo, useState } from "react";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormCatalogueItem } from "@/hooks/useEstateForms";

type Row = Record<string, any>;
interface Field { key: string; label: string; type?: "date" | "select"; options?: { value: string; label: string }[]; required?: boolean; forForms?: string[] }

const FIELDS: Field[] = [
  { key: "estate_type", label: "Estate type", type: "select", required: true, options: [{ value: "Bankruptcy", label: "Bankruptcy" }, { value: "Consumer Proposal", label: "Consumer proposal" }] },
  { key: "insolvency_date", label: "Filing (insolvency) date", type: "date", required: true },
  { key: "appointment_date", label: "Trustee appointment date", type: "date", forForms: ["Form 68"] },
  { key: "administration_type", label: "Administration type", type: "select", forForms: ["Form 12", "Form 13"], options: [{ value: "Summary", label: "Summary" }, { value: "Ordinary", label: "Ordinary" }] },
  { key: "first_name", label: "Debtor first name", required: true },
  { key: "last_name", label: "Debtor last name", required: true },
  { key: "address", label: "Debtor address", required: true },
  { key: "osb_estate_number", label: "OSB estate number" },
  { key: "court_number", label: "Court number" },
  { key: "district", label: "District" },
  { key: "division_number", label: "Division number" },
  { key: "trustee_name", label: "Trustee / administrator", required: true },
];

export const fieldsFor = (formNumber: string) => FIELDS.filter((f) => !f.forForms || f.forForms.includes(formNumber));
export const missingFields = (formNumber: string, row?: Row | null) =>
  fieldsFor(formNumber).filter((f) => (f.required || f.forForms) && !String(row?.[f.key] ?? "").trim());

export const FormDetailsEditor = ({ item, estate, saving, onSave }: { item: FormCatalogueItem; estate?: Row | null; saving: boolean; onSave: (patch: Record<string, string | null>) => void }) => {
  const fields = useMemo(() => fieldsFor(item.number), [item.number]);
  const [vals, setVals] = useState<Record<string, string>>({});
  useEffect(() => {
    setVals(Object.fromEntries(fields.map((f) => [f.key, String(estate?.[f.key] ?? "")])));
  }, [estate, fields]);
  const missing = new Set(missingFields(item.number, estate).map((f) => f.key));
  const changed = fields.filter((f) => (vals[f.key] ?? "") !== String(estate?.[f.key] ?? ""));
  return (
    <section className="space-y-3">
      <div>
        <h4 className="font-semibold">Form details</h4>
        <p className="text-xs text-muted-foreground">
          {missing.size ? `${missing.size} item(s) missing — fill them in here.` : "All details present. Edit anything that is wrong."} Saves to the estate record so every form uses the same value.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((f) => (
          <div key={f.key} className="space-y-1">
            <Label htmlFor={`fd-${f.key}`} className="text-xs">
              {f.label} {missing.has(f.key) && <span className="text-destructive">· missing</span>}
            </Label>
            {f.type === "select" ? (
              <select id={`fd-${f.key}`} className="h-9 w-full rounded-md border bg-background px-2 text-sm" value={vals[f.key] ?? ""} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))}>
                <option value="">Choose…</option>
                {f.options!.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            ) : (
              <Input id={`fd-${f.key}`} type={f.type ?? "text"} value={vals[f.key] ?? ""} onChange={(e) => setVals((v) => ({ ...v, [f.key]: e.target.value }))} aria-invalid={missing.has(f.key)} />
            )}
          </div>
        ))}
      </div>
      <Button size="sm" disabled={saving || !changed.length} onClick={() => onSave(Object.fromEntries(changed.map((f) => [f.key, vals[f.key]?.trim() || null])))}>
        {saving ? "Saving…" : `Save ${changed.length || ""} change${changed.length === 1 ? "" : "s"}`.replace("  ", " ")}
      </Button>
    </section>
  );
};

/** Draft PDF populated from the estate record. Not an official OSB rendering. */
export const buildFormPdf = (item: FormCatalogueItem, estate?: Row | null): string => {
  const doc = new jsPDF();
  const e = item.evaluation;
  const w = doc.internal.pageSize.getWidth();
  doc.setFontSize(9);
  doc.text("Bankruptcy and Insolvency Act — Office of the Superintendent of Bankruptcy", 14, 12);
  doc.setFontSize(15);
  doc.text(`${item.number} — ${item.title}`, 14, 22, { maxWidth: w - 28 });
  doc.setFontSize(9);
  doc.text(`${e.version.label}${e.period ? ` · Period: ${e.period}` : ""} · Status: ${e.status ?? "Not applicable"}`, 14, 34);
  let y = 44;
  doc.setFontSize(10);
  fieldsFor(item.number).forEach((f) => {
    const v = String(estate?.[f.key] ?? "").trim();
    doc.setTextColor(90);
    doc.text(f.label, 14, y);
    doc.setTextColor(v ? 0 : 200, 0, 0);
    doc.text(v || "[MISSING]", 80, y);
    doc.setDrawColor(200);
    doc.line(80, y + 1.5, w - 14, y + 1.5);
    y += 9;
  });
  doc.setTextColor(0);
  y += 4;
  doc.text(`Data sources: ${item.sources.join(", ")}`, 14, y);
  if (e.deadline) doc.text(`Due ${e.deadline} (${item.deadline?.citation ?? ""})`, 14, (y += 7));
  y += 14;
  doc.text("Signature of trustee / administrator", 14, y);
  doc.line(80, y + 1.5, w - 14, y + 1.5);
  doc.text(`Date: ${item.instance?.signing_date ?? "________________"}`, 14, (y += 10));
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text("DRAFT PREVIEW — layout is not the official OSB form. Values in red are missing.", 14, 285);
  return doc.output("bloburl").toString();
};
