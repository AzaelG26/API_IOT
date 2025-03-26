CREATE TABLE "nfc_keys" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tag_id" varchar(20) NOT NULL,
	CONSTRAINT "nfc_keys_tag_id_key" UNIQUE("tag_id")
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(100) NOT NULL,
	"phone" varchar(15) NOT NULL,
	"email" varchar(100) NOT NULL,
	"password" varchar(100) NOT NULL,
	"status" boolean DEFAULT true
);
--> statement-breakpoint
CREATE TABLE "vaults" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"nickname" varchar(50) NOT NULL,
	"status" boolean DEFAULT true,
	"user_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vaults_configurations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pin" integer NOT NULL,
	"nfc_key_id" uuid NOT NULL,
	"vault_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vaults" ADD CONSTRAINT "fk_id_user" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults_configurations" ADD CONSTRAINT "fk_nfc_keys" FOREIGN KEY ("nfc_key_id") REFERENCES "public"."nfc_keys"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vaults_configurations" ADD CONSTRAINT "fk_vaults" FOREIGN KEY ("vault_id") REFERENCES "public"."vaults"("id") ON DELETE no action ON UPDATE no action;