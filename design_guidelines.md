# Design Guidelines for Aashley International School Website

## Design Approach

**Hybrid Strategy**: Premium storytelling for public site + Clean, functional portal

**Public Site Inspiration**: Airbnb's photo storytelling + Apple's refined minimalism + Medium's editorial layouts
**Portal Inspiration**: Linear's clarity + Notion's role-based organization

## Core Design Principles

1. **Emotional Connection First**: Design prioritizes human stories over institutional rigidity
2. **Premium yet Approachable**: Sophisticated but never cold or intimidating
3. **Clear Hierarchy**: Public brand experience vs. functional private portal are distinctly different

## Typography System

**Primary Font**: Inter or Poppins (Google Fonts) - clean, modern, highly readable
**Secondary Font**: Playfair Display or Lora for taglines and emotional storytelling sections

**Hierarchy**:
- Hero Headlines: text-5xl to text-7xl, font-bold
- Section Titles: text-3xl to text-4xl, font-semibold
- Body Text: text-base to text-lg, leading-relaxed
- Portal UI: text-sm to text-base, consistent weights

## Layout System

**Spacing Scale**: Use Tailwind units of 4, 6, 8, 12, 16, 20, 24 for consistent rhythm
**Section Padding**: py-16 on mobile, py-24 on desktop for public site; tighter py-8 to py-12 for portal

**Grid Strategy**:
- Photo Stories: Masonry-style asymmetric grid (not rigid)
- Features: 3-column on desktop (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Portal Dashboards: Single column cards on mobile, 2-column on desktop

## Public Website Components

### Homepage
**Hero Section**: Full-width emotional image (students in natural learning moments), centered headline overlay with blurred-background CTA buttons
- Image: Warm classroom scene or outdoor learning activity
- Height: min-h-screen with content vertically centered
- Typography: Large, confident headline with school tagline below

**Photo Stories Gallery**: Irregular card sizes creating Pinterest-style masonry layout, hover effects revealing captions, natural photography showcasing real moments

**Instagram Wall**: 3x3 grid on desktop pulling #AashleyLife posts, auto-refreshing, click-through to Instagram

**Growth Stories Section**: Large testimonial cards with student/parent photos, quote-first layout, emphasis on transformation narratives

### A Day at Aashley
Timeline infographic with illustrated icons, horizontal scroll on mobile, vertical on desktop, warm color accents marking different periods

### Academics & Programs
Card-based layout with curriculum highlights, expandable sections for detailed information, icons representing different subjects/activities

### Gallery
**Critical**: Emotional photo story layouts with varied image sizes, contextual captions, event-based categorization, lightbox modal for full-view

### Contact Page
Split layout: left side with contact form, right side with embedded map and quick contact details

## Private Portal Components

### Login Page
Centered card design, school logo prominent, role selection dropdown (Student/Parent/Teacher/Admin), clean minimal form fields

### Dashboard (Role-Based)
**Header**: Fixed navigation with role indicator badge, quick access icons, logout button
**Live Ticker**: Horizontal scrolling banner below header showing urgent announcements, color-coded by priority
**Main Content**: Card-based layout with sections for:
- Upcoming deadlines (students/parents)
- Recent circulars (downloadable PDFs)
- Calendar widget showing exam schedules
- Quick actions panel

**Design Difference**: Portal uses tighter spacing, functional card layouts, table views for schedules, less decorative elements than public site

### Admin Panel
Table-heavy layouts with search/filter controls, modal forms for adding content, user management with clear deactivation controls

## Component Library

**Buttons**: 
- Primary: Solid fill with subtle shadow, rounded-lg
- Secondary: Outlined with border
- On-image: Backdrop-blur-md background with white text

**Cards**: 
- Public site: Generous padding (p-8), soft shadows, rounded-xl
- Portal: Compact (p-6), subtle borders, rounded-lg

**Forms**: Consistent input styling, floating labels, validation states, file upload for circulars/assignments

**Navigation**:
- Public: Full-width header, hamburger menu on mobile, dropdown menus for sub-sections
- Portal: Sidebar navigation on desktop, bottom nav on mobile, role-based menu items

**Modals**: Center-screen overlays for lightbox gallery, form submissions, confirmation dialogs

## Images Strategy

**Hero Image**: Yes - Large emotional hero on homepage (students engaged in learning)
**Additional Images**:
- About Us: Principal photo, campus images
- Photo Stories: 15-20 authentic school moment photos
- Growth Stories: 3-5 student/parent testimonial photos
- Gallery: Event-based collections (50+ photos organized by category)
- A Day at Aashley: Illustrated icons/graphics timeline

**Image Treatment**: Natural, warm photography for public site; functional icons for portal UI

## Accessibility & Responsiveness

- All portal tables mobile-responsive with horizontal scroll or card transformation
- Touch-friendly targets minimum 44px
- Clear focus states for keyboard navigation
- High contrast text throughout portal for readability
- Semantic HTML structure maintained across both public and private areas