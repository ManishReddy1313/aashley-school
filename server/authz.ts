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

export function requireAnyPermission(...permissions: PermissionKey[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = getSessionUser(req);
    if (!user) return res.status(401).json({ message: "Not authenticated" });
    const effective = getEffectivePermissions(user);
    const hasAny = permissions.some((permission) => effective.has(permission));
    if (!hasAny) return res.status(403).json({ message: "Permission denied" });
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
