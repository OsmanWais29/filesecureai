import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  RecordDrawer,
  RecordForm,
  Register,
  useRecordValues,
} from "@/components/estate/forms/RecordForm";
import {
  consumerIdentitySection,
  corporateIdentitySection,
  dateProvenanceSection,
  estateArchiveSection,
  estateClassificationSection,
  estateContactSection,
  estateCourtSection,
  estateDatesSection,
  estateRecordDefaults,
  estateResponsibilitySection,
  statutoryDates,
  statutoryInformationSections,
} from "@/data/estateFormSpecs";
import { cn } from "@/lib/utils";

const SUB_TABS = [
  { id: "record", label: "Estate Record" },
  { id: "statutory", label: "Statutory Information" },
  { id: "dates", label: "Significant Dates" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

const SignificantDates = () => {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState<(typeof statutoryDates)[number] | null>(null);

  const filtered = statutoryDates.filter((d) =>
    `${d.group} ${d.label}`.toLowerCase().includes(query.toLowerCase())
  );
  const groups = Array.from(new Set(filtered.map((d) => d.group)));

  return (
    <>
      <Register
        title="Statutory Date Register"
        description="Every date carries source, document, page, confirmation and change history."
        action={
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search dates…"
            className="w-56"
          />
        }
      >
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group} className="space-y-2">
              <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                {group}
              </h4>
              {filtered
                .filter((d) => d.group === group)
                .map((d) => (
                  <div
                    key={d.key}
                    className="grid items-center gap-3 rounded-md border p-3 text-sm md:grid-cols-[minmax(0,1fr)_140px_auto_auto]"
                  >
                    <span className="font-medium">{d.label}</span>
                    <span className={cn(!d.value && "text-muted-foreground")}>
                      {d.value || "Not recorded"}
                    </span>
                    <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                      <Badge variant="outline">{d.source}</Badge>
                      {d.document && (
                        <span>
                          {d.document}
                          {d.page ? ` · p.${d.page}` : ""}
                        </span>
                      )}
                      {d.confirmedBy && <span>· confirmed {d.confirmedBy}</span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActive(d)}>
                      Edit
                    </Button>
                  </div>
                ))}
            </div>
          ))}
        </div>
      </Register>

      <RecordDrawer
        open={Boolean(active)}
        onOpenChange={(o) => !o && setActive(null)}
        title={active?.label ?? ""}
        description={`${active?.group ?? ""} date · provenance and change history`}
        sections={[dateProvenanceSection]}
        initial={{
          value: active?.value,
          source: active?.source,
          document: active?.document,
          page: active?.page,
          confirmedBy: active?.confirmedBy,
        }}
        submitLabel="Save date"
        onSubmit={() => toast({ title: "Date updated", description: "Change recorded in the estate audit trail." })}
      />
    </>
  );
};

export const EstateRecordTab = () => {
  const [sub, setSub] = useState<SubTab>("record");
  const { values, onChange } = useRecordValues(estateRecordDefaults);
  const { values: statValues, onChange: onStatChange } = useRecordValues({});

  const isCorporate = values.estateType === "Corporate";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        {SUB_TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setSub(t.id)}
            className={cn(
              "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              sub === t.id ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {sub === "record" && (
        <RecordForm
          sections={[
            estateClassificationSection,
            isCorporate ? corporateIdentitySection : consumerIdentitySection,
            estateDatesSection,
            estateResponsibilitySection,
            estateCourtSection,
            estateContactSection,
            estateArchiveSection,
          ]}
          values={values}
          onChange={onChange}
          submitLabel="Save Estate"
          onSubmit={() => toast({ title: "Estate saved", description: "Estate record updated." })}
        />
      )}

      {sub === "statutory" && (
        <RecordForm
          sections={statutoryInformationSections}
          values={statValues}
          onChange={onStatChange}
          submitLabel="Save statutory information"
          onSubmit={() => toast({ title: "Statutory information saved" })}
        />
      )}

      {sub === "dates" && <SignificantDates />}
    </div>
  );
};