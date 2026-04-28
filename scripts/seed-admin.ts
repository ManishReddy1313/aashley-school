import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "../server/db";
import { users } from "../shared/models/auth";

async function seedAdmin() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log("Users already exist. Skipping seed.");
    process.exit(0);
  }

  const password = await bcrypt.hash("Admin@1234", 10);
  await db.insert(users).values({
    username: "superadmin",
    password,
    email: "admin@aashley.edu.in",
    firstName: "Super",
    lastName: "Admin",
    role: "super_admin",
    permissionGrants: [],
    permissionRevokes: [],
  });

  console.log("✅ Super Admin seeded — username: superadmin  password: Admin@1234");
  console.log("⚠️  Change this password immediately after first login.");
  process.exit(0);
}

seedAdmin().catch(console.error);
