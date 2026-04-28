CREATE TABLE "parent_student_links" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"parent_user_id" varchar NOT NULL,
	"student_user_id" varchar NOT NULL,
	"relationship" varchar(20) DEFAULT 'parent' NOT NULL,
	"is_primary" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "student_profiles" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" varchar NOT NULL,
	"admission_number" varchar(30),
	"class_id" varchar,
	"roll_number" varchar(10),
	"date_of_birth" timestamp,
	"gender" varchar(10),
	"blood_group" varchar(5),
	"address" text,
	"photo_url" text,
	"academic_year" varchar(20),
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now(),
	CONSTRAINT "student_profiles_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "student_profiles_admission_number_unique" UNIQUE("admission_number")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "parent_student_links_parent_student_idx" ON "parent_student_links" USING btree ("parent_user_id","student_user_id");