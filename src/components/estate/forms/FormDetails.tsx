import { useEffect, useMemo, useState } from "react";
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

const VERSIONED = new Set(["Form 31", "Form 65", "Form 79"]);
const PRE2024_AVAILABLE = new Set(["Form 65", "Form 79"]);

/** Which official OSB template file applies, chosen from the form version. */
export const templateFor = (item: FormCatalogueItem): { url: string | null; note: string } => {
  const n = item.number.replace("Form ", "");
  const v = item.evaluation.version;
  if (!VERSIONED.has(item.number)) return { url: `/osb-forms/form-${n}.pdf`, note: "Official OSB form (2009-amendment version)." };
  if (!v.known) return { url: null, note: "Filing date missing, so SecureFiles can't tell which version of this form applies. Add the filing date above." };
  if (v.label.startsWith("Pre-2024")) {
    return PRE2024_AVAILABLE.has(item.number)
      ? { url: `/osb-forms/form-${n}-pre2024.pdf`, note: "Official pre-2024 OSB version (estate filed before Sept 16, 2024)." }
      : { url: null, note: "The OSB doesn't publish a downloadable pre-2024 version of this form, so no official template can be shown." };
  }
  return { url: `/osb-forms/form-${n}-2024.pdf`, note: "Official OSB version for estates filed on or after Sept 16, 2024." };
};

/** Official OSB template with a draft stamp on every page, plus a data sheet of estate values. */
export const buildFormPdf = async (item: FormCatalogueItem, estate?: Row | null): Promise<string> => {
  const { PDFDocument, StandardFonts, rgb, degrees } = await import("pdf-lib");
  const tpl = templateFor(item);
  if (!tpl.url) throw new Error(tpl.note);
  const bytes = await (await fetch(tpl.url)).arrayBuffer();
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const font = await doc.embedFont(StandardFonts.HelveticaBold);
  const plain = await doc.embedFont(StandardFonts.Helvetica);
  const missing = missingFields(item.number, estate);
  const e = item.evaluation;
  const incomplete = missing.length > 0 || e.blockers.length > 0 || e.openFlags.length > 0;
  const signed = Boolean(item.instance?.signing_date);
  const stamp = incomplete ? `INCOMPLETE DRAFT — ${missing.length + e.blockers.length + e.openFlags.length} item(s) outstanding` : signed ? "SIGNED COPY — NOT FILED UNTIL OSB ACKNOWLEDGES" : "DRAFT — NOT SIGNED";
  const red = rgb(0.75, 0.1, 0.1);
  for (const page of doc.getPages()) {
    const { width, height } = page.getSize();
    page.drawRectangle({ x: 0, y: height - 18, width, height: 18, color: incomplete ? red : rgb(0.3, 0.3, 0.3), opacity: 0.85 });
    page.drawText(`SecureFiles · ${stamp}`, { x: 10, y: height - 13, size: 9, font, color: rgb(1, 1, 1) });
    if (incomplete || !signed) {
      page.drawText(incomplete ? "INCOMPLETE DRAFT" : "DRAFT", { x: width * 0.18, y: height * 0.3, size: incomplete ? 54 : 80, font, color: red, opacity: 0.15, rotate: degrees(45) });
    }
  }
  const sheet = doc.insertPage(0);
  const { width, height } = sheet.getSize();
  let y = height - 50;
  const line = (t: string, size = 10, f = plain, color = rgb(0, 0, 0)) => { sheet.drawText(t, { x: 40, y, size, font: f, color, maxWidth: width - 80 }); y -= size + 8; };
  line(`${item.number} — ${item.title}`, 14, font);
  line(`${e.version.label}. ${tpl.note}`, 9);
  line(stamp, 11, font, incomplete ? red : rgb(0, 0, 0));
  y -= 6;
  line("Estate details to transcribe onto the official form:", 10, font);
  fieldsFor(item.number).forEach((f) => {
    const v = String(estate?.[f.key] ?? "").trim();
    sheet.drawText(f.label, { x: 40, y, size: 10, font: plain, color: rgb(0.35, 0.35, 0.35) });
    sheet.drawText(v || "MISSING", { x: 220, y, size: 10, font: v ? plain : font, color: v ? rgb(0, 0, 0) : red });
    y -= 18;
  });
  if (e.blockers.length || e.openFlags.length) {
    y -= 6;
    line("Other outstanding checks:", 10, font);
    [...e.blockers, ...e.openFlags.map((f) => f.message)].forEach((b) => line(`• ${b}`, 9));
  }
  y -= 6;
  line("The pages that follow are the official OSB form, unchanged apart from the draft stamp.", 8);
  line("The OSB publishes these forms as flat PDFs, so values are not typed into the boxes automatically.", 8);
  const out = await doc.save();
  return URL.createObjectURL(new Blob([out as BlobPart], { type: "application/pdf" }));
};
