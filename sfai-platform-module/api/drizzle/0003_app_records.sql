CREATE TABLE "crm"."records" (
	"firm_id" text NOT NULL,
	"tbl" text NOT NULL,
	"id" text NOT NULL,
	"owner_id" text,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "records_firm_id_tbl_id_pk" PRIMARY KEY("firm_id","tbl","id")
);
--> statement-breakpoint
DROP TABLE "crm"."portal_invites" CASCADE;--> statement-breakpoint
CREATE INDEX "records_changes" ON "crm"."records" USING btree ("firm_id","tbl","updated_at");--> statement-breakpoint
CREATE INDEX "records_data" ON "crm"."records" USING gin ("data");