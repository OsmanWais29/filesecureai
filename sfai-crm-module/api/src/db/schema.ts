// Database tables. Everything lives in its own Postgres schema ("crm") so it can
// share one database with the host project without name clashes.
// Every table has firm_id: one database can serve many trustee firms.
import {
  boolean,
  index,
  integer,
  jsonb,
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const crm = pgSchema("crm");

// Columns shared by every table
const id = () => uuid("id").primaryKey().defaultRandom();
const firmId = () => text("firm_id").notNull();
const createdAt = () =>
  timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
const at = (name: string) => timestamp(name, { withTimezone: true });

// Per-firm settings (public key powers the website form + booking page URLs)
export const firms = crm.table("firms", {
  firmId: text("firm_id").primaryKey(),
  name: text("name").notNull(),
  publicKey: text("public_key").notNull().unique(),
  timezone: text("timezone").default("America/Toronto").notNull(),
  emailFrom: text("email_from"), // verified SES sender for this firm
  notifyEmail: text("notify_email"), // where "notify trustee" alerts go
  hours: jsonb("hours")
    .$type<{ start: number; end: number; days: number[] }>()
    .default({ start: 9, end: 17, days: [1, 2, 3, 4, 5] })
    .notNull(),
  slotMinutes: integer("slot_minutes").default(30).notNull(),
  createdAt: createdAt(),
});

export const clients = crm.table(
  "clients",
  {
    id: id(),
    firmId: firmId(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    city: text("city"),
    province: text("province"),
    // lead | prospect | client | former_client
    status: text("status").default("lead").notNull(),
    stage: text("stage").default("New lead").notNull(), // see STAGES in domain/rules.ts
    fileType: text("file_type").default("Debt consultation").notNull(),
    leadSource: text("lead_source").default("other").notNull(),
    totalDebt: integer("total_debt").default(0).notNull(), // whole dollars (CAD)
    monthlyIncome: integer("monthly_income").default(0).notNull(),
    estateNumber: text("estate_number"),
    risk: text("risk").default("medium").notNull(), // low | medium | high
    assignedTo: text("assigned_to"), // host user id
    filedAt: at("filed_at"), // drives the statutory deadline rules
    stageSince: at("stage_since").defaultNow().notNull(),
    lastContactAt: at("last_contact_at").defaultNow().notNull(),
    docsReceived: jsonb("docs_received").$type<string[]>().default([]).notNull(),
    intake: jsonb("intake").$type<Record<string, string>>().default({}).notNull(),
    sinEncrypted: text("sin_encrypted"), // KMS-encrypted; never returned in lists
    sinLast3: text("sin_last3"),
    createdAt: createdAt(),
  },
  (t) => [index("clients_firm").on(t.firmId, t.stage)],
);

export const deadlines = crm.table(
  "deadlines",
  {
    id: id(),
    firmId: firmId(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => clients.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    rule: text("rule"), // rule key for generated deadlines (prevents duplicates)
    statutory: boolean("statutory").default(false).notNull(),
    dueAt: at("due_at").notNull(),
    doneAt: at("done_at"),
    createdAt: createdAt(),
  },
  (t) => [
    index("deadlines_due").on(t.firmId, t.dueAt),
    uniqueIndex("deadlines_rule").on(t.clientId, t.rule),
  ],
);

export const appointments = crm.table(
  "appointments",
  {
    id: id(),
    firmId: firmId(),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "set null" }),
    title: text("title").notNull(),
    startsAt: at("starts_at").notNull(),
    minutes: integer("minutes").default(30).notNull(),
    kind: text("kind").default("video").notNull(), // video | phone | in_person
    // CRM | Website booking | Google Calendar | Outlook
    source: text("source").default("CRM").notNull(),
    meetingUrl: text("meeting_url"),
    externalId: text("external_id"), // calendar event id after sync
    createdAt: createdAt(),
  },
  (t) => [
    index("appointments_time").on(t.firmId, t.startsAt),
    uniqueIndex("appointments_external").on(t.firmId, t.source, t.externalId),
  ],
);

export const activities = crm.table(
  "activities",
  {
    id: id(),
    firmId: firmId(),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
    // email | call | meeting | note | form | booking | automation
    type: text("type").notNull(),
    text: text("text").notNull(),
    source: text("source"), // e.g. "Website form", "Automation"
    actor: text("actor"), // user id, or "system"
    createdAt: createdAt(),
  },
  (t) => [index("activities_client").on(t.firmId, t.clientId, t.createdAt)],
);

export const documents = crm.table("documents", {
  id: id(),
  firmId: firmId(),
  clientId: uuid("client_id")
    .notNull()
    .references(() => clients.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  s3Key: text("s3_key").notNull(),
  contentType: text("content_type").notNull(),
  size: integer("size").notNull(),
  status: text("status").default("pending").notNull(), // pending | uploaded
  createdAt: createdAt(),
});

export const templates = crm.table(
  "templates",
  {
    id: id(),
    firmId: firmId(),
    key: text("key").notNull(), // stable name used by automations
    name: text("name").notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(), // {{name}} {{trustee}} {{missingDocs}} {{date}}
  },
  (t) => [uniqueIndex("templates_key").on(t.firmId, t.key)],
);

export const automations = crm.table(
  "automations",
  {
    id: id(),
    firmId: firmId(),
    trigger: text("trigger").notNull(), // see TRIGGERS in domain/automations.ts
    action: text("action").notNull(), // see ACTIONS in domain/automations.ts
    templateKey: text("template_key"),
    enabled: boolean("enabled").default(true).notNull(),
    runs: integer("runs").default(0).notNull(),
  },
  (t) => [uniqueIndex("automations_rule").on(t.firmId, t.trigger, t.action)],
);

// One row per automation x client x occurrence, so nothing is sent twice
export const automationRuns = crm.table(
  "automation_runs",
  {
    automationId: uuid("automation_id")
      .notNull()
      .references(() => automations.id, { onDelete: "cascade" }),
    clientId: uuid("client_id").notNull(),
    occurrence: text("occurrence").notNull(), // e.g. deadline id, or "once"
    ranAt: createdAt(),
  },
  (t) => [
    uniqueIndex("automation_runs_once").on(t.automationId, t.clientId, t.occurrence),
  ],
);

// Connected services. Tokens/credentials are KMS-encrypted.
export const integrations = crm.table(
  "integrations",
  {
    firmId: firmId(),
    provider: text("provider").notNull(), // google | microsoft | twilio
    account: text("account"), // e.g. connected mailbox address
    secretEncrypted: text("secret_encrypted").notNull(), // refresh token / auth token
    settings: jsonb("settings").$type<Record<string, string>>().default({}).notNull(),
    lastSyncAt: at("last_sync_at"),
    connectedAt: createdAt(),
  },
  (t) => [uniqueIndex("integrations_provider").on(t.firmId, t.provider)],
);

// Mirror of client email, both directions (Gmail / Outlook sync + what we send).
// Only messages to or from a known client are stored, never the whole mailbox.
export const emails = crm.table(
  "emails",
  {
    id: id(),
    firmId: firmId(),
    clientId: uuid("client_id").references(() => clients.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(), // gmail | outlook | ses
    externalId: text("external_id").notNull(), // provider message id
    threadId: text("thread_id"), // provider thread / conversation id
    direction: text("direction").notNull(), // in | out
    fromAddr: text("from_addr").notNull(),
    toAddr: text("to_addr").notNull(),
    subject: text("subject").notNull(),
    snippet: text("snippet").notNull(), // first ~500 characters
    sentAt: at("sent_at").notNull(),
  },
  (t) => [
    uniqueIndex("emails_message").on(t.firmId, t.provider, t.externalId),
    index("emails_client").on(t.firmId, t.clientId, t.sentAt),
  ],
);

// Emails written by the AI (in-app assistant or MCP). Nothing is sent until a
// person approves it: status pending -> sent | discarded.
export const drafts = crm.table(
  "drafts",
  {
    id: id(),
    firmId: firmId(),
    clientIds: jsonb("client_ids").$type<string[]>().notNull(),
    subject: text("subject").notNull(),
    body: text("body").notNull(),
    source: text("source").notNull(), // assistant | mcp
    status: text("status").default("pending").notNull(),
    decidedBy: text("decided_by"), // user who sent or discarded it
    createdAt: createdAt(),
  },
  (t) => [index("drafts_status").on(t.firmId, t.status)],
);

// Who did what and when (compliance)
export const auditLog = crm.table(
  "audit_log",
  {
    id: id(),
    firmId: firmId(),
    actor: text("actor").notNull(),
    action: text("action").notNull(), // e.g. "PATCH /clients/:id", "sin.reveal"
    entityId: text("entity_id"),
    createdAt: createdAt(),
  },
  (t) => [index("audit_firm").on(t.firmId, t.createdAt)],
);

export type Client = typeof clients.$inferSelect;
export type Appointment = typeof appointments.$inferSelect;
