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
- **Auth**: Username/password with bcrypt + express-session
- **Styling**: Tailwind CSS + shadcn/ui components
- **Theme**: Deep navy primary (HSL 215 70% 22%) + Rich gold accent (HSL 40 100% 50%)
- **Fonts**: Poppins (body), Playfair Display (headings)

## Active Pages (10 Public)
1. **Home** - Hero with real school images, stats, features, photo stories, testimonials, scroll-reveal animations
2. **About Us** - Vision/mission, core values, principal's message, milestones, accreditations
3. **Academics** - ICSE curriculum overview (4 levels), teaching methodology, co-curricular, facilities
4. **Admissions** - Process steps, enquiry form, downloads, eligibility
5. **Gallery** - Photo gallery with 21 real categorized images and lightbox
6. **A Day at Aashley** - Daily schedule showcase
7. **Alumni** - Alumni registration and stories
8. **Contact** - Contact form, department info, map embed
9. **Why Aashley?** - Unique features showcase, comparison table, parent testimonials
10. **Careers** - Job postings, application form, staff testimonials, benefits

## Hidden Pages (temporarily disabled)
- **News & Events** - Route commented out in App.tsx, removed from navigation
- **Portal** - Routes still accessible but hidden from navigation and footer

## Navigation Structure
- **Top Bar** (dark navy): Gallery | A Day at Aashley | Alumni | Careers | Contact + Social icons
- **Main Nav** (white, sticky with backdrop blur): School Logo + Home | About Us | Academics | Admissions | Why Aashley?

## School Logo
- File: attached_assets/02_school_logo_1772107248114.jpg
- Displayed as circular image in header and footer (replaces GraduationCap icon)

## Database Tables
- portal_users, announcements, events, gallery_items, admission_enquiries
- alumni, resources, contact_messages, growth_stories
- job_postings, job_applications

## Key Technical Notes
- apiRequest signature: `apiRequest(method, url, data)`
- Forms use react-hook-form + shadcn Form + Zod validation
- TanStack Query v5 (object form only)
- Images imported from `@assets/` directory (50+ real school images)
- Port 5000 for both frontend and backend
- Scroll-reveal animations using IntersectionObserver (home page)
- CSS animations: fade-in-up, slow-zoom, scroll-reveal
- Scroll-to-top floating button
- Hover transitions on cards, buttons, navigation items, social icons
- Mobile menu with smooth expand/collapse animation

## Recent Changes (Feb 2026)
- Hidden Portal from navigation and footer
- Hidden News & Events page and removed from top bar
- Removed Upcoming Events section from home page
- Added school logo (circular) to header and footer
- Updated color scheme: deeper navy primary, richer gold accent
- Changed body font to Poppins, headings to Playfair Display
- Added scroll-reveal animations on home page sections
- Added hover transitions (cards lift, images zoom, buttons shadow)
- Added sticky header with backdrop blur on scroll
- Added scroll-to-top floating button
- Integrated 50+ real school images across all pages
