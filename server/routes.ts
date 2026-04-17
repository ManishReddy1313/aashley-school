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
        .filter((user: any) => actor.role === "super_admin" || user.role === "staff" || user.role === "student")
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
