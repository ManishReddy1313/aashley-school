export const ROLE_KEYS = [
  "super_admin",
  "principal",
  "admin_staff",
  "admissions_officer",
  "class_teacher",
  "subject_teacher",
  "student",
] as const;
export type RoleKey = (typeof ROLE_KEYS)[number];

export const PERMISSION_KEYS = [
  "users.manage",
  "portal.read",
  "admissions.view",
  "admissions.manage",
  "admissions.comment",
  "announcements.school",
  "announcements.class",
  "announcements.section",
  "marks.enter",
  "marks.view",
  "timetable.manage",
  "timetable.view",
  "chat.initiate",
  "chat.respond",
  "classes.manage",
  "students.read",
  "students.update",
  "content.create",
  "content.publish",
  "messages.read",
] as const;
export type PermissionKey = (typeof PERMISSION_KEYS)[number];

const ROLE_LEVEL: Record<RoleKey, number> = {
  student: 1,
  subject_teacher: 2,
  class_teacher: 3,
  admissions_officer: 3,
  admin_staff: 4,
  principal: 5,
  super_admin: 6,
};

const ALL_PERMISSIONS = [...PERMISSION_KEYS] as PermissionKey[];

export const ROLE_DEFAULT_PERMISSIONS: Record<RoleKey, PermissionKey[]> = {
  super_admin: [...ALL_PERMISSIONS],
  principal: [
    "portal.read",
    "announcements.school",
    "announcements.class",
    "announcements.section",
    "marks.view",
    "timetable.view",
    "admissions.view",
    "students.read",
    "users.manage",
    "classes.manage",
    "content.create",
    "content.publish",
    "messages.read",
  ],
  admin_staff: [
    "portal.read",
    "admissions.view",
    "admissions.manage",
    "admissions.comment",
    "students.read",
    "users.manage",
    "classes.manage",
    "announcements.school",
    "content.create",
    "messages.read",
  ],
  admissions_officer: [
    "portal.read",
    "admissions.view",
    "admissions.manage",
    "admissions.comment",
  ],
  class_teacher: [
    "portal.read",
    "announcements.class",
    "announcements.section",
    "marks.enter",
    "marks.view",
    "timetable.manage",
    "timetable.view",
    "students.read",
    "students.update",
    "chat.respond",
    "content.create",
  ],
  subject_teacher: [
    "portal.read",
    "marks.enter",
    "marks.view",
    "students.read",
    "timetable.view",
  ],
  student: [
    "portal.read",
    "marks.view",
    "timetable.view",
    "chat.initiate",
  ],
};

const LEGACY_ROLE_MAP: Record<string, RoleKey> = {
  super_admin: "super_admin",
  principal: "principal",
  admin_staff: "admin_staff",
  admissions_officer: "admissions_officer",
  class_teacher: "class_teacher",
  subject_teacher: "subject_teacher",
  student: "student",
  admin: "admin_staff",
  staff: "class_teacher",
  teacher: "class_teacher",
  parent: "student",
};

export function normalizeRole(input: string | null | undefined): RoleKey {
  if (!input) return "student";
  const value = String(input).trim().toLowerCase();
  return LEGACY_ROLE_MAP[value] ?? "student";
}

export function canAssignRole(actorRole: RoleKey, targetRole: RoleKey): boolean {
  return ROLE_LEVEL[actorRole] > ROLE_LEVEL[targetRole];
}

export function canManageUserRole(actorRole: RoleKey, targetCurrentRole: RoleKey): boolean {
  return ROLE_LEVEL[actorRole] > ROLE_LEVEL[targetCurrentRole];
}

export function hasRoleAtLeast(currentRole: RoleKey, minRole: RoleKey): boolean {
  return ROLE_LEVEL[currentRole] >= ROLE_LEVEL[minRole];
}

export function isPermissionKey(value: unknown): value is PermissionKey {
  return typeof value === "string" && PERMISSION_KEYS.includes(value as PermissionKey);
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

export function getRoleLabel(role: RoleKey): string {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export function roleHasModuleAccess(role: RoleKey, module: string): boolean {
  const effective = resolveEffectivePermissions({ role });
  const modulePermissionMap: Record<string, PermissionKey[]> = {
    admissions: ["admissions.view", "admissions.manage", "admissions.comment"],
    announcements: ["announcements.school", "announcements.class", "announcements.section"],
    marks: ["marks.enter", "marks.view"],
    timetable: ["timetable.manage", "timetable.view"],
    chat: ["chat.initiate", "chat.respond"],
    users: ["users.manage"],
    classes: ["classes.manage"],
  };
  const modulePermissions = modulePermissionMap[module];
  if (!modulePermissions) return false;
  return modulePermissions.some((permission) => effective.has(permission));
}
