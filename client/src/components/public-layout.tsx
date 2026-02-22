import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { 
  Menu, 
  X, 
  GraduationCap,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

const topBarLinks = [
  { href: "/gallery", label: "Gallery" },
  { href: "/day-at-aashley", label: "A Day at Aashley" },
  { href: "/news", label: "News & Events" },
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
  { href: "/portal", label: "Portal" },
];

function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const allNavLinks = [...mainNavLinks.slice(0, -1), ...topBarLinks];

  return (
    <header className="sticky top-0 z-50">
      {/* Top Bar */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-9">
            <div className="hidden md:flex items-center gap-1">
              {topBarLinks.map((link, index) => (
                <span key={link.href} className="flex items-center">
                  <Link 
                    href={link.href}
                    className="text-xs hover:text-accent transition-colors px-2"
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
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors" data-testid="link-topbar-facebook">
                <Facebook className="h-4 w-4" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors" data-testid="link-topbar-instagram">
                <Instagram className="h-4 w-4" />
              </a>
              <a href="#" className="text-primary-foreground/80 hover:text-accent transition-colors" data-testid="link-topbar-youtube">
                <Youtube className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="bg-background border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0" data-testid="link-home-logo">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold text-lg">Aashley International</span>
                <span className="text-xs text-muted-foreground block -mt-1">School</span>
              </div>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {mainNavLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={location === link.href ? "secondary" : "ghost"}
                    size="sm"
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
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                data-testid="button-mobile-menu"
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>

          {mobileMenuOpen && (
            <nav className="md:hidden py-4 border-t">
              <div className="flex flex-col gap-1">
                {allNavLinks.map((link) => (
                  <Link key={link.href} href={link.href}>
                    <Button
                      variant={location === link.href ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setMobileMenuOpen(false)}
                      data-testid={`link-mobile-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {link.label}
                    </Button>
                  </Link>
                ))}
              </div>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
}

function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <span className="font-semibold text-lg">Aashley International</span>
                <span className="text-xs opacity-80 block -mt-1">School</span>
              </div>
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
              <Link href="/about" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-about">About Us</Link>
              <Link href="/academics" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-academics">Academics</Link>
              <Link href="/admissions" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-admissions">Admissions</Link>
              <Link href="/gallery" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-gallery">Gallery</Link>
              <Link href="/why-aashley" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-why-aashley">Why Aashley?</Link>
              <Link href="/careers" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-careers">Careers</Link>
              <Link href="/contact" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 81234 56789</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@aashleyschool.edu</span>
              </div>
              <div className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>Bangarpet Road, Budikote, Bangarapet, Kolar - 563114</span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Follow Us</h4>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" data-testid="link-social-facebook">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" data-testid="link-social-twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" data-testid="link-social-instagram">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 flex items-center justify-center transition-colors" data-testid="link-social-youtube">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
            <div className="mt-6">
              <Link href="/portal">
                <Button variant="secondary" size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-footer-portal">
                  Portal Login
                </Button>
              </Link>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 mt-8 pt-8 text-center">
          <p className="text-sm opacity-70">
            © {new Date().getFullYear()} Aashley International School. All rights reserved.
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
    </div>
  );
}
