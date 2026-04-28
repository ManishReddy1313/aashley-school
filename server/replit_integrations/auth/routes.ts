import type { Express } from "express";
import { isAuthenticated } from "./replitAuth";
import { getRoleLabel, normalizeRole, resolveEffectivePermissions } from "@shared/authz";
import { authStorage } from "./storage";

export function registerAuthRoutes(app: Express): void {
  app.get("/api/auth/user", isAuthenticated, async (req: any, res) => {
    try {
      const dbUser = await authStorage.getUser(req.user.id);
      if (!dbUser) return res.status(401).json({ message: "User not found" });

      const { password: _password, ...safeUser } = dbUser;
      const normalizedRole = normalizeRole(safeUser.role);
      const effectivePermissions = Array.from(
        resolveEffectivePermissions({
          role: normalizedRole,
          permissionGrants: safeUser.permissionGrants ?? [],
          permissionRevokes: safeUser.permissionRevokes ?? [],
        })
      );
      const sessionUser = {
        ...safeUser,
        role: normalizedRole,
        roleLabel: getRoleLabel(normalizedRole),
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
