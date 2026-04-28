import { 
  classes, type Class, type InsertClass,
  subjects, type Subject, type InsertSubject,
  exams, type Exam, type InsertExam,
  examResults, type ExamResult, type InsertExamResult,
  timetableSlots, type TimetableSlot, type InsertTimetableSlot,
  notifications, type Notification, type InsertNotification,
  classTeachers, classStudents,
  announcements, type Announcement, type InsertAnnouncement,
  events, type Event, type InsertEvent,
  galleryItems, type GalleryItem, type InsertGalleryItem,
  admissionEnquiries, type AdmissionEnquiry, type InsertAdmissionEnquiry,
  admissionLeads, type AdmissionLead, type InsertAdmissionLead,
  admissionLeadComments, type AdmissionLeadComment, type InsertAdmissionLeadComment,
  admissionLeadStatusHistory,
  studentProfiles, type StudentProfile, type InsertStudentProfile,
  parentStudentLinks, type ParentStudentLink, type InsertParentStudentLink,
  parentTeacherMessages, type ParentTeacherMessage, type InsertParentTeacherMessage,
  alumni, type Alumni, type InsertAlumni,
  resources, type Resource, type InsertResource,
  contactMessages, type ContactMessage, type InsertContactMessage,
  growthStories, type GrowthStory, type InsertGrowthStory,
  jobPostings, type JobPosting, type InsertJobPosting,
  jobApplications, type JobApplication, type InsertJobApplication
} from "@shared/schema";
import { users, type UpsertUser, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, desc, and, lte, gte, or, isNull, sql, asc } from "drizzle-orm";

export interface IStorage {
  // Auth Users
  getUsers(): Promise<Omit<User, "password">[]>;
  updateUserById(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getStudentProfileByUserId(userId: string): Promise<StudentProfile | null>;
  getStudentProfileByAdmissionNumber(admissionNumber: string): Promise<StudentProfile | null>;
  createStudentProfile(data: InsertStudentProfile): Promise<StudentProfile>;
  updateStudentProfile(
    userId: string,
    data: Partial<Omit<StudentProfile, "id" | "createdAt">>
  ): Promise<StudentProfile | null>;
  getStudentsInClass(classId: string): Promise<Array<{ user: Omit<User, "password">; profile: StudentProfile | null }>>;
  getChildrenForParent(parentUserId: string): Promise<Array<{ link: ParentStudentLink; studentUser: Omit<User, "password">; profile: StudentProfile | null }>>;
  getParentsForStudent(studentUserId: string): Promise<Array<{ link: ParentStudentLink; parentUser: Omit<User, "password"> }>>;
  createParentStudentLink(data: InsertParentStudentLink): Promise<ParentStudentLink>;
  removeParentStudentLink(parentUserId: string, studentUserId: string): Promise<void>;

  // Classes
  getClasses(): Promise<Class[]>;
  createClass(data: InsertClass): Promise<Class>;
  replaceClassTeachers(classId: string, teacherUserIds: string[]): Promise<void>;
  replaceClassStudents(classId: string, studentUserIds: string[]): Promise<void>;
  getTeacherClassIds(teacherUserId: string): Promise<string[]>;
  getStudentClassIds(studentUserId: string): Promise<string[]>;
  getClassTeacherUserIds(classId: string): Promise<string[]>;
  getClassStudentUserIds(classId: string): Promise<string[]>;
  getStudentsForTeacher(teacherUserId: string): Promise<User[]>;
  getClassesByIds(classIds: string[]): Promise<Class[]>;
  getClassStudentLinks(classIds: string[]): Promise<Array<{ classId: string; studentUserId: string }>>;
  getSubjectsByClass(classId: string, academicYear: string): Promise<Subject[]>;
  createSubject(data: InsertSubject): Promise<Subject>;
  deleteSubject(id: string): Promise<void>;
  getExamsByClass(classId: string, academicYear: string): Promise<Exam[]>;
  getExamById(id: string): Promise<Exam | null>;
  createExam(data: InsertExam): Promise<Exam>;
  updateExam(id: string, data: Partial<Omit<Exam, "id" | "createdAt">>): Promise<Exam | null>;
  deleteExam(id: string): Promise<void>;
  getResultsByExam(examId: string): Promise<ExamResult[]>;
  getResultsByStudent(studentUserId: string, academicYear: string): Promise<Array<{
    exam: Exam;
    result: ExamResult | null;
    subject: Subject | null;
  }>>;
  upsertExamResult(data: {
    examId: string;
    studentUserId: string;
    marksObtained: number;
    remarks?: string;
    enteredByUserId: string;
  }): Promise<ExamResult>;
  bulkUpsertExamResults(results: Array<{
    examId: string;
    studentUserId: string;
    marksObtained: number;
    remarks?: string;
    enteredByUserId: string;
  }>): Promise<ExamResult[]>;
  getTimetableByClass(classId: string, academicYear: string): Promise<TimetableSlot[]>;
  upsertTimetableSlot(data: {
    classId: string;
    academicYear: string;
    dayOfWeek: number;
    periodNumber: number;
    subjectName: string;
    teacherUserId?: string | null;
    startTime: string;
    endTime: string;
  }): Promise<TimetableSlot>;
  deleteTimetableSlot(classId: string, academicYear: string, dayOfWeek: number, periodNumber: number): Promise<void>;
  getTimetableForStudent(studentUserId: string, academicYear: string): Promise<TimetableSlot[]>;
  getNotifications(userId: string, limit?: number): Promise<Notification[]>;
  getUnreadNotificationCount(userId: string): Promise<number>;
  markNotificationsRead(userId: string): Promise<void>;
  createNotification(data: InsertNotification): Promise<Notification>;
  
  // Announcements
  getActiveAnnouncements(params: {
    classIds?: string[];
    includeSchoolWide?: boolean;
  }): Promise<Announcement[]>;
  getAnnouncementById(id: string): Promise<Announcement | null>;
  getAllAnnouncements(): Promise<Announcement[]>;
  getAnnouncementsByCreator(userId: string): Promise<Announcement[]>;
  deactivateAnnouncement(id: string): Promise<void>;
  updateAnnouncement(
    id: string,
    data: Partial<Pick<Announcement, "title" | "content" | "priority" | "expiresAt" | "isActive">>
  ): Promise<Announcement | null>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;

  // Parent-teacher chat
  getMessageThread(studentUserId: string, classId: string): Promise<ParentTeacherMessage[]>;
  sendMessage(data: InsertParentTeacherMessage): Promise<ParentTeacherMessage>;
  markThreadRead(studentUserId: string, classId: string, readerRole: "student" | "class_teacher"): Promise<void>;
  getTeacherMessageThreads(teacherUserId: string): Promise<Array<{
    studentUserId: string;
    classId: string;
    lastMessage: ParentTeacherMessage;
    unreadCount: number;
    studentFirstName: string | null;
    studentLastName: string | null;
    studentUsername: string;
  }>>;
  getUnreadMessageCount(userId: string, role: string): Promise<number>;
  
  // Events
  getPublicEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Gallery
  getGalleryItems(): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  
  // Admission Enquiries
  getAdmissionEnquiries(): Promise<AdmissionEnquiry[]>;
  createAdmissionEnquiry(enquiry: InsertAdmissionEnquiry): Promise<AdmissionEnquiry>;
  getAdmissionLeads(filters?: { status?: string; assignedTo?: string }): Promise<AdmissionLead[]>;
  getAdmissionLeadById(id: string): Promise<AdmissionLead | null>;
  createAdmissionLead(data: InsertAdmissionLead): Promise<AdmissionLead>;
  updateAdmissionLead(
    id: string,
    data: Partial<Omit<AdmissionLead, "id" | "createdAt">>
  ): Promise<AdmissionLead | null>;
  getLeadComments(leadId: string): Promise<AdmissionLeadComment[]>;
  addLeadComment(data: InsertAdmissionLeadComment): Promise<AdmissionLeadComment>;
  addLeadStatusHistory(params: {
    leadId: string;
    changedByUserId: string;
    fromStatus: string | null;
    toStatus: string;
  }): Promise<void>;
  getLeadStatusHistory(leadId: string): Promise<typeof admissionLeadStatusHistory.$inferSelect[]>;
  
  // Alumni
  getAllAlumni(): Promise<Alumni[]>;
  getApprovedAlumni(): Promise<Alumni[]>;
  createAlumni(alumni: InsertAlumni): Promise<Alumni>;
  
  // Resources
  getResources(roles?: string[]): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Growth Stories
  getPublishedGrowthStories(): Promise<GrowthStory[]>;
  createGrowthStory(story: InsertGrowthStory): Promise<GrowthStory>;

  // Job Postings
  getActiveJobPostings(): Promise<JobPosting[]>;
  getAllJobPostings(): Promise<JobPosting[]>;
  createJobPosting(posting: InsertJobPosting): Promise<JobPosting>;

  // Job Applications
  getJobApplications(): Promise<JobApplication[]>;
  createJobApplication(application: InsertJobApplication): Promise<JobApplication>;
}

export class DatabaseStorage implements IStorage {
  // Auth Users
  async getUsers(): Promise<Omit<User, "password">[]> {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt));
    return rows.map(({ password: _password, ...user }) => user);
  }

  async updateUserById(id: string, updates: Partial<UpsertUser>): Promise<User | undefined> {
    const [updated] = await db
      .update(users)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return updated;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getStudentProfileByUserId(userId: string): Promise<StudentProfile | null> {
    const [profile] = await db.select().from(studentProfiles).where(eq(studentProfiles.userId, userId));
    return profile ?? null;
  }

  async getStudentProfileByAdmissionNumber(admissionNumber: string): Promise<StudentProfile | null> {
    const [profile] = await db
      .select()
      .from(studentProfiles)
      .where(eq(studentProfiles.admissionNumber, admissionNumber));
    return profile ?? null;
  }

  async createStudentProfile(data: InsertStudentProfile): Promise<StudentProfile> {
    const [created] = await db.insert(studentProfiles).values(data).returning();
    return created;
  }

  async updateStudentProfile(
    userId: string,
    data: Partial<Omit<StudentProfile, "id" | "createdAt">>
  ): Promise<StudentProfile | null> {
    const [updated] = await db
      .update(studentProfiles)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(studentProfiles.userId, userId))
      .returning();
    return updated ?? null;
  }

  async getStudentsInClass(classId: string): Promise<Array<{ user: Omit<User, "password">; profile: StudentProfile | null }>> {
    const rows = await db
      .select()
      .from(users)
      .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
      .where(and(eq(users.role, "student"), eq(studentProfiles.classId, classId)));

    return rows.map((row) => {
      const { password: _password, ...safeUser } = row.users;
      return { user: safeUser, profile: row.student_profiles ?? null };
    });
  }

  async getChildrenForParent(
    parentUserId: string
  ): Promise<Array<{ link: ParentStudentLink; studentUser: Omit<User, "password">; profile: StudentProfile | null }>> {
    const rows = await db
      .select()
      .from(parentStudentLinks)
      .leftJoin(users, eq(users.id, parentStudentLinks.studentUserId))
      .leftJoin(studentProfiles, eq(studentProfiles.userId, parentStudentLinks.studentUserId))
      .where(eq(parentStudentLinks.parentUserId, parentUserId))
      .orderBy(desc(parentStudentLinks.createdAt));

    return rows
      .filter((row) => !!row.users)
      .map((row) => {
        const { password: _password, ...safeStudent } = row.users as User;
        return {
          link: row.parent_student_links,
          studentUser: safeStudent,
          profile: row.student_profiles ?? null,
        };
      });
  }

  async getParentsForStudent(
    studentUserId: string
  ): Promise<Array<{ link: ParentStudentLink; parentUser: Omit<User, "password"> }>> {
    const rows = await db
      .select()
      .from(parentStudentLinks)
      .leftJoin(users, eq(users.id, parentStudentLinks.parentUserId))
      .where(eq(parentStudentLinks.studentUserId, studentUserId))
      .orderBy(desc(parentStudentLinks.createdAt));

    return rows
      .filter((row) => !!row.users)
      .map((row) => {
        const { password: _password, ...safeParent } = row.users as User;
        return {
          link: row.parent_student_links,
          parentUser: safeParent,
        };
      });
  }

  async createParentStudentLink(data: InsertParentStudentLink): Promise<ParentStudentLink> {
    const [created] = await db.insert(parentStudentLinks).values(data).returning();
    return created;
  }

  async removeParentStudentLink(parentUserId: string, studentUserId: string): Promise<void> {
    await db
      .delete(parentStudentLinks)
      .where(and(eq(parentStudentLinks.parentUserId, parentUserId), eq(parentStudentLinks.studentUserId, studentUserId)));
  }

  // Classes
  async getClasses(): Promise<Class[]> {
    return db.select().from(classes).orderBy(desc(classes.createdAt));
  }

  async createClass(data: InsertClass): Promise<Class> {
    const [created] = await db.insert(classes).values(data).returning();
    return created;
  }

  async replaceClassTeachers(classId: string, teacherUserIds: string[]): Promise<void> {
    await db.delete(classTeachers).where(eq(classTeachers.classId, classId));
    if (teacherUserIds.length === 0) return;
    await db.insert(classTeachers).values(
      teacherUserIds.map((teacherUserId) => ({ classId, teacherUserId }))
    );
  }

  async replaceClassStudents(classId: string, studentUserIds: string[]): Promise<void> {
    await db.delete(classStudents).where(eq(classStudents.classId, classId));
    if (studentUserIds.length === 0) return;
    await db.insert(classStudents).values(
      studentUserIds.map((studentUserId) => ({ classId, studentUserId }))
    );
  }

  async getTeacherClassIds(teacherUserId: string): Promise<string[]> {
    const rows = await db
      .select({ classId: classTeachers.classId })
      .from(classTeachers)
      .where(eq(classTeachers.teacherUserId, teacherUserId));
    return rows.map((row) => row.classId);
  }

  async getStudentClassIds(studentUserId: string): Promise<string[]> {
    const rows = await db
      .select({ classId: classStudents.classId })
      .from(classStudents)
      .where(eq(classStudents.studentUserId, studentUserId));
    return rows.map((row) => row.classId);
  }

  async getClassTeacherUserIds(classId: string): Promise<string[]> {
    const rows = await db
      .select({ teacherUserId: classTeachers.teacherUserId })
      .from(classTeachers)
      .where(eq(classTeachers.classId, classId));
    return rows.map((row) => row.teacherUserId);
  }

  async getClassStudentUserIds(classId: string): Promise<string[]> {
    const rows = await db
      .select({ studentUserId: classStudents.studentUserId })
      .from(classStudents)
      .where(eq(classStudents.classId, classId));
    return rows.map((row) => row.studentUserId);
  }

  async getStudentsForTeacher(teacherUserId: string): Promise<User[]> {
    const teacherClassIds = await this.getTeacherClassIds(teacherUserId);
    if (teacherClassIds.length === 0) return [];

    const rows = await db
      .select({ studentUserId: classStudents.studentUserId })
      .from(classStudents)
      .where(or(...teacherClassIds.map((classId) => eq(classStudents.classId, classId))));

    const uniqueStudentIds = Array.from(new Set(rows.map((row) => row.studentUserId)));
    if (uniqueStudentIds.length === 0) return [];

    const students = await db
      .select()
      .from(users)
      .where(or(...uniqueStudentIds.map((id) => eq(users.id, id))));

    return students;
  }

  async getClassesByIds(classIds: string[]): Promise<Class[]> {
    if (classIds.length === 0) return [];
    return db
      .select()
      .from(classes)
      .where(or(...classIds.map((id) => eq(classes.id, id))));
  }

  async getClassStudentLinks(classIds: string[]): Promise<Array<{ classId: string; studentUserId: string }>> {
    if (classIds.length === 0) return [];
    return db
      .select({ classId: classStudents.classId, studentUserId: classStudents.studentUserId })
      .from(classStudents)
      .where(or(...classIds.map((id) => eq(classStudents.classId, id))));
  }

  async getSubjectsByClass(classId: string, academicYear: string): Promise<Subject[]> {
    return db
      .select()
      .from(subjects)
      .where(and(eq(subjects.classId, classId), eq(subjects.academicYear, academicYear)))
      .orderBy(subjects.name);
  }

  async createSubject(data: InsertSubject): Promise<Subject> {
    const [created] = await db.insert(subjects).values(data).returning();
    return created;
  }

  async deleteSubject(id: string): Promise<void> {
    await db.delete(subjects).where(eq(subjects.id, id));
  }

  async getExamsByClass(classId: string, academicYear: string): Promise<Exam[]> {
    return db
      .select()
      .from(exams)
      .where(and(eq(exams.classId, classId), eq(exams.academicYear, academicYear)))
      .orderBy(asc(exams.examDate));
  }

  async getExamById(id: string): Promise<Exam | null> {
    const [exam] = await db.select().from(exams).where(eq(exams.id, id));
    return exam ?? null;
  }

  async createExam(data: InsertExam): Promise<Exam> {
    const [created] = await db.insert(exams).values(data).returning();
    return created;
  }

  async updateExam(id: string, data: Partial<Omit<Exam, "id" | "createdAt">>): Promise<Exam | null> {
    const [updated] = await db
      .update(exams)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(exams.id, id))
      .returning();
    return updated ?? null;
  }

  async deleteExam(id: string): Promise<void> {
    await db.delete(examResults).where(eq(examResults.examId, id));
    await db.delete(exams).where(eq(exams.id, id));
  }

  async getResultsByExam(examId: string): Promise<ExamResult[]> {
    return db
      .select()
      .from(examResults)
      .where(eq(examResults.examId, examId))
      .orderBy(asc(examResults.createdAt));
  }

  async getResultsByStudent(studentUserId: string, academicYear: string): Promise<Array<{
    exam: Exam;
    result: ExamResult | null;
    subject: Subject | null;
  }>> {
    const classIds = await this.getStudentClassIds(studentUserId);
    if (classIds.length === 0) return [];
    const examRows = await db
      .select()
      .from(exams)
      .where(
        and(
          eq(exams.academicYear, academicYear),
          or(...classIds.map((classId) => eq(exams.classId, classId)))
        )
      )
      .orderBy(asc(exams.examDate));
    if (examRows.length === 0) return [];

    const subjectIds = Array.from(new Set(examRows.map((row) => row.subjectId)));
    const subjectRows = subjectIds.length
      ? await db.select().from(subjects).where(or(...subjectIds.map((subjectId) => eq(subjects.id, subjectId))))
      : [];
    const subjectById = new Map(subjectRows.map((row) => [row.id, row]));

    const resultsRows = await db
      .select()
      .from(examResults)
      .where(
        and(
          eq(examResults.studentUserId, studentUserId),
          or(...examRows.map((row) => eq(examResults.examId, row.id)))
        )
      );
    const resultByExamId = new Map(resultsRows.map((row) => [row.examId, row]));

    return examRows.map((exam) => ({
      exam,
      result: resultByExamId.get(exam.id) ?? null,
      subject: subjectById.get(exam.subjectId) ?? null,
    }));
  }

  async upsertExamResult(data: {
    examId: string;
    studentUserId: string;
    marksObtained: number;
    remarks?: string;
    enteredByUserId: string;
  }): Promise<ExamResult> {
    const [saved] = await db
      .insert(examResults)
      .values({
        examId: data.examId,
        studentUserId: data.studentUserId,
        marksObtained: data.marksObtained,
        remarks: data.remarks ?? null,
        enteredByUserId: data.enteredByUserId,
      })
      .onConflictDoUpdate({
        target: [examResults.examId, examResults.studentUserId],
        set: {
          marksObtained: data.marksObtained,
          remarks: data.remarks ?? null,
          enteredByUserId: data.enteredByUserId,
          updatedAt: new Date(),
        },
      })
      .returning();
    return saved;
  }

  async bulkUpsertExamResults(results: Array<{
    examId: string;
    studentUserId: string;
    marksObtained: number;
    remarks?: string;
    enteredByUserId: string;
  }>): Promise<ExamResult[]> {
    const saved: ExamResult[] = [];
    for (const row of results) {
      const upserted = await this.upsertExamResult(row);
      saved.push(upserted);
    }
    return saved;
  }

  async getTimetableByClass(classId: string, academicYear: string): Promise<TimetableSlot[]> {
    return db
      .select()
      .from(timetableSlots)
      .where(and(eq(timetableSlots.classId, classId), eq(timetableSlots.academicYear, academicYear)))
      .orderBy(asc(timetableSlots.dayOfWeek), asc(timetableSlots.periodNumber));
  }

  async upsertTimetableSlot(data: {
    classId: string;
    academicYear: string;
    dayOfWeek: number;
    periodNumber: number;
    subjectName: string;
    teacherUserId?: string | null;
    startTime: string;
    endTime: string;
  }): Promise<TimetableSlot> {
    const [saved] = await db
      .insert(timetableSlots)
      .values({
        classId: data.classId,
        academicYear: data.academicYear,
        dayOfWeek: data.dayOfWeek,
        periodNumber: data.periodNumber,
        subjectName: data.subjectName,
        teacherUserId: data.teacherUserId ?? null,
        startTime: data.startTime,
        endTime: data.endTime,
      })
      .onConflictDoUpdate({
        target: [
          timetableSlots.classId,
          timetableSlots.academicYear,
          timetableSlots.dayOfWeek,
          timetableSlots.periodNumber,
        ],
        set: {
          subjectName: data.subjectName,
          teacherUserId: data.teacherUserId ?? null,
          startTime: data.startTime,
          endTime: data.endTime,
          updatedAt: new Date(),
        },
      })
      .returning();
    return saved;
  }

  async deleteTimetableSlot(classId: string, academicYear: string, dayOfWeek: number, periodNumber: number): Promise<void> {
    await db
      .delete(timetableSlots)
      .where(
        and(
          eq(timetableSlots.classId, classId),
          eq(timetableSlots.academicYear, academicYear),
          eq(timetableSlots.dayOfWeek, dayOfWeek),
          eq(timetableSlots.periodNumber, periodNumber)
        )
      );
  }

  async getTimetableForStudent(studentUserId: string, academicYear: string): Promise<TimetableSlot[]> {
    const profile = await this.getStudentProfileByUserId(studentUserId);
    if (!profile?.classId) return [];
    return this.getTimetableByClass(profile.classId, academicYear);
  }

  async getNotifications(userId: string, limit = 20): Promise<Notification[]> {
    return db
      .select()
      .from(notifications)
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);
  }

  async getUnreadNotificationCount(userId: string): Promise<number> {
    const [row] = await db
      .select({ count: sql<number>`count(*)` })
      .from(notifications)
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
    return Number(row?.count ?? 0);
  }

  async markNotificationsRead(userId: string): Promise<void> {
    await db
      .update(notifications)
      .set({ isRead: true })
      .where(and(eq(notifications.userId, userId), eq(notifications.isRead, false)));
  }

  async createNotification(data: InsertNotification): Promise<Notification> {
    const [created] = await db.insert(notifications).values(data).returning();
    return created;
  }

  // Announcements
  async getActiveAnnouncements(params: {
    classIds?: string[];
    includeSchoolWide?: boolean;
  }): Promise<Announcement[]> {
    const now = new Date();
    const includeSchoolWide = params.includeSchoolWide !== false;
    const classIds = Array.isArray(params.classIds) ? params.classIds.filter(Boolean) : [];
    const conditions = [];
    if (includeSchoolWide) {
      conditions.push(
        and(
          eq(announcements.type, "school"),
          eq(announcements.isActive, true),
          or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now))
        )
      );
    }
    if (classIds.length > 0) {
      conditions.push(
        and(
          or(eq(announcements.type, "class"), eq(announcements.type, "section")),
          or(...classIds.map((classId) => eq(announcements.classId, classId))),
          eq(announcements.isActive, true),
          or(isNull(announcements.expiresAt), gte(announcements.expiresAt, now))
        )
      );
    }
    if (conditions.length === 0) return [];

    return db.select()
      .from(announcements)
      .where(or(...conditions))
      .orderBy(desc(announcements.createdAt));
  }

  async getAnnouncementById(id: string): Promise<Announcement | null> {
    const [announcement] = await db.select().from(announcements).where(eq(announcements.id, id));
    return announcement ?? null;
  }

  async getAllAnnouncements(): Promise<Announcement[]> {
    return db.select().from(announcements).orderBy(desc(announcements.createdAt));
  }

  async getAnnouncementsByCreator(userId: string): Promise<Announcement[]> {
    return db
      .select()
      .from(announcements)
      .where(eq(announcements.createdByUserId, userId))
      .orderBy(desc(announcements.createdAt));
  }

  async deactivateAnnouncement(id: string): Promise<void> {
    await db
      .update(announcements)
      .set({ isActive: false })
      .where(eq(announcements.id, id));
  }

  async updateAnnouncement(
    id: string,
    data: Partial<Pick<Announcement, "title" | "content" | "priority" | "expiresAt" | "isActive">>
  ): Promise<Announcement | null> {
    const [updated] = await db
      .update(announcements)
      .set(data)
      .where(eq(announcements.id, id))
      .returning();
    return updated ?? null;
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
  }

  async getMessageThread(studentUserId: string, classId: string): Promise<ParentTeacherMessage[]> {
    return db
      .select()
      .from(parentTeacherMessages)
      .where(
        and(
          eq(parentTeacherMessages.studentUserId, studentUserId),
          eq(parentTeacherMessages.classId, classId)
        )
      )
      .orderBy(parentTeacherMessages.createdAt);
  }

  async sendMessage(data: InsertParentTeacherMessage): Promise<ParentTeacherMessage> {
    const [created] = await db.insert(parentTeacherMessages).values(data).returning();
    return created;
  }

  async markThreadRead(studentUserId: string, classId: string, readerRole: "student" | "class_teacher"): Promise<void> {
    if (readerRole === "student") {
      await db
        .update(parentTeacherMessages)
        .set({ isReadByParent: true })
        .where(
          and(
            eq(parentTeacherMessages.studentUserId, studentUserId),
            eq(parentTeacherMessages.classId, classId),
            eq(parentTeacherMessages.isReadByParent, false)
          )
        );
      return;
    }

    await db
      .update(parentTeacherMessages)
      .set({ isReadByTeacher: true })
      .where(
        and(
          eq(parentTeacherMessages.studentUserId, studentUserId),
          eq(parentTeacherMessages.classId, classId),
          eq(parentTeacherMessages.isReadByTeacher, false)
        )
      );
  }

  async getTeacherMessageThreads(teacherUserId: string): Promise<Array<{
    studentUserId: string;
    classId: string;
    lastMessage: ParentTeacherMessage;
    unreadCount: number;
    studentFirstName: string | null;
    studentLastName: string | null;
    studentUsername: string;
  }>> {
    const classIds = await this.getTeacherClassIds(teacherUserId);
    if (classIds.length === 0) return [];

    const threadPairs = await db
      .selectDistinct({
        studentUserId: parentTeacherMessages.studentUserId,
        classId: parentTeacherMessages.classId,
      })
      .from(parentTeacherMessages)
      .where(or(...classIds.map((classId) => eq(parentTeacherMessages.classId, classId))));

    const threads = await Promise.all(
      threadPairs.map(async (pair) => {
        const [lastMessage] = await db
          .select()
          .from(parentTeacherMessages)
          .where(
            and(
              eq(parentTeacherMessages.studentUserId, pair.studentUserId),
              eq(parentTeacherMessages.classId, pair.classId)
            )
          )
          .orderBy(desc(parentTeacherMessages.createdAt))
          .limit(1);

        if (!lastMessage) return null;

        const [unreadRow] = await db
          .select({ count: sql<number>`count(*)` })
          .from(parentTeacherMessages)
          .where(
            and(
              eq(parentTeacherMessages.studentUserId, pair.studentUserId),
              eq(parentTeacherMessages.classId, pair.classId),
              eq(parentTeacherMessages.isReadByTeacher, false)
            )
          );

        const [student] = await db
          .select({
            firstName: users.firstName,
            lastName: users.lastName,
            username: users.username,
          })
          .from(users)
          .where(eq(users.id, pair.studentUserId))
          .limit(1);

        if (!student) return null;

        return {
          studentUserId: pair.studentUserId,
          classId: pair.classId,
          lastMessage,
          unreadCount: Number(unreadRow?.count ?? 0),
          studentFirstName: student.firstName,
          studentLastName: student.lastName,
          studentUsername: student.username,
        };
      })
    );

    return threads
      .filter((row): row is NonNullable<typeof row> => !!row)
      .sort((a, b) => {
        const t1 = a.lastMessage.createdAt ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const t2 = b.lastMessage.createdAt ? new Date(b.lastMessage.createdAt).getTime() : 0;
        return t2 - t1;
      });
  }

  async getUnreadMessageCount(userId: string, role: string): Promise<number> {
    if (role === "class_teacher" || role === "subject_teacher") {
      const classIds = await this.getTeacherClassIds(userId);
      if (classIds.length === 0) return 0;
      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(parentTeacherMessages)
        .where(
          and(
            eq(parentTeacherMessages.isReadByTeacher, false),
            or(...classIds.map((classId) => eq(parentTeacherMessages.classId, classId)))
          )
        );
      return Number(countRow?.count ?? 0);
    }

    if (role === "student") {
      const [countRow] = await db
        .select({ count: sql<number>`count(*)` })
        .from(parentTeacherMessages)
        .where(
          and(
            eq(parentTeacherMessages.isReadByParent, false),
            eq(parentTeacherMessages.studentUserId, userId)
          )
        );
      return Number(countRow?.count ?? 0);
    }

    return 0;
  }

  // Events
  async getPublicEvents(): Promise<Event[]> {
    return db.select()
      .from(events)
      .where(eq(events.isPublic, true))
      .orderBy(desc(events.eventDate));
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [created] = await db.insert(events).values(event).returning();
    return created;
  }

  // Gallery
  async getGalleryItems(): Promise<GalleryItem[]> {
    return db.select()
      .from(galleryItems)
      .orderBy(desc(galleryItems.displayOrder), desc(galleryItems.createdAt));
  }

  async createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem> {
    const [created] = await db.insert(galleryItems).values(item).returning();
    return created;
  }

  // Admission Enquiries
  async getAdmissionEnquiries(): Promise<AdmissionEnquiry[]> {
    return db.select()
      .from(admissionEnquiries)
      .orderBy(desc(admissionEnquiries.createdAt));
  }

  async createAdmissionEnquiry(enquiry: InsertAdmissionEnquiry): Promise<AdmissionEnquiry> {
    const [created] = await db.insert(admissionEnquiries).values(enquiry).returning();
    return created;
  }

  async getAdmissionLeads(filters?: { status?: string; assignedTo?: string }): Promise<AdmissionLead[]> {
    const conditions = [];
    if (filters?.status) conditions.push(eq(admissionLeads.status, filters.status));
    if (filters?.assignedTo) conditions.push(eq(admissionLeads.assignedTo, filters.assignedTo));
    return db
      .select()
      .from(admissionLeads)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(desc(admissionLeads.createdAt));
  }

  async getAdmissionLeadById(id: string): Promise<AdmissionLead | null> {
    const [lead] = await db.select().from(admissionLeads).where(eq(admissionLeads.id, id));
    return lead ?? null;
  }

  async createAdmissionLead(data: InsertAdmissionLead): Promise<AdmissionLead> {
    const [created] = await db.insert(admissionLeads).values(data).returning();
    return created;
  }

  async updateAdmissionLead(
    id: string,
    data: Partial<Omit<AdmissionLead, "id" | "createdAt">>
  ): Promise<AdmissionLead | null> {
    const [updated] = await db
      .update(admissionLeads)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(admissionLeads.id, id))
      .returning();
    return updated ?? null;
  }

  async getLeadComments(leadId: string): Promise<AdmissionLeadComment[]> {
    return db
      .select()
      .from(admissionLeadComments)
      .where(eq(admissionLeadComments.leadId, leadId))
      .orderBy(desc(admissionLeadComments.createdAt));
  }

  async addLeadComment(data: InsertAdmissionLeadComment): Promise<AdmissionLeadComment> {
    const [created] = await db.insert(admissionLeadComments).values(data).returning();
    return created;
  }

  async addLeadStatusHistory(params: {
    leadId: string;
    changedByUserId: string;
    fromStatus: string | null;
    toStatus: string;
  }): Promise<void> {
    await db.insert(admissionLeadStatusHistory).values(params);
  }

  async getLeadStatusHistory(leadId: string): Promise<typeof admissionLeadStatusHistory.$inferSelect[]> {
    return db
      .select()
      .from(admissionLeadStatusHistory)
      .where(eq(admissionLeadStatusHistory.leadId, leadId))
      .orderBy(desc(admissionLeadStatusHistory.createdAt));
  }

  // Alumni
  async getAllAlumni(): Promise<Alumni[]> {
    return db.select()
      .from(alumni)
      .orderBy(desc(alumni.createdAt));
  }

  async getApprovedAlumni(): Promise<Alumni[]> {
    return db.select()
      .from(alumni)
      .where(eq(alumni.isApproved, true))
      .orderBy(desc(alumni.graduationYear));
  }

  async createAlumni(alumniData: InsertAlumni): Promise<Alumni> {
    const [created] = await db.insert(alumni).values(alumniData).returning();
    return created;
  }

  // Resources
  async getResources(roles: string[] = []): Promise<Resource[]> {
    const roleFilter = roles.length > 0 ? or(...roles.map((role) => sql`${role} = ANY(${resources.targetRoles})`)) : undefined;
    return db.select()
      .from(resources)
      .where(roleFilter)
      .orderBy(desc(resources.createdAt));
  }

  async createResource(resource: InsertResource): Promise<Resource> {
    const [created] = await db.insert(resources).values(resource).returning();
    return created;
  }

  // Contact Messages
  async getContactMessages(): Promise<ContactMessage[]> {
    return db.select()
      .from(contactMessages)
      .orderBy(desc(contactMessages.createdAt));
  }

  async createContactMessage(message: InsertContactMessage): Promise<ContactMessage> {
    const [created] = await db.insert(contactMessages).values(message).returning();
    return created;
  }

  // Growth Stories
  async getPublishedGrowthStories(): Promise<GrowthStory[]> {
    return db.select()
      .from(growthStories)
      .where(eq(growthStories.isPublished, true))
      .orderBy(growthStories.displayOrder, desc(growthStories.createdAt));
  }

  async createGrowthStory(story: InsertGrowthStory): Promise<GrowthStory> {
    const [created] = await db.insert(growthStories).values(story).returning();
    return created;
  }

  // Job Postings
  async getActiveJobPostings(): Promise<JobPosting[]> {
    return db.select()
      .from(jobPostings)
      .where(eq(jobPostings.isActive, true))
      .orderBy(desc(jobPostings.createdAt));
  }

  async getAllJobPostings(): Promise<JobPosting[]> {
    return db.select()
      .from(jobPostings)
      .orderBy(desc(jobPostings.createdAt));
  }

  async createJobPosting(posting: InsertJobPosting): Promise<JobPosting> {
    const [created] = await db.insert(jobPostings).values(posting).returning();
    return created;
  }

  // Job Applications
  async getJobApplications(): Promise<JobApplication[]> {
    return db.select()
      .from(jobApplications)
      .orderBy(desc(jobApplications.createdAt));
  }

  async createJobApplication(application: InsertJobApplication): Promise<JobApplication> {
    const [created] = await db.insert(jobApplications).values(application).returning();
    return created;
  }
}

export const storage = new DatabaseStorage();
