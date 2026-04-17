import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { SchoolLogo } from "@/components/school-logo";
import { 
  Menu, 
  X, 
  Phone,
  Mail,
  MapPin,
  Instagram,
  ChevronUp,
  GraduationCap,
  Award,
  BookOpen,
  Users
} from "lucide-react";

const topBarLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/day-at-aashley", label: "A Day at Aashley" },
  { href: "/alumni", label: "Alumni" },
  { href: "/careers", label: "Careers" },
  { href: "/contact", label: "Contact" },
];

const mainNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/why-aashley", label: "Why Aashley?" },
];

const portalNavLink = { href: "/portal/dashboard", label: "Portal Login" };

function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const allNavLinks = [...mainNavLinks, ...topBarLinks];

  return (
    <header className="sticky top-0 z-50">
      {/* Gold Accent Bar */}
      <div className="gold-accent-bar" />

      {/* Top info bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9">
            <div className="hidden md:flex items-center gap-1">
              {topBarLinks.map((link, index) => (
                <span key={link.href} className="flex items-center">
                  <Link 
                    href={link.href}
                    className="text-xs hover:text-gold transition-colors duration-200 px-2 font-medium tracking-wide underline-slide"
                    data-testid={`link-topbar-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                  {index < topBarLinks.length - 1 && (
                    <span className="text-primary-foreground/30 text-xs">·</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-4 ml-auto">
              <a
                href="tel:+919480330967"
                className="hidden md:flex items-center gap-1.5 text-xs text-primary-foreground/75 hover:text-gold transition-colors duration-200"
              >
                <Phone className="h-3 w-3" />
                <span>+91 94803 30967</span>
              </a>
              <a
                href="https://www.instagram.com/aashley__2009/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary-foreground/80 hover:text-gold transition-all duration-200 hover:scale-110"
                data-testid="link-topbar-instagram"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className={`transition-all duration-300 ${
        scrolled 
          ? "glass-light shadow-md" 
          : "bg-background/95 shadow-sm border-b border-border/60"
      }`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-[4.5rem] gap-4">
            <Link href="/" className="flex-shrink-0 group" data-testid="link-home-logo">
              <div className="transition-transform duration-300 group-hover:scale-[1.03]">
                <SchoolLogo />
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-0.5">
              {mainNavLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <button
                    className={`nav-link-premium px-4 py-2 text-sm rounded-lg transition-all duration-200 font-medium ${
                      location === link.href 
                        ? "text-primary bg-primary/8 dark:bg-primary-foreground/10" 
                        : "text-foreground/80 hover:text-foreground hover:bg-muted/60"
                    }`}
                    data-active={location === link.href ? "true" : "false"}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </button>
                </Link>
              ))}
              <Link href={portalNavLink.href} className="ml-2">
                <Button
                  variant={location.startsWith("/portal") ? "secondary" : "default"}
                  size="sm"
                  className={`transition-all duration-200 font-semibold tracking-wide shadow-sm hover:shadow-gold ${
                    location.startsWith("/portal") 
                      ? "" 
                      : "bg-primary hover:bg-primary/90 border border-gold/20"
                  }`}
                  data-testid="button-nav-portal-login"
                >
                  {portalNavLink.label}
                </Button>
              </Link>
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {/* Mobile menu */}
          {mobileMenuOpen && (
            <nav className="md:hidden py-6 border-t border-border/60 max-h-[80vh] overflow-y-auto">
              <div className="flex flex-col gap-1">
                {allNavLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <button
                      className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        location === link.href 
                          ? "bg-primary text-primary-foreground" 
                          : "text-foreground/80 hover:bg-muted"
                      }`}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </button>
                  </Link>
                ))}
                <Link href={portalNavLink.href}>
                  <Button
                    variant={location.startsWith("/portal") ? "secondary" : "default"}
                    className="w-full justify-start mt-1"
                    onClick={() => setMobileMenuOpen(false)}
                    data-testid="button-mobile-portal-login"
                  >
                    {portalNavLink.label}
                  </Button>
                </Link>
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-8 right-8 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-primary/90 hover:-translate-y-1 hover:shadow-xl border border-gold/20 ${
        visible ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-4 scale-90 pointer-events-none"
      }`}
      data-testid="button-scroll-top"
      aria-label="Scroll to top"
    >
      <ChevronUp className="h-5 w-5" />
    </button>
  );
}

function Footer() {
  return (
    <footer className="relative overflow-hidden noise-overlay">
      {/* Main footer body */}
      <div className="section-navy-premium text-primary-foreground relative z-10">
        {/* Gold top line */}
        <div className="gold-accent-bar" />

        {/* Tagline banner */}
        <div className="border-b border-primary-foreground/10">
          <div className="container mx-auto px-4 py-6">
            <p className="font-serif italic text-lg md:text-xl text-center text-primary-foreground/80">
              "Learning the Aashley Way — Rooted in Values, Rising with Confidence."
            </p>
          </div>
        </div>

        {/* Grid */}
        <div className="container mx-auto px-4 py-12 md:py-14 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {/* Brand column */}
            <div>
              <div className="mb-5">
                <SchoolLogo variant="white" />
              </div>
              <p className="text-sm text-primary-foreground/70 mb-6 leading-relaxed">
                Aashley International School, Bangarpet — nurturing young minds through ICSE 
                excellence, value-based education, and holistic development since 2008.
              </p>
              {/* Accreditation badges */}
              <div className="flex flex-wrap gap-2">
                {["ICSE", "CISCE", "Co-Ed"].map((badge) => (
                  <span
                    key={badge}
                    className="text-xs font-semibold tracking-wider px-3 py-1 rounded-full border border-gold/30 text-gold/90"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>

            {/* Quick links */}
            <div>
              <h4 className="font-semibold mb-5 text-base tracking-wide flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gold inline-block" />
                Quick Links
              </h4>
              <div className="flex flex-col gap-2.5">
                {[
                  { href: "/about", label: "About Us" },
                  { href: "/academics", label: "Academics" },
                  { href: "/admissions", label: "Admissions" },
                  { href: "/gallery", label: "Gallery" },
                  { href: "/day-at-aashley", label: "A Day at Aashley" },
                  { href: "/alumni", label: "Alumni" },
                  { href: "/why-aashley", label: "Why Aashley?" },
                  { href: "/careers", label: "Careers" },
                  { href: "/contact", label: "Contact" },
                ].map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-sm text-primary-foreground/65 hover:text-gold transition-colors duration-200 flex items-center gap-2 group"
                    data-testid={`link-footer-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-gold transition-all duration-300 inline-block" />
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact info */}
            <div>
              <h4 className="font-semibold mb-5 text-base tracking-wide flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gold inline-block" />
                Contact
              </h4>
              <div className="flex flex-col gap-4">
                <a
                  href="tel:+919480330967"
                  className="flex items-start gap-3 text-sm text-primary-foreground/65 hover:text-gold transition-colors duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/8 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-200">
                    <Phone className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-primary-foreground/40 mb-0.5">Phone</div>
                    +91 94803 30967
                  </div>
                </a>
                <a
                  href="mailto:contact@aashleyinternationalschool.in"
                  className="flex items-start gap-3 text-sm text-primary-foreground/65 hover:text-gold transition-colors duration-200 group"
                >
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/8 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-200">
                    <Mail className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-primary-foreground/40 mb-0.5">Email</div>
                    contact@aashleyinternationalschool.in
                  </div>
                </a>
                <div className="flex items-start gap-3 text-sm text-primary-foreground/65">
                  <div className="w-8 h-8 rounded-lg bg-primary-foreground/8 flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <div className="text-xs text-primary-foreground/40 mb-0.5">Address</div>
                    Bangarpet Road, Budikote,<br />
                    Bangarpet, Kolar – 563114
                  </div>
                </div>
              </div>
            </div>

            {/* Social & highlights */}
            <div>
              <h4 className="font-semibold mb-5 text-base tracking-wide flex items-center gap-2">
                <span className="w-6 h-0.5 bg-gold inline-block" />
                Follow Us
              </h4>
              <a
                href="https://www.instagram.com/aashley__2009/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-pink-500 text-white text-sm font-medium hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 mb-6"
                data-testid="link-social-instagram"
              >
                <Instagram className="h-4 w-4" />
                @aashley__2009
              </a>

              {/* Highlights */}
              <div className="grid grid-cols-2 gap-3 mt-2">
                {[
                  { icon: GraduationCap, label: "Since 2008" },
                  { icon: Users, label: "2000+ Students" },
                  { icon: BookOpen, label: "ICSE Board" },
                  { icon: Award, label: "4.6/5 Rating" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-xs text-primary-foreground/55">
                    <Icon className="h-3.5 w-3.5 text-gold flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/10">
          <div className="container mx-auto px-4 py-6 md:py-5 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-3">
            <p className="text-xs text-primary-foreground/45">
              © {new Date().getFullYear()} Aashley International School, Bangarpet. All rights reserved.
            </p>
            <p className="text-xs text-primary-foreground/30">
              Affiliated to CISCE · English Medium · Co-Educational · Pre-Primary to Class X
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

export function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
