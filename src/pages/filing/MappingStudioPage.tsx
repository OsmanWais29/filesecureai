import { Link } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FORM_DEFS } from "@/lib/forms/formEngine";
import { schemaFor, useOsbSchemas } from "@/hooks/useOsbFilings";
import { coverage } from "@/lib/filing/mapping";

const VERSIONED = ["Form 31", "Form 65", "Form 79"];
const rows = FORM_DEFS.flatMap((d) => (VERSIONED.includes(d.number) ? ["Pre-2024 version", "Current version"] : ["Current version"]).map((v) => ({ form: d.number, title: d.title, version: v })));

const MappingStudioPage = () => {
  const { data, isLoading } = useOsbSchemas();
  return (
    <MainLayout>
      <div className="container mx-auto max-w-5xl space-y-5 py-6">
        <Link to="/filing" className="text-sm text-muted-foreground hover:underline">← Filing Centre</Link>
        <header>
          <h1 className="text-2xl font-bold">Schema &amp; Mapping Studio</h1>
          <p className="text-sm text-muted-foreground">Each OSB form version, its schema, and how much of it SecureFiles fills from estate data. A form can't produce XML until its schema is loaded and every element is mapped. Maintained by SecureFiles; read-only for firms.</p>
        </header>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Schemas loaded: {data?.versions.length ?? 0}</CardTitle>
            <CardDescription>OSB e-filing schemas come from the OSB vendor guide. Until they're loaded, forms show "Schema not loaded" and XML checks report "Not checked" rather than passing.</CardDescription>
          </CardHeader>
        </Card>
        {isLoading ? <p className="text-sm text-muted-foreground">Loading…</p> : (
          <div className="space-y-2">
            {rows.map((r) => {
              const s = schemaFor(data, r.form, r.version);
              const c = coverage(s.elements, s.mappings);
              return (
                <div key={r.form + r.version} className="rounded-md border p-3 text-sm">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span><span className="font-medium">{r.form}</span> {r.title} · <span className="text-muted-foreground">{r.version}</span></span>
                    {!c.loaded ? <Badge variant="outline">Schema not loaded</Badge> : c.releasable ? <Badge variant="secondary">Fully mapped</Badge> : <Badge variant="destructive">{c.unmappedMandatory.length} required unmapped</Badge>}
                  </div>
                  {c.loaded && (<>
                    <div className="mt-2 flex items-center gap-2"><Progress value={c.pct} className="h-2" /><span className="text-xs">{c.mapped}/{c.total}</span></div>
                    {c.unmappedMandatory.length > 0 && <p className="mt-1 text-xs text-destructive">Unmapped required: {c.unmappedMandatory.map((e) => e.path).join(", ")}</p>}
                    {c.unmappedOptional.length > 0 && <p className="mt-1 text-xs text-muted-foreground">Optional elements not yet mappable: {c.unmappedOptional.map((e) => e.path).join(", ")}</p>}
                    {s.version?.loaded_at && <p className="mt-1 text-xs text-muted-foreground">Loaded {s.version.loaded_at.slice(0, 10)}{s.version.namespace ? ` · ${s.version.namespace}` : ""}</p>}
                  </>)}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MainLayout>
  );
};
export default MappingStudioPage;
