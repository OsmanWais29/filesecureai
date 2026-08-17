import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RecordDrawer, Register } from "@/components/estate/forms/RecordForm";
import { SubTabs } from "@/components/estate/forms/SubTabs";
import { additionalInfoGroups } from "@/data/estateFormSpecs";

export const AdditionalInfoTab = () => {
  const [tab, setTab] = useState<string>(additionalInfoGroups[0].id);
  const [open, setOpen] = useState(false);
  const group = additionalInfoGroups.find((g) => g.id === tab) ?? additionalInfoGroups[0];

  return (
    <div className="space-y-4">
      <SubTabs
        tabs={additionalInfoGroups.map((g) => ({ id: g.id, label: g.label }))}
        active={tab}
        onChange={setTab}
      />
      <Register
        title={group.label}
        description="Structured repeatable records — never a single free-text notes field."
        action={
          <Button size="sm" onClick={() => setOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Add record
          </Button>
        }
      >
        <div className="space-y-2 text-sm">
          {group.rows.map((r) => (
            <div key={r} className="flex items-center gap-3 rounded-md border p-3">
              <span>{r}</span>
              <Button size="sm" variant="outline" className="ml-auto" onClick={() => setOpen(true)}>
                Edit
              </Button>
            </div>
          ))}
        </div>
      </Register>

      <RecordDrawer
        open={open}
        onOpenChange={setOpen}
        title={group.label}
        sections={group.sections}
        submitLabel="Save record"
        onSubmit={() => toast({ title: `${group.label} record saved` })}
      />
    </div>
  );
};
