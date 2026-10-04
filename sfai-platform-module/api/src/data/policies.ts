// Who may read and write each of the FileSecure app's tables. This replaces the
// Supabase row-level security (RLS) policies. Every rule is applied on the server
// on top of the firm check: a user only ever sees their own firm's rows.
//
//   staff   "firm"     anyone at the firm reads + writes (the default)
//           "own"      each user only reads + writes their own rows (owner column)
//           "trustee"  everyone at the firm reads, only trustees write
//           "append"   read + add, never change or delete (logs)
//           "server"   read only; the API itself writes these rows
//   shared  reference data readable by every firm, never written by users
//   portal  what a logged-in portal client may do, limited to their own estate(s)

export interface Policy {
  staff?: "firm" | "own" | "trustee" | "append" | "server";
  owner?: string; // column naming the row's user (default "user_id")
  othersMayCreate?: boolean; // "own" tables a colleague may add to (notifications)
  forceOwner?: boolean; // the owner column is always the caller (e-signatures)
  shared?: boolean;
  portal?: {
    read?: boolean;
    insert?: boolean;
    update?: boolean;
    by: "estate_id" | "id" | "user_id" | "redeemed_by"; // what ties the row to the client
  };
}

const estate = (p: Omit<NonNullable<Policy["portal"]>, "by">) => ({
  ...p,
  by: "estate_id" as const,
});

export const POLICIES: Record<string, Policy> = {
  // Private to each user
  notifications: { staff: "own", othersMayCreate: true },
  user_notifications: { staff: "own", othersMayCreate: true },
  user_settings: { staff: "own" },
  user_preferences: { staff: "own" },
  api_integrations: { staff: "own" },
  conversations: { staff: "own" },
  // Everyone at the firm sees profiles; you only edit yours (made at sign-up)
  profiles: { staff: "own", owner: "id" },
  user_roles: { staff: "server" },
  // A signature is always the logged-in user's own
  signatures: { owner: "signer_id", forceOwner: true },

  // Logs: append only
  audit_logs: { staff: "append" },
  audit_log: { staff: "append" },
  document_access_logs: { staff: "append" },
  document_access_history: { staff: "append" },
  document_audit_log: { staff: "append" },
  api_cost_log: { staff: "append" },
  analytics_events: { staff: "append" },
  ai_request_logs: { staff: "append" },

  // Reference data shared by every firm
  osb_forms_reference: { shared: true },
  bia_forms_reference: { shared: true },
  legal_references: { shared: true },
  regulatory_updates: { shared: true },

  // Client portal (old RLS: trustees manage, clients see their own estate)
  client_portal_invitations: {
    staff: "trustee",
    portal: { read: true, by: "redeemed_by" },
  },
  client_portal_access: { staff: "trustee", portal: { read: true, by: "user_id" } },
  client_portal_events: { staff: "append", portal: estate({ insert: true }) },
  client_portal_requests: { portal: estate({ read: true, update: true }) },
  client_portal_documents: { portal: estate({ read: true, insert: true }) },
  client_portal_intake_sections: {
    portal: estate({ read: true, insert: true, update: true }),
  },
  client_portal_messages: { portal: estate({ read: true, insert: true }) },
  client_portal_income_submissions: {
    portal: estate({ read: true, insert: true, update: true }),
  },
  client_portal_request_staff_notes: {}, // staff only
  estates: { portal: { read: true, by: "id" } },
};

// Every table the app may use. Anything else is refused (404).
export const TABLES = new Set([
  ...Object.keys(POLICIES),
  // Documents + analysis
  "documents",
  "document_versions",
  "document_comments",
  "document_analysis",
  "document_categorization",
  "document_metadata",
  "document_folders",
  "ai_document_analysis",
  "ai_generated_schemas",
  "osb_form_analyses",
  "osb_form_analysis",
  "osb_risk_assessments",
  "osb_compliance_tracking",
  "form_analysis_results",
  "form_templates",
  "dynamic_form_tables",
  "signatures",
  "translations",
  "training_data",
  // Clients, CRM, tasks, messages
  "clients",
  "client_interactions",
  "client_tasks",
  "client_trustee_relationships",
  "meetings",
  "tasks",
  "task_assignments",
  "task_comments",
  "task_deadlines",
  "task_templates",
  "messages",
  "branding",
  "financial_records",
  "financial_documents",
  "financial_analysis",
  // Estates
  "claims",
  "creditors",
  "creditor_meetings",
  "creditor_notices",
  "distributions",
  "estate_asset_securities",
  "estate_assets",
  "estate_assignments",
  "estate_bank_accounts",
  "estate_closings",
  "estate_counselling_sessions",
  "estate_creditor_meetings",
  "estate_creditors",
  "estate_dates",
  "estate_disbursements",
  "estate_discharge_reports",
  "estate_events",
  "estate_form_instances",
  "estate_income_periods",
  "estate_ledger_entries",
  "estate_milestones",
  "estate_notes",
  "estate_pad_runs",
  "estate_payment_schedules",
  "estate_receipt_allocations",
  "estate_receipts",
  "estate_reconciliations",
  "estate_schedule_rows",
  "estate_statement_lines",
  "estate_tax_documents",
  "estate_tax_returns",
]);

export const policyFor = (table: string): Policy => POLICIES[table] ?? {};

// Embedded selects ("*, estate_asset_securities(...)"): child table -> column
// on the child that points at the parent row's id
export const RELATIONS: Record<string, string> = {
  estate_asset_securities: "asset_id",
};
