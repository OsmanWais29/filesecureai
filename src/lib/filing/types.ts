export type FilingStatus = "drafted" | "checked" | "signed" | "queued" | "submitted" | "acknowledged" | "accepted" | "rejected";
export const STATUS_FLOW: FilingStatus[] = ["drafted", "checked", "signed", "queued", "submitted", "acknowledged", "accepted"];
export const STATUS_LABEL: Record<FilingStatus, string> = {
  drafted: "Drafted", checked: "Checked", signed: "Signed", queued: "Queued", submitted: "Submitted",
  acknowledged: "Acknowledged", accepted: "Accepted", rejected: "Rejected",
};
export interface SchemaElement { id: string; path: string; seq: number; data_type?: string | null; min_occurs: number; max_occurs?: number | null; choice_group?: string | null; enum_values?: string[] | null }
export interface FieldMapping { schema_element_id: string; source_field: string; transform?: string | null }
export type CheckState = "pass" | "fail" | "not_checked";
export interface CheckIssue { message: string; fix?: string }
export interface CheckLayer { id: "schema" | "cross_form" | "rules" | "package"; label: string; state: CheckState; issues: CheckIssue[]; note?: string }
/** Values for one filing: scalars plus arrays for repeating groups. */
export type Payload = Record<string, string | number | null | Array<Record<string, string | number | null>>>;
