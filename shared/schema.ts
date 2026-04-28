import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer, uniqueIndex } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Academic Classes
export const classes = pgTable(
  "classes",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 100 }).notNull(),
    section: varchar("section", { length: 20 }),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    classUniqueIdx: uniqueIndex("classes_name_section_year_idx").on(table.name, table.section, table.academicYear),
  }),
);

export const classTeachers = pgTable("class_teachers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull(),
  teacherUserId: varchar("teacher_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const classStudents = pgTable("class_students", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull(),
  studentUserId: varchar("student_user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertClassSchema = createInsertSchema(classes).omit({ id: true, createdAt: true });
export type InsertClass = z.infer<typeof insertClassSchema>;
export type Class = typeof classes.$inferSelect;

export const assignClassTeachersSchema = z.object({
  teacherUserIds: z.array(z.string()).default([]),
});
export const assignClassStudentsSchema = z.object({
  studentUserIds: z.array(z.string()).default([]),
});

export const subjects = pgTable(
  "subjects",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    classId: varchar("class_id").notNull(),
    name: varchar("name", { length: 100 }).notNull(),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    subjectUniqueIdx: uniqueIndex("subjects_class_name_year_idx").on(table.classId, table.name, table.academicYear),
  }),
);
export const insertSubjectSchema = createInsertSchema(subjects).omit({ id: true, createdAt: true });
export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export const exams = pgTable("exams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  classId: varchar("class_id").notNull(),
  subjectId: varchar("subject_id").notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  examDate: timestamp("exam_date").notNull(),
  maxMarks: integer("max_marks").notNull(),
  passingMarks: integer("passing_marks").notNull(),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  createdByUserId: varchar("created_by_user_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertExamSchema = createInsertSchema(exams).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertExam = z.infer<typeof insertExamSchema>;
export type Exam = typeof exams.$inferSelect;

export const examResults = pgTable(
  "exam_results",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    examId: varchar("exam_id").notNull(),
    studentUserId: varchar("student_user_id").notNull(),
    marksObtained: integer("marks_obtained").notNull(),
    remarks: text("remarks"),
    enteredByUserId: varchar("entered_by_user_id"),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    examStudentUniqueIdx: uniqueIndex("exam_results_exam_student_idx").on(table.examId, table.studentUserId),
  })
);
export const insertExamResultSchema = createInsertSchema(examResults).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertExamResult = z.infer<typeof insertExamResultSchema>;
export type ExamResult = typeof examResults.$inferSelect;

export const timetableSlots = pgTable(
  "timetable_slots",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    classId: varchar("class_id").notNull(),
    academicYear: varchar("academic_year", { length: 20 }).notNull(),
    dayOfWeek: integer("day_of_week").notNull(),
    periodNumber: integer("period_number").notNull(),
    subjectName: varchar("subject_name", { length: 100 }).notNull(),
    teacherUserId: varchar("teacher_user_id"),
    startTime: varchar("start_time", { length: 5 }).notNull(),
    endTime: varchar("end_time", { length: 5 }).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    timetableUniqueIdx: uniqueIndex("timetable_slots_class_year_day_period_idx").on(
      table.classId,
      table.academicYear,
      table.dayOfWeek,
      table.periodNumber
    ),
  })
);
export const insertTimetableSlotSchema = createInsertSchema(timetableSlots).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertTimetableSlot = z.infer<typeof insertTimetableSlotSchema>;
export type TimetableSlot = typeof timetableSlots.$inferSelect;

export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  type: varchar("type", { length: 50 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  body: text("body"),
  isRead: boolean("is_read").notNull().default(false),
  relatedId: varchar("related_id"),
  relatedHref: varchar("related_href", { length: 300 }),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Announcements / Circulars
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"),
  type: varchar("type", { length: 20 }).notNull().default("school"),
  classId: varchar("class_id"),
  createdByUserId: varchar("created_by_user_id"),
  targetRoles: text("target_roles").array().notNull().default(
    sql`ARRAY['student', 'subject_teacher', 'class_teacher', 'admissions_officer', 'admin_staff', 'principal', 'super_admin']`
  ),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

export const insertAnnouncementSchema = createInsertSchema(announcements).omit({ id: true, createdAt: true });
export type InsertAnnouncement = z.infer<typeof insertAnnouncementSchema>;
export type Announcement = typeof announcements.$inferSelect;

// Events
export const events = pgTable("events", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  eventDate: timestamp("event_date").notNull(),
  location: text("location"),
  imageUrl: text("image_url"),
  isPublic: boolean("is_public").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertEventSchema = createInsertSchema(events).omit({ id: true, createdAt: true });
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Event = typeof events.$inferSelect;

// Gallery Items
export const galleryItems = pgTable("gallery_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  caption: text("caption"),
  imageUrl: text("image_url").notNull(),
  category: varchar("category", { length: 50 }).notNull().default("general"),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGalleryItemSchema = createInsertSchema(galleryItems).omit({ id: true, createdAt: true });
export type InsertGalleryItem = z.infer<typeof insertGalleryItemSchema>;
export type GalleryItem = typeof galleryItems.$inferSelect;

// Admission Enquiries
export const admissionEnquiries = pgTable("admission_enquiries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  grade: varchar("grade", { length: 20 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAdmissionEnquirySchema = createInsertSchema(admissionEnquiries).omit({ id: true, createdAt: true, status: true });
export type InsertAdmissionEnquiry = z.infer<typeof insertAdmissionEnquirySchema>;
export type AdmissionEnquiry = typeof admissionEnquiries.$inferSelect;

export const admissionLeads = pgTable("admission_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  grade: varchar("grade", { length: 20 }).notNull(),
  message: text("message"),
  status: varchar("status", { length: 30 }).notNull().default("new_enquiry"),
  assignedTo: varchar("assigned_to"),
  source: varchar("source", { length: 50 }).notNull().default("website"),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertAdmissionLeadSchema = createInsertSchema(admissionLeads).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertAdmissionLead = z.infer<typeof insertAdmissionLeadSchema>;
export type AdmissionLead = typeof admissionLeads.$inferSelect;

export const admissionLeadComments = pgTable("admission_lead_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  userId: varchar("user_id").notNull(),
  comment: text("comment").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertAdmissionLeadCommentSchema = createInsertSchema(admissionLeadComments).omit({
  id: true,
  createdAt: true,
});
export type InsertAdmissionLeadComment = z.infer<typeof insertAdmissionLeadCommentSchema>;
export type AdmissionLeadComment = typeof admissionLeadComments.$inferSelect;

export const admissionLeadStatusHistory = pgTable("admission_lead_status_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull(),
  changedByUserId: varchar("changed_by_user_id").notNull(),
  fromStatus: varchar("from_status", { length: 30 }),
  toStatus: varchar("to_status", { length: 30 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const studentProfiles = pgTable("student_profiles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().unique(),
  admissionNumber: varchar("admission_number", { length: 30 }).unique(),
  classId: varchar("class_id"),
  rollNumber: varchar("roll_number", { length: 10 }),
  dateOfBirth: timestamp("date_of_birth"),
  gender: varchar("gender", { length: 10 }),
  bloodGroup: varchar("blood_group", { length: 5 }),
  address: text("address"),
  photoUrl: text("photo_url"),
  academicYear: varchar("academic_year", { length: 20 }),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
export const insertStudentProfileSchema = createInsertSchema(studentProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export type InsertStudentProfile = z.infer<typeof insertStudentProfileSchema>;
export type StudentProfile = typeof studentProfiles.$inferSelect;

export const parentStudentLinks = pgTable(
  "parent_student_links",
  {
    id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
    parentUserId: varchar("parent_user_id").notNull(),
    studentUserId: varchar("student_user_id").notNull(),
    relationship: varchar("relationship", { length: 20 }).notNull().default("parent"),
    isPrimary: boolean("is_primary").notNull().default(true),
    createdAt: timestamp("created_at").defaultNow(),
  },
  (table) => ({
    parentStudentUniqueIdx: uniqueIndex("parent_student_links_parent_student_idx").on(
      table.parentUserId,
      table.studentUserId
    ),
  })
);
export const insertParentStudentLinkSchema = createInsertSchema(parentStudentLinks).omit({
  id: true,
  createdAt: true,
});
export type InsertParentStudentLink = z.infer<typeof insertParentStudentLinkSchema>;
export type ParentStudentLink = typeof parentStudentLinks.$inferSelect;

export const parentTeacherMessages = pgTable("parent_teacher_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentUserId: varchar("student_user_id").notNull(),
  classId: varchar("class_id").notNull(),
  senderUserId: varchar("sender_user_id").notNull(),
  senderRole: varchar("sender_role", { length: 30 }).notNull(),
  message: text("message").notNull(),
  isReadByTeacher: boolean("is_read_by_teacher").notNull().default(false),
  isReadByParent: boolean("is_read_by_parent").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});
export const insertParentTeacherMessageSchema = createInsertSchema(parentTeacherMessages).omit({
  id: true,
  createdAt: true,
});
export type InsertParentTeacherMessage = z.infer<typeof insertParentTeacherMessageSchema>;
export type ParentTeacherMessage = typeof parentTeacherMessages.$inferSelect;

// Alumni
export const alumni = pgTable("alumni", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  graduationYear: integer("graduation_year").notNull(),
  currentRole: text("current_role"),
  organization: text("organization"),
  story: text("story"),
  imageUrl: text("image_url"),
  isApproved: boolean("is_approved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertAlumniSchema = createInsertSchema(alumni).omit({ id: true, createdAt: true, isApproved: true });
export type InsertAlumni = z.infer<typeof insertAlumniSchema>;
export type Alumni = typeof alumni.$inferSelect;

// Resources / Downloads
export const resources = pgTable("resources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description"),
  fileUrl: text("file_url").notNull(),
  fileType: varchar("file_type", { length: 20 }).notNull().default("pdf"),
  targetRoles: text("target_roles").array().notNull().default(
    sql`ARRAY['student', 'subject_teacher', 'class_teacher', 'admissions_officer', 'admin_staff', 'principal', 'super_admin']`
  ),
  category: varchar("category", { length: 50 }).notNull().default("circular"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertResourceSchema = createInsertSchema(resources).omit({ id: true, createdAt: true });
export type InsertResource = z.infer<typeof insertResourceSchema>;
export type Resource = typeof resources.$inferSelect;

// Contact Messages
export const contactMessages = pgTable("contact_messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({ id: true, createdAt: true, isRead: true });
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;
export type ContactMessage = typeof contactMessages.$inferSelect;

// Growth Stories (testimonials)
export const growthStories = pgTable("growth_stories", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  studentName: text("student_name").notNull(),
  parentName: text("parent_name"),
  story: text("story").notNull(),
  imageUrl: text("image_url"),
  isPublished: boolean("is_published").notNull().default(false),
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertGrowthStorySchema = createInsertSchema(growthStories).omit({ id: true, createdAt: true });
export type InsertGrowthStory = z.infer<typeof insertGrowthStorySchema>;
export type GrowthStory = typeof growthStories.$inferSelect;

// Job Postings
export const jobPostings = pgTable("job_postings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  department: varchar("department", { length: 50 }).notNull(),
  type: varchar("type", { length: 20 }).notNull().default("full-time"),
  description: text("description").notNull(),
  requirements: text("requirements").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobPostingSchema = createInsertSchema(jobPostings).omit({ id: true, createdAt: true });
export type InsertJobPosting = z.infer<typeof insertJobPostingSchema>;
export type JobPosting = typeof jobPostings.$inferSelect;

// Job Applications
export const jobApplications = pgTable("job_applications", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  jobId: varchar("job_id").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  experience: varchar("experience", { length: 50 }).notNull(),
  qualification: text("qualification").notNull(),
  coverLetter: text("cover_letter"),
  resumeUrl: text("resume_url"),
  status: varchar("status", { length: 20 }).notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertJobApplicationSchema = createInsertSchema(jobApplications).omit({ id: true, createdAt: true, status: true });
export type InsertJobApplication = z.infer<typeof insertJobApplicationSchema>;
export type JobApplication = typeof jobApplications.$inferSelect;
