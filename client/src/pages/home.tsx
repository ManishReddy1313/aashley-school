import { Link } from "wouter";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PublicLayout } from "@/components/public-layout";
import heroImage1 from "@assets/hero_2.jpg";
import heroImage2 from "@assets/hero_5.jpg";
import heroImage3 from "@assets/hero_assembly.jpg";
import prayerImage from "@assets/hero_building.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labImage from "@assets/lab_1.jpg";
import exerciseImage from "@assets/home_6.jpg";
import buildingImage from "@assets/home_entrance.jpg";
import heroStudents from "@assets/hero_1.jpg";
import assemblyImage from "@assets/hero_5.jpg";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Trophy, 
  Heart, 
  Star,
  ArrowRight,
  Clock,
  Quote,
  CheckCircle,
  Sparkles,
  Award
} from "lucide-react";

/* ──────────────── Scroll Reveal Hook ──────────────── */
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("scroll-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "", delay = 0, direction = "up" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useScrollReveal();
  const revealClass = direction === "left" ? "scroll-reveal-left" : direction === "right" ? "scroll-reveal-right" : "scroll-reveal";
  return (
    <div ref={ref} className={`${revealClass} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ──────────────── Data ──────────────── */
const heroSlides = [
  {
    image: heroImage1,
    eyebrow: "ICSE (CISCE) Affiliated · Bangarpet, Kolar",
    title: "Nurturing Young Minds,",
    highlight: "Building Tomorrow's Leaders",
    subtitle: "At Aashley International School, we nurture every child's unique potential through ICSE (CISCE) curriculum, value-based education, and a caring learning environment.",
  },
  {
    image: heroImage2,
    eyebrow: "Best School in Bangarpet & Kolar District",
    title: "Where Learning Meets",
    highlight: "Excellence & Values",
    subtitle: "ICSE (CISCE) curriculum combined with holistic development programs creates well-rounded students ready to take on the world with confidence.",
  },
  {
    image: heroImage3,
    eyebrow: "2000+ Happy Students · Rated 4.6/5",
    title: "Rooted in Values,",
    highlight: "Rising with Confidence",
    subtitle: "From morning assembly to co-curricular activities, every moment at Aashley is designed to inspire curiosity, build character, and foster lifelong learning.",
  },
];

const stats = [
  { icon: GraduationCap, value: "Since 2008", label: "Established", bg: "2008" },
  { icon: Users, value: "2000+", label: "Happy Students", bg: "2K" },
  { icon: BookOpen, value: "ICSE", label: "Board Affiliation", bg: "ICSE" },
  { icon: Trophy, value: "4.6/5", label: "Parent Rating", bg: "★" },
];

const features = [
  {
    icon: Heart,
    title: "Value Based Education",
    description: "We nurture character alongside academics, building responsible citizens with strong moral foundations and integrity.",
    image: prayerImage,
    badge: "Core Philosophy",
  },
  {
    icon: Star,
    title: "Holistic Development",
    description: "Our curriculum balances academics, sports, arts, and life skills for complete personality development in every student.",
    image: sportsImage,
    badge: "Beyond Textbooks",
  },
  {
    icon: BookOpen,
    title: "Modern Curriculum",
    description: "Innovative ICSE teaching methods combined with cutting-edge technology prepare students for the future with confidence.",
    image: labImage,
    badge: "ICSE Excellence",
  },
];

const photoStories = [
  { title: "Morning Assembly", category: "Daily Life", size: "large", image: assemblyImage },
  { title: "Classroom Learning", category: "Academics", size: "medium", image: classroomImage },
  { title: "Campus Prayer", category: "Values", size: "medium", image: prayerImage },
  { title: "School Assembly", category: "Daily Life", size: "small", image: heroStudents },
  { title: "Sports Champions", category: "Sports", size: "small", image: sportsImage },
  { title: "Physical Training", category: "Campus", size: "small", image: exerciseImage },
  { title: "Smart Classrooms", category: "Academics", size: "small", image: labImage },
  { title: "Our Campus", category: "Campus", size: "large", image: buildingImage },
];

const growthStories = [
  {
    name: "Mrs. Kavitha R.",
    role: "Parent of Class 5 Student",
    quote: "Choosing Aashley was the best decision for my child. The teachers are incredibly dedicated and the value-based approach has truly shaped my son's character.",
    stars: 5,
  },
  {
    name: "Mr. Suresh Kumar",
    role: "Parent of Class 8 Student",
    quote: "The ICSE curriculum at Aashley prepares students thoroughly. My daughter's analytical skills and confidence have grown tremendously since joining.",
    stars: 5,
  },
  {
    name: "Mrs. Priya Gowda",
    role: "Parent of Class 3 Student",
    quote: "The genuine care for every child, a clean campus, and morning prayer sessions create a nurturing atmosphere that goes far beyond just academics.",
    stars: 5,
  },
];

const daySchedule = [
  { icon: Clock,    time: "8:45 AM", label: "School Assembly",       color: "from-blue-500 to-blue-600" },
  { icon: BookOpen, time: "9:10 AM", label: "Academic Classes",       color: "from-emerald-500 to-emerald-600" },
  { icon: Users,    time: "1:00 PM", label: "Lunch & Recreation",    color: "from-amber-500 to-amber-600" },
  { icon: Star,     time: "3:00 PM", label: "Co-curricular Activities", color: "from-purple-500 to-purple-600" },
];

/* ──────────────── Hero Slider ──────────────── */
function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 900);
  }, [isTransitioning]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <section className="relative min-h-[92vh] flex items-center overflow-hidden" data-testid="hero-slider">
      {/* Background slides */}
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1200 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
          style={{ transitionDuration: "1200ms" }}
        >
          <img
            src={slide.image}
            alt={`Aashley International School - ${slide.title}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          {/* Cinematic gradient overlay */}
          <div className="absolute inset-0 hero-gradient-cinema" />
          {/* Bottom vignette */}
          <div className="absolute bottom-0 left-0 right-0 h-40 hero-gradient-bottom" />
        </div>
      ))}

      {/* Subtle dot pattern overlay */}
      <div className="absolute inset-0 dot-pattern opacity-20 pointer-events-none" />

      {/* Content */}
      <div className="container mx-auto px-4 relative z-10 pt-8">
        <div className="max-w-3xl">
          {/* Eyebrow */}
          {heroSlides.map((slide, index) => (
            <div
              key={`eyebrow-${index}`}
              className={`transition-all duration-700 ${
                index === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 absolute pointer-events-none"
              } mb-6`}
              aria-hidden={index !== current}
            >
              <span className="badge-gold inline-block">{slide.eyebrow}</span>
            </div>
          ))}

          {/* Main H1 — static for SEO */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-4 leading-tight tracking-tight">
            Aashley International School
            <span className="block text-2xl md:text-3xl lg:text-4xl font-light mt-2 text-white/70 font-sans">
              Best School in Bangarpet
            </span>
          </h1>

          {/* Sliding content */}
          {heroSlides.map((slide, index) => (
            <div
              key={`content-${index}`}
              className={`transition-all duration-700 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-6 absolute pointer-events-none"
              }`}
              aria-hidden={index !== current}
            >
              <p className="text-xl md:text-2xl lg:text-3xl font-semibold mb-4">
                <span className="text-gold">{slide.title} </span>
                <span className="text-white">{slide.highlight}</span>
              </p>
              <p className="text-base md:text-lg text-white/80 mb-8 leading-relaxed max-w-2xl">
                {slide.subtitle}
              </p>
            </div>
          ))}

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mt-4">
            <Link href="/admissions">
              <Button
                size="lg"
                className="bg-gold text-white hover:bg-gold-dark border-0 transition-all duration-300 hover:shadow-gold hover:-translate-y-1 font-semibold text-base px-8"
                data-testid="button-hero-admissions"
              >
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 border-white/25 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 font-medium text-base px-8"
                data-testid="button-hero-learn-more"
              >
                Explore Our School
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Slide dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex gap-3 items-center" data-testid="hero-dots">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`rounded-full transition-all duration-500 ${
              index === current 
                ? "w-10 h-2.5 bg-gold shadow-gold" 
                : "w-2.5 h-2.5 bg-white/35 hover:bg-white/60"
            }`}
            data-testid={`hero-dot-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 right-12 z-20 hidden md:flex flex-col items-center gap-2">
        <span className="text-white/40 text-xs tracking-widest writing-mode-vertical rotate-90 whitespace-nowrap">SCROLL DOWN</span>
        <div className="w-px h-12 bg-gradient-to-b from-white/40 to-transparent" />
      </div>
    </section>
  );
}

/* ──────────────── Main Page ──────────────── */
export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSlider />

      {/* ── STATS BAND ── */}
      <section className="relative overflow-hidden section-navy-premium noise-overlay" data-testid="stats-section">
        {/* Ambient blob */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 py-16 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <RevealSection key={index} delay={index * 120}>
                <div
                  className="relative text-center group py-6 px-4 rounded-2xl border border-primary-foreground/6 bg-primary-foreground/4 hover:bg-primary-foreground/8 transition-all duration-300 hover:border-gold/20 overflow-hidden"
                  data-testid={`stat-${index}`}
                >
                  {/* Decorative bg number */}
                  <div className="stat-bg-number">{stat.bg}</div>
                  {/* Icon with gold glow */}
                  <div className="relative z-10 inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gold/10 border border-gold/20 mb-4 mx-auto group-hover:bg-gold/20 transition-all duration-300">
                    <stat.icon className="h-7 w-7 text-gold" />
                  </div>
                  <div className="relative z-10 text-3xl md:text-4xl font-bold text-primary-foreground mb-1 font-serif">{stat.value}</div>
                  <div className="relative z-10 text-sm text-primary-foreground/55 tracking-wide">{stat.label}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT CALLOUT (2-col split) ── */}
      <section className="py-24 relative overflow-hidden" aria-labelledby="best-school-bangarpet">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center max-w-7xl mx-auto">
            {/* Image Column */}
            <RevealSection direction="left">
              <div className="relative">
                {/* Main image */}
                <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-xl">
                  <img
                    src={buildingImage}
                    alt="Aashley International School Campus Bangarpet"
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/70 via-transparent to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="badge-gold text-[10px]">Our Campus · Bangarpet, Kolar</span>
                  </div>
                </div>
                {/* Floating stat cards */}
                <div className="absolute -bottom-5 -right-4 md:-right-8 bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <Trophy className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-serif">4.6/5</div>
                    <div className="text-xs text-muted-foreground">Parent Rating • 388+ Reviews</div>
                  </div>
                </div>
                <div className="absolute -top-5 -left-4 md:-left-8 bg-card border border-border rounded-2xl p-4 shadow-xl flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/15 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <div className="text-xl font-bold font-serif">2000+</div>
                    <div className="text-xs text-muted-foreground">Happy Students</div>
                  </div>
                </div>
              </div>
            </RevealSection>

            {/* Text Column */}
            <RevealSection direction="right">
              <div>
                <span className="badge-gold mb-5 inline-block">About Our School</span>
                <h2 id="best-school-bangarpet" className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight">
                  Best School in{" "}
                  <span className="text-gradient-gold">Bangarpet</span>{" "}
                  &amp; Kolar District
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-7" />
                <div className="space-y-4 text-muted-foreground text-base md:text-lg leading-relaxed">
                  <p>
                    <strong className="text-foreground font-semibold">Aashley International School</strong> is recognized as one of the{" "}
                    <strong className="text-foreground font-semibold">top schools in Bangarpet</strong> and the wider Kolar District. 
                    Located on Bangarpet Road in Budikote, we serve families from Bangarpet, Kolar, KGF, Malur, and surrounding areas. 
                    Our commitment to <strong className="text-foreground font-semibold">quality ICSE (CISCE) education</strong> combined 
                    with modern infrastructure makes us a leading choice for parents.
                  </p>
                  <p>
                    Our experienced teachers, well-equipped classrooms, science and computer labs, sports facilities, and 
                    value-based curriculum create a nurturing environment for holistic development.
                  </p>
                  <p>
                    Parents choosing <strong className="text-foreground font-semibold">schools near Bangarpet</strong> consistently 
                    select Aashley for our dedicated faculty, safe campus, and focus on each child's unique potential. 
                    We invite you to visit our campus and experience why we are among the{" "}
                    <strong className="text-foreground font-semibold">best schools in Kolar District</strong>.
                  </p>
                </div>

                {/* Trust signals */}
                <div className="mt-8 grid grid-cols-2 gap-3">
                  {[
                    "ICSE Affiliated (CISCE)",
                    "English Medium",
                    "Co-Educational",
                    "Pre-Primary to Class X",
                  ].map((item) => (
                    <div
                      key={item}
                      className="flex items-center gap-2.5 p-3.5 rounded-xl bg-primary/5 border border-primary/8 hover:border-gold/20 hover:bg-gold/5 transition-all duration-200"
                    >
                      <CheckCircle className="h-4 w-4 text-gold flex-shrink-0" />
                      <span className="text-sm font-medium text-foreground/80">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── WHY AASHLEY ── */}
      <section className="py-24 bg-muted/25">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Why Choose Us</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
                Why Choose{" "}
                <span className="text-gradient-gold">Aashley?</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">
                We provide a nurturing environment where children discover their passions and develop skills for life.
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <RevealSection key={index} delay={index * 150}>
                <div
                  className="card-premium group"
                  data-testid={`card-feature-${index}`}
                >
                  {/* Image */}
                  <div className="aspect-[4/3] relative overflow-hidden rounded-t-[calc(var(--radius)-1px)]">
                    <img
                      src={feature.image}
                      alt={`${feature.title} at Aashley International School Bangarpet`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {/* Badge on image */}
                    <div className="absolute top-4 left-4">
                      <span className="badge-gold text-[10px]">{feature.badge}</span>
                    </div>
                  </div>
                  {/* Content */}
                  <div className="p-7">
                    <div className="w-12 h-12 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-5 transition-all duration-300 group-hover:bg-gold/20 group-hover:scale-110">
                      <feature.icon className="h-6 w-6 text-gold" />
                    </div>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors duration-200">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                    <div className="mt-5 flex items-center gap-1.5 text-gold text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO STORIES ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-14">
              <div>
                <span className="badge-gold mb-3 inline-block">Campus & Activities</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold leading-tight">
                  Photo <span className="text-gradient-gold">Stories</span>
                </h2>
                <div className="section-divider mt-3 ml-0" style={{ margin: "0.75rem 0 0" }} />
                <p className="text-muted-foreground mt-3">Capturing moments of learning, growth, and joy</p>
              </div>
              <Link href="/gallery">
                <Button
                  variant="outline"
                  className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 border-border/60 font-medium"
                  data-testid="button-view-gallery"
                >
                  View Full Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </RevealSection>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photoStories.map((story, index) => (
              <RevealSection key={index} delay={index * 70}>
                <div
                  className={`relative group overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-400 cursor-pointer ${
                    story.size === "large" ? "col-span-2 row-span-2" :
                    story.size === "medium" ? "col-span-1 row-span-2" : ""
                  }`}
                  data-testid={`photo-story-${index}`}
                >
                  <div className={`relative ${
                    story.size === "large" ? "aspect-square" :
                    story.size === "medium" ? "aspect-[3/4]" : "aspect-square"
                  }`}>
                    <img
                      src={story.image}
                      alt={`${story.title} - Aashley International School Bangarpet campus and activities`}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {/* Caption */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                      <h4 className="font-bold text-white text-sm mb-1">{story.title}</h4>
                      <span className="text-xs font-semibold tracking-wider text-gold/90 uppercase">{story.category}</span>
                    </div>
                    {/* Category chip always visible */}
                    <div className="absolute top-3 right-3 opacity-90 group-hover:opacity-0 transition-opacity duration-300">
                      <span className="text-xs bg-black/40 backdrop-blur-sm text-white px-2 py-1 rounded-full font-medium">
                        {story.category}
                      </span>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 relative overflow-hidden">
        {/* Ambient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-background to-muted/20 pointer-events-none" />
        <div className="absolute top-20 right-0 w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 left-0 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Parent Testimonials</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
                Real <span className="text-gradient-gold">Journeys</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">
                Stories of transformation from our students and parents
              </p>
            </div>
          </RevealSection>

          <div className="grid md:grid-cols-3 gap-8">
            {growthStories.map((story, index) => (
              <RevealSection key={index} delay={index * 150}>
                <div
                  className="card-premium h-full flex flex-col p-8 relative"
                  data-testid={`testimonial-${index}`}
                >
                  {/* Decorative quote mark */}
                  <div className="absolute top-4 right-6 text-5xl font-serif font-black text-gold/15 leading-none select-none pointer-events-none">
                    "
                  </div>

                  {/* Star rating */}
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: story.stars }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="text-foreground/80 leading-relaxed italic flex-1 mb-6 relative z-10">
                    "{story.quote}"
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-4 pt-4 border-t border-border/50">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 via-primary/10 to-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg font-serif">
                        {story.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <div className="font-bold text-sm">{story.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{story.role}</div>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Overall rating */}
          <RevealSection delay={300}>
            <div className="mt-14 text-center">
              <div className="inline-flex items-center gap-3 px-8 py-4 rounded-full bg-gold/10 border border-gold/20">
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-gold text-gold" />
                  ))}
                </div>
                <span className="font-bold text-xl text-foreground">4.6 / 5</span>
                <span className="text-muted-foreground text-sm">from 388+ parent reviews</span>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── A DAY AT AASHLEY ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={exerciseImage}
            alt="Students at Aashley International School"
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 section-navy-premium opacity-95" />
          {/* Noise overlay */}
          <div className="absolute inset-0 noise-overlay opacity-50" />
        </div>

        {/* Decorative circle */}
        <div className="absolute top-1/2 right-20 -translate-y-1/2 w-80 h-80 rounded-full border border-gold/10 hidden xl:block" />
        <div className="absolute top-1/2 right-20 -translate-y-1/2 w-56 h-56 rounded-full border border-gold/6 hidden xl:block" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <RevealSection direction="left">
              <div className="text-primary-foreground">
                <span className="badge-gold mb-4 inline-block">School Life</span>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight">
                  Experience
                  <br />
                  <span className="text-gradient-gold">A Day at Aashley</span>
                </h2>
                <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-6" />
                <p className="text-primary-foreground/75 mb-8 text-lg leading-relaxed">
                  From the morning bell to the afternoon dispersal, every moment at Aashley is 
                  designed to inspire curiosity, build character, and create lasting memories.
                </p>
                <Link href="/day-at-aashley">
                  <Button
                    size="lg"
                    className="bg-gold text-white hover:bg-gold-dark border-0 font-semibold hover:shadow-gold hover:-translate-y-1 transition-all duration-300"
                    data-testid="button-day-at-aashley"
                  >
                    See the Full Day
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </RevealSection>

            <RevealSection direction="right">
              <div className="grid grid-cols-2 gap-4">
                {daySchedule.map((item, index) => (
                  <div
                    key={index}
                    className="group glass rounded-2xl p-5 text-primary-foreground hover:scale-[1.03] transition-all duration-300 hover:border-gold/30 cursor-pointer"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="text-xs text-gold font-semibold tracking-wider mb-1">{item.time}</div>
                    <div className="font-semibold text-sm leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>
            </RevealSection>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ── */}
      <section className="py-24 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <RevealSection>
            <div className="max-w-4xl mx-auto">
              <div className="relative rounded-3xl overflow-hidden shadow-premium-hover shadow-lg">
                {/* Card gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/85" />
                <div className="noise-overlay absolute inset-0" />
                {/* Gold top line */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
                {/* Decorative circles */}
                <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-gold/8" />
                <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-accent/8" />

                <div className="relative z-10 p-10 md:p-16 text-center text-primary-foreground">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/15 border border-gold/25 mb-6">
                    <Sparkles className="h-4 w-4 text-gold" />
                    <span className="text-xs font-semibold tracking-widest text-gold uppercase">Admissions Open</span>
                  </div>

                  <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight">
                    Are You Ready to Join the{" "}
                    <span className="text-gradient-gold">Aashley Family?</span>
                  </h2>
                  <p className="text-primary-foreground/75 max-w-2xl mx-auto mb-10 text-lg leading-relaxed">
                    Give your child the gift of quality ICSE education, experienced faculty, and a nurturing 
                    environment designed for success. Start your journey with us today.
                  </p>

                  <div className="flex flex-wrap justify-center gap-5">
                    <Link href="/admissions">
                      <Button
                        size="lg"
                        className="bg-gold text-white hover:bg-gold-dark border-0 font-bold text-base px-10 hover:shadow-gold hover:-translate-y-1 transition-all duration-300"
                        data-testid="button-cta-apply"
                      >
                        Apply Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Button>
                    </Link>
                    <Link href="/contact">
                      <Button
                        size="lg"
                        variant="outline"
                        className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 font-medium text-base px-8 hover:-translate-y-1 transition-all duration-300"
                        data-testid="button-cta-contact"
                      >
                        Schedule a Visit
                      </Button>
                    </Link>
                  </div>

                  {/* Bottom trust badges */}
                  <div className="mt-10 pt-8 border-t border-primary-foreground/10 flex flex-wrap justify-center gap-6">
                    {[
                      { icon: Award, text: "ICSE Affiliated" },
                      { icon: Users, text: "2000+ Students" },
                      { icon: Star, text: "4.6/5 Rating" },
                      { icon: GraduationCap, text: "Est. 2008" },
                    ].map(({ icon: Icon, text }) => (
                      <div key={text} className="flex items-center gap-2 text-primary-foreground/55 text-sm">
                        <Icon className="h-4 w-4 text-gold" />
                        {text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>
    </PublicLayout>
  );
}
