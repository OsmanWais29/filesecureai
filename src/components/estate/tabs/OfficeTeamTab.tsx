import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { PageHeading } from "@/components/estate/PageHeading";
import { Register } from "@/components/estate/forms/RecordForm";
import { useEstateAssignments, useRecordAssignment } from "@/hooks/useEstateRecords";

const ROLE_FOR_PAGE: Record<string, { role: string; title: string }> = {
  office: { role: "office", title: "Office" },
  trustee: { role: "trustee", title: "Trustee" },
  manager: { role: "office_manager", title: "Office Manager" },
  administrator: { role: "administrator", title: "Administrator" },
  counsellor: { role: "counsellor", title: "Counsellor" },
  staff: { role: "other_staff", title: "Other Staff" },
};

interface Props {
  estateId?: string;
  page: string;
  title: string;
  description?: string;
}

export const OfficeTeamTab = ({ estateId, page, title, description }: Props) => {
  const { data: assignments = [], isLoading } = useEstateAssignments(estateId);
  const record = useRecordAssignment(estateId);
  const [name, setName] = useState("");
  const [reason, setReason] = useState("");

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading assignments…
      </div>
    );
  }

  if (page === "history") {
    return (
      <>
        <PageHeading title={title} description={description} />
        <Register title="Assignment history" description="Responsibility changes are never overwritten — each change closes the prior holder.">
          <div className="space-y-2 text-sm">
            {assignments.length === 0 && (
              <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                No assignments recorded for this estate yet.
              </p>
            )}
            {assignments.map((a: any) => (
              <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-md border p-3">
                <Badge variant="outline">{a.role}</Badge>
                <span className="font-medium">{a.assignee_name}</span>
                <span className="text-muted-foreground">
                  {a.effective_from} → {a.effective_to ?? "current"}
                </span>
                {a.reason && <span className="text-muted-foreground">· {a.reason}</span>}
                <span className="ml-auto text-xs text-muted-foreground">{a.assigned_by}</span>
              </div>
            ))}
          </div>
        </Register>
      </>
    );
  }

  const spec = ROLE_FOR_PAGE[page] ?? ROLE_FOR_PAGE.office;
  const roleHistory = assignments.filter((a: any) => a.role === spec.role);
  const current = roleHistory.find((a: any) => !a.effective_to);

  return (
    <>
      <PageHeading title={title} description={description} />

      <Register
        title={`Current ${spec.title.toLowerCase()}`}
        description={current ? `Effective from ${current.effective_from}.` : "No one is currently assigned to this role."}
      >
        <div className="space-y-4 text-sm">
          <div className="rounded-md border p-3">
            <span className="font-medium">{current?.assignee_name ?? "Unassigned"}</span>
            {current?.reason && <span className="ml-2 text-muted-foreground">· {current.reason}</span>}
          </div>

          <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
            <div className="space-y-1.5">
              <Label htmlFor="assignee">Reassign to</Label>
              <Input id="assignee" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reason">Reason</Label>
              <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why the change" />
            </div>
            <Button
              disabled={!name.trim() || record.isPending}
              onClick={() =>
                record.mutate(
                  { role: spec.role, assigneeName: name.trim(), reason: reason.trim() || undefined },
                  {
                    onSuccess: () => {
                      setName("");
                      setReason("");
                    },
                  }
                )
              }
            >
              Record assignment
            </Button>
          </div>
        </div>
      </Register>

      <div className="mt-4">
        <Register title="History for this role">
          <div className="space-y-2 text-sm">
            {roleHistory.length === 0 && (
              <p className="rounded-md border border-dashed p-6 text-center text-muted-foreground">
                No history for this role yet.
              </p>
            )}
            {roleHistory.map((a: any) => (
              <div key={a.id} className="flex items-center gap-3 rounded-md border p-3">
                <span className="font-medium">{a.assignee_name}</span>
                <span className="ml-auto text-muted-foreground">
                  {a.effective_from} → {a.effective_to ?? "current"}
                </span>
              </div>
            ))}
          </div>
        </Register>
      </div>
    </>
  );
};