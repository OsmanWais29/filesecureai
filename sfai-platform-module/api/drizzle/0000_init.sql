CREATE SCHEMA IF NOT EXISTS "crm";
--> statement-breakpoint
CREATE TABLE "crm"."activities" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid,
	"type" text NOT NULL,
	"text" text NOT NULL,
	"source" text,
	"actor" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid,
	"title" text NOT NULL,
	"starts_at" timestamp with time zone NOT NULL,
	"minutes" integer DEFAULT 30 NOT NULL,
	"kind" text DEFAULT 'video' NOT NULL,
	"source" text DEFAULT 'CRM' NOT NULL,
	"meeting_url" text,
	"external_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"actor" text NOT NULL,
	"action" text NOT NULL,
	"entity_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."automation_runs" (
	"automation_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"occurrence" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."automations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"trigger" text NOT NULL,
	"action" text NOT NULL,
	"template_key" text,
	"enabled" boolean DEFAULT true NOT NULL,
	"runs" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."clients" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"name" text NOT NULL,
	"email" text,
	"phone" text,
	"city" text,
	"province" text,
	"status" text DEFAULT 'lead' NOT NULL,
	"stage" text DEFAULT 'New lead' NOT NULL,
	"file_type" text DEFAULT 'Debt consultation' NOT NULL,
	"lead_source" text DEFAULT 'other' NOT NULL,
	"total_debt" integer DEFAULT 0 NOT NULL,
	"monthly_income" integer DEFAULT 0 NOT NULL,
	"estate_number" text,
	"risk" text DEFAULT 'medium' NOT NULL,
	"assigned_to" text,
	"filed_at" timestamp with time zone,
	"stage_since" timestamp with time zone DEFAULT now() NOT NULL,
	"last_contact_at" timestamp with time zone DEFAULT now() NOT NULL,
	"docs_received" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"intake" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"sin_encrypted" text,
	"sin_last3" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."deadlines" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"rule" text,
	"statutory" boolean DEFAULT false NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"name" text NOT NULL,
	"s3_key" text NOT NULL,
	"content_type" text NOT NULL,
	"size" integer NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."firms" (
	"firm_id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"public_key" text NOT NULL,
	"timezone" text DEFAULT 'America/Toronto' NOT NULL,
	"email_from" text,
	"notify_email" text,
	"hours" jsonb DEFAULT '{"start":9,"end":17,"days":[1,2,3,4,5]}'::jsonb NOT NULL,
	"slot_minutes" integer DEFAULT 30 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "firms_public_key_unique" UNIQUE("public_key")
);
--> statement-breakpoint
CREATE TABLE "crm"."integrations" (
	"firm_id" text NOT NULL,
	"provider" text NOT NULL,
	"account" text,
	"secret_encrypted" text NOT NULL,
	"settings" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"last_sync_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"key" text NOT NULL,
	"name" text NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm"."activities" ADD CONSTRAINT "activities_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."appointments" ADD CONSTRAINT "appointments_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."automation_runs" ADD CONSTRAINT "automation_runs_automation_id_automations_id_fk" FOREIGN KEY ("automation_id") REFERENCES "crm"."automations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."deadlines" ADD CONSTRAINT "deadlines_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD CONSTRAINT "documents_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "activities_client" ON "crm"."activities" USING btree ("firm_id","client_id","created_at");--> statement-breakpoint
CREATE INDEX "appointments_time" ON "crm"."appointments" USING btree ("firm_id","starts_at");--> statement-breakpoint
CREATE UNIQUE INDEX "appointments_external" ON "crm"."appointments" USING btree ("firm_id","source","external_id");--> statement-breakpoint
CREATE INDEX "audit_firm" ON "crm"."audit_log" USING btree ("firm_id","created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "automation_runs_once" ON "crm"."automation_runs" USING btree ("automation_id","client_id","occurrence");--> statement-breakpoint
CREATE UNIQUE INDEX "automations_rule" ON "crm"."automations" USING btree ("firm_id","trigger","action");--> statement-breakpoint
CREATE INDEX "clients_firm" ON "crm"."clients" USING btree ("firm_id","stage");--> statement-breakpoint
CREATE INDEX "deadlines_due" ON "crm"."deadlines" USING btree ("firm_id","due_at");--> statement-breakpoint
CREATE UNIQUE INDEX "deadlines_rule" ON "crm"."deadlines" USING btree ("client_id","rule");--> statement-breakpoint
CREATE UNIQUE INDEX "integrations_provider" ON "crm"."integrations" USING btree ("firm_id","provider");--> statement-breakpoint
CREATE UNIQUE INDEX "templates_key" ON "crm"."templates" USING btree ("firm_id","key");