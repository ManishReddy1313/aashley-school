/**
 * SEO configuration for Aashley International School
 * Primary: Bangarpet, Kolar District, Karnataka
 */

const SITE_URL = typeof window !== "undefined" 
  ? window.location.origin 
  : "https://aashleyinternationalschool.in";

export const SEO_CONFIG = {
  siteName: "Aashley International School",
  defaultTitle: "Aashley International School | Best School in Bangarpet | ICSE (CISCE) Education",
  defaultDescription: "Aashley International School in Bangarpet provides quality ICSE (CISCE) education with modern infrastructure, experienced teachers, sports facilities, and holistic learning for students in Kolar District.",
  defaultImage: "/aashley_logo.png",
  locale: "en_IN",
  siteUrl: SITE_URL,
  phone: "+91 94803 30967",
  email: "contact@aashleyinternationalschool.in",
  address: {
    street: "Bangarpet Road, next to HP Gas Agency, Budikote",
    city: "Bangarpet",
    state: "Karnataka",
    postalCode: "563114",
    country: "India",
    full: "Bangarpet Road, Budikote, Bangarpet, Kolar - 563114",
  },
  geo: {
    latitude: 12.9870147,
    longitude: 78.170699,
  },
  social: {
    instagram: "https://www.instagram.com/aashley__2009/",
  },
  keywords: [
    "Aashley International School Bangarpet",
    "Best School in Bangarpet",
    "International School in Bangarpet",
    "ICSE School in Bangarpet",
    "Top School in Bangarpet",
    "Best School in Kolar District",
    "Schools near Bangarpet",
    "Best Education in Bangarpet",
    "Schools in Kolar",
    "Schools in KGF",
    "Schools in Malur",
  ].join(", "),
} as const;

export type PageSEO = {
  title: string;
  description: string;
  path: string;
  image?: string;
  noindex?: boolean;
  keywords?: string;
};

export const PAGE_SEO: Record<string, PageSEO> = {
  "/": {
    title: "Aashley International School | Best School in Bangarpet | ICSE (CISCE) Education",
    description: "Aashley International School in Bangarpet provides quality ICSE (CISCE) education with modern infrastructure, experienced teachers, sports facilities, and holistic learning for students in Kolar District.",
    path: "/",
    keywords: "Aashley International School Bangarpet, Best School in Bangarpet, ICSE School in Bangarpet, CISCE Bangarpet, Top School in Kolar District",
  },
  "/about": {
    title: "About Us | Aashley International School - Best School in Bangarpet",
    description: "Discover Aashley International School's mission, values, and commitment to excellence in education. Established in Bangarpet, serving Kolar District since 2008.",
    path: "/about",
    keywords: "About Aashley International School, Best School Bangarpet, School mission values",
  },
  "/academics": {
    title: "Academics | ICSE CISCE Curriculum | Aashley International School Bangarpet",
    description: "Explore our ICSE (CISCE) curriculum, grade-wise programs, and academic excellence at Aashley International School in Bangarpet. Quality education from primary to secondary.",
    path: "/academics",
    keywords: "ICSE curriculum Bangarpet, CISCE Bangarpet, Academics Aashley School, School programs Kolar",
  },
  "/admissions": {
    title: "Admissions | Aashley International School - Enroll in Bangarpet's Best School",
    description: "Apply for admissions at Aashley International School Bangarpet. Complete process, eligibility, and requirements for ICSE (CISCE) education in Kolar District.",
    path: "/admissions",
    keywords: "School admissions Bangarpet, ICSE admission Kolar, Enroll Aashley School",
  },
  "/why-aashley": {
    title: "Why Choose Aashley? | Best International School in Bangarpet",
    description: "Why parents choose Aashley International School in Bangarpet - value-based education, modern facilities, experienced faculty, and holistic development.",
    path: "/why-aashley",
    keywords: "Why Aashley School, Best School Bangarpet, Quality education Kolar",
  },
  "/gallery": {
    title: "Gallery | Aashley International School Bangarpet - Campus & Activities",
    description: "View photos of Aashley International School campus, classrooms, sports, events, and student activities. Best school in Bangarpet, Kolar District.",
    path: "/gallery",
    keywords: "Aashley School gallery, School photos Bangarpet, Campus images",
  },
  "/day-at-aashley": {
    title: "A Day at Aashley | Student Life | Aashley International School Bangarpet",
    description: "Experience a typical day at Aashley International School - morning assembly, classes, sports, and co-curricular activities. Best education in Bangarpet.",
    path: "/day-at-aashley",
    keywords: "A Day at Aashley, Student life Bangarpet, School routine",
  },
  "/contact": {
    title: "Contact Us | Aashley International School Bangarpet | Location & Hours",
    description: "Contact Aashley International School in Bangarpet. Address: Bangarpet Road, Budikote. Phone: +91 94803 30967. Visit the best school in Kolar District.",
    path: "/contact",
    keywords: "Contact Aashley School, School address Bangarpet, Aashley School phone",
  },
  "/careers": {
    title: "Careers | Join Aashley International School Bangarpet",
    description: "Join the team at Aashley International School Bangarpet. Teaching and non-teaching positions at one of the best schools in Kolar District.",
    path: "/careers",
    keywords: "Careers Aashley School, Teaching jobs Bangarpet, School jobs Kolar",
  },
  "/portal": {
    title: "Portal Login | Aashley International School",
    description: "Login to Aashley International School portal.",
    path: "/portal",
    noindex: true,
  },
  "/portal/dashboard": {
    title: "Dashboard | Aashley International School",
    description: "Aashley International School portal dashboard.",
    path: "/portal/dashboard",
    noindex: true,
  },
  "/alumni": {
    description: "Connect with Aashley International School alumni. Stay connected with your alma mater - the best school in Bangarpet and Kolar District.",
    path: "/alumni",
    keywords: "Aashley School alumni, Alumni network Bangarpet",
  },
};

export function getFullUrl(path: string): string {
  const base = typeof window !== "undefined" ? window.location.origin : SEO_CONFIG.siteUrl;
  return `${base.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}
