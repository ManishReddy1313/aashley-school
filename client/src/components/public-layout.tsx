import { Link, useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import schoolLogo from "@assets/02_school_logo_1772107248114.jpg";
import { 
  Menu, 
  X, 
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  ChevronUp
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

function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const allNavLinks = [...mainNavLinks, ...topBarLinks];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? "shadow-lg" : ""}`}>
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9">
            <div className="hidden md:flex items-center gap-1">
              {topBarLinks.map((link, index) => (
                <span key={link.href} className="flex items-center">
                  <Link 
                    href={link.href}
                    className="text-xs hover:text-accent transition-colors duration-200 px-2"
                    data-testid={`link-topbar-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Link>
                  {index < topBarLinks.length - 1 && (
                    <span className="text-primary-foreground/40">|</span>
                  )}
                </span>
              ))}
            </div>
            <div className="flex items-center gap-3 ml-auto">
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 hover:scale-110 transform" data-testid="link-topbar-facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 hover:scale-110 transform" data-testid="link-topbar-instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors duration-200 hover:scale-110 transform" data-testid="link-topbar-youtube">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={`bg-background border-b transition-all duration-300 ${scrolled ? "bg-background/95 backdrop-blur-md" : ""}`}>
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex-shrink-0 group" data-testid="link-home-logo">
              <img 
                src={schoolLogo} 
                alt="Aashley International School" 
                className="h-12 object-contain transition-transform duration-300 group-hover:scale-105"
              />
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "default" : "ghost"}
                    size="sm"
                    className={`transition-all duration-200 font-medium ${
                      location === link.href 
                        ? "bg-primary text-primary-foreground shadow-md" 
                        : "hover:bg-primary/10 hover:text-primary"
                    }`}
                    data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    {link.label}
                  </Button>
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden transition-transform duration-200"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${mobileMenuOpen ? "max-h-[500px] opacity-100" : "max-h-0 opacity-0"}`}>
            <nav className="py-4 border-t">
              <div className="flex flex-col gap-1">
                {allNavLinks.map((link, index) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={location === link.href ? "default" : "ghost"}
                      className={`w-full justify-start transition-all duration-200 ${
                        location === link.href ? "bg-primary text-primary-foreground" : ""
                      }`}
                      style={{ animationDelay: `${index * 50}ms` }}
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

function ScrollToTop() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 400);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-primary/90 hover:scale-110 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
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
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <img 
                src={schoolLogo} 
                alt="Aashley International School" 
                className="h-14 object-contain"
              />
            </div>
            <p className="text-sm opacity-80 mb-4">
              Rooted in Values, Rising with Confidence.
            </p>
            <p className="text-sm font-serif italic opacity-90">
              "Learning the Aashley Way"
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2">
              <Link href="/about" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-about">About Us</Link>
              <Link href="/academics" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-academics">Academics</Link>
              <Link href="/admissions" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-admissions">Admissions</Link>
              <Link href="/gallery" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-gallery">Gallery</Link>
              <Link href="/why-aashley" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-why-aashley">Why Aashley?</Link>
              <Link href="/careers" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-careers">Careers</Link>
              <Link href="/contact" className="text-sm opacity-80 hover:opacity-100 hover:translate-x-1 transform transition-all duration-200" data-testid="link-footer-contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 81234 56789</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@aashleyschool.edu</span>
              </div>
              <div className="flex items-start gap-2 text-sm opacity-80 hover:opacity-100 transition-opacity duration-200">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Bangarpet Road, Budikote, Bangarapet, Kolar - 563114</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300 hover:scale-110" data-testid="link-social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300 hover:scale-110" data-testid="link-social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300 hover:scale-110" data-testid="link-social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-accent hover:text-accent-foreground flex items-center justify-center transition-all duration-300 hover:scale-110" data-testid="link-social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-70">
            &copy; {new Date().getFullYear()} Aashley International School. All rights reserved.
          </p>
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
