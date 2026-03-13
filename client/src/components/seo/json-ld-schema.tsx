import { SEO_CONFIG, getFullUrl } from "@/lib/seo-config";

const schoolSchema = {
  "@context": "https://schema.org",
  "@type": "School",
  "@id": "https://www.aashleyinternationalschool.in/#school",
  name: "Aashley International School",
  alternateName: "Aashley International School Bangarpet",
  description: "Aashley International School in Bangarpet provides quality CBSE education with modern infrastructure, experienced teachers, sports facilities, and holistic learning for students in Kolar District, Karnataka.",
  url: "https://www.aashleyinternationalschool.in",
  telephone: "+91 94803 30967",
  email: "contact@aashleyinternationalschool.in",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bangarpet Road, next to HP Gas Agency, Budikote",
    addressLocality: "Bangarpet",
    addressRegion: "Karnataka",
    postalCode: "563114",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9870147,
    longitude: 78.170699,
  },
  sameAs: ["https://www.instagram.com/aashley__2009/"],
  areaServed: [
    { "@type": "City", name: "Bangarpet" },
    { "@type": "AdministrativeArea", name: "Kolar District" },
    { "@type": "City", name: "Kolar" },
    { "@type": "City", name: "KGF" },
    { "@type": "City", name: "Malur" },
  ],
  openingHoursSpecification: [
    { "@type": "OpeningHoursSpecification", dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"], opens: "08:00", closes: "16:00" },
    { "@type": "OpeningHoursSpecification", dayOfWeek: "Saturday", opens: "09:00", closes: "13:00" },
  ],
};

const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "@id": "https://www.aashleyinternationalschool.in/#organization",
  name: "Aashley International School",
  image: "https://www.aashleyinternationalschool.in/aashley_logo.png",
  url: "https://www.aashleyinternationalschool.in",
  telephone: "+91 94803 30967",
  email: "contact@aashleyinternationalschool.in",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Bangarpet Road, Budikote",
    addressLocality: "Bangarpet",
    addressRegion: "Karnataka",
    postalCode: "563114",
    addressCountry: "IN",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: 12.9870147,
    longitude: 78.170699,
  },
  priceRange: "$$",
  areaServed: "Bangarpet, Kolar, KGF, Malur, Kolar District",
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://www.aashleyinternationalschool.in/#org",
  name: "Aashley International School",
  url: "https://www.aashleyinternationalschool.in",
  logo: "https://www.aashleyinternationalschool.in/aashley_logo.png",
  sameAs: ["https://www.instagram.com/aashley__2009/"],
  contactPoint: {
    "@type": "ContactPoint",
    telephone: "+91 94803 30967",
    email: "contact@aashleyinternationalschool.in",
    areaServed: "IN",
    availableLanguage: "English, Kannada, Hindi",
    contactType: "customer service",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Bangarpet Road, Budikote",
      addressLocality: "Bangarpet",
      addressRegion: "Karnataka",
      postalCode: "563114",
    },
  },
};

const schemas = [schoolSchema, localBusinessSchema, organizationSchema];

export function JsonLdSchema() {
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://www.aashleyinternationalschool.in";
  const schemasWithUrl = schemas.map((s, i) => ({
    ...s,
    url: baseUrl,
    "@id": `${baseUrl}#${String(s["@type"]).toLowerCase()}-${i}`,
  }));

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemasWithUrl) }}
    />
  );
}
