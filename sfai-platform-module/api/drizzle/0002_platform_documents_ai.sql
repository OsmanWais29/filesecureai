CREATE TABLE "crm"."notifications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"user_id" text NOT NULL,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"type" text DEFAULT 'info' NOT NULL,
	"priority" text DEFAULT 'normal' NOT NULL,
	"action_url" text,
	"metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
	"read_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."portal_invites" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid NOT NULL,
	"email" text NOT NULL,
	"token_hash" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"redeemed_at" timestamp with time zone,
	"created_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "portal_invites_token_hash_unique" UNIQUE("token_hash")
);
--> statement-breakpoint
CREATE TABLE "crm"."signatures" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"document_id" uuid NOT NULL,
	"signer_id" text NOT NULL,
	"signer_name" text,
	"party_type" text NOT NULL,
	"signature_data" text NOT NULL,
	"ip" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."tasks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid,
	"document_id" uuid,
	"title" text NOT NULL,
	"description" text,
	"priority" text DEFAULT 'medium' NOT NULL,
	"status" text DEFAULT 'open' NOT NULL,
	"due_at" timestamp with time zone,
	"assigned_to" text,
	"source" text DEFAULT 'manual' NOT NULL,
	"created_by" text NOT NULL,
	"done_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm"."documents" ALTER COLUMN "client_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "folder" text;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "uploaded_by" text;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "analysis_status" text DEFAULT 'none' NOT NULL;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "analysis" jsonb;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "analysis_error" text;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "analyzed_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "search_text" text;--> statement-breakpoint
ALTER TABLE "crm"."documents" ADD COLUMN "required_parties" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "crm"."portal_invites" ADD CONSTRAINT "portal_invites_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."signatures" ADD CONSTRAINT "signatures_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "crm"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."tasks" ADD CONSTRAINT "tasks_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crm"."tasks" ADD CONSTRAINT "tasks_document_id_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "crm"."documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "notifications_user" ON "crm"."notifications" USING btree ("firm_id","user_id","created_at");--> statement-breakpoint
CREATE INDEX "portal_invites_client" ON "crm"."portal_invites" USING btree ("firm_id","client_id");--> statement-breakpoint
CREATE UNIQUE INDEX "signatures_once" ON "crm"."signatures" USING btree ("document_id","signer_id","party_type");--> statement-breakpoint
CREATE INDEX "tasks_open" ON "crm"."tasks" USING btree ("firm_id","status","due_at");--> statement-breakpoint
CREATE INDEX "documents_client" ON "crm"."documents" USING btree ("firm_id","client_id");--> statement-breakpoint
CREATE INDEX "documents_search" ON "crm"."documents" USING gin (to_tsvector('english', "name" || ' ' || coalesce("search_text", '')));