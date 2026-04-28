import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";
import { storage } from "./storage";
import { 
  insertAdmissionEnquirySchema, 
  insertAdmissionLeadSchema,
  insertAdmissionLeadCommentSchema,
  insertStudentProfileSchema,
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
  assignClassStudentsSchema,
  insertExamSchema,
  insertTimetableSlotSchema,
} from "@shared/schema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { formatDistanceToNow } from "date-fns";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { sendContactFormEmail, sendAdmissionEnquiryEmail } from "./services/emailService";
import { authStorage } from "./replit_integrations/auth/storage";
import { db } from "./db";
import { users } from "@shared/models/auth";
import { admissionLeads, announcements, studentProfiles } from "@shared/schema";
import { PERMISSION_KEYS, ROLE_KEYS, isPermissionKey, normalizeRole } from "@shared/authz";
import {
  ensureCanAssignRole,
  ensureCanManageUser,
  getEffectivePermissions,
  getRole,
  requireAnyPermission,
  requirePermission,
} from "./authz";

const getAuthUser = (req: Request) => {
  const user = ((req.session as any)?.user || (req as any).user) as any;
  if (!user) return null;
  return { ...user, role: getRole(user) };
};

const computeCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  const nextShort = String(year + 1).slice(-2);
  return `${year}-${nextShort}`;
};

const isAdminRole = (role: string) =>
  role === "super_admin" || role === "principal" || role === "admin_staff";

function apiError(res: Response, status: number, message: string) {
  return res.status(status).json({ message });
}

type SearchResult = {
  type: "student" | "lead" | "announcement";
  id: string;
  label: string;
  sublabel: string;
  href: string;
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
        await storage.createAdmissionLead({
          studentName: data.studentName,
          parentName: data.parentName,
          email: data.email,
          phone: data.phone,
          grade: data.grade,
          message: data.message ?? null,
          status: "new_enquiry",
          source: "website",
        });
      } catch (dbErr) {
        console.error("[api] Failed to save admission lead to database:", dbErr);
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

  app.get("/api/search", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return apiError(res, 401, "Not authenticated");
      const query = typeof req.query.q === "string" ? req.query.q.trim() : "";
      if (query.length < 2) return res.json({ results: [], query });

      const like = `%${query}%`;
      const effective = getEffectivePermissions(user as any);

      const studentsPromise = effective.has("students.read")
        ? db
            .select({
              id: users.id,
              username: users.username,
              firstName: users.firstName,
              lastName: users.lastName,
              role: users.role,
              admissionNumber: studentProfiles.admissionNumber,
            })
            .from(users)
            .leftJoin(studentProfiles, eq(studentProfiles.userId, users.id))
            .where(
              and(
                eq(users.role, "student"),
                or(
                  ilike(users.firstName, like),
                  ilike(users.lastName, like),
                  ilike(users.username, like)
                )
              )
            )
            .limit(5)
        : Promise.resolve([]);

      const leadsPromise = effective.has("admissions.view")
        ? db
            .select({
              id: admissionLeads.id,
              studentName: admissionLeads.studentName,
              status: admissionLeads.status,
              grade: admissionLeads.grade,
              parentName: admissionLeads.parentName,
              phone: admissionLeads.phone,
            })
            .from(admissionLeads)
            .where(
              or(
                ilike(admissionLeads.studentName, like),
                ilike(admissionLeads.parentName, like),
                ilike(admissionLeads.phone, like)
              )
            )
            .limit(5)
        : Promise.resolve([]);

      const announcementsPromise = db
        .select({
          id: announcements.id,
          title: announcements.title,
          type: announcements.type,
          createdAt: announcements.createdAt,
        })
        .from(announcements)
        .where(and(eq(announcements.isActive, true), ilike(announcements.title, like)))
        .orderBy(desc(announcements.createdAt))
        .limit(5);

      const [studentRows, leadRows, announcementRows] = await Promise.all([
        studentsPromise,
        leadsPromise,
        announcementsPromise,
      ]);

      const results: SearchResult[] = [
        ...studentRows.map((row) => ({
          type: "student" as const,
          id: row.id,
          label: `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || row.username,
          sublabel: row.admissionNumber ?? row.role,
          href: `/portal/students/${row.id}`,
        })),
        ...leadRows.map((row) => ({
          type: "lead" as const,
          id: row.id,
          label: row.studentName,
          sublabel: `${row.status} · ${row.grade}`,
          href: `/portal/admissions/${row.id}`,
        })),
        ...announcementRows.map((row) => ({
          type: "announcement" as const,
          id: row.id,
          label: row.title,
          sublabel: `${row.type} · ${row.createdAt ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true }) : "recent"}`,
          href: "/portal/announcements",
        })),
      ].slice(0, 10);

      return res.json({ results, query });
    } catch (error: any) {
      return apiError(res, 500, error.message || "Failed to search");
    }
  });

  // Announcements for logged-in users
  app.get("/api/portal/announcements", isAuthenticated, requirePermission("portal.read"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });

      let classIds: string[] = [];
      if (user.role === "student") {
        classIds = await storage.getStudentClassIds(user.id);
      } else if (user.role === "class_teacher" || user.role === "subject_teacher") {
        classIds = await storage.getTeacherClassIds(user.id);
      }

      const announcements = await storage.getActiveAnnouncements({
        classIds,
        includeSchoolWide: true,
      });
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

  app.post(
    "/api/portal/announcements",
    isAuthenticated,
    requireAnyPermission("announcements.school", "announcements.class", "announcements.section"),
    async (req, res) => {
      try {
        const user = getAuthUser(req);
        if (!user) return res.status(401).json({ message: "Not authenticated" });

        const body = req.body as Record<string, unknown>;
        const type = String(body.type || "school");
        const effective = getEffectivePermissions(user as any);
        if (type === "school" && !effective.has("announcements.school")) {
          return res.status(403).json({ message: "No permission to post school-wide announcements" });
        }
        if ((type === "class" || type === "section") && !effective.has("announcements.class")) {
          return res.status(403).json({ message: "No permission to post class announcements" });
        }

        if ((type === "class" || type === "section") && body.classId) {
          const isSuperOrPrincipal = user.role === "super_admin" || user.role === "principal";
          if (!isSuperOrPrincipal) {
            const teacherClassIds = await storage.getTeacherClassIds(user.id);
            if (!teacherClassIds.includes(String(body.classId))) {
              return res.status(403).json({
                message: "You can only post announcements for your own classes",
              });
            }
          }
        }

        const data = insertAnnouncementSchema.parse({
          ...body,
          createdByUserId: user.id,
          type,
        });
        const announcement = await storage.createAnnouncement(data);
        res.status(201).json(announcement);
      } catch (error: any) {
        res.status(400).json({ message: error.message || "Invalid request" });
      }
    }
  );

  // Admin: get all announcements (management view)
  app.get(
    "/api/admin/announcements",
    isAuthenticated,
    requireAnyPermission("announcements.school", "content.publish"),
    async (_req, res) => {
      try {
        const data = await storage.getAllAnnouncements();
        res.json(data);
      } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to fetch announcements" });
      }
    }
  );

  // Deactivate announcement (soft delete)
  app.patch("/api/portal/announcements/:id/deactivate", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const announcement = await storage.getAnnouncementById(req.params.id);
      if (!announcement) return res.status(404).json({ message: "Announcement not found" });

      const effective = getEffectivePermissions(user as any);
      const canManageSchoolAnnouncements = effective.has("announcements.school");
      if (announcement.createdByUserId !== user.id && !canManageSchoolAnnouncements) {
        return res.status(403).json({ message: "Permission denied" });
      }

      await storage.deactivateAnnouncement(req.params.id);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to deactivate announcement" });
    }
  });

  // Admin: Create Portal User
  app.post("/api/admin/users", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });

      const body = req.body as Record<string, unknown>;
      const username = String(body.username ?? "").trim();
      const password = String(body.password ?? "");
      const email = body.email ? String(body.email).trim() : null;
      const phone = body.phone ? String(body.phone).trim() : null;
      const firstName = body.firstName ? String(body.firstName).trim() : null;
      const lastName = body.lastName ? String(body.lastName).trim() : null;
      const role = normalizeRole(body.role ? String(body.role) : "student");
      const classId = body.classId ? String(body.classId).trim() : "";

      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      const actorRole = normalizeRole(actor.role);
      const allowedByRole: Record<string, string[]> = {
        super_admin: ["super_admin", "principal", "admin_staff", "admissions_officer", "class_teacher", "subject_teacher", "student"],
        principal: ["admin_staff", "class_teacher", "subject_teacher", "admissions_officer"],
        admin_staff: ["class_teacher", "subject_teacher", "admissions_officer", "student"],
        class_teacher: ["student"],
        subject_teacher: [],
        admissions_officer: [],
        student: [],
      };
      if (!(allowedByRole[actorRole] ?? []).includes(role)) {
        return res.status(403).json({ message: "You are not allowed to create this role" });
      }
      if (role === "student" && !classId) {
        return res.status(400).json({ message: "classId is required when creating a student" });
      }
      if (actorRole === "class_teacher") {
        if (role !== "student") {
          return res.status(403).json({ message: "Class teachers can only create students" });
        }
        const teacherClassIds = await storage.getTeacherClassIds(actor.id);
        if (!teacherClassIds.includes(classId)) {
          return res.status(403).json({ message: "You can only create students in your assigned classes" });
        }
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
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        email,
        phone,
        firstName,
        lastName,
        role,
        isActive: true,
      });

      if (role === "student") {
        await storage.createStudentProfile({
          userId: user.id,
          admissionNumber: username,
          classId,
          academicYear: computeCurrentAcademicYear(),
          isActive: true,
        });
        await storage.replaceClassStudents(classId, Array.from(new Set([...(await storage.getClassStudentUserIds(classId)), user.id])));
      }

      const { password: _password, ...safeUser } = user;
      res.status(201).json(safeUser);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to create user" });
    }
  });

  // Admin: List users
  app.get("/api/admin/users", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
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
  app.patch("/api/admin/users/:id/role", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
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
  app.patch("/api/admin/users/:id/permissions", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
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
  app.patch("/api/admin/users/:id", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
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

      if (typeof body.password === "string" && body.password.length > 0) {
        if (actor.role !== "super_admin") {
          return res.status(403).json({ message: "Only Super Admin can reset passwords" });
        }
        updates.password = await bcrypt.hash(String(body.password), 10);
      }
      if (body.phone === null || typeof body.phone === "string") {
        updates.phone = body.phone ? String(body.phone).trim() : null;
      }
      if (typeof body.isActive === "boolean") {
        updates.isActive = body.isActive;
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

  app.get("/api/admin/permissions/catalog", isAuthenticated, requirePermission("users.manage"), (_req, res) => {
    res.json({ permissions: [...PERMISSION_KEYS], roles: [...ROLE_KEYS] });
  });

  app.patch("/api/admin/users/:id/password", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return apiError(res, 401, "Not authenticated");
      const target = await storage.getUserById(req.params.id);
      if (!target) return apiError(res, 404, "User not found");
      const password = String((req.body as Record<string, unknown>)?.password ?? "");
      if (password.length < 6) return apiError(res, 400, "Password must be at least 6 characters");
      if (normalizeRole(target.role) === "super_admin" && normalizeRole(actor.role) !== "super_admin") {
        return apiError(res, 403, "Only super admin can reset another super admin password");
      }
      await storage.setUserPassword(target.id, await bcrypt.hash(password, 10));
      res.json({ success: true });
    } catch (error: any) {
      apiError(res, 500, error.message || "Failed to update password");
    }
  });

  app.patch("/api/admin/users/:id/disable", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return apiError(res, 401, "Not authenticated");
      if (actor.id === req.params.id) return apiError(res, 400, "You cannot disable your own account");
      const target = await storage.getUserById(req.params.id);
      if (!target) return apiError(res, 404, "User not found");
      if (normalizeRole(target.role) === "super_admin" && normalizeRole(actor.role) !== "super_admin") {
        return apiError(res, 403, "Only super admin can disable another super admin");
      }
      await storage.disableUser(target.id);
      res.json({ success: true });
    } catch (error: any) {
      apiError(res, 500, error.message || "Failed to disable user");
    }
  });

  app.patch("/api/admin/users/:id/enable", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return apiError(res, 401, "Not authenticated");
      if (actor.id === req.params.id) return apiError(res, 400, "You cannot enable your own account");
      const target = await storage.getUserById(req.params.id);
      if (!target) return apiError(res, 404, "User not found");
      if (normalizeRole(target.role) === "super_admin" && normalizeRole(actor.role) !== "super_admin") {
        return apiError(res, 403, "Only super admin can enable another super admin");
      }
      await storage.enableUser(target.id);
      res.json({ success: true });
    } catch (error: any) {
      apiError(res, 500, error.message || "Failed to enable user");
    }
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
        if (!teacher) {
          return res.status(400).json({ message: `Invalid teacher user: ${teacherId}` });
        }
        const teacherRole = normalizeRole(teacher.role);
        if (teacherRole !== "class_teacher" && teacherRole !== "subject_teacher") {
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
      if (actor.role === "class_teacher") {
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

  // Student profiles
  app.get("/api/student/profile", isAuthenticated, async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });
      const dbUser = await storage.getUserById(actor.id);
      if (!dbUser) return res.status(404).json({ message: "User not found" });
      const profile = await storage.getStudentProfileByUserId(actor.id);
      const classDetails = profile?.classId ? (await storage.getClassesByIds([profile.classId]))[0] ?? null : null;
      const { password: _password, ...safeUser } = dbUser;
      res.json({ user: safeUser, profile, class: classDetails });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch student profile" });
    }
  });

  app.get("/api/students/:userId/profile", isAuthenticated, async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });
      const canReadStudents = Array.isArray((actor as any).effectivePermissions)
        ? (actor as any).effectivePermissions.includes("students.read")
        : false;
      if (!canReadStudents && actor.id !== req.params.userId) {
        return res.status(403).json({ message: "Permission denied" });
      }
      const dbUser = await storage.getUserById(req.params.userId);
      if (!dbUser) return res.status(404).json({ message: "User not found" });
      const profile = await storage.getStudentProfileByUserId(req.params.userId);
      const { password: _password, ...safeUser } = dbUser;
      res.json({ user: safeUser, profile });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch student profile" });
    }
  });

  app.post("/api/students/:userId/profile", isAuthenticated, requirePermission("students.update"), async (req, res) => {
    try {
      const existing = await storage.getStudentProfileByUserId(req.params.userId);
      if (existing) return res.status(409).json({ message: "Student profile already exists" });
      const parsed = insertStudentProfileSchema.parse({
        ...req.body,
        userId: req.params.userId,
      });
      const created = await storage.createStudentProfile(parsed);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.patch("/api/students/:userId/profile", isAuthenticated, requirePermission("students.update"), async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const updates: Record<string, unknown> = {};
      const allowedKeys = [
        "admissionNumber",
        "classId",
        "rollNumber",
        "dateOfBirth",
        "gender",
        "bloodGroup",
        "address",
        "photoUrl",
        "academicYear",
        "isActive",
      ];
      for (const key of allowedKeys) {
        if (key in body) updates[key] = body[key];
      }
      if ("dateOfBirth" in updates && typeof updates.dateOfBirth === "string" && updates.dateOfBirth) {
        updates.dateOfBirth = new Date(String(updates.dateOfBirth));
      }
      const updated = await storage.updateStudentProfile(req.params.userId, updates as any);
      if (!updated) return res.status(404).json({ message: "Student profile not found" });
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.get("/api/admin/students", isAuthenticated, requirePermission("students.read"), async (req, res) => {
    try {
      const classId = typeof req.query.classId === "string" ? req.query.classId : undefined;
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : undefined;
      const allUsers = await storage.getUsers();
      const students = allUsers.filter((user) => normalizeRole(user.role) === "student");
      const joined = await Promise.all(
        students.map(async (student) => ({
          user: student,
          profile: await storage.getStudentProfileByUserId(student.id),
        }))
      );
      const filtered = joined.filter((row) => {
        if (classId && row.profile?.classId !== classId) return false;
        if (academicYear && row.profile?.academicYear !== academicYear) return false;
        return true;
      });
      res.json(filtered);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch students" });
    }
  });

  // Parent-teacher chat
  app.post("/api/messages/send", isAuthenticated, requirePermission("chat.initiate"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const body = req.body as Record<string, unknown>;
      const studentUserId = String(body.studentUserId ?? "");
      const classId = String(body.classId ?? "");
      const message = String(body.message ?? "").trim();
      if (!message) return res.status(400).json({ message: "Message must not be empty" });

      const studentUser = await storage.getUserById(studentUserId);
      const classRows = await storage.getClassesByIds([classId]);
      if (!studentUser) return res.status(400).json({ message: "Student user not found" });
      if (classRows.length === 0) return res.status(400).json({ message: "Class not found" });

      if (user.role === "student" && user.id !== studentUserId && user.role !== "super_admin") {
        return res.status(403).json({ message: "You can only message for your own student account" });
      }

      const created = await storage.sendMessage({
        studentUserId,
        classId,
        senderUserId: user.id,
        senderRole: "student",
        message,
      });
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.post("/api/messages/respond", isAuthenticated, requirePermission("chat.respond"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const body = req.body as Record<string, unknown>;
      const studentUserId = String(body.studentUserId ?? "");
      const classId = String(body.classId ?? "");
      const message = String(body.message ?? "").trim();
      if (!message) return res.status(400).json({ message: "Message must not be empty" });

      if (user.role !== "super_admin") {
        const teacherClassIds = await storage.getTeacherClassIds(user.id);
        if (!teacherClassIds.includes(classId)) {
          return res.status(403).json({ message: "You can only respond to your assigned classes" });
        }
      }

      const created = await storage.sendMessage({
        studentUserId,
        classId,
        senderUserId: user.id,
        senderRole: "class_teacher",
        message,
      });
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.get("/api/messages/thread/:studentUserId/:classId", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const { studentUserId, classId } = req.params;
      const isAdmin = user.role === "super_admin" || user.role === "principal";

      let allowed = isAdmin;
      if (!allowed) {
        if (user.role === "student") {
          allowed = user.id === studentUserId;
        } else if (user.role === "class_teacher" || user.role === "subject_teacher") {
          const teacherClassIds = await storage.getTeacherClassIds(user.id);
          allowed = teacherClassIds.includes(classId);
        }
      }
      if (!allowed) return res.status(403).json({ message: "Permission denied" });

      const messages = await storage.getMessageThread(studentUserId, classId);
      if (user.role === "student") {
        await storage.markThreadRead(studentUserId, classId, "student");
      } else if (user.role === "class_teacher" || user.role === "subject_teacher") {
        await storage.markThreadRead(studentUserId, classId, "class_teacher");
      }
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch thread" });
    }
  });

  app.get("/api/messages/threads", isAuthenticated, requirePermission("chat.respond"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const threads = await storage.getTeacherMessageThreads(user.id);
      res.json(threads);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch threads" });
    }
  });

  app.post("/api/messages/thread/:studentUserId/:classId/read", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });

      let readerRole: "student" | "class_teacher" | null = null;
      if (user.role === "student") readerRole = "student";
      if (user.role === "class_teacher" || user.role === "subject_teacher") readerRole = "class_teacher";
      if (!readerRole) return res.status(400).json({ message: "Unsupported role for read status" });

      await storage.markThreadRead(req.params.studentUserId, req.params.classId, readerRole);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to mark thread as read" });
    }
  });

  app.get("/api/messages/unread-count", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const count = await storage.getUnreadMessageCount(user.id, user.role);
      res.json({ count });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch unread count" });
    }
  });

  app.get("/api/notifications", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return apiError(res, 401, "Not authenticated");
      const rows = await storage.getNotifications(user.id, 20);
      res.json(rows);
    } catch (error: any) {
      apiError(res, 500, error.message || "Failed to fetch notifications");
    }
  });

  app.get("/api/notifications/unread-count", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return apiError(res, 401, "Not authenticated");
      const count = await storage.getUnreadNotificationCount(user.id);
      res.json({ count });
    } catch (error: any) {
      apiError(res, 500, error.message || "Failed to fetch unread notifications");
    }
  });

  app.post("/api/notifications/read-all", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return apiError(res, 401, "Not authenticated");
      await storage.markNotificationsRead(user.id);
      res.json({ success: true });
    } catch (error: any) {
      apiError(res, 500, error.message || "Failed to mark notifications as read");
    }
  });

  // Admin: Create Event
  app.post("/api/admin/events", isAuthenticated, requirePermission("content.publish"), async (req, res) => {
    try {
      const data = insertEventSchema.parse(req.body);
      const event = await storage.createEvent(data);
      res.status(201).json(event);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Create Gallery Item
  app.post("/api/admin/gallery", isAuthenticated, requirePermission("content.publish"), async (req, res) => {
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
  app.post("/api/admin/growth-stories", isAuthenticated, requirePermission("content.publish"), async (req, res) => {
    try {
      const data = insertGrowthStorySchema.parse(req.body);
      const story = await storage.createGrowthStory(data);
      res.status(201).json(story);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Get all admission enquiries
  app.get("/api/admin/admission-enquiries", isAuthenticated, requirePermission("admissions.view"), async (_req, res) => {
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
  app.get("/api/admin/alumni", isAuthenticated, requirePermission("admissions.view"), async (_req, res) => {
    try {
      const alumni = await storage.getAllAlumni();
      res.json(alumni);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch alumni" });
    }
  });

  // Admin: Create Job Posting
  app.post("/api/admin/careers", isAuthenticated, requirePermission("users.manage"), async (req, res) => {
    try {
      const data = insertJobPostingSchema.parse(req.body);
      const posting = await storage.createJobPosting(data);
      res.status(201).json(posting);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Admin: Get all job postings
  app.get("/api/admin/careers", isAuthenticated, requirePermission("users.manage"), async (_req, res) => {
    try {
      const postings = await storage.getAllJobPostings();
      res.json(postings);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch job postings" });
    }
  });

  // Admin: Get all job applications
  app.get("/api/admin/applications", isAuthenticated, requirePermission("users.manage"), async (_req, res) => {
    try {
      const applications = await storage.getJobApplications();
      res.json(applications);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch applications" });
    }
  });

  // Admissions CRM
  app.get("/api/admissions/leads", isAuthenticated, requirePermission("admissions.view"), async (req, res) => {
    try {
      const status = typeof req.query.status === "string" ? req.query.status : undefined;
      const assignedTo = typeof req.query.assignedTo === "string" ? req.query.assignedTo : undefined;
      const leads = await storage.getAdmissionLeads({ status, assignedTo });
      res.json(leads);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch admission leads" });
    }
  });

  app.get("/api/admissions/leads/:id", isAuthenticated, requirePermission("admissions.view"), async (req, res) => {
    try {
      const lead = await storage.getAdmissionLeadById(req.params.id);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      const [comments, history] = await Promise.all([
        storage.getLeadComments(req.params.id),
        storage.getLeadStatusHistory(req.params.id),
      ]);
      res.json({ lead, comments, history });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch admission lead" });
    }
  });

  app.post("/api/admissions/leads", isAuthenticated, requirePermission("admissions.manage"), async (req, res) => {
    try {
      const data = insertAdmissionLeadSchema.parse(req.body);
      const lead = await storage.createAdmissionLead(data);
      res.status(201).json(lead);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.patch("/api/admissions/leads/:id", isAuthenticated, requirePermission("admissions.manage"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });
      const current = await storage.getAdmissionLeadById(req.params.id);
      if (!current) return res.status(404).json({ message: "Lead not found" });

      const updates = req.body as Record<string, unknown>;
      const status = typeof updates.status === "string" ? updates.status : undefined;
      const updated = await storage.updateAdmissionLead(req.params.id, updates as any);
      if (!updated) return res.status(404).json({ message: "Lead not found" });

      if (status && status !== current.status) {
        await storage.addLeadStatusHistory({
          leadId: current.id,
          changedByUserId: actor.id,
          fromStatus: current.status,
          toStatus: status,
        });
      }
      res.json(updated);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.post("/api/admissions/leads/:id/comments", isAuthenticated, requirePermission("admissions.comment"), async (req, res) => {
    try {
      const actor = getAuthUser(req);
      if (!actor) return res.status(401).json({ message: "Not authenticated" });
      const lead = await storage.getAdmissionLeadById(req.params.id);
      if (!lead) return res.status(404).json({ message: "Lead not found" });
      const parsed = insertAdmissionLeadCommentSchema.parse({
        leadId: req.params.id,
        userId: actor.id,
        comment: (req.body as Record<string, unknown>).comment,
      });
      const comment = await storage.addLeadComment(parsed);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  // Subjects
  app.get("/api/classes/:classId/subjects", isAuthenticated, async (req, res) => {
    try {
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : "";
      if (!academicYear) return res.status(400).json({ message: "academicYear query is required" });
      const subjectRows = await storage.getSubjectsByClass(req.params.classId, academicYear);
      res.json(subjectRows);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch subjects" });
    }
  });

  app.post("/api/classes/:classId/subjects", isAuthenticated, requirePermission("classes.manage"), async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const created = await storage.createSubject({
        classId: req.params.classId,
        name: String(body.name ?? ""),
        academicYear: String(body.academicYear ?? ""),
      });
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.delete("/api/classes/:classId/subjects/:subjectId", isAuthenticated, requirePermission("classes.manage"), async (req, res) => {
    try {
      await storage.deleteSubject(req.params.subjectId);
      res.status(204).send();
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete subject" });
    }
  });

  // Exams
  app.get("/api/classes/:classId/exams", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : "";
      if (!academicYear) return res.status(400).json({ message: "academicYear query is required" });

      if (!isAdminRole(user.role)) {
        const teacherClassIds = await storage.getTeacherClassIds(user.id);
        if (!teacherClassIds.includes(req.params.classId)) {
          return res.status(403).json({ message: "Permission denied for this class" });
        }
      }

      const rows = await storage.getExamsByClass(req.params.classId, academicYear);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch exams" });
    }
  });

  app.post("/api/classes/:classId/exams", isAuthenticated, requirePermission("marks.enter"), async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const body = req.body as Record<string, unknown>;
      const subjectId = String(body.subjectId ?? "");
      const classSubjects = await storage.getSubjectsByClass(
        req.params.classId,
        String(body.academicYear ?? "")
      );
      const validSubject = classSubjects.some((subject) => subject.id === subjectId);
      if (!validSubject) return res.status(400).json({ message: "Subject does not belong to this class" });

      const parsed = insertExamSchema.parse({
        classId: req.params.classId,
        subjectId,
        title: String(body.title ?? ""),
        examDate: new Date(String(body.examDate ?? "")),
        maxMarks: Number(body.maxMarks),
        passingMarks: Number(body.passingMarks),
        academicYear: String(body.academicYear ?? ""),
        createdByUserId: user.id,
      });
      const created = await storage.createExam(parsed);
      res.status(201).json(created);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.patch(
    "/api/classes/:classId/exams/:examId",
    isAuthenticated,
    requirePermission("marks.enter"),
    async (req, res) => {
      try {
        const user = getAuthUser(req);
        if (!user) return res.status(401).json({ message: "Not authenticated" });
        const exam = await storage.getExamById(req.params.examId);
        if (!exam || exam.classId !== req.params.classId) return res.status(404).json({ message: "Exam not found" });
        if (!isAdminRole(user.role) && exam.createdByUserId !== user.id) {
          return res.status(403).json({ message: "Only creator or admin can update exam" });
        }

        const body = req.body as Record<string, unknown>;
        const updates: Record<string, unknown> = {};
        if (typeof body.title === "string") updates.title = body.title;
        if (body.examDate) updates.examDate = new Date(String(body.examDate));
        if (body.maxMarks !== undefined) updates.maxMarks = Number(body.maxMarks);
        if (body.passingMarks !== undefined) updates.passingMarks = Number(body.passingMarks);
        if (typeof body.academicYear === "string") updates.academicYear = body.academicYear;

        const updated = await storage.updateExam(req.params.examId, updates as any);
        if (!updated) return res.status(404).json({ message: "Exam not found" });
        res.json(updated);
      } catch (error: any) {
        res.status(400).json({ message: error.message || "Invalid request" });
      }
    }
  );

  app.delete(
    "/api/classes/:classId/exams/:examId",
    isAuthenticated,
    requirePermission("marks.enter"),
    async (req, res) => {
      try {
        const user = getAuthUser(req);
        if (!user) return res.status(401).json({ message: "Not authenticated" });
        const exam = await storage.getExamById(req.params.examId);
        if (!exam || exam.classId !== req.params.classId) return res.status(404).json({ message: "Exam not found" });
        if (!isAdminRole(user.role) && exam.createdByUserId !== user.id) {
          return res.status(403).json({ message: "Only creator or admin can delete exam" });
        }
        await storage.deleteExam(req.params.examId);
        res.json({ success: true });
      } catch (error: any) {
        res.status(500).json({ message: error.message || "Failed to delete exam" });
      }
    }
  );

  app.get("/api/exams/:examId/results", isAuthenticated, requirePermission("marks.enter"), async (req, res) => {
    try {
      const exam = await storage.getExamById(req.params.examId);
      if (!exam) return res.status(404).json({ message: "Exam not found" });
      const studentUserIds = await storage.getClassStudentUserIds(exam.classId);
      const classStudents = await Promise.all(studentUserIds.map((userId) => storage.getUserById(userId)));
      const results = await storage.getResultsByExam(exam.id);
      const resultByStudentId = new Map(results.map((result) => [result.studentUserId, result]));

      const response = classStudents
        .filter((student): student is NonNullable<typeof student> => !!student)
        .map((student) => {
          const { password: _password, ...safeUser } = student;
          return {
            studentUser: safeUser,
            result: resultByStudentId.get(student.id) ?? null,
          };
        });

      res.json(response);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch exam results" });
    }
  });

  app.post(
    "/api/exams/:examId/results/bulk",
    isAuthenticated,
    requirePermission("marks.enter"),
    async (req, res) => {
      try {
        const user = getAuthUser(req);
        if (!user) return res.status(401).json({ message: "Not authenticated" });
        const exam = await storage.getExamById(req.params.examId);
        if (!exam) return res.status(404).json({ message: "Exam not found" });

        const body = req.body as Record<string, unknown>;
        const rows = Array.isArray(body.results) ? body.results : [];
        const payload = rows.map((row: any) => {
          const marksObtained = Number(row.marksObtained);
          if (Number.isNaN(marksObtained) || marksObtained < 0 || marksObtained > exam.maxMarks) {
            throw new Error(`Invalid marks for student ${row.studentUserId}`);
          }
          return {
            examId: exam.id,
            studentUserId: String(row.studentUserId),
            marksObtained,
            remarks: row.remarks ? String(row.remarks) : undefined,
            enteredByUserId: user.id,
          };
        });

        const saved = await storage.bulkUpsertExamResults(payload);
        res.json(saved);
      } catch (error: any) {
        res.status(400).json({ message: error.message || "Invalid request" });
      }
    }
  );

  app.get("/api/student/marks", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : "";
      if (!academicYear) return res.status(400).json({ message: "academicYear query is required" });

      const rows = await storage.getResultsByStudent(user.id, academicYear);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch marks" });
    }
  });

  // Timetable
  app.get("/api/classes/:classId/timetable", isAuthenticated, async (req, res) => {
    try {
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : "";
      if (!academicYear) return res.status(400).json({ message: "academicYear query is required" });
      const rows = await storage.getTimetableByClass(req.params.classId, academicYear);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch timetable" });
    }
  });

  app.post("/api/classes/:classId/timetable", isAuthenticated, requirePermission("timetable.manage"), async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const dayOfWeek = Number(body.dayOfWeek);
      const periodNumber = Number(body.periodNumber);
      const subjectName = String(body.subjectName ?? "").trim();
      const startTime = String(body.startTime ?? "");
      const endTime = String(body.endTime ?? "");
      const academicYear = String(body.academicYear ?? "");

      if (dayOfWeek < 1 || dayOfWeek > 6) return res.status(400).json({ message: "dayOfWeek must be between 1 and 6" });
      if (periodNumber < 1 || periodNumber > 8) return res.status(400).json({ message: "periodNumber must be between 1 and 8" });
      if (!subjectName) return res.status(400).json({ message: "subjectName is required" });
      if (!/^\d{2}:\d{2}$/.test(startTime) || !/^\d{2}:\d{2}$/.test(endTime)) {
        return res.status(400).json({ message: "startTime and endTime must match HH:MM format" });
      }

      const parsed = insertTimetableSlotSchema.parse({
        classId: req.params.classId,
        academicYear,
        dayOfWeek,
        periodNumber,
        subjectName,
        teacherUserId: body.teacherUserId ? String(body.teacherUserId) : null,
        startTime,
        endTime,
      });
      const saved = await storage.upsertTimetableSlot(parsed);
      res.json(saved);
    } catch (error: any) {
      res.status(400).json({ message: error.message || "Invalid request" });
    }
  });

  app.delete("/api/classes/:classId/timetable", isAuthenticated, requirePermission("timetable.manage"), async (req, res) => {
    try {
      const body = req.body as Record<string, unknown>;
      const dayOfWeek = Number(body.dayOfWeek);
      const periodNumber = Number(body.periodNumber);
      const academicYear = String(body.academicYear ?? "");
      await storage.deleteTimetableSlot(req.params.classId, academicYear, dayOfWeek, periodNumber);
      res.json({ success: true });
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to delete timetable slot" });
    }
  });

  app.get("/api/student/timetable", isAuthenticated, async (req, res) => {
    try {
      const user = getAuthUser(req);
      if (!user) return res.status(401).json({ message: "Not authenticated" });
      const academicYear = typeof req.query.academicYear === "string" ? req.query.academicYear : "";
      if (!academicYear) return res.status(400).json({ message: "academicYear query is required" });
      const rows = await storage.getTimetableForStudent(user.id, academicYear);
      res.json(rows);
    } catch (error: any) {
      res.status(500).json({ message: error.message || "Failed to fetch student timetable" });
    }
  });

  return httpServer;
}
