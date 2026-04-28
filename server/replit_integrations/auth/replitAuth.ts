import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { authStorage } from "./storage";
import { getRoleLabel, normalizeRole, resolveEffectivePermissions } from "@shared/authz";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { message: "Too many login attempts. Please try again in 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
  skip: undefined,
  keyGenerator: (req) => {
    const forwardedFor = req.headers["x-forwarded-for"];
    const firstForwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(",")[0]?.trim();
    const ip = firstForwardedIp || req.ip || req.socket.remoteAddress || "fallback";
    return ip === "fallback" ? ip : ipKeyGenerator(ip);
  },
});

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error(
      "SESSION_SECRET environment variable is required. Set it in your .env file."
    );
  }
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: sessionTtl,
    },
  });
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());

  app.post("/api/auth/login", loginLimiter, async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
      }

      const user = await authStorage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) {
        return res.status(401).json({ message: "Invalid username or password" });
      }

      if (user.isActive === false) {
        return res
          .status(403)
          .json({ message: "This account has been disabled. Contact your administrator." });
      }

      const { password: _, ...safeUser } = user;
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
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  app.post("/api/auth/register", async (_req, res) => {
    res.status(403).json({ message: "Public registration is disabled. Contact admin." });
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Logout error:", err);
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logged out" });
    });
  });
}

export const isAuthenticated: RequestHandler = (req, res, next) => {
  const user = (req.session as any)?.user;
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  (req as any).user = user;
  next();
};
