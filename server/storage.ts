import { 
  portalUsers, type PortalUser, type InsertPortalUser,
  announcements, type Announcement, type InsertAnnouncement,
  events, type Event, type InsertEvent,
  galleryItems, type GalleryItem, type InsertGalleryItem,
  admissionEnquiries, type AdmissionEnquiry, type InsertAdmissionEnquiry,
  alumni, type Alumni, type InsertAlumni,
  resources, type Resource, type InsertResource,
  contactMessages, type ContactMessage, type InsertContactMessage,
  growthStories, type GrowthStory, type InsertGrowthStory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, lte, gte, or, isNull } from "drizzle-orm";

export interface IStorage {
  // Portal Users
  getPortalUser(userId: string): Promise<PortalUser | undefined>;
  createPortalUser(user: InsertPortalUser): Promise<PortalUser>;
  
  // Announcements
  getActiveAnnouncements(): Promise<Announcement[]>;
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
  getResources(): Promise<Resource[]>;
  createResource(resource: InsertResource): Promise<Resource>;
  
  // Contact Messages
  getContactMessages(): Promise<ContactMessage[]>;
  createContactMessage(message: InsertContactMessage): Promise<ContactMessage>;
  
  // Growth Stories
  getPublishedGrowthStories(): Promise<GrowthStory[]>;
  createGrowthStory(story: InsertGrowthStory): Promise<GrowthStory>;
}

export class DatabaseStorage implements IStorage {
  // Portal Users
  async getPortalUser(userId: string): Promise<PortalUser | undefined> {
    const [user] = await db.select().from(portalUsers).where(eq(portalUsers.userId, userId));
    return user;
  }

  async createPortalUser(user: InsertPortalUser): Promise<PortalUser> {
    const [created] = await db.insert(portalUsers).values(user).returning();
    return created;
  }

  // Announcements
  async getActiveAnnouncements(): Promise<Announcement[]> {
    const now = new Date();
    return db.select()
      .from(announcements)
      .where(
        and(
          eq(announcements.isActive, true),
          or(
            isNull(announcements.expiresAt),
            gte(announcements.expiresAt, now)
          )
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
  async getResources(): Promise<Resource[]> {
    return db.select()
      .from(resources)
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
}

export const storage = new DatabaseStorage();
