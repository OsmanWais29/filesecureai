// Mapping between the Estate Record form field keys (camelCase, defined in
// estateFormSpecs.ts) and the persisted `estates` table columns.
import type { RecordValues } from "@/components/estate/forms/RecordForm";
import type { EstateSummary } from "@/data/estateWorkspace";

/** form key -> column name */
export const ESTATE_FIELD_COLUMNS: Record<string, string> = {
  estateType: "debtor_kind",
  proceedingType: "proceeding_type",
  administrationType: "administration_type",
  osbEstateNumber: "osb_estate_number",
  estateStatus: "status",
  fileStatus: "file_status",
  fileName: "file_name",
  eFileEnabled: "efile_enabled",
  firstName: "first_name",
  middleName: "middle_name",
  lastName: "last_name",
  aka: "aka",
  jointFiling: "joint_filing",
  maritalStatus: "marital_status",
  language: "language",
  homePhone: "home_phone",
  workPhone: "work_phone",
  cellPhone: "cell_phone",
  email: "email",
  address: "address",
  corporateName: "corporate_name",
  operatingAs: "operating_as",
  businessNumber: "business_number",
  federalCharterNumber: "federal_charter_number",
  incorporationDate: "incorporation_date",
  incorporationPlace: "incorporation_place",
  natureOfBusiness: "nature_of_business",
  dateStarted: "date_started",
  trusteeOffice: "trustee_office",
  serviceLocation: "service_location",
  processingCentre: "processing_centre",
  localOR: "local_or",
  trustee: "trustee_name",
  estateAdministrator: "estate_administrator",
  technician: "technician",
  initialInterviewer: "initial_interviewer",
  officeManager: "office_manager",
  courtName: "court_name",
  courtNumber: "court_number",
  division: "division",
  divisionNumber: "division_number",
  district: "district",
  signupDate: "signup_date",
  initialContactDate: "initial_contact_date",
  appointmentDate: "appointment_date",
  insolvencyDate: "insolvency_date",
  archiveBoxNumber: "archive_box_number",
  archiveSentDate: "archive_sent_date",
  sin: "sin",
  dateOfBirth: "date_of_birth",
  gender: "gender",
  gstRefundChoice: "gst_refund_choice",
  householdAdults: "household_adults",
  householdMinors: "household_minors",
  primaryCause: "primary_cause",
  secondaryCause: "secondary_cause",
  causeDetails: "cause_details",
};

const BOOLEAN_COLUMNS = new Set(["efile_enabled", "joint_filing"]);
const NUMERIC_COLUMNS = new Set(["household_adults", "household_minors"]);
const DATE_COLUMNS = new Set([
  "incorporation_date",
  "date_started",
  "signup_date",
  "initial_contact_date",
  "appointment_date",
  "insolvency_date",
  "archive_sent_date",
  "date_of_birth",
]);

/** Values stored on the row but not surfaced by the record form spec. */
const EXTRA_KEYS = ["effectiveFrom", "effectiveTo", "reassignmentReason", "pstExempt", "gstExempt", "hstExempt"];

export type EstateRow = Record<string, unknown>;

const clean = (v: RecordValues[string]) =>
  v === undefined || v === null || v === "" ? null : v;

/** Convert form values into a partial `estates` row. */
export const valuesToRow = (values: RecordValues): EstateRow => {
  const row: EstateRow = {};
  Object.entries(ESTATE_FIELD_COLUMNS).forEach(([key, column]) => {
    if (!(key in values)) return;
    const raw = clean(values[key]);
    if (BOOLEAN_COLUMNS.has(column)) row[column] = Boolean(values[key]);
    else if (NUMERIC_COLUMNS.has(column)) row[column] = raw === null ? null : Number(raw);
    else if (DATE_COLUMNS.has(column)) row[column] = raw === null ? null : String(raw);
    else row[column] = raw === null ? null : String(raw);
  });

  if (row.debtor_kind) row.debtor_kind = String(row.debtor_kind).toLowerCase();

  const extras: Record<string, unknown> = {};
  EXTRA_KEYS.forEach((key) => {
    if (key in values) extras[key] = values[key] ?? null;
  });
  if (Object.keys(extras).length) row.record_extras = extras;

  return row;
};

/** Convert a persisted row back into form values. */
export const rowToValues = (row: EstateRow | null | undefined): RecordValues => {
  if (!row) return {};
  const values: RecordValues = {};
  Object.entries(ESTATE_FIELD_COLUMNS).forEach(([key, column]) => {
    const raw = row[column];
    if (raw === null || raw === undefined) return;
    if (BOOLEAN_COLUMNS.has(column)) values[key] = Boolean(raw);
    else if (NUMERIC_COLUMNS.has(column)) values[key] = Number(raw);
    else values[key] = String(raw);
  });
  if (values.estateType) {
    values.estateType = String(values.estateType).toLowerCase() === "corporate" ? "Corporate" : "Consumer";
  }
  const extras = (row.record_extras ?? {}) as Record<string, RecordValues[string]>;
  Object.entries(extras).forEach(([key, value]) => {
    if (value !== null && value !== undefined) values[key] = value;
  });
  return values;
};

export const derivedDebtorName = (values: RecordValues) => {
  const s = (v: RecordValues[string]) => (v === undefined || v === null ? "" : String(v)).trim();
  if (s(values.estateType).toLowerCase() === "corporate") {
    return s(values.corporateName) || "Unnamed corporation";
  }
  return (
    [s(values.firstName), s(values.middleName), s(values.lastName)].filter(Boolean).join(" ") ||
    "Unnamed debtor"
  );
};

/** Presentation summary consumed by the workspace header, panel and list. */
export const rowToSummary = (row: EstateRow): EstateSummary => ({
  id: String(row.id),
  debtorName: String(row.debtor_name || "Unnamed debtor"),
  estateNumber: String(row.osb_estate_number || row.file_number || "—"),
  proceeding: String(row.proceeding_type || row.estate_type || "—"),
  division: String(row.division || "—"),
  status: String(row.status || "open"),
  trustee: String(row.trustee_name || "Unassigned"),
  administrator: String(row.estate_administrator || "Unassigned"),
  office: String(row.trustee_office || "Unassigned"),
  osbStatus: "attention",
  openIssues: 0,
  nextDeadline: String(row.next_deadline_description || row.next_deadline || "No deadline recorded"),
  stage: String(row.file_status || "Intake"),
  stageProgress: 0,
  osbReadiness: 0,
});