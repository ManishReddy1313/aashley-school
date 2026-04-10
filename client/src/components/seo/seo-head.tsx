import { useEffect } from "react";
import { useLocation } from "wouter";
import { SEO_CONFIG, PAGE_SEO, getFullUrl } from "@/lib/seo-config";

function updateMeta(name: string, content: string, property = false) {
  const attr = property ? "property" : "name";
  let el = document.querySelector(`meta[${attr}="${name}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

export function SEOHead() {
  const [location] = useLocation();
  const path = location || "/";
  const pageSeo = PAGE_SEO[path] || PAGE_SEO["/"];

  useEffect(() => {
    const fullUrl = getFullUrl(pageSeo.path);
    const imageUrl = pageSeo.image 
      ? getFullUrl(pageSeo.image) 
      : getFullUrl(SEO_CONFIG.defaultImage);

    // Title
    document.title = pageSeo.title;

    // Meta description
    updateMeta("description", pageSeo.description);

    // Meta keywords
    updateMeta("keywords", pageSeo.keywords || SEO_CONFIG.keywords);

    // Canonical
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", fullUrl);

    // Robots
    if (pageSeo.noindex) {
      updateMeta("robots", "noindex, nofollow");
    } else {
      updateMeta("robots", "index, follow");
    }

    // Open Graph
    updateMeta("og:title", pageSeo.title, true);
    updateMeta("og:description", pageSeo.description, true);
    updateMeta("og:url", fullUrl, true);
    updateMeta("og:image", imageUrl, true);
    updateMeta("og:type", "website", true);
    updateMeta("og:site_name", SEO_CONFIG.siteName, true);
    updateMeta("og:locale", SEO_CONFIG.locale, true);

    // Twitter
    updateMeta("twitter:card", "summary_large_image");
    updateMeta("twitter:title", pageSeo.title);
    updateMeta("twitter:description", pageSeo.description);
    updateMeta("twitter:image", imageUrl);
    updateMeta("twitter:url", fullUrl);
  }, [path, pageSeo]);

  return null;
}
