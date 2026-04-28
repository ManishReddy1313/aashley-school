# Aashley School - Project Audit Report

Generated on: 2026-04-28

## 1) Folder Structure

```text
.
├── .dockerignore
├── .env.example
├── .gitignore
├── Dockerfile
├── PROJECT_TRACKER.md
├── SEO_IMPROVEMENTS.md
├── api
│   └── index.js
├── attached_assets
│   ├── Pasted-10-05-1073-modules-transformed-10-84-Build-failed-in-7-_1771745409484.txt
│   └── Pasted-Website-Features-for-Aashley-International-School-Publi_1766925826621.txt
├── client
│   ├── index.html
│   ├── public
│   │   ├── robots.txt
│   │   └── sitemap.xml
│   └── src
│       ├── App.tsx
│       ├── components
│       │   ├── loader.tsx
│       │   ├── public-layout.tsx
│       │   ├── school-logo.tsx
│       │   ├── seo
│       │   │   ├── json-ld-schema.tsx
│       │   │   └── seo-head.tsx
│       │   ├── theme-provider.tsx
│       │   ├── theme-toggle.tsx
│       │   └── ui
│       │       ├── accordion.tsx
│       │       ├── alert-dialog.tsx
│       │       ├── alert.tsx
│       │       ├── aspect-ratio.tsx
│       │       ├── avatar.tsx
│       │       ├── badge.tsx
│       │       ├── breadcrumb.tsx
│       │       ├── button.tsx
│       │       ├── calendar.tsx
│       │       ├── card.tsx
│       │       ├── carousel.tsx
│       │       ├── chart.tsx
│       │       ├── checkbox.tsx
│       │       ├── collapsible.tsx
│       │       ├── command.tsx
│       │       ├── context-menu.tsx
│       │       ├── dialog.tsx
│       │       ├── drawer.tsx
│       │       ├── dropdown-menu.tsx
│       │       ├── form.tsx
│       │       ├── hover-card.tsx
│       │       ├── input-otp.tsx
│       │       ├── input.tsx
│       │       ├── label.tsx
│       │       ├── menubar.tsx
│       │       ├── navigation-menu.tsx
│       │       ├── pagination.tsx
│       │       ├── popover.tsx
│       │       ├── progress.tsx
│       │       ├── radio-group.tsx
│       │       ├── resizable.tsx
│       │       ├── scroll-area.tsx
│       │       ├── select.tsx
│       │       ├── separator.tsx
│       │       ├── sheet.tsx
│       │       ├── sidebar.tsx
│       │       ├── skeleton.tsx
│       │       ├── slider.tsx
│       │       ├── switch.tsx
│       │       ├── table.tsx
│       │       ├── tabs.tsx
│       │       ├── textarea.tsx
│       │       ├── toast.tsx
│       │       ├── toaster.tsx
│       │       ├── toggle-group.tsx
│       │       ├── toggle.tsx
│       │       └── tooltip.tsx
│       ├── hooks
│       │   ├── use-auth.ts
│       │   ├── use-mobile.tsx
│       │   └── use-toast.ts
│       ├── index.css
│       ├── lib
│       │   ├── auth-utils.ts
│       │   ├── queryClient.ts
│       │   ├── seo-config.ts
│       │   └── utils.ts
│       ├── main.tsx
│       └── pages
│           ├── about.tsx
│           ├── academics.tsx
│           ├── admissions.tsx
│           ├── alumni.tsx
│           ├── careers.tsx
│           ├── contact.tsx
│           ├── day-at-aashley.tsx
│           ├── gallery.tsx
│           ├── home.tsx
│           ├── news.tsx
│           ├── not-found.tsx
│           ├── portal
│           │   ├── dashboard.tsx
│           │   ├── login.tsx
│           │   ├── manage-classes.tsx
│           │   ├── manage-users.tsx
│           │   └── teacher-students.tsx
│           └── why-aashley.tsx
├── components.json
├── design_guidelines.md
├── docker-compose.yml
├── drizzle.config.ts
├── package-lock.json
├── package.json
├── postcss.config.js
├── replit.md
├── script
│   └── build.ts
├── server
│   ├── authz.ts
│   ├── db.ts
│   ├── index.ts
│   ├── replit_integrations
│   │   └── auth
│   │       ├── index.ts
│   │       ├── replitAuth.ts
│   │       ├── routes.ts
│   │       └── storage.ts
│   ├── routes.ts
│   ├── services
│   │   └── emailService.ts
│   ├── static.ts
│   ├── storage.ts
│   └── vite.ts
├── shared
│   ├── authz.ts
│   ├── models
│   │   └── auth.ts
│   └── schema.ts
├── tailwind.config.ts
├── tsconfig.json
├── vercel.json
└── vite.config.ts
```

## 2) Tech Stack

- Runtime: Node.js
- Language: TypeScript / JavaScript
- Backend: Express
- Frontend: React + Vite + Wouter
- Data fetching: TanStack React Query
- Database: PostgreSQL (`pg`)
- ORM: Drizzle ORM + Drizzle Kit + drizzle-zod
- Validation: Zod
- Auth: Session-based auth with `express-session` + `connect-pg-simple`
- Password hashing: `bcryptjs`
- UI: Tailwind CSS + Radix UI + shadcn-style components
- Email: Resend API
- Build: esbuild + Vite
- Deploy configs: Vercel + Docker

## 3) Entry Points (Raw)

### `server/index.ts`

```ts
import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";

const app = express();
const httpServer = createServer(app);

declare module "http" {
  interface IncomingMessage {
    rawBody: unknown;
  }
}

app.use(
  express.json({
    verify: (req, _res, buf) => {
      req.rawBody = buf;
    },
  }),
);

app.use(express.urlencoded({ extended: false }));

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      log(logLine);
    }
  });

  next();
});

export const initPromise = (async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  if (process.env.NODE_ENV === "production") {
    if (!process.env.VERCEL) {
      serveStatic(app);
    }
  } else {
    if (!process.env.VERCEL) {
      const { setupVite } = await import("./vite");
      await setupVite(httpServer, app);
    }
  }

  const port = parseInt(process.env.PORT || "5000", 10);
  
  if (!process.env.VERCEL) {
    httpServer.listen(
      {
        port,
        host: "0.0.0.0",
        reusePort: true,
      },
      () => {
        log(`serving on port ${port}`);
      },
    );
  }

  return app;
})();
```

### `api/index.js`

```js
import serverData from "../dist/index.cjs";

export default async function handler(req, res) {
  const app = await serverData.initPromise;
  
  // Hand the request to Express
  return app(req, res);
}
```

### `client/src/main.tsx`

```tsx
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(<App />);
```

### `client/src/App.tsx`

```tsx
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { SEOHead } from "@/components/seo/seo-head";
import { JsonLdSchema } from "@/components/seo/json-ld-schema";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { Loader } from "@/components/loader";

import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import AcademicsPage from "@/pages/academics";
import AdmissionsPage from "@/pages/admissions";
import GalleryPage from "@/pages/gallery";
import DayAtAashleyPage from "@/pages/day-at-aashley";
import NewsPage from "@/pages/news";
import AlumniPage from "@/pages/alumni";
import ContactPage from "@/pages/contact";
import WhyAashleyPage from "@/pages/why-aashley";
import CareersPage from "@/pages/careers";

import PortalLoginPage from "@/pages/portal/login";
import PortalDashboard from "@/pages/portal/dashboard";
import ManageUsersPage from "@/pages/portal/manage-users";
import ManageClassesPage from "@/pages/portal/manage-classes";
import TeacherStudentsPage from "@/pages/portal/teacher-students";

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/academics" component={AcademicsPage} />
      <Route path="/admissions" component={AdmissionsPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/day-at-aashley" component={DayAtAashleyPage} />
      {/* <Route path="/news" component={NewsPage} /> */}
      <Route path="/alumni" component={AlumniPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/why-aashley" component={WhyAashleyPage} />
      <Route path="/careers" component={CareersPage} />
      
      <Route path="/portal" component={PortalLoginPage} />
      <Route path="/portal/dashboard" component={PortalDashboard} />
      <Route path="/portal/admin/users" component={ManageUsersPage} />
      <Route path="/portal/admin/classes" component={ManageClassesPage} />
      <Route path="/portal/teacher/students" component={TeacherStudentsPage} />
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="aashley-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SEOHead />
          <JsonLdSchema />
          <Toaster />
          <Loader />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
```

## 4) Routes / API Endpoints

### Auth

- `POST /api/auth/login` - Login and create session
- `POST /api/auth/register` - Disabled
- `GET /api/auth/user` - Current user + effective permissions
- `POST /api/auth/logout` - Logout
- `GET /api/logout` - Logout + redirect

### Public

- `POST /api/admission-enquiries`
- `POST /api/alumni`
- `POST /api/contact`
- `GET /api/events`
- `GET /api/gallery`
- `GET /api/growth-stories`
- `GET /api/alumni/approved`
- `GET /api/careers`
- `POST /api/careers/apply`

### Portal / Protected

- `GET /api/portal/announcements`
- `GET /api/portal/resources`
- `GET /api/portal/events`

### Admin / Teacher Protected

- `POST /api/admin/announcements`
- `POST /api/admin/users`
- `GET /api/admin/users`
- `PATCH /api/admin/users/:id/role`
- `PATCH /api/admin/users/:id/permissions`
- `PATCH /api/admin/users/:id`
- `GET /api/admin/permissions/catalog`
- `GET /api/admin/classes`
- `POST /api/admin/classes`
- `PUT /api/admin/classes/:classId/teachers`
- `PUT /api/admin/classes/:classId/students`
- `GET /api/admin/classes/:classId/assignments`
- `GET /api/teacher/classes/me`
- `GET /api/teacher/students/me`
- `PATCH /api/teacher/students/:id`
- `POST /api/admin/events`
- `POST /api/admin/gallery`
- `POST /api/admin/resources`
- `POST /api/admin/growth-stories`
- `GET /api/admin/admission-enquiries`
- `GET /api/admin/contact-messages`
- `GET /api/admin/alumni`
- `POST /api/admin/careers`
- `GET /api/admin/careers`
- `GET /api/admin/applications`

## 5) Database (Schema/Tables)

Defined in:

- `shared/models/auth.ts`
- `shared/schema.ts`

Tables:

- `sessions`
- `users`
- `portal_users`
- `classes`
- `class_teachers`
- `class_students`
- `announcements`
- `events`
- `gallery_items`
- `admission_enquiries`
- `alumni`
- `resources`
- `contact_messages`
- `growth_stories`
- `job_postings`
- `job_applications`

## 6) Auth System

- Session-based auth using PostgreSQL store (`connect-pg-simple`)
- Passwords hashed with bcrypt
- Session user attached to `req.session.user`
- Role hierarchy: `super_admin > admin > staff > student`
- Permissions resolved from role defaults + grants/revokes
- Middleware:
  - `isAuthenticated` (session check)
  - `requirePermission` (permission guard)
  - role utility guards (`ensureCanAssignRole`, `ensureCanManageUser`)

## 7) Backend Portal Logic

Portal/admin logic is centered in:

- `server/routes.ts`
- `server/authz.ts`
- `server/storage.ts`
- `client/src/pages/portal/*`

Features include:

- Role-aware announcements/resources
- Admin user management
- Class assignment workflows (teacher/student mapping)
- Teacher-scoped student management
- Admin operations for events/gallery/resources/growth stories/admissions/careers

## 8) Environment Variables

Used in code:

- `DATABASE_URL`
- `SESSION_SECRET`
- `NODE_ENV`
- `PORT`
- `VERCEL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ENQUIRY_EMAIL_TO`

From `.env.example`:

- `DATABASE_URL`
- `RESEND_API_KEY`
- `EMAIL_FROM`
- `ENQUIRY_EMAIL_TO`

## 9) Known Issues / Risky Areas

- `SESSION_SECRET` has insecure default fallback in code
- Error middleware rethrows after sending response (`throw err`)
- Some public flows continue even if DB write fails (logs only)
- No visible CSRF/rate limiting guards on auth/contact endpoints
- Build allowlist contains packages not in current dependency list
- `portal_users` appears underused versus direct `users` role model

## 10) Raw File Contents (Requested Categories)

### Route Files

- `server/routes.ts` (see source file in repo; very large)
- `server/replit_integrations/auth/routes.ts`:

```ts
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
```

- `server/replit_integrations/auth/replitAuth.ts`:

```ts
import session from "express-session";
import type { Express, RequestHandler } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcryptjs";
import { authStorage } from "./storage";
import { normalizeRole, resolveEffectivePermissions } from "@shared/authz";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000;
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET || "aashley-school-secret-key",
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

  app.post("/api/auth/login", async (req, res) => {
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

  app.get("/api/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) console.error("Logout error:", err);
      res.redirect("/portal");
    });
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
```

### Model/Schema Files

- `shared/models/auth.ts` (full content present in repo)
- `shared/schema.ts` (full content present in repo)
- `shared/authz.ts` (full content present in repo)

### Middleware Files

- `server/authz.ts` (full content present in repo)
- `server/replit_integrations/auth/replitAuth.ts` (acts as auth middleware layer)

### Main Config Files

- `package.json`
- `tsconfig.json`
- `drizzle.config.ts`
- `vite.config.ts`
- `tailwind.config.ts`
- `postcss.config.js`
- `vercel.json`
- `docker-compose.yml`
- `Dockerfile`
- `components.json`

---

## Notes

- This report was generated from current workspace contents.
- If you want, I can generate a second file `PROJECT_AUDIT_FULL_RAW.md` that includes *entire* raw text of every requested file (including very large files like `server/routes.ts` and `shared/schema.ts`) with no truncation.
