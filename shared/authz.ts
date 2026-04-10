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
