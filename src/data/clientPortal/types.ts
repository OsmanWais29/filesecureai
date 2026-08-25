/**
 * Client Portal data models.
 *
 * These interfaces are intentionally backend-shaped (snake-case-free camelCase mirrors of
 * the eventual Supabase tables) so the in-session store can later be swapped for
 * Supabase queries without touching UI components.
 *
 * Table mapping:
 *   client_requests              -> ClientRequest
 *   client_request_events        -> ClientRequestEvent
 *   bank_connections             -> BankConnection
 *   bank_consents                -> BankConsent
 *   bank_data_imports            -> BankDataImport
 *   bank_statement_records       -> BankStatementRecord
 *   pad_authorizations           -> PadAuthorization
 *   payment_schedule_client_views-> PaymentScheduleClientView (read-only projection of the
 *                                   authoritative estate_payment_schedules row)
 *   client_notifications         -> ClientNotification
 *   client_messages              -> ClientMessage
 */

export type ClientRequestStatus =
  | "Action Required"
  | "In Progress"
  | "Submitted"
  | "Under Review"
  | "More Information Needed"
  | "Completed"
  | "Reopened"
  | "Cancelled";

export type ClientRequestType =
  | "upload_document"
  | "replace_document"
  | "clarify_information"
  | "correct_information"
  | "complete_income_statement"
  | "sign_document"
  | "connect_bank_account"
  | "authorize_pad"
  | "provide_bank_statement"
  | "provide_payment_information"
  | "contact_trustee"
  | "other";

export const REQUEST_TYPE_LABELS: Record<ClientRequestType, string> = {
  upload_document: "Upload document",
  replace_document: "Replace document",
  clarify_information: "Clarify information",
  correct_information: "Correct information",
  complete_income_statement: "Complete income & expense statement",
  sign_document: "Sign or acknowledge document",
  connect_bank_account: "Connect bank account",
  authorize_pad: "Authorize automatic payments",
  provide_bank_statement: "Provide bank statement",
  provide_payment_information: "Provide payment information",
  contact_trustee: "Contact your trustee",
  other: "Other",
};

export type ClientPriority = "Standard" | "Important" | "Time sensitive";

export interface ClientRequest {
  id: string;
  estateId: string;
  clientId: string;
  title: string;
  /** Plain-language description shown to the client. Never internal wording. */
  description: string;
  requestType: ClientRequestType;
  /** Internal signal that motivated the request. Never surfaced to the client. */
  sourceSignalId?: string;
  sourceDocumentId?: string;
  requestedDocumentType?: string;
  dueDate?: string;
  priority: ClientPriority;
  requestedByUserId: string;
  requestedByName: string;
  requestedAt: string;
  status: ClientRequestStatus;
  clientResponse?: string;
  uploadedDocumentIds: string[];
  completedAt?: string;
  /** Staff review state — the client cannot set this. */
  trusteeReviewState: "Not started" | "In review" | "Accepted" | "Returned";
  reopenedCount: number;
  /** Internal-only staff notes. Filtered out of every client-facing selector. */
  staffNotes?: string;
}

export type ClientRequestEventType =
  | "CLIENT_REQUEST_SENT"
  | "CLIENT_REQUEST_VIEWED"
  | "CLIENT_REQUEST_SUBMITTED"
  | "CLIENT_DOCUMENT_UPLOADED"
  | "CLIENT_DOCUMENT_REPLACED"
  | "CLIENT_BANK_CONSENT_GRANTED"
  | "CLIENT_BANK_CONNECTED"
  | "CLIENT_BANK_SYNCED"
  | "CLIENT_BANK_DISCONNECTED"
  | "PAD_AUTHORIZATION_GRANTED"
  | "PAD_AUTHORIZATION_REVOKED"
  | "CLIENT_INCOME_SUBMITTED"
  | "CLIENT_MESSAGE_SENT"
  | "CLIENT_APPOINTMENT_VIEWED"
  | "CLIENT_LOGIN";

export interface ClientRequestEvent {
  id: string;
  estateId: string;
  requestId?: string;
  eventType: ClientRequestEventType;
  actor: string;
  actorRole: "client" | "staff" | "system";
  occurredAt: string;
  detail?: string;
}

/* ---------------------------------------------------------------- banking */

export type BankConnectionStatus =
  | "not_connected"
  | "consent_pending"
  | "connecting"
  | "connected"
  | "error"
  | "revoked";

export type ConnectionHealth = "healthy" | "attention" | "expired" | "unknown";

export interface BankConsent {
  id: string;
  estateId: string;
  clientId: string;
  /** Scopes the client explicitly agreed to. */
  scopes: ("account_details" | "balances" | "transactions" | "statements" | "pad_debit")[];
  grantedAt: string;
  grantedBy: string;
  expiresAt?: string;
  revokedAt?: string;
  purposeText: string;
}

export interface BankConnection {
  id: string;
  estateId: string;
  clientId: string;
  provider: "zum_rails";
  /** Provider-side reference. Safe identifier only — never a credential. */
  externalConnectionId?: string;
  status: BankConnectionStatus;
  institutionName?: string;
  /** Masked only. SecureFiles never stores a full account number. */
  accountMask?: string;
  accountType?: "Chequing" | "Savings";
  sourceAccountRef?: string;
  connectedAt?: string;
  lastSyncedAt?: string;
  health: ConnectionHealth;
  consentId?: string;
  lastError?: string;
  /** True whenever the connection was produced by the simulated provider adapter. */
  simulated: boolean;
}

export interface BankDataImport {
  id: string;
  estateId: string;
  connectionId: string;
  provider: "zum_rails";
  kind: "transactions" | "statements";
  periodStart: string;
  periodEnd: string;
  status: "pending" | "complete" | "failed";
  recordCount: number;
  syncedAt: string;
  consentId?: string;
  providerStatus?: string;
}

export interface BankStatementRecord {
  id: string;
  estateId: string;
  documentId: string;
  institutionName: string;
  accountMask: string;
  periodStart: string;
  periodEnd: string;
  source: "BANK_PROVIDER" | "CLIENT_UPLOAD";
  uploadedBy: string;
  uploadedAt: string;
  contentHash?: string;
  extractionStatus: "queued" | "processing" | "extracted" | "failed";
  linkedRequestId?: string;
}

/** Client bank transaction. Evidence only — never a trust-ledger receipt. */
export interface ClientBankTransaction {
  id: string;
  estateId: string;
  connectionId: string;
  postedAt: string;
  description: string;
  amount: number;
  direction: "credit" | "debit";
  category?: string;
  /** Explicitly flags that this is client evidence, not estate trust money. */
  classification: "CLIENT_FINANCIAL_EVIDENCE";
}

/* -------------------------------------------------------------------- PAD */

export type PadStatus =
  | "not_requested"
  | "action_required"
  | "account_connection_required"
  | "authorization_pending"
  | "active"
  | "paused"
  | "cancelled"
  | "failed"
  | "completed";

export interface PadAuthorization {
  id: string;
  estateId: string;
  clientId: string;
  /** Authoritative estate-side schedule this authorization serves. Read-only here. */
  estateScheduleId: string;
  status: PadStatus;
  connectionId?: string;
  authorizedAt?: string;
  authorizedBy?: string;
  revokedAt?: string;
  termsVersion: string;
  lastFailureReason?: string;
  simulated: boolean;
}

/** Read-only client projection of the authoritative estate payment schedule. */
export interface PaymentScheduleClientView {
  id: string;
  estateId: string;
  purpose: string;
  amount: number;
  frequency: "Monthly" | "Bi-weekly" | "Weekly";
  startDate: string;
  endDate?: string;
  totalPayments?: number;
  paidToDate: number;
  outstandingToDate: number;
  nextPaymentDate?: string;
  method: "Pre-authorized debit" | "Manual payment";
  status: "Active" | "Pending authorization" | "Paused" | "Completed";
}

export interface PaymentHistoryEntry {
  id: string;
  estateId: string;
  date: string;
  amount: number;
  method: string;
  status: "Paid" | "Failed" | "Scheduled" | "Returned";
  reference?: string;
}

/* ---------------------------------------------------- documents / income */

export type ClientDocumentState =
  | "Requested"
  | "Uploaded"
  | "Processing"
  | "Needs replacement"
  | "Under review"
  | "Accepted";

export interface ClientDocument {
  id: string;
  estateId: string;
  title: string;
  category: string;
  state: ClientDocumentState;
  source: "CLIENT_UPLOAD" | "BANK_PROVIDER" | "TRUSTEE_SHARED";
  uploadedBy?: string;
  uploadedAt?: string;
  sharedWithClient: boolean;
  downloadable: boolean;
  linkedRequestId?: string;
  note?: string;
}

export interface IncomeExpenseLine {
  key: string;
  label: string;
  amount: number | null;
}

export interface ClientIncomePeriod {
  id: string;
  estateId: string;
  periodLabel: string;
  periodStart: string;
  periodEnd: string;
  dueDate: string;
  status: "Not started" | "Draft" | "Submitted" | "Under review" | "Accepted" | "More information needed";
  income: IncomeExpenseLine[];
  expenses: IncomeExpenseLine[];
  householdSize: number | null;
  dependants: number | null;
  supportingDocumentIds: string[];
  submittedAt?: string;
  staffMessage?: string;
}

/* ------------------------------------------------- messages / meetings */

export interface ClientMessage {
  id: string;
  estateId: string;
  threadId: string;
  senderName: string;
  senderRole: "client" | "staff";
  body: string;
  sentAt: string;
  attachmentDocumentIds: string[];
  relatedRequestId?: string;
}

export interface ClientAppointment {
  id: string;
  estateId: string;
  kind: "Counselling session" | "Trustee meeting" | "Requested call";
  title: string;
  scheduledAt: string;
  durationMinutes: number;
  status: "Scheduled" | "Completed" | "Requested" | "Cancelled";
  method: "Video call" | "Phone" | "In person";
  location?: string;
  instructions?: string;
  relatedRequestIds: string[];
}

export interface ClientNotification {
  id: string;
  estateId: string;
  kind:
    | "new_request"
    | "request_due_soon"
    | "more_information"
    | "document_reviewed"
    | "upcoming_payment"
    | "payment_failure"
    | "pad_request"
    | "appointment_reminder"
    | "new_message";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  to?: string;
}

/* ------------------------------------------------------------- profile */

export interface ClientProfile {
  id: string;
  estateId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  firmName: string;
  proceedingLabel: string;
  trusteeName: string;
  preferredContact: "Email" | "Phone" | "Portal message";
  language: "English" | "French";
  documentSharingAcknowledgedAt?: string;
}

export interface ClientPortalState {
  profile: ClientProfile;
  requests: ClientRequest[];
  events: ClientRequestEvent[];
  connections: BankConnection[];
  consents: BankConsent[];
  imports: BankDataImport[];
  statements: BankStatementRecord[];
  transactions: ClientBankTransaction[];
  padAuthorizations: PadAuthorization[];
  schedules: PaymentScheduleClientView[];
  payments: PaymentHistoryEntry[];
  documents: ClientDocument[];
  incomePeriods: ClientIncomePeriod[];
  messages: ClientMessage[];
  appointments: ClientAppointment[];
  notifications: ClientNotification[];
}
