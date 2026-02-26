import { Link } from "wouter";
import { useEffect, useRef, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import heroImage1 from "@assets/home_entrance2.jpg";
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
  Quote,
  Clock
} from "lucide-react";

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
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return ref;
}

function RevealSection({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`scroll-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

const heroSlides = [
  {
    image: heroImage1,
    title: "Nurturing Young Minds,",
    highlight: "Building Tomorrow's Leaders",
    subtitle: "At Aashley International School, Bangarapet, we nurture every child's unique potential through our ICSE curriculum, values-based education, and a caring learning environment.",
  },
  {
    image: heroImage2,
    title: "Where Learning Meets",
    highlight: "Excellence & Values",
    subtitle: "Our ICSE curriculum combined with holistic development programs creates well-rounded students ready to take on the world with confidence.",
  },
  {
    image: heroImage3,
    title: "Rooted in Values,",
    highlight: "Rising with Confidence",
    subtitle: "From morning assembly to co-curricular activities, every moment at Aashley is designed to inspire curiosity, build character, and foster lifelong learning.",
  },
];

const stats = [
  { icon: GraduationCap, value: "Since 2008", label: "Established" },
  { icon: Users, value: "500+", label: "Happy Students" },
  { icon: BookOpen, value: "ICSE", label: "Board Affiliation" },
  { icon: Trophy, value: "4.6/5", label: "Parent Rating" },
];

const features = [
  {
    icon: Heart,
    title: "Values-Based Education",
    description: "We nurture character alongside academics, building responsible citizens with strong moral foundations.",
    image: prayerImage,
  },
  {
    icon: Star,
    title: "Holistic Development",
    description: "Our curriculum balances academics, sports, arts, and life skills for complete personality development.",
    image: sportsImage,
  },
  {
    icon: BookOpen,
    title: "Modern Curriculum",
    description: "Innovative teaching methods combined with cutting-edge technology prepare students for the future.",
    image: labImage,
  },
];

const photoStories = [
  { title: "Morning Assembly", category: "Daily Life", size: "large", image: assemblyImage },
  { title: "Classroom Learning", category: "Academics", size: "medium", image: classroomImage },
  { title: "Creative Minds", category: "Activities", size: "medium", image: prayerImage },
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
    quote: "Choosing Aashley was the best decision for my child. The teachers are incredibly dedicated and the values-based approach has truly shaped my son's character.",
  },
  {
    name: "Mr. Suresh Kumar",
    role: "Parent of Class 8 Student",
    quote: "The ICSE curriculum at Aashley prepares students thoroughly. My daughter's analytical skills and confidence have grown tremendously since joining.",
  },
  {
    name: "Mrs. Priya Gowda",
    role: "Parent of Class 3 Student",
    quote: "The genuine care for every child, nutritious mid-day meals, clean campus, and morning prayer sessions create a nurturing atmosphere beyond just academics.",
  },
];

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goToSlide = useCallback((index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setCurrent(index);
    setTimeout(() => setIsTransitioning(false), 800);
  }, [isTransitioning]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent(prev => (prev + 1) % heroSlides.length);
    }, 6000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden -mt-[100px] pt-[100px]" data-testid="hero-slider">
      {heroSlides.map((slide, index) => (
        <div
          key={index}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === current ? "opacity-100 scale-100" : "opacity-0 scale-105"
          }`}
        >
          <img
            src={slide.image}
            alt={`Aashley International School - ${slide.title}`}
            className="w-full h-full object-cover"
            loading={index === 0 ? "eager" : "lazy"}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/50 to-black/25" />
        </div>
      ))}

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl">
          <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-hero">
            ICSE Affiliated | Bangarapet, Kolar
          </Badge>
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`transition-all duration-700 ${
                index === current
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4 absolute pointer-events-none"
              }`}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight">
                {slide.title}{" "}
                <span className="text-accent">{slide.highlight}</span>
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
                {slide.subtitle}
              </p>
            </div>
          ))}
          <div className="flex flex-wrap gap-4">
            <Link href="/admissions">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" data-testid="button-hero-admissions">
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/about">
              <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" data-testid="button-hero-learn-more">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3" data-testid="hero-dots">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all duration-500 ${
              index === current ? "w-8 bg-accent" : "w-2 bg-white/50 hover:bg-white/80"
            }`}
            data-testid={`hero-dot-${index}`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}

export default function HomePage() {
  return (
    <PublicLayout>
      <HeroSlider />

      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <RevealSection key={index} delay={index * 100}>
                <div className="text-center" data-testid={`stat-${index}`}>
                  <stat.icon className="h-10 w-10 mx-auto mb-3 text-accent" />
                  <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                  <div className="text-sm opacity-80">{stat.label}</div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Why Choose <span className="text-primary">Aashley?</span>
              </h2>
              <p className="text-muted-foreground">
                We provide a nurturing environment where children discover their passions and develop skills for life.
              </p>
            </div>
          </RevealSection>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <RevealSection key={index} delay={index * 150}>
                <Card className="overflow-hidden group transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid={`card-feature-${index}`}>
                  <div className="aspect-video relative overflow-hidden">
                    <img 
                      src={feature.image} 
                      alt={feature.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10 transition-colors duration-300" />
                  </div>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110 group-hover:bg-accent/20">
                      <feature.icon className="h-6 w-6 text-accent" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-2">Photo Stories</h2>
                <p className="text-muted-foreground">Capturing moments of learning, growth, and joy</p>
              </div>
              <Link href="/gallery">
                <Button variant="outline" className="transition-all duration-300 hover:shadow-md" data-testid="button-view-gallery">
                  View Full Gallery
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </RevealSection>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photoStories.map((story, index) => (
              <RevealSection key={index} delay={index * 80}>
                <div 
                  className={`relative group overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 ${
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
                      alt={story.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                      <h4 className="font-semibold text-white">{story.title}</h4>
                      <Badge variant="secondary" className="mt-2">{story.category}</Badge>
                    </div>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto px-4">
          <RevealSection>
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                Real <span className="text-primary">Journeys</span>
              </h2>
              <p className="text-muted-foreground">
                Stories of transformation from our students and parents
              </p>
            </div>
          </RevealSection>
          
          <div className="grid md:grid-cols-3 gap-6">
            {growthStories.map((story, index) => (
              <RevealSection key={index} delay={index * 150}>
                <Card className="relative transition-all duration-300 hover:shadow-xl hover:-translate-y-1" data-testid={`testimonial-${index}`}>
                  <CardContent className="p-6">
                    <Quote className="h-8 w-8 text-accent mb-4" />
                    <p className="text-muted-foreground mb-6 italic">
                      "{story.quote}"
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <div className="font-semibold">{story.name}</div>
                        <div className="text-sm text-muted-foreground">{story.role}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={exerciseImage} 
            alt="Students at Aashley International School" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <RevealSection>
              <div className="text-primary-foreground">
                <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
                  Experience <span className="text-accent">A Day at Aashley</span>
                </h2>
                <p className="opacity-90 mb-6">
                  From the morning bell to the afternoon dispersal, every moment at Aashley is designed 
                  to inspire curiosity, foster friendships, and build character.
                </p>
                <Link href="/day-at-aashley">
                  <Button className="bg-accent text-accent-foreground hover:bg-accent/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" data-testid="button-day-at-aashley">
                    See the Full Day
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </RevealSection>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Clock, time: "8:00 AM", label: "Morning Assembly" },
                { icon: BookOpen, time: "9:00 AM", label: "Academic Classes" },
                { icon: Users, time: "1:00 PM", label: "Lunch & Recreation" },
                { icon: Star, time: "3:00 PM", label: "Co-curricular Activities" },
              ].map((item, index) => (
                <RevealSection key={index} delay={index * 100}>
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-primary-foreground transition-all duration-300 hover:bg-white/20 hover:-translate-y-1 hover:shadow-lg">
                    <item.icon className="h-6 w-6 text-accent mb-2" />
                    <div className="text-sm opacity-80">{item.time}</div>
                    <div className="font-medium">{item.label}</div>
                  </div>
                </RevealSection>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <RevealSection>
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">
              Ready to Join the <span className="text-primary">Aashley Family?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
              Give your child the gift of quality education. Start your journey with us today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/admissions">
                <Button size="lg" className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" data-testid="button-cta-apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" data-testid="button-cta-contact">
                  Schedule a Visit
                </Button>
              </Link>
            </div>
          </RevealSection>
        </div>
      </section>
    </PublicLayout>
  );
}
