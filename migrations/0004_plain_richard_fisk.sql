CREATE TABLE "timetable_slots" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" varchar NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"day_of_week" integer NOT NULL,
	"period_number" integer NOT NULL,
	"subject_name" varchar(100) NOT NULL,
	"teacher_user_id" varchar,
	"start_time" varchar(5) NOT NULL,
	"end_time" varchar(5) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "timetable_slots_class_year_day_period_idx" ON "timetable_slots" USING btree ("class_id","academic_year","day_of_week","period_number");