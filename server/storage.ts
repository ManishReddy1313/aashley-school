import { 
  portalUsers, type PortalUser, type InsertPortalUser,
  classes, type Class, type InsertClass,
  classTeachers, classStudents,
  announcements, type Announcement, type InsertAnnouncement,
  events, type Event, type InsertEvent,
  galleryItems, type GalleryItem, type InsertGalleryItem,
  admissionEnquiries, type AdmissionEnquiry, type InsertAdmissionEnquiry,
  alumni, type Alumni, type InsertAlumni,
  resources, type Resource, type InsertResource,
  contactMessages, type ContactMessage, type InsertContactMessage,
  growthStories, type GrowthStory, type InsertGrowthStory,
  jobPostings, type JobPosting, type InsertJobPosting,
  jobApplications, type JobApplication, type InsertJobApplication
} from "@shared/schema";
import { users, type UpsertUser, type User } from "@shared/models/auth";
import { db } from "./db";
import { eq, desc, and, lte, gte, or, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // Auth Users
  getUsers(): Promise<User[]>;
  updateUserById(id: string, updates: Partial<UpsertUser>): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;

  // Portal Users
  getPortalUser(userId: string): Promise<PortalUser | undefined>;
  createPortalUser(user: InsertPortalUser): Promise<PortalUser>;

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
  
  // Announcements
  getActiveAnnouncements(roles?: string[]): Promise<Announcement[]>;
  createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement>;
  
  // Events
  getPublicEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  
  // Gallery
  getGalleryItems(): Promise<GalleryItem[]>;
  createGalleryItem(item: InsertGalleryItem): Promise<GalleryItem>;
  
  // Admission Enquiries
  getAdmissionEnquiries(): Promise<AdmissionEnquiry[]>;
  createAdmissionEnquiry(enquiry: InsertAdmissionEnquiry): Promise<AdmissionEnquiry>;
  
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
  async getUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
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

  // Portal Users
  async getPortalUser(userId: string): Promise<PortalUser | undefined> {
    const [user] = await db.select().from(portalUsers).where(eq(portalUsers.userId, userId));
    return user;
  }

  async createPortalUser(user: InsertPortalUser): Promise<PortalUser> {
    const [created] = await db.insert(portalUsers).values(user).returning();
    return created;
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

  // Announcements
  async getActiveAnnouncements(roles: string[] = []): Promise<Announcement[]> {
    const now = new Date();
    const roleFilter = roles.length > 0 ? or(...roles.map((role) => sql`${role} = ANY(${announcements.targetRoles})`)) : undefined;
    return db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            isNull(announcements.expiresAt),
            gte(announcements.expiresAt, now)
          ),
          roleFilter
        )
      )
      .orderBy(desc(announcements.createdAt));
  }

  async createAnnouncement(announcement: InsertAnnouncement): Promise<Announcement> {
    const [created] = await db.insert(announcements).values(announcement).returning();
    return created;
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
