# SEO Optimization Report - Aashley International School

**Date:** March 14, 2025  
**Target:** Aashley International School, Bangarpet, Karnataka  
**Primary Focus:** Local SEO for Bangarpet, Kolar District, KGF, Malur

---

## 1. META SEO IMPLEMENTED

### Per-Page Meta Tags
- **Title tags** – Unique, keyword-rich titles (55–60 chars) for each page
- **Meta descriptions** – Compelling 150–160 char descriptions with primary keywords
- **Meta keywords** – Target keywords added: Aashley International School Bangarpet, Best School in Bangarpet, CBSE School in Bangarpet, Top School in Bangarpet, Best School in Kolar District, Schools near Bangarpet, Best Education in Bangarpet
- **Canonical URLs** – Dynamic canonical set per page via `SEOHead` component
- **Robots meta** – `index, follow` for public pages; `noindex, nofollow` for `/portal` and `/portal/dashboard`

### Pages Configured
| Page | Title |
|------|-------|
| Home | Aashley International School \| Best School in Bangarpet \| CBSE Education |
| About | About Us \| Aashley International School - Best School in Bangarpet |
| Academics | Academics \| CBSE Curriculum \| Aashley International School Bangarpet |
| Admissions | Admissions \| Aashley International School - Enroll in Bangarpet's Best School |
| Why Aashley | Why Choose Aashley? \| Best International School in Bangarpet |
| Gallery | Gallery \| Aashley International School Bangarpet - Campus & Activities |
| Day at Aashley | A Day at Aashley \| Student Life \| Aashley International School Bangarpet |
| Contact | Contact Us \| Aashley International School Bangarpet \| Location & Hours |
| Careers | Careers \| Join Aashley International School Bangarpet |
| Alumni | Alumni \| Aashley International School Bangarpet |

---

## 2. OPEN GRAPH & SOCIAL SEO

- **og:title** – Per-page
- **og:description** – Per-page
- **og:url** – Canonical URL per page
- **og:image** – Logo/school image (absolute URL)
- **og:type** – `website`
- **og:site_name** – Aashley International School
- **og:locale** – en_IN
- **twitter:card** – `summary_large_image`
- **twitter:title** – Per-page
- **twitter:description** – Per-page
- **twitter:image** – Per-page

---

## 3. STRUCTURED DATA (JSON-LD)

### Schemas
1. **School** – `schema.org/School`  
   - name, description, url, telephone, email, address, geo, sameAs (Instagram), areaServed, openingHoursSpecification
2. **EducationalOrganization** – `schema.org/EducationalOrganization`  
   - name, image, url, telephone, email, address, geo, areaServed
3. **Organization** – `schema.org/Organization`  
   - name, logo, url, sameAs, contactPoint (telephone, email, areaServed, availableLanguage, address)

### Location Data
- **Address:** Bangarpet Road, Budikote, Bangarpet, Kolar - 563114
- **Geo:** 12.9870147, 78.170699
- **Areas:** Bangarpet, Kolar District, Kolar, KGF, Malur

---

## 4. PAGE STRUCTURE & HEADING HIERARCHY

- **Single H1** on each page
- **Homepage H1:** “Aashley International School – Best School in Bangarpet”
- **H2** for main sections (e.g. About Our School, Our Facilities, Why Choose Aashley)
- **H3** for sub-sections (e.g. feature titles, step titles)
- Proper use of `aria-labelledby` on sections where helpful

---

## 5. IMAGE SEO

- **Alt text** – Descriptive, includes “Aashley International School Bangarpet” and context (e.g. “Students learning at Aashley International School Bangarpet”)
- **loading="lazy"** – Applied to below-the-fold images
- **Hero image** – Uses `loading="eager"` on the first slide
- **Image descriptions** – Clarified across gallery, home, about, and other pages

---

## 6. TECHNICAL SEO

### Files
- **`/robots.txt`** – Allows indexing of public pages, disallows `/portal`, `/portal/`, and `/api/`; includes sitemap reference
- **`/sitemap.xml`** – Lists all public URLs with lastmod, changefreq, priority

### robots.txt Content
```
User-agent: *
Allow: /
Disallow: /portal
Disallow: /portal/
Disallow: /api/

Sitemap: https://www.aashleyinternationalschool.in/sitemap.xml
```

**Important:** Replace `https://www.aashleyinternationalschool.in` in `sitemap.xml` and `robots.txt` with your live domain.

---

## 7. LOCAL SEO CONTENT

### Homepage Section
“Best School in Bangarpet & Kolar District” with:
- Target keywords used naturally
- Location and curriculum details
- Facilities and teaching quality
- Call to action to visit
- Coverage of Bangarpet, Kolar, KGF, Malur

---

## 8. INTERNAL LINKING & NAVIGATION

### Footer Quick Links
- About Us
- Academics
- Admissions
- Gallery
- A Day at Aashley
- Alumni
- Why Aashley?
- Careers
- Contact

### Header
- Main nav and top bar links added/kept for primary pages

---

## 9. ACCESSIBILITY

- **aria-label** on Instagram link, scroll-to-top button, and hero slider controls
- **aria-labelledby** on the “Best School in Bangarpet” section
- **aria-hidden** for inactive hero slides
- **Semantic HTML** – use of `<header>`, `<main>`, `<footer>`, `<section>`, `<nav>`

---

## 10. CURRICULUM ALIGNMENT

- Content updated from ICSE to **CBSE** to match target keywords (e.g. “CBSE School in Bangarpet”)
- Applied across Home, About, and related mentions

---

## FILES CREATED / MODIFIED

### Created
- `client/src/lib/seo-config.ts` – SEO config and page meta
- `client/src/components/seo/seo-head.tsx` – Dynamic meta/og/twitter tags
- `client/src/components/seo/json-ld-schema.tsx` – JSON-LD structured data
- `client/public/robots.txt`
- `client/public/sitemap.xml`

### Modified
- `client/index.html` – Default meta, og, twitter tags, canonical
- `client/src/App.tsx` – `SEOHead`, `JsonLdSchema` components
- `client/src/pages/home.tsx` – H1, Local SEO section, image alts, CBSE
- `client/src/components/public-layout.tsx` – Footer links
- `client/src/pages/about.tsx` – CBSE update
- `client/src/pages/gallery.tsx` – Image alt text

---

## LIGHTHOUSE RECOMMENDATIONS

1. **Performance**
   - Vite already does code-splitting; consider lazy-loading non-critical routes with `React.lazy`
   - Optimize images (e.g. WebP) and use `responsive`/`srcset` where relevant
   - Trim unused font families in `index.html`
   - Preload critical assets (logo, primary font)

2. **Best Practices**
   - Ensure HTTPS in production
   - Avoid large layout shifts (fixed heights/skeleton for images if needed)
   - Use `rel="noopener"` on external links (already done for Instagram)

3. **SEO**
   - Submit `sitemap.xml` in Google Search Console
   - Verify the site in Google Search Console and Google Business Profile
   - Add the site to Bing Webmaster Tools

---

## GOOGLE BUSINESS OPTIMIZATION

- Structured contact section present (footer + contact page)
- Address: Bangarpet Road, Budikote, Bangarpet, Kolar - 563114
- Phone: +91 94803 30967
- Email: contact@aashleyinternationalschool.in
- Google Maps embed on the Contact page
- Hours: Mon–Fri 8:00 AM–4:00 PM, Sat 9:00 AM–1:00 PM

---

## BLOG / SEO CONTENT (Future)

A blog section was not added. Suggested topics for future posts:
- Best Schools in Bangarpet
- Why CBSE Education Works Well for Students
- How to Choose the Best School in Kolar District
- Importance of Sports in Education

To add a blog, create a `/blog` route and structure posts with their own meta and schema if needed.
