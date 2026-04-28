CREATE TABLE "parent_teacher_messages" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"student_user_id" varchar NOT NULL,
	"class_id" varchar NOT NULL,
	"sender_user_id" varchar NOT NULL,
	"sender_role" varchar(30) NOT NULL,
	"message" text NOT NULL,
	"is_read_by_teacher" boolean DEFAULT false NOT NULL,
	"is_read_by_parent" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now()
);
