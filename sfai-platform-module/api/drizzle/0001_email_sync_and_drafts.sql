CREATE TABLE "crm"."drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_ids" jsonb NOT NULL,
	"subject" text NOT NULL,
	"body" text NOT NULL,
	"source" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"decided_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "crm"."emails" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"firm_id" text NOT NULL,
	"client_id" uuid,
	"provider" text NOT NULL,
	"external_id" text NOT NULL,
	"thread_id" text,
	"direction" text NOT NULL,
	"from_addr" text NOT NULL,
	"to_addr" text NOT NULL,
	"subject" text NOT NULL,
	"snippet" text NOT NULL,
	"sent_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "crm"."emails" ADD CONSTRAINT "emails_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "crm"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "drafts_status" ON "crm"."drafts" USING btree ("firm_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "emails_message" ON "crm"."emails" USING btree ("firm_id","provider","external_id");--> statement-breakpoint
CREATE INDEX "emails_client" ON "crm"."emails" USING btree ("firm_id","client_id","sent_at");