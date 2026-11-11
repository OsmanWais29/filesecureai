import type { FilingStatus } from "./types";

/** Who has to act next on a filing. Accepted/filed items carry no action. */
export type ActionBucket = "sign" | "fix" | "osb" | "filed";
export interface QueueItem { status: FilingStatus; deadline: string | null; readiness?: { issues?: { message: string }[] } }

const FILED: FilingStatus[] = ["submitted", "acknowledged", "accepted"];
export const isOpen = (f: QueueItem) => !FILED.includes(f.status);

export const actionBucket = (f: QueueItem): ActionBucket => {
  if (f.status === "accepted") return "filed";
  if (f.status === "rejected") return "fix";
  if (f.status === "signed" || f.status === "queued" || f.status === "submitted" || f.status === "acknowledged") return "osb";
  return f.readiness?.issues?.length ? "fix" : f.status === "checked" ? "sign" : "fix";
};

const addDays = (iso: string, n: number) => { const d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); };
export const isOverdue = (f: QueueItem, today: string) => isOpen(f) && !!f.deadline && f.deadline < today;
export const isDueSoon = (f: QueueItem, today: string, days = 7) => isOpen(f) && !!f.deadline && f.deadline >= today && f.deadline <= addDays(today, days);

/** Risk order: overdue, then soonest deadline, then undated. */
export const byRisk = (today: string) => (a: QueueItem, b: QueueItem) => {
  const o = Number(isOverdue(b, today)) - Number(isOverdue(a, today));
  if (o) return o;
  if (a.deadline && b.deadline) return a.deadline.localeCompare(b.deadline);
  return a.deadline ? -1 : b.deadline ? 1 : 0;
};
