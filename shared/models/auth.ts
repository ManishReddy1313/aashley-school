import { sql } from "drizzle-orm";
import { boolean, index, jsonb, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";
import type { PermissionKey, RoleKey } from "../authz";

export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)]
);

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: varchar("username", { length: 100 }).unique().notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  email: varchar("email").unique(),
  phone: varchar("phone", { length: 20 }),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  role: varchar("role", { length: 30 }).$type<RoleKey>().notNull().default("student"),
  isActive: boolean("is_active").notNull().default(true),
  permissionGrants: text("permission_grants").array().$type<PermissionKey[]>().notNull().default(sql`ARRAY[]::text[]`),
  permissionRevokes: text("permission_revokes").array().$type<PermissionKey[]>().notNull().default(sql`ARRAY[]::text[]`),
  legacyRole: varchar("legacy_role", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
