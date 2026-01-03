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

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/academics", label: "Academics" },
  { href: "/admissions", label: "Admissions" },
  { href: "/gallery", label: "Gallery" },
  { href: "/day-at-aashley", label: "A Day at Aashley" },
  { href: "/news", label: "News & Events" },
  { href: "/alumni", label: "Alumni" },
  { href: "/contact", label: "Contact" },
];

function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
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

          <nav className="hidden xl:flex items-center gap-1 flex-wrap justify-center">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <Button
                  variant={location === link.href ? "secondary" : "ghost"}
                  size="sm"
                  className="text-xs px-2"
                  data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/portal">
              <Button size="sm" data-testid="button-portal-login">
                Portal Login
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="xl:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <nav className="xl:hidden py-4 border-t">
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
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
              <Link href="/contact" className="text-sm opacity-80 hover:opacity-100 transition-opacity" data-testid="link-footer-contact">Contact</Link>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact Info</h4>
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2 text-sm opacity-80">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span>info@aashleyschool.edu</span>
              </div>
              <div className="flex items-start gap-2 text-sm opacity-80">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                <span>123 Education Lane, Knowledge City, India - 560001</span>
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
