CREATE TABLE "exam_results" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"exam_id" varchar NOT NULL,
	"student_user_id" varchar NOT NULL,
	"marks_obtained" integer NOT NULL,
	"remarks" text,
	"entered_by_user_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "exams" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_id" varchar NOT NULL,
	"subject_id" varchar NOT NULL,
	"title" varchar(200) NOT NULL,
	"exam_date" timestamp NOT NULL,
	"max_marks" integer NOT NULL,
	"passing_marks" integer NOT NULL,
	"academic_year" varchar(20) NOT NULL,
	"created_by_user_id" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE UNIQUE INDEX "exam_results_exam_student_idx" ON "exam_results" USING btree ("exam_id","student_user_id");