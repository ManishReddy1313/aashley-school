import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { 
  insertAdmissionEnquirySchema, 
  insertAlumniSchema, 
  insertContactMessageSchema,
  insertAnnouncementSchema,
  insertEventSchema,
  insertGalleryItemSchema,
  insertResourceSchema,
  insertGrowthStorySchema,
  insertJobPostingSchema,
  insertJobApplicationSchema
} from "@shared/schema";
import { z } from "zod";
import { sendContactFormEmail, sendAdmissionEnquiryEmail } from "./mail";

const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const user = (req.session as any)?.user || (req as any).user;
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }

  if (user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Setup authentication FIRST
  await setupAuth(app);
  registerAuthRoutes(app);

  // ============ PUBLIC API ROUTES ============

  // Admission Enquiries – direct mail send (no DB)
  app.post("/api/admission-enquiries", async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const normalized = {
        studentName: String(body.studentName ?? ""),
        parentName: String(body.parentName ?? ""),
        email: String(body.email ?? ""),
        phone: String(body.phone ?? ""),
        grade: String(body.grade ?? ""),
        message: body.message === "" || body.message == null ? undefined : String(body.message),
      };
      const data = insertAdmissionEnquirySchema.parse(normalized);
      await sendAdmissionEnquiryEmail({
        studentName: data.studentName,
        parentName: data.parentName,
        email: data.email,
        phone: data.phone ?? "",
        grade: data.grade,
        message: data.message ?? undefined,
      });
      res.status(200).json({ success: true, message: "Enquiry sent successfully." });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const msg = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        return res.status(400).json({ message: msg });
      }
      console.error("[api] Admission enquiry email failed:", error?.message, error?.code);
      res.status(500).json({ message: error?.message || "Failed to send enquiry. Please try again." });
    }
  });

  // Alumni Registration
  app.post("/api/alumni", async (req, res) => {
    try {
      const data = insertAlumniSchema.parse(req.body);
      const alumni = await storage.createAlumni(data);
      res.status(201).json(alumni);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Contact – direct mail send (no DB)
  app.post("/api/contact", async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const normalized = {
        name: body.name ?? "",
        email: body.email ?? "",
        phone: body.phone === "" || body.phone == null ? undefined : String(body.phone),
        subject: body.subject ?? "",
        message: body.message ?? "",
      };
      const data = insertContactMessageSchema.parse(normalized);
      await sendContactFormEmail({
        ...data,
        phone: data.phone ?? undefined,
      });
      res.status(200).json({ success: true, message: "Message sent successfully." });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const msg = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join("; ");
        return res.status(400).json({ message: msg });
      }
      console.error("[api] Contact form email failed:", error?.message, error?.code);
      res.status(500).json({ message: error?.message || "Failed to send message. Please try again." });
    }
  });

  // Public Events
  app.get("/api/events", async (_req, res) => {
    try {
      const events = await storage.getPublicEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch events" });
    }
  });

  // Public Gallery
  app.get("/api/gallery", async (_req, res) => {
    try {
      const items = await storage.getGalleryItems();
      res.json(items);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch gallery" });
    }
  });

  // Public Growth Stories
  app.get("/api/growth-stories", async (_req, res) => {
    try {
      const stories = await storage.getPublishedGrowthStories();
      res.json(stories);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch stories" });
    }
  });

  // Public Alumni Stories
  app.get("/api/alumni/approved", async (_req, res) => {
    try {
      const alumni = await storage.getApprovedAlumni();
      res.json(alumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch alumni" });
    }
  });

  // Public Job Postings
  app.get("/api/careers", async (_req, res) => {
    try {
      const jobs = await storage.getActiveJobPostings();
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch job postings" });
    }
  });

  // Job Application Submission
  app.post("/api/careers/apply", async (req, res) => {
    try {
      const data = insertJobApplicationSchema.parse(req.body);
      const application = await storage.createJobApplication(data);
      res.status(201).json(application);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // ============ PROTECTED PORTAL ROUTES ============

  // Announcements for logged-in users
  app.get("/api/portal/announcements", isAuthenticated, async (_req, res) => {
    try {
      const announcements = await storage.getActiveAnnouncements();
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch announcements" });
    }
  });

  // Resources for logged-in users
  app.get("/api/portal/resources", isAuthenticated, async (_req, res) => {
    try {
      const resources = await storage.getResources();
      res.json(resources);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch resources" });
    }
  });

  // Upcoming events for logged-in users
  app.get("/api/portal/events", isAuthenticated, async (_req, res) => {
    try {
      const events = await storage.getPublicEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch events" });
    }
  });

  // ============ ADMIN ROUTES (Role-protected) ============

  // Admin: Create Announcement
  app.post("/api/admin/announcements", isAdmin, async (req, res) => {
    try {
      const data = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(data);
      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Event
  app.post("/api/admin/events", isAdmin, async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Gallery Item
  app.post("/api/admin/gallery", isAdmin, async (req, res) => {
    try {
      const data = insertGalleryItemSchema.parse(req.body);
      const item = await storage.createGalleryItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Resource
  app.post("/api/admin/resources", isAdmin, async (req, res) => {
    try {
      const data = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(data);
      res.status(201).json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Growth Story
  app.post("/api/admin/growth-stories", isAdmin, async (req, res) => {
    try {
      const data = insertGrowthStorySchema.parse(req.body);
      const story = await storage.createGrowthStory(data);
      res.status(201).json(story);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Get all admission enquiries
  app.get("/api/admin/admission-enquiries", isAdmin, async (_req, res) => {
    try {
      const enquiries = await storage.getAdmissionEnquiries();
      res.json(enquiries);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch enquiries" });
    }
  });

  // Admin: Get all contact messages
  app.get("/api/admin/contact-messages", isAdmin, async (_req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch messages" });
    }
  });

  // Admin: Get all alumni (including pending)
  app.get("/api/admin/alumni", isAdmin, async (_req, res) => {
    try {
      const alumni = await storage.getAllAlumni();
      res.json(alumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch alumni" });
    }
  });

  // Admin: Create Job Posting
  app.post("/api/admin/careers", isAdmin, async (req, res) => {
    try {
      const data = insertJobPostingSchema.parse(req.body);
      const posting = await storage.createJobPosting(data);
      res.status(201).json(posting);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Get all job postings
  app.get("/api/admin/careers", isAdmin, async (_req, res) => {
    try {
      const postings = await storage.getAllJobPostings();
      res.json(postings);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch job postings" });
    }
  });

  // Admin: Get all job applications
  app.get("/api/admin/applications", isAdmin, async (_req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch applications" });
    }
  });

  return httpServer;
}
