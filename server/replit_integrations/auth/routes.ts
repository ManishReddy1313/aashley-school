import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { normalizeRole, resolveEffectivePermissions } from "@shared/authz";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const normalizedRole = normalizeRole(req.user?.role);
      const effectivePermissions = Array.from(
        resolveEffectivePermissions({
          role: normalizedRole,
          permissionGrants: req.user?.permissionGrants ?? [],
          permissionRevokes: req.user?.permissionRevokes ?? [],
        })
      );
      const sessionUser = {
        ...req.user,
        role: normalizedRole,
        effectivePermissions,
      };
      (req.session as any).user = sessionUser;
      res.json(sessionUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });
}
