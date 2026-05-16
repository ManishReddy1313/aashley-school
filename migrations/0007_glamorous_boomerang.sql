CREATE TABLE "activities" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" varchar,
	"type" varchar(30) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text,
	"activity_date" varchar(10) NOT NULL,
	"conducted_by_user_id" varchar,
	"participants" text,
	"academic_year" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "attendance" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" varchar NOT NULL,
	"student_user_id" varchar NOT NULL,
	"date" varchar(10) NOT NULL,
	"status" varchar(10) NOT NULL,
	"marked_by_user_id" varchar NOT NULL,
	"notification_sent" boolean DEFAULT false NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "homework" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" varchar NOT NULL,
	"subject_id" varchar,
	"subject_name" varchar(100) NOT NULL,
	"title" varchar(200) NOT NULL,
	"description" text NOT NULL,
	"due_date" varchar(10) NOT NULL,
	"attachment_url" text,
	"created_by_user_id" varchar NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_login_at" timestamp;--> statement-breakpoint
CREATE UNIQUE INDEX "attendance_class_student_date_idx" ON "attendance" USING btree ("class_id","student_user_id","date");--> statement-breakpoint
CREATE INDEX "attendance_date_idx" ON "attendance" USING btree ("date");