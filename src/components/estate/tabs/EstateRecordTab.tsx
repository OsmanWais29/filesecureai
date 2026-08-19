import { useEffect, useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import {
  RecordDrawer,
  RecordForm,
  Register,
  useRecordValues,
} from "@/components/estate/forms/RecordForm";
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import {
  consumerIdentitySection,
  corporateIdentitySection,
  dateProvenanceSection,
  estateArchiveSection,
  estateClassificationSection,
  estateContactSection,
  estateCourtSection,
  estateDatesSection,
  estateResponsibilitySection,
  statutoryDates,
  statutoryInformationSections,
} from "@/data/estateFormSpecs";
import { rowToValues } from "@/data/estateRecordMapping";
import {
  useEstateDates,
  useEstateRow,
  useSaveEstateDate,
  useUpdateEstateRecord,
} from "@/hooks/useEstateRecords";
import { cn } from "@/lib/utils";

const SUB_TABS = [
  { id: "details", label: "Details" },
  { id: "client", label: "Client / Debtor" },
  { id: "conduct", label: "Conduct" },
  { id: "court", label: "Court & Jurisdiction" },
] as const;

type SubTab = (typeof SUB_TABS)[number]["id"];

/** The canonical register: the statutory date catalogue merged with persisted values. */
const SignificantDates = ({ estateId }: { estateId?: string }) => {
  const [query, setQuery] = useState("");
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const { data: saved = [], isLoading } = useEstateDates(estateId);
  const saveDate = useSaveEstateDate(estateId);

  const register = useMemo(
    () =>
      statutoryDates.map((d) => {
        const row = saved.find((s) => s.date_type === d.label);
        return {
          key: d.key,
          group: d.group,
          label: d.label,
          type: d.type,
          value: row?.date_value ?? row?.time_value ?? "",
          source: row?.source_type ?? "Manual",
          document: row?.source_document ?? undefined,
          page: row?.source_page ?? undefined,
          confirmedBy: row?.confirmed_by ?? undefined,
          persisted: Boolean(row),
        };
      }),
    [saved]
  );

  const filtered = register.filter((d) =>
    `${d.group} ${d.label}`.toLowerCase().includes(query.toLowerCase())
  );
  const groups = Array.from(new Set(filtered.map((d) => d.group)));
  const active = register.find((d) => d.key === activeKey) ?? null;

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
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading date register…
          </div>
        ) : (
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
                      <Badge variant="outline">{d.persisted ? d.source : "Not recorded"}</Badge>
                      {d.document && (
                        <span>
                          {d.document}
                          {d.page ? ` · p.${d.page}` : ""}
                        </span>
                      )}
                      {d.confirmedBy && <span>· confirmed {d.confirmedBy}</span>}
                    </div>
                    <Button variant="outline" size="sm" onClick={() => setActiveKey(d.key)}>
                      Edit
                    </Button>
                  </div>
                ))}
            </div>
          ))}
        </div>
        )}
      </Register>

      <RecordDrawer
        open={Boolean(active)}
        onOpenChange={(o) => !o && setActiveKey(null)}
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
        onSubmit={async (values: RecordValues) => {
          if (!active) return;
          const next = values.value ? String(values.value) : "";
          await saveDate.mutateAsync({
            dateGroup: active.group,
            dateType: active.label,
            dateValue: active.type === "time" ? null : next,
            timeValue: active.type === "time" ? next : null,
            sourceType: values.source ? String(values.source) : "Manual",
            sourceDocument: values.document ? String(values.document) : null,
            sourcePage: values.page ? String(values.page) : null,
            confirmedBy: values.confirmedBy ? String(values.confirmedBy) : null,
            changeReason: values.changeReason ? String(values.changeReason) : null,
            previousValue: active.value || null,
          });
          setActiveKey(null);
        }}
      />
    </>
  );
};

export const EstateRecordTab = ({
  estateId,
  sub: controlledSub,
}: {
  estateId?: string;
  /** When provided the module navigation drives the subpage and the local tabs are hidden. */
  sub?: SubTab;
}) => {
  const [localSub, setSub] = useState<SubTab>("details");
  const sub = controlledSub ?? localSub;
  const { data: row, isLoading } = useEstateRow(estateId);
  const updateEstate = useUpdateEstateRecord(estateId);
  const { values, onChange, setValues } = useRecordValues({});
  const { values: statValues, onChange: onStatChange, setValues: setStatValues } = useRecordValues({});

  useEffect(() => {
    if (!row) return;
    const mapped = rowToValues(row);
    setValues(mapped);
    setStatValues(mapped);
  }, [row, setValues, setStatValues]);

  const isCorporate = values.estateType === "Corporate";

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading estate record…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!controlledSub && (
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
      )}

      {sub === "details" && (
        <div className="space-y-6">
        <RecordForm
          sections={[
            estateClassificationSection,
            estateDatesSection,
            estateResponsibilitySection,
            estateArchiveSection,
          ]}
          values={values}
          onChange={onChange}
          submitLabel={updateEstate.isPending ? "Saving…" : "Save estate details"}
          onSubmit={(next: RecordValues) => updateEstate.mutate({ values: next })}
        />
          <SignificantDates estateId={estateId} />
        </div>
      )}

      {sub === "client" && (
        <RecordForm
          sections={[
            isCorporate ? corporateIdentitySection : consumerIdentitySection,
            estateContactSection,
            statutoryInformationSections[0],
          ]}
          values={statValues}
          onChange={onStatChange}
          submitLabel={updateEstate.isPending ? "Saving…" : "Save debtor record"}
          onSubmit={(next: RecordValues) =>
            updateEstate.mutate({ values: next, eventType: "estate.updated" })
          }
        />
      )}

      {sub === "conduct" && (
        <RecordForm
          sections={[statutoryInformationSections[1]]}
          values={statValues}
          onChange={onStatChange}
          submitLabel={updateEstate.isPending ? "Saving…" : "Save conduct record"}
          onSubmit={(next: RecordValues) =>
            updateEstate.mutate({ values: next, eventType: "estate.updated" })
          }
        />
      )}

      {sub === "court" && (
        <RecordForm
          sections={[estateCourtSection]}
          values={values}
          onChange={onChange}
          submitLabel={updateEstate.isPending ? "Saving…" : "Save court information"}
          onSubmit={(next: RecordValues) =>
            updateEstate.mutate({ values: next, eventType: "estate.updated" })
          }
        />
      )}
    </div>
  );
};