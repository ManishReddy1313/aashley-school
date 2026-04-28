# Full Raw Content Dump

## 1) `server/routes.ts`

```ts
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
  insertJobApplicationSchema,
  insertClassSchema,
  assignClassTeachersSchema,
  assignClassStudentsSchema
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { sendContactFormEmail, sendAdmissionEnquiryEmail } from "./services/emailService";
import { authStorage } from "./replit_integrations/auth/storage";
import { type PermissionKey, PERMISSION_KEYS, isPermissionKey, normalizeRole } from "@shared/authz";
import { ensureCanAssignRole, ensureCanManageUser, getRole, requirePermission } from "./authz";

const getAuthUser = (req: Request) => {
  const user = ((req.session as any)?.user || (req as any).user) as any;
  if (!user) return null;
  return { ...user, role: getRole(user) };
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

      try {
        await storage.createAdmissionEnquiry(data);
      } catch (dbErr) {
        console.error("[api] Failed to save admission enquiry to database:", dbErr);
      }

      try {
        await sendAdmissionEnquiryEmail({
          studentName: data.studentName,
          parentName: data.parentName,
          email: data.email,
          phone: data.phone ?? "",
          grade: data.grade,
          message: data.message ?? undefined,
        });
      } catch (emailErr) {
        console.error("[api] Admission enquiry email failed, but lead was saved to file:", emailErr);
      }

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

      try {
        await storage.createContactMessage(data);
      } catch (dbErr) {
        console.error("[api] Failed to save contact message to database:", dbErr);
      }

      try {
        await sendContactFormEmail({
          ...data,
          phone: data.phone ?? undefined,
        });
      } catch (emailErr) {
        console.error("[api] Contact form email failed, but lead was saved to file:", emailErr);
      }

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
  app.get("/api/portal/announcements", isAuthenticated, requirePermission("portal.read"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      const announcements = await storage.getActiveAnnouncements(user ? [user.role] : []);
      res.json(announcements);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch announcements" });
    }
  });

  // Resources for logged-in users
  app.get("/api/portal/resources", isAuthenticated, requirePermission("portal.read"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      const resources = await storage.getResources(user ? [user.role] : []);
      res.json(resources);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch resources" });
    }
  });

  // Upcoming events for logged-in users
  app.get("/api/portal/events", isAuthenticated, requirePermission("portal.read"), async (_req, res) => {
    try {
      const events = await storage.getPublicEvents();
      res.json(events);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch events" });
    }
  });

  // ============ ADMIN ROUTES (Role-protected) ============

  // Admin: Create Announcement
  app.post("/api/admin/announcements", isAuthenticated, requirePermission("content.create"), async (req, res) => {
    try {
      const data = insertAnnouncementSchema.parse(req.body);
      const announcement = await storage.createAnnouncement(data);
      res.status(201).json(announcement);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Portal User
  app.post("/api/admin/users", isAuthenticated, requirePermission("users.create"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const body = req.body as Record<string, unknown>;
      const username = String(body.username ?? "").trim();
      const password = String(body.password ?? "");
      const email = body.email ? String(body.email).trim() : null;
      const firstName = body.firstName ? String(body.firstName).trim() : null;
      const lastName = body.lastName ? String(body.lastName).trim() : null;
      const role = normalizeRole(body.role ? String(body.role) : "student");

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (!ensureCanAssignRole(actor.role, role)) {
        return res.status(403).json({ message: "You are not allowed to assign this role" });
      }

      const existing = await authStorage.getUserByUsername(username);
      if (existing) {
        return res.status(409).json({ message: "Username already exists" });
      }

      if (email) {
        const existingEmail = await authStorage.getUserByEmail(email);
        if (existingEmail) {
          return res.status(409).json({ message: "Email already registered" });
        }
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = await authStorage.createUser({
        username,
        password: hashedPassword,
        email,
        firstName,
        lastName,
        role,
      });

      const { password: _password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create user" });
    }
  });

  // Admin: List users
  app.get("/api/admin/users", isAuthenticated, requirePermission("users.read"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const users = await storage.getUsers();
      const visibleUsers = users
        .map((user: any) => ({ ...user, role: normalizeRole(user.role) }))
        .filter((user: any) => ensureCanManageUser(actor.role, user.role))
        .map((user: any) => {
          const { password: _password, ...safeUser } = user;
          return safeUser;
        });

      res.json(visibleUsers);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch users" });
    }
  });

  // Admin: Update user role
  app.patch("/api/admin/users/:id/role", isAuthenticated, requirePermission("roles.assign"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const target = await authStorage.getUser(req.params.id);
      if (!target) return res.status(404).json({ message: "User not found" });

      const actorRole = actor.role;
      const targetCurrentRole = normalizeRole(target.role);
      const nextRole = normalizeRole((req.body as Record<string, unknown>)?.role as string);

      if (!ensureCanManageUser(actorRole, targetCurrentRole) || !ensureCanAssignRole(actorRole, nextRole)) {
        return res.status(403).json({ message: "You are not allowed to modify this user role" });
      }

      const updated = await storage.updateUserById(req.params.id, { role: nextRole });
      if (!updated) return res.status(404).json({ message: "User not found" });

      const { password: _password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update role" });
    }
  });

  // Admin: Update user permission overrides
  app.patch("/api/admin/users/:id/permissions", isAuthenticated, requirePermission("permissions.assign"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const target = await authStorage.getUser(req.params.id);
      if (!target) return res.status(404).json({ message: "User not found" });

      const targetCurrentRole = normalizeRole(target.role);
      if (!ensureCanManageUser(actor.role, targetCurrentRole)) {
        return res.status(403).json({ message: "You are not allowed to modify this user" });
      }

      const body = req.body as Record<string, unknown>;
      const grants = Array.isArray(body.permissionGrants) ? body.permissionGrants.map(String).filter(isPermissionKey) : [];
      const revokes = Array.isArray(body.permissionRevokes) ? body.permissionRevokes.map(String).filter(isPermissionKey) : [];

      const updated = await storage.updateUserById(req.params.id, {
        permissionGrants: grants,
        permissionRevokes: revokes,
      });
      if (!updated) return res.status(404).json({ message: "User not found" });

      const { password: _password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update permissions" });
    }
  });

  // Admin: Update any user fields (SuperAdmin full control, Admin scoped)
  app.patch("/api/admin/users/:id", isAuthenticated, requirePermission("users.update"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const target = await authStorage.getUser(req.params.id);
      if (!target) return res.status(404).json({ message: "User not found" });

      const targetRole = normalizeRole(target.role);
      if (!ensureCanManageUser(actor.role, targetRole)) {
        return res.status(403).json({ message: "You are not allowed to modify this user" });
      }

      const body = req.body as Record<string, unknown>;
      const updates: Record<string, unknown> = {};

      if (typeof body.username === "string") updates.username = body.username.trim();
      if (body.email === null || typeof body.email === "string") updates.email = body.email ? String(body.email).trim() : null;
      if (body.firstName === null || typeof body.firstName === "string") updates.firstName = body.firstName ? String(body.firstName).trim() : null;
      if (body.lastName === null || typeof body.lastName === "string") updates.lastName = body.lastName ? String(body.lastName).trim() : null;
      if (typeof body.profileImageUrl === "string" || body.profileImageUrl === null) {
        updates.profileImageUrl = body.profileImageUrl ? String(body.profileImageUrl).trim() : null;
      }

      if (body.role && typeof body.role === "string") {
        const nextRole = normalizeRole(body.role);
        if (!ensureCanAssignRole(actor.role, nextRole)) {
          return res.status(403).json({ message: "You are not allowed to assign this role" });
        }
        updates.role = nextRole;
      }

      if (body.password && typeof body.password === "string") {
        if (actor.role !== "super_admin") {
          return res.status(403).json({ message: "Only Super Admin can reset passwords here" });
        }
        updates.password = await bcrypt.hash(body.password, 10);
      }

      if (Array.isArray(body.permissionGrants) && actor.role === "super_admin") {
        updates.permissionGrants = body.permissionGrants.map(String).filter(isPermissionKey);
      }
      if (Array.isArray(body.permissionRevokes) && actor.role === "super_admin") {
        updates.permissionRevokes = body.permissionRevokes.map(String).filter(isPermissionKey);
      }

      const updated = await storage.updateUserById(req.params.id, updates);
      if (!updated) return res.status(404).json({ message: "User not found" });

      const { password: _password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update user" });
    }
  });

  app.get("/api/admin/permissions/catalog", isAuthenticated, requirePermission("users.read"), async (_req, res) => {
    res.json({ permissions: PERMISSION_KEYS });
  });

  // Classes: create/list/assignments
  app.get("/api/admin/classes", isAuthenticated, requirePermission("classes.manage"), async (_req, res) => {
    try {
      const data = await storage.getClasses();
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch classes" });
    }
  });

  app.post("/api/admin/classes", isAuthenticated, requirePermission("classes.manage"), async (req, res) => {
    try {
      const data = insertClassSchema.parse(req.body);
      const created = await storage.createClass(data);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.put("/api/admin/classes/:classId/teachers", isAuthenticated, requirePermission("classes.manage"), async (req, res) => {
    try {
      const parsed = assignClassTeachersSchema.parse(req.body);
      const teacherUserIds = parsed.teacherUserIds;
      for (const teacherId of teacherUserIds) {
        const teacher = await storage.getUserById(teacherId);
        if (!teacher || normalizeRole(teacher.role) !== "staff") {
          return res.status(400).json({ message: `Invalid teacher user: ${teacherId}` });
        }
      }
      await storage.replaceClassTeachers(req.params.classId, teacherUserIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.put("/api/admin/classes/:classId/students", isAuthenticated, requirePermission("classes.manage"), async (req, res) => {
    try {
      const parsed = assignClassStudentsSchema.parse(req.body);
      const studentUserIds = parsed.studentUserIds;
      for (const studentId of studentUserIds) {
        const student = await storage.getUserById(studentId);
        if (!student || normalizeRole(student.role) !== "student") {
          return res.status(400).json({ message: `Invalid student user: ${studentId}` });
        }
      }
      await storage.replaceClassStudents(req.params.classId, studentUserIds);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.get("/api/admin/classes/:classId/assignments", isAuthenticated, requirePermission("classes.manage"), async (req, res) => {
    try {
      const [teacherUserIds, studentUserIds] = await Promise.all([
        storage.getClassTeacherUserIds(req.params.classId),
        storage.getClassStudentUserIds(req.params.classId),
      ]);
      res.json({ teacherUserIds, studentUserIds });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch class assignments" });
    }
  });

  // Teacher scoped access
  app.get("/api/teacher/classes/me", isAuthenticated, requirePermission("students.read"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });
      const classIds = await storage.getTeacherClassIds(actor.id);
      const classRows = await storage.getClassesByIds(classIds);
      res.json({
        classIds,
        classes: classRows.map((cls) => ({
          id: cls.id,
          name: cls.name,
          section: cls.section,
          academicYear: cls.academicYear,
        })),
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch classes" });
    }
  });

  app.get("/api/teacher/students/me", isAuthenticated, requirePermission("students.read"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });
      const classIds = await storage.getTeacherClassIds(actor.id);
      const students = await storage.getStudentsForTeacher(actor.id);
      const links = await storage.getClassStudentLinks(classIds);
      const classIdsByStudentId = links.reduce<Record<string, string[]>>((acc, link) => {
        if (!acc[link.studentUserId]) acc[link.studentUserId] = [];
        acc[link.studentUserId].push(link.classId);
        return acc;
      }, {});
      const safeStudents = students.map((student: any) => {
        const { password: _password, ...safeUser } = student;
        return {
          ...safeUser,
          classIds: classIdsByStudentId[safeUser.id] || [],
        };
      });
      res.json(safeStudents);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch students" });
    }
  });

  app.patch("/api/teacher/students/:id", isAuthenticated, requirePermission("students.update"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const target = await storage.getUserById(req.params.id);
      if (!target || normalizeRole(target.role) !== "student") {
        return res.status(404).json({ message: "Student not found" });
      }

      // SuperAdmin/Admin can edit any student. Staff only if shared class exists.
      if (actor.role === "staff") {
        const teacherClassIds = await storage.getTeacherClassIds(actor.id);
        const studentClassIds = await storage.getStudentClassIds(req.params.id);
        const hasSharedClass = teacherClassIds.some((id) => studentClassIds.includes(id));
        if (!hasSharedClass) {
          return res.status(403).json({ message: "You can only edit students in your assigned classes" });
        }
      }

      const body = req.body as Record<string, unknown>;
      const updates: Record<string, unknown> = {};
      if (body.firstName === null || typeof body.firstName === "string") updates.firstName = body.firstName ? String(body.firstName).trim() : null;
      if (body.lastName === null || typeof body.lastName === "string") updates.lastName = body.lastName ? String(body.lastName).trim() : null;
      if (body.email === null || typeof body.email === "string") updates.email = body.email ? String(body.email).trim() : null;
      if (typeof body.profileImageUrl === "string" || body.profileImageUrl === null) {
        updates.profileImageUrl = body.profileImageUrl ? String(body.profileImageUrl).trim() : null;
      }

      const updated = await storage.updateUserById(req.params.id, updates);
      if (!updated) return res.status(404).json({ message: "Student not found" });
      const { password: _password, ...safeUser } = updated;
      res.json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to update student" });
    }
  });

  // Admin: Create Event
  app.post("/api/admin/events", isAuthenticated, requirePermission("content.create"), async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Gallery Item
  app.post("/api/admin/gallery", isAuthenticated, requirePermission("content.create"), async (req, res) => {
    try {
      const data = insertGalleryItemSchema.parse(req.body);
      const item = await storage.createGalleryItem(data);
      res.status(201).json(item);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Resource
  app.post("/api/admin/resources", isAuthenticated, requirePermission("content.create"), async (req, res) => {
    try {
      const data = insertResourceSchema.parse(req.body);
      const resource = await storage.createResource(data);
      res.status(201).json(resource);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Growth Story
  app.post("/api/admin/growth-stories", isAuthenticated, requirePermission("content.create"), async (req, res) => {
    try {
      const data = insertGrowthStorySchema.parse(req.body);
      const story = await storage.createGrowthStory(data);
      res.status(201).json(story);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Get all admission enquiries
  app.get("/api/admin/admission-enquiries", isAuthenticated, requirePermission("admissions.read"), async (_req, res) => {
    try {
      const enquiries = await storage.getAdmissionEnquiries();
      res.json(enquiries);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch enquiries" });
    }
  });

  // Admin: Get all contact messages
  app.get("/api/admin/contact-messages", isAuthenticated, requirePermission("messages.read"), async (_req, res) => {
    try {
      const messages = await storage.getContactMessages();
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch messages" });
    }
  });

  // Admin: Get all alumni (including pending)
  app.get("/api/admin/alumni", isAuthenticated, requirePermission("content.create"), async (_req, res) => {
    try {
      const alumni = await storage.getAllAlumni();
      res.json(alumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch alumni" });
    }
  });

  // Admin: Create Job Posting
  app.post("/api/admin/careers", isAuthenticated, requirePermission("careers.manage"), async (req, res) => {
    try {
      const data = insertJobPostingSchema.parse(req.body);
      const posting = await storage.createJobPosting(data);
      res.status(201).json(posting);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Get all job postings
  app.get("/api/admin/careers", isAuthenticated, requirePermission("careers.manage"), async (_req, res) => {
    try {
      const postings = await storage.getAllJobPostings();
      res.json(postings);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch job postings" });
    }
  });

  // Admin: Get all job applications
  app.get("/api/admin/applications", isAuthenticated, requirePermission("careers.manage"), async (_req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch applications" });
    }
  });

  return httpServer;
}
```

## 2) `shared/schema.ts`

```ts
import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";

// Portal Users with roles (extends auth users)
export const portalUsers = pgTable("portal_users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  role: varchar("role", { length: 20 }).notNull().default("student"),
  studentId: varchar("student_id"),
  parentId: varchar("parent_id"),
  staffId: varchar("staff_id"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPortalUserSchema = createInsertSchema(portalUsers).omit({ id: true, createdAt: true });
export type InsertPortalUser = z.infer<typeof insertPortalUserSchema>;
export type PortalUser = typeof portalUsers.$inferSelect;

// Academic Classes
export const classes = pgTable("classes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name", { length: 100 }).notNull().unique(),
  section: varchar("section", { length: 20 }),
  academicYear: varchar("academic_year", { length: 20 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

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

// Announcements / Circulars
export const announcements = pgTable("announcements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  content: text("content").notNull(),
  priority: varchar("priority", { length: 20 }).notNull().default("normal"),
  targetRoles: text("target_roles").array().notNull().default(sql`ARRAY['student', 'staff', 'admin', 'super_admin']`),
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
  targetRoles: text("target_roles").array().notNull().default(sql`ARRAY['student', 'staff', 'admin', 'super_admin']`),
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
```

## 3) `shared/authz.ts`

```ts
export const ROLE_KEYS = ["super_admin", "admin", "staff", "student"] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSION_KEYS = [
  "users.read",
  "users.create",
  "users.update",
  "roles.assign",
  "permissions.assign",
  "content.create",
  "content.publish",
  "messages.read",
  "admissions.read",
  "careers.manage",
  "portal.read",
  "classes.manage",
  "students.read",
  "students.update",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const ROLE_LEVEL: Record<RoleKey, number> = {
  student: 1,
  staff: 2,
  admin: 3,
  super_admin: 4,
};

const ALL_PERMISSIONS = [...PERMISSION_KEYS] as PermissionKey[];

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  student: ["portal.read"],
  staff: ["portal.read", "content.create"],
  admin: [
    "portal.read",
    "users.read",
    "users.create",
    "users.update",
    "content.create",
    "content.publish",
    "messages.read",
    "admissions.read",
    "careers.manage",
    "classes.manage",
    "students.read",
    "students.update",
  ],
  super_admin: ALL_PERMISSIONS,
};

const LEGACY_ROLE_MAP: Record<string, RoleKey> = {
  admin: "admin",
  teacher: "staff",
  parent: "student",
  student: "student",
  staff: "staff",
  super_admin: "super_admin",
};

export function normalizeRole(input: string | null | undefined): RoleKey {
  if (!input) return "student";
  const value = String(input).trim().toLowerCase();
  return LEGACY_ROLE_MAP[value] ?? "student";
}

export function canAssignRole(actorRole: RoleKey, targetRole: RoleKey): boolean {
  if (actorRole === "super_admin") return true;
  if (actorRole === "admin") return targetRole === "staff" || targetRole === "student";
  return false;
}

export function canManageUserRole(actorRole: RoleKey, targetCurrentRole: RoleKey): boolean {
  if (actorRole === "super_admin") return true;
  if (actorRole === "admin") return targetCurrentRole === "staff" || targetCurrentRole === "student";
  return false;
}

export function hasRoleAtLeast(currentRole: RoleKey, minRole: RoleKey): boolean {
  return ROLE_LEVEL[currentRole] >= ROLE_LEVEL[minRole];
}

export function resolveEffectivePermissions(params: {
  role: RoleKey;
  permissionGrants?: string[] | null;
  permissionRevokes?: string[] | null;
}): Set<PermissionKey> {
  const defaults = ROLE_DEFAULT_PERMISSIONS[params.role] ?? [];
  const grants = (params.permissionGrants ?? []).filter(isPermissionKey);
  const revokes = new Set((params.permissionRevokes ?? []).filter(isPermissionKey));

  const resolved = new Set<PermissionKey>([...defaults, ...grants]);
  for (const permission of Array.from(revokes)) {
    resolved.delete(permission);
  }
  return resolved;
}

export function isRoleKey(input: string): input is RoleKey {
  return ROLE_KEYS.includes(input as RoleKey);
}

export function isPermissionKey(input: string): input is PermissionKey {
  return PERMISSION_KEYS.includes(input as PermissionKey);
}
```

## 4) `server/storage.ts`

```ts
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
```

## 5) `server/authz.ts`

```ts
import type { NextFunction, Request, Response } from "express";
import type { User } from "@shared/models/auth";
import {
  type PermissionKey,
  type RoleKey,
  canAssignRole,
  canManageUserRole,
  hasRoleAtLeast,
  normalizeRole,
  resolveEffectivePermissions,
} from "@shared/authz";

export type SessionUser = Omit<User, "password"> & { effectivePermissions?: PermissionKey[] };

function getSessionUser(req: Request): SessionUser | null {
  return ((req.session as any)?.user || (req as any).user || null) as SessionUser | null;
}

export function requireAuthenticated(req: Request, res: Response, next: NextFunction) {
  const user = getSessionUser(req);
  if (!user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  (req as any).user = user;
  next();
}

export function getRole(user: Pick<SessionUser, "role">): RoleKey {
  return normalizeRole(user.role);
}

export function getEffectivePermissions(user: SessionUser): Set<PermissionKey> {
  return resolveEffectivePermissions({
    role: getRole(user),
    permissionGrants: user.permissionGrants as string[] | undefined,
    permissionRevokes: user.permissionRevokes as string[] | undefined,
  });
}

export function requireRole(minRole: RoleKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    if (!hasRoleAtLeast(getRole(user), minRole)) {
      return res.status(403).json({ message: "Insufficient role" });
    }
    (req as any).user = user;
    next();
  };
}

export function requirePermission(permission: PermissionKey) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ message: "Not authenticated" });

    const effective = getEffectivePermissions(user);
    if (!effective.has(permission)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    (req as any).user = { ...user, effectivePermissions: Array.from(effective) };
    next();
  };
}

export function ensureCanAssignRole(actorRole: RoleKey, targetRole: RoleKey): boolean {
  return canAssignRole(actorRole, targetRole);
}

export function ensureCanManageUser(actorRole: RoleKey, targetCurrentRole: RoleKey): boolean {
  return canManageUserRole(actorRole, targetCurrentRole);
}
```

## 6) `client/src/pages/portal/dashboard.tsx`

```tsx
import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Announcement, Event, Resource } from "@shared/schema";
import {
  GraduationCap,
  LogOut,
  Bell,
  Calendar,
  FileText,
  CreditCard,
  Clock,
  Users,
  BookOpen,
  Settings,
  ChevronRight,
  AlertCircle,
  Download,
  Home,
  ShieldCheck,
  BarChart3,
  Briefcase,
  MessageSquare,
  UserCog,
  Megaphone
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

export default function PortalDashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout, isAdmin, isSuperAdmin, isStaff, can } = useAuth();
  const [, setLocation] = useLocation();
  const isAdminRole = !!(isAdmin || isSuperAdmin);
  const isTeacherRole = !!(isStaff && can("students.read"));

  // Fetch announcements
  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/portal/announcements"],
    enabled: isAuthenticated,
  });

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/portal/events"],
    enabled: isAuthenticated,
  });

  // Fetch resources
  const { data: resources, isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/portal/resources"],
    enabled: isAuthenticated,
  });

  const { data: adminUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdminRole,
  });

  const { data: admissionEnquiries } = useQuery<any[]>({
    queryKey: ["/api/admin/admission-enquiries"],
    enabled: isAuthenticated && isAdminRole,
  });

  const { data: contactMessages } = useQuery<any[]>({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAuthenticated && isAdminRole,
  });

  const { data: jobApplications } = useQuery<any[]>({
    queryKey: ["/api/admin/applications"],
    enabled: isAuthenticated && isAdminRole,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/portal");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userInitials = user?.firstName && user?.lastName
    ? `${user.firstName[0]}${user.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";
  const roleLabel = (user?.role || "student").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  // Calculate days left for events
  const upcomingEventsWithDays = events?.slice(0, 3).map(event => ({
    ...event,
    daysLeft: differenceInDays(new Date(event.eventDate), new Date()),
    formattedDate: format(new Date(event.eventDate), "MMM d"),
  })) || [];

  // Fallback data for demo purposes
  const displayAnnouncements = announcements?.length ? announcements : [
    { id: 1, title: "Term 2 Examination Schedule Released", priority: "high", createdAt: new Date() },
    { id: 2, title: "Fee Payment Deadline: Jan 10, 2025", priority: "high", createdAt: new Date() },
    { id: 3, title: "Winter Vacation: Dec 25 - Jan 5", priority: "normal", createdAt: new Date() },
    { id: 4, title: "Parent-Teacher Meeting on Jan 20", priority: "normal", createdAt: new Date() },
  ];

  const displayEvents = upcomingEventsWithDays.length ? upcomingEventsWithDays : [
    { title: "Term 2 Exams Begin", daysLeft: 18, formattedDate: "Jan 15" },
    { title: "Annual Day Rehearsals", daysLeft: 13, formattedDate: "Jan 10" },
    { title: "Science Exhibition", daysLeft: 39, formattedDate: "Feb 5" },
  ];

  const displayResources = resources?.slice(0, 4) || [
    { id: 1, title: "Term 2 Exam Schedule", fileType: "PDF", category: "Exam" },
    { id: 2, title: "Fee Structure 2024-25", fileType: "PDF", category: "Accounts" },
    { id: 3, title: "Holiday List", fileType: "PDF", category: "Calendar" },
    { id: 4, title: "Bus Route Map", fileType: "PDF", category: "Transport" },
  ];

  const adminStats = [
    {
      label: "Total Users",
      value: String(adminUsers?.length ?? 0),
      icon: UserCog,
      color: "text-primary",
    },
    {
      label: "Admissions",
      value: String(admissionEnquiries?.length ?? 0),
      icon: Users,
      color: "text-amber-600",
    },
    {
      label: "Contact Messages",
      value: String(contactMessages?.length ?? 0),
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      label: "Applications",
      value: String(jobApplications?.length ?? 0),
      icon: Briefcase,
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        {/* Live Ticker */}
        <div className="bg-accent py-2 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex-shrink-0" data-testid="badge-live-updates">
                <Bell className="h-3 w-3 mr-1" />
                Live Updates
              </Badge>
              <div className="flex gap-8 animate-scroll whitespace-nowrap">
                {displayAnnouncements.map((ann: any) => (
                  <span key={ann.id} className="text-sm text-accent-foreground flex items-center gap-2" data-testid={`ticker-announcement-${ann.id}`}>
                    {ann.priority === "high" && <AlertCircle className="h-3 w-3 text-destructive" />}
                    {ann.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold">Aashley Portal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-back-to-website">
                  <Home className="h-4 w-4 mr-2" />
                  Website
                </Button>
              </Link>
              <ThemeToggle />
              <div className="flex items-center gap-2" data-testid="user-info">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-sm">
                  <div className="font-medium" data-testid="text-user-name">{user?.firstName || user?.email}</div>
                  <Badge variant="secondary" data-testid="badge-user-role">{roleLabel}</Badge>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            {isAdminRole
              ? "Manage operations, users, and communications from one place."
              : "Here's what's happening at Aashley today."}
          </p>
        </div>

        {isAdminRole ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Admin Overview
                  </CardTitle>
                  <CardDescription>
                    Dynamic role-based view for {roleLabel}
                  </CardDescription>
                </div>
                <Badge variant="secondary" data-testid="badge-dashboard-role">
                  {isSuperAdmin ? "Super Admin Access" : "Admin Access"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {adminStats.map((stat) => (
                    <Card key={stat.label} data-testid={`admin-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                      <CardContent className="p-4 text-center">
                        <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    User Management
                  </CardTitle>
                  <CardDescription>Create users and assign roles/permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/portal/admin/users">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-admin-manage-users">
                      Manage Users
                    </Button>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {isSuperAdmin
                      ? "You can manage all roles including Super Admin."
                      : "You can manage Staff and Student accounts."}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Content Management
                  </CardTitle>
                  <CardDescription>Announcements, resources, events, and stories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-admin-manage-content">
                    Create or Publish Content
                  </Button>
                  <Link href="/portal/admin/classes">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-admin-manage-classes">
                      Manage Classes
                    </Button>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    Use admin APIs to manage content by role visibility.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Admissions
                  </CardTitle>
                  <CardDescription>Review admission enquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1" data-testid="text-admin-admissions-count">
                    {admissionEnquiries?.length ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending and recent records</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Contact Inbox
                  </CardTitle>
                  <CardDescription>Monitor incoming contact messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1" data-testid="text-admin-contact-count">
                    {contactMessages?.length ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">All website contact submissions</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Dashboard loads dynamically based on your role and permissions.</p>
                <p>Super Admin has full access; Admin has scoped user-management controls.</p>
              </CardContent>
            </Card>
          </div>
        ) : isTeacherRole ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teacher Workspace
              </CardTitle>
              <CardDescription>
                Manage students assigned to your classes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portal/teacher/students">
                <Button variant="outline" className="w-full justify-start" data-testid="button-teacher-manage-students">
                  Manage My Students
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Access is limited to students in your assigned classes.
              </p>
            </CardContent>
          </Card>
        </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Announcements & Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Announcements
                  </CardTitle>
                  <CardDescription>Important updates and circulars</CardDescription>
                </div>
                <Button variant="ghost" size="sm" data-testid="button-view-all-announcements">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayAnnouncements.map((ann: any) => (
                      <div
                        key={ann.id}
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                        data-testid={`announcement-${ann.id}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          ann.priority === "high" ? "bg-destructive" : "bg-muted-foreground"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{ann.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {ann.createdAt ? formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true }) : "Recently"}
                          </div>
                        </div>
                        {ann.priority === "high" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {displayEvents.map((event: any, index: number) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg bg-muted/50 text-center"
                        data-testid={`event-${index}`}
                      >
                        <div className="text-3xl font-bold text-primary mb-1">{event.daysLeft}</div>
                        <div className="text-sm text-muted-foreground mb-2">days left</div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.formattedDate}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: "Attendance", value: "95%", color: "text-green-600" },
                { icon: FileText, label: "Assignments", value: "3 Due", color: "text-amber-600" },
                { icon: CreditCard, label: "Fee Status", value: "Paid", color: "text-green-600" },
                { icon: Clock, label: "Next Class", value: "Math", color: "text-primary" },
              ].map((stat, index) => (
                <Card key={index} data-testid={`stat-${index}`}>
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Resources & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Calendar, label: "Exam Schedule" },
                    { icon: CreditCard, label: "Fee Details" },
                    { icon: FileText, label: "Circulars" },
                    { icon: Users, label: "PTM Schedule" },
                  ].map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      data-testid={`action-${index}`}
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Downloadable Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayResources.map((resource: any, index: number) => (
                      <div
                        key={resource.id || index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                        data-testid={`resource-${index}`}
                      >
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{resource.title}</div>
                          <div className="text-xs text-muted-foreground">{resource.fileType || "PDF"}</div>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm opacity-80 mb-4">
                  Contact the school office for any queries.
                </p>
                <Button variant="secondary" size="sm" className="bg-accent text-accent-foreground" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
```

## 7) `client/src/pages/portal/manage-users.tsx`

```tsx
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, UserCog } from "lucide-react";

type UserRow = {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  permissionGrants?: string[];
  permissionRevokes?: string[];
};

const roleOptions = ["student", "staff", "admin", "super_admin"];

export default function ManageUsersPage() {
  const { user, isSuperAdmin, isAdmin, can } = useAuth();
  const queryClient = useQueryClient();
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "student",
  });
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("student");
  const [editDetails, setEditDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [grantPermissions, setGrantPermissions] = useState<string[]>([]);
  const [revokePermissions, setRevokePermissions] = useState<string[]>([]);

  const canView = isSuperAdmin || isAdmin || can("users.read");

  const usersQuery = useQuery<UserRow[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!canView,
  });
  const permissionsCatalogQuery = useQuery<{ permissions: string[] }>({
    queryKey: ["/api/admin/permissions/catalog"],
    enabled: !!canView,
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/users", {
        ...createForm,
        email: createForm.email || null,
        firstName: createForm.firstName || null,
        lastName: createForm.lastName || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateForm({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "student",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      if (!editUserId) return null;
      const res = await apiRequest("PATCH", `/api/admin/users/${editUserId}/role`, { role: editRole });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserId(null);
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editUserId) return null;
      const payload: Record<string, unknown> = {
        firstName: editDetails.firstName || null,
        lastName: editDetails.lastName || null,
        email: editDetails.email || null,
        role: editRole,
      };
      if (isSuperAdmin && editDetails.password) {
        payload.password = editDetails.password;
      }
      if (isSuperAdmin) {
        payload.permissionGrants = grantPermissions;
        payload.permissionRevokes = revokePermissions;
      }
      const res = await apiRequest("PATCH", `/api/admin/users/${editUserId}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditDetails({ firstName: "", lastName: "", email: "", password: "" });
    },
  });

  const visibleRoleOptions = useMemo(() => {
    if (isSuperAdmin) return roleOptions;
    return ["student", "staff"];
  }, [isSuperAdmin]);

  if (!canView) {
    return (
      <div className="min-h-screen container mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>You do not have permission to manage users.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <UserCog className="h-6 w-6 text-primary" />
            Manage Users
          </h1>
          <p className="text-muted-foreground text-sm">
            Signed in as {user?.role?.replace(/_/g, " ")}
          </p>
        </div>
        <Link href="/portal/dashboard">
          <Button variant="outline" data-testid="button-back-dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>Super Admin can create any role; Admin can create Staff/Student.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label>Username</Label>
            <Input value={createForm.username} onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Password</Label>
            <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <select
              className="w-full border rounded-md h-10 px-3 bg-background"
              value={createForm.role}
              onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
            >
              {visibleRoleOptions.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label>First Name</Label>
            <Input value={createForm.firstName} onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Last Name</Label>
            <Input value={createForm.lastName} onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
          </div>
          <div className="md:col-span-3">
            <Button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending} data-testid="button-create-user">
              {createUserMutation.isPending ? "Creating..." : "Create User"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(usersQuery.data || []).map((u) => (
              <div key={u.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div>
                  <div className="font-medium">{u.firstName || u.username} {u.lastName || ""}</div>
                  <div className="text-sm text-muted-foreground">{u.username} {u.email ? `• ${u.email}` : ""}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{u.role}</Badge>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditUserId(u.id);
                      setEditRole(u.role);
                      setEditDetails({
                        firstName: u.firstName || "",
                        lastName: u.lastName || "",
                        email: u.email || "",
                        password: "",
                      });
                      setGrantPermissions(u.permissionGrants || []);
                      setRevokePermissions(u.permissionRevokes || []);
                    }}
                    data-testid={`button-edit-role-${u.id}`}
                  >
                    Edit Role
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {editUserId && (
            <div className="mt-4 border rounded-lg p-4 space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Role</Label>
                  <select
                    className="border rounded-md h-10 px-3 bg-background w-full"
                    value={editRole}
                    onChange={(e) => setEditRole(e.target.value)}
                  >
                    {visibleRoleOptions.map((role) => (
                      <option key={role} value={role}>{role}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={editDetails.email} onChange={(e) => setEditDetails((p) => ({ ...p, email: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>First Name</Label>
                  <Input value={editDetails.firstName} onChange={(e) => setEditDetails((p) => ({ ...p, firstName: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <Label>Last Name</Label>
                  <Input value={editDetails.lastName} onChange={(e) => setEditDetails((p) => ({ ...p, lastName: e.target.value }))} />
                </div>
                {isSuperAdmin && (
                  <div className="space-y-2 md:col-span-2">
                    <Label>Reset Password (optional)</Label>
                    <Input
                      type="password"
                      value={editDetails.password}
                      onChange={(e) => setEditDetails((p) => ({ ...p, password: e.target.value }))}
                      placeholder="Leave blank to keep unchanged"
                    />
                  </div>
                )}
              </div>

              {isSuperAdmin && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-2 block">Permission Grants</Label>
                    <div className="space-y-1 max-h-44 overflow-auto border rounded-md p-2">
                      {(permissionsCatalogQuery.data?.permissions || []).map((perm) => (
                        <label key={`grant-${perm}`} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={grantPermissions.includes(perm)}
                            onChange={(e) =>
                              setGrantPermissions((prev) =>
                                e.target.checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                              )
                            }
                          />
                          <span>{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label className="mb-2 block">Permission Revokes</Label>
                    <div className="space-y-1 max-h-44 overflow-auto border rounded-md p-2">
                      {(permissionsCatalogQuery.data?.permissions || []).map((perm) => (
                        <label key={`revoke-${perm}`} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={revokePermissions.includes(perm)}
                            onChange={(e) =>
                              setRevokePermissions((prev) =>
                                e.target.checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                              )
                            }
                          />
                          <span>{perm}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Button onClick={() => updateRoleMutation.mutate()} disabled={updateRoleMutation.isPending} data-testid="button-save-role">
                  Save Role Only
                </Button>
                <Button onClick={() => updateUserMutation.mutate()} disabled={updateUserMutation.isPending} data-testid="button-save-user-all">
                  Save Full User
                </Button>
                <Button variant="ghost" onClick={() => setEditUserId(null)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
```

## 8) `client/src/pages/portal/manage-classes.tsx`

```tsx
import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, School } from "lucide-react";

type UserRow = { id: string; username: string; firstName: string | null; lastName: string | null; role: string };
type ClassRow = { id: string; name: string; section: string | null; academicYear: string; isActive: boolean };

export default function ManageClassesPage() {
  const queryClient = useQueryClient();
  const [createForm, setCreateForm] = useState({ name: "", section: "", academicYear: "2026-27" });
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const classesQuery = useQuery<ClassRow[]>({ queryKey: ["/api/admin/classes"] });
  const usersQuery = useQuery<UserRow[]>({ queryKey: ["/api/admin/users"] });
  const assignmentsQuery = useQuery<{ teacherUserIds: string[]; studentUserIds: string[] }>({
    queryKey: ["/api/admin/classes", selectedClassId, "assignments"],
    enabled: !!selectedClassId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/classes/${selectedClassId}/assignments`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load assignments");
      return res.json();
    },
  });

  const teacherOptions = useMemo(
    () => (usersQuery.data || []).filter((u) => u.role === "staff"),
    [usersQuery.data]
  );
  const studentOptions = useMemo(
    () => (usersQuery.data || []).filter((u) => u.role === "student"),
    [usersQuery.data]
  );

  const createClassMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/classes", {
        name: createForm.name,
        section: createForm.section || null,
        academicYear: createForm.academicYear,
        isActive: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/classes"] });
      setCreateForm({ name: "", section: "", academicYear: "2026-27" });
    },
  });

  const loadAssignments = async (classId: string) => {
    setSelectedClassId(classId);
    const res = await fetch(`/api/admin/classes/${classId}/assignments`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setSelectedTeachers(data.teacherUserIds || []);
    setSelectedStudents(data.studentUserIds || []);
  };

  const saveAssignmentsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassId) return;
      await apiRequest("PUT", `/api/admin/classes/${selectedClassId}/teachers`, { teacherUserIds: selectedTeachers });
      await apiRequest("PUT", `/api/admin/classes/${selectedClassId}/students`, { studentUserIds: selectedStudents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/classes", selectedClassId, "assignments"] });
    },
  });

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <School className="h-6 w-6 text-primary" />
          Manage Classes
        </h1>
        <Link href="/portal/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Class</CardTitle>
          <CardDescription>Admins can create classes and assign teachers/students.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-4 gap-3">
          <div className="space-y-2">
            <Label>Name</Label>
            <Input value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} placeholder="Grade 8" />
          </div>
          <div className="space-y-2">
            <Label>Section</Label>
            <Input value={createForm.section} onChange={(e) => setCreateForm((p) => ({ ...p, section: e.target.value }))} placeholder="A" />
          </div>
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Input value={createForm.academicYear} onChange={(e) => setCreateForm((p) => ({ ...p, academicYear: e.target.value }))} />
          </div>
          <div className="flex items-end">
            <Button onClick={() => createClassMutation.mutate()} disabled={createClassMutation.isPending}>
              {createClassMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Classes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {(classesQuery.data || []).map((cls) => (
            <div key={cls.id} className="border rounded-lg p-3 flex items-center justify-between">
              <div>
                <div className="font-medium">{cls.name} {cls.section || ""}</div>
                <div className="text-sm text-muted-foreground">{cls.academicYear}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{cls.isActive ? "Active" : "Inactive"}</Badge>
                <Button variant="outline" size="sm" onClick={() => loadAssignments(cls.id)}>
                  Manage Assignment
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>Assignments</CardTitle>
            <CardDescription>Assign multiple teachers and students to this class.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="mb-2 block">Teachers</Label>
              <div className="grid md:grid-cols-2 gap-2">
                {teacherOptions.map((t) => {
                  const checked = selectedTeachers.includes(t.id);
                  return (
                    <label key={t.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedTeachers((prev) => e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id));
                        }}
                      />
                      <span>{t.firstName || t.username} {t.lastName || ""}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Students</Label>
              <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-auto">
                {studentOptions.map((s) => {
                  const checked = selectedStudents.includes(s.id);
                  return (
                    <label key={s.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          setSelectedStudents((prev) => e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id));
                        }}
                      />
                      <span>{s.firstName || s.username} {s.lastName || ""}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <Button onClick={() => saveAssignmentsMutation.mutate()} disabled={saveAssignmentsMutation.isPending}>
              {saveAssignmentsMutation.isPending ? "Saving..." : "Save Assignments"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```
