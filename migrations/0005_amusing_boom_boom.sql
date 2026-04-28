CREATE TABLE "notifications" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"type" varchar(50) NOT NULL,
	"title" varchar(200) NOT NULL,
	"body" text,
	"is_read" boolean DEFAULT false NOT NULL,
	"related_id" varchar,
	"related_href" varchar(300),
	"created_at" timestamp DEFAULT now()
);
