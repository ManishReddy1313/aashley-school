# Project Tracker (Single Source of Truth)

This file is the single running memory for:
- What has been done
- What is next
- What to avoid duplicating

## Working Rule
- Do not change current frontend pages unless explicitly requested by user.

## Done So Far
- Completed read-only backend + portal integration analysis.
- Confirmed backend stack: Express + TypeScript + Drizzle + PostgreSQL.
- Confirmed auth/session flow exists (`/api/auth/login`, `/api/auth/register`, `/api/auth/logout`, `/api/auth/user`).
- Confirmed role-based admin middleware exists (`role === "admin"` checks).
- Confirmed portal-protected API routes exist (`/api/portal/*`).
- Confirmed email integration exists (Resend-based service).
- Reviewed Docker setup and env dependencies in `docker-compose.yml` and `.env.example`.
- Identified launch gap: external Docker network `proxy_default` is required.
- Identified data-flow gap: admission/contact endpoints send email but do not persist to DB, while admin reads DB tables.
- Identified access gap: newly registered users default to `student`; no built-in admin bootstrap flow.
- No frontend files were modified.
- Added header `Portal Login` button in shared public header (desktop + mobile), linked to existing `/portal/dashboard` flow.
- Removed public registration from portal login and restricted user creation to admin-only API.
- Implemented production RBAC foundation with roles (`super_admin`, `admin`, `staff`, `student`) and permission overrides.
- Implemented dynamic portal dashboard rendering for `super_admin` and `admin` roles on the existing dashboard route.
- Added functional Super Admin/Admin user-management page and class-teacher-student backend linkage with role-scoped constraints.
- Added class-management UI and advanced SuperAdmin user edit controls (permissions + reset password) wired to backend.
- Added teacher portal student-management view with class-scoped access enforcement.
- Enhanced teacher view with class names, class-based grouping/filter context, and student search.

## Next Steps (Backend-First)
1. Prepare `.env` with required values (`DATABASE_URL`, `SESSION_SECRET`; email keys if testing email).
2. Start backend (`npm run db:push` then `npm run dev`) or Docker bring-up (`docker compose up -d --build`).
3. Run API smoke tests for auth/session and portal-protected endpoints.
4. Create/confirm at least one admin user for admin route validation.
5. Validate whether admission/contact should be DB-persisted; if yes, implement backend persistence (no frontend changes).
6. Verify portal data endpoints return real data (not just frontend fallback display).

## Duplication Guard
- Before starting new work, check this file first.
- If an item is already in "Done So Far", do not repeat the same analysis.
- Add only net-new findings, decisions, and actions.

## Update Format (for all future updates)
- Date:
- Task:
- Completed:
- Next:
- Notes/Decisions:

## Latest Update
- Date: 2026-03-23
- Task: Improve teacher UX with class names + filtering.
- Completed:
  - Extended `GET /api/teacher/classes/me` in `server/routes.ts` to return class metadata (`name`, `section`, `academicYear`) in addition to IDs.
  - Extended `GET /api/teacher/students/me` to include `classIds` per student.
  - Added new storage helpers in `server/storage.ts`:
    - `getClassesByIds`
    - `getClassStudentLinks`
  - Updated `client/src/pages/portal/teacher-students.tsx`:
    - displays assigned class names as badges
    - adds student search
    - adds class filter dropdown
    - shows class badges on each student row
    - keeps teacher edit flow constrained to assigned classes
- Next:
  - Add pagination/virtualized list for very large student lists.
  - Optionally add per-class grouped sections (accordion view) based on filter usage feedback.
  - Run `npm run db:push` and end-to-end role tests.
- Notes/Decisions:
  - No change to permission policy; only data shape + UI enhancements.
  - `npm run check` still only fails due to pre-existing files `client/src/lib/seo-config.ts` and `client/src/pages/news.tsx`.

