import { STATUS_FLOW, type FilingStatus } from "./types";
/** Next allowed steps. OSB outcomes are only offered after submission and need an OSB reference. */
export const nextSteps = (s: FilingStatus): FilingStatus[] => {
  if (s === "accepted" || s === "rejected") return [];
  if (s === "submitted" || s === "acknowledged") return s === "submitted" ? ["acknowledged", "accepted", "rejected"] : ["accepted", "rejected"];
  const i = STATUS_FLOW.indexOf(s);
  return [STATUS_FLOW[i + 1]];
};
export const needsOsbReference = (s: FilingStatus) => s === "acknowledged" || s === "accepted" || s === "rejected";
/** Accepted filings close the deadline: met when on time, late otherwise (reason required). */
export const deadlineOutcome = (deadline: string | null, respondedOn: string): "met" | "late" | null =>
  !deadline ? null : respondedOn <= deadline ? "met" : "late";
