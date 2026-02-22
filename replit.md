# Aashley International School Website

## Overview
A comprehensive marketing and admission-focused website for Aashley International School, Bangarapet, Kolar District, Karnataka. ICSE-affiliated (CISCE), co-educational day school established in 2008, serving Pre-Primary to Class 10.

## Real School Information
- **Location**: Bangarpet Road, next to HP Gas Agency, Budikote, Bangarapet, Kolar - 563114, Karnataka
- **Board**: ICSE (CISCE affiliated)
- **Medium**: English
- **Type**: Private Unaided, Co-educational Day School
- **Principal**: Mrs. Veenarani B C
- **Established**: 2008-2009
- **Classes**: Pre-Primary through Class 10
- **Rating**: 4.6/5 (388+ reviews)
- **Facilities**: 20 classrooms, computer lab, science lab, library (500+ books), playground, mid-day meals

## Architecture
- **Frontend**: React + TypeScript + Vite (client/)
- **Backend**: Express + TypeScript (server/)
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: Replit Auth (OIDC)
- **Styling**: Tailwind CSS + shadcn/ui components
- **Theme**: Deep blue primary (#1a365d style) + Gold accent

## Pages (12 Public + Portal)
1. **Home** - Hero with real school images, stats, features, photo stories, testimonials
2. **About Us** - Vision/mission, core values, principal's message, milestones, accreditations
3. **Academics** - ICSE curriculum overview (4 levels), teaching methodology, co-curricular, facilities
4. **Admissions** - Process steps, enquiry form, downloads, eligibility
5. **Gallery** - Photo gallery with categories
6. **A Day at Aashley** - Daily schedule showcase
7. **News & Events** - School news and upcoming events
8. **Alumni** - Alumni registration and stories
9. **Contact** - Contact form, department info, map embed
10. **Why Aashley?** - Unique features showcase, comparison table, parent testimonials, principal's message
11. **Careers** - Job postings, application form, staff testimonials, benefits
12. **Portal** - Login + Role-based dashboards (Student/Parent/Teacher/Admin)

## Navigation Structure
- **Top Bar** (dark blue): Gallery | A Day at Aashley | News & Events | Alumni | Careers | Contact + Social icons
- **Main Nav** (white): Home | About Us | Academics | Admissions | Why Aashley? | Portal

## Database Tables
- portal_users, announcements, events, gallery_items, admission_enquiries
- alumni, resources, contact_messages, growth_stories
- job_postings, job_applications

## Key Technical Notes
- apiRequest signature: `apiRequest(method, url, data)`
- Forms use react-hook-form + shadcn Form + Zod validation
- TanStack Query v5 (object form only)
- Images imported from `@assets/` directory
- Port 5000 for both frontend and backend

## Recent Changes (Feb 2026)
- Added "Why Aashley?" page with 12 unique features, comparison table, 4 parent testimonials
- Added Careers portal with job postings API, application form, staff testimonials
- Replaced all placeholder content with real Aashley International School data
- Updated from CBSE to ICSE throughout all pages
- Real principal name (Mrs. Veenarani B C), real address, real facilities
- Two-row header navigation matching Cambridge Institute style
