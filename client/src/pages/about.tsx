import { PublicLayout } from "@/components/public-layout";
import { useEffect, useRef } from "react";
import buildingImage from "@assets/home_entrance.jpg";
import teachersImage from "@assets/teachers_group.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import assemblyImage from "@assets/hero_2.jpg";
import { 
  Target, 
  Eye, 
  Heart, 
  Star, 
  Award,
  Users,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Shield,
  CheckCircle,
  Quote
} from "lucide-react";

/* ──────────── Scroll Reveal ──────────── */
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

function Reveal({ children, className = "", delay = 0, direction = "up" }: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  direction?: "up" | "left" | "right";
}) {
  const ref = useScrollReveal();
  const cls = direction === "left" ? "scroll-reveal-left" : direction === "right" ? "scroll-reveal-right" : "scroll-reveal";
  return (
    <div ref={ref} className={`${cls} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/* ──────────── Data ──────────── */
const coreValues = [
  { icon: Heart,         title: "Integrity",        description: "We uphold honesty and strong moral principles in everything we do.", color: "from-rose-400 to-rose-600" },
  { icon: Star,          title: "Excellence",       description: "We strive for the highest standards in academics and character.",      color: "from-amber-400 to-amber-600" },
  { icon: Users,         title: "Respect",          description: "We value every individual and foster a culture of mutual respect.",    color: "from-blue-400 to-blue-600" },
  { icon: Lightbulb,     title: "Innovation",       description: "We embrace creativity and new ideas to stay ahead in education.",     color: "from-emerald-400 to-emerald-600" },
  { icon: Shield,        title: "Responsibility",   description: "We nurture responsible citizens who contribute positively to society.", color: "from-purple-400 to-purple-600" },
  { icon: GraduationCap, title: "Lifelong Learning", description: "We inspire curiosity and a passion for continuous growth.",          color: "from-cyan-400 to-cyan-600" },
];

const milestones = [
  { year: "2008", title: "Foundation",            description: "Aashley International School was established in Bangarpet with a vision to provide quality English medium education." },
  { year: "2010", title: "ICSE Affiliation",       description: "Received affiliation from CISCE (Council for Indian School Certificate Examinations) for the ICSE curriculum." },
  { year: "2013", title: "Campus Development",     description: "Expanded facilities with 50+ classrooms, well-equipped science labs, a computer lab, and a dedicated playground." },
  { year: "2016", title: "Growing Community",      description: "Crossed 300+ student enrollment with increasing recognition in Kolar district for quality education." },
  { year: "2020", title: "Resilient Learning",     description: "Successfully adapted to hybrid learning methods while maintaining academic standards during global challenges." },
  { year: "2025", title: "Leading in Excellence",  description: "Rated 4.6/5 by 388+ parents, serving 2000+ students with a commitment to holistic development." },
];

const accreditations = [
  { icon: BookOpen,       label: "ICSE Affiliated (CISCE)" },
  { icon: Award,          label: "English Medium" },
  { icon: Users,          label: "Co-Educational" },
  { icon: GraduationCap,  label: "Pre-Primary to Class X" },
];

export default function AboutPage() {
  return (
    <PublicLayout>

      {/* ── HERO ── */}
      <section className="relative min-h-[65vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={assemblyImage} alt="Aashley International School Assembly" className="w-full h-full object-cover scale-105" style={{ objectPosition: '50% 30%' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(11,31,58,0.97) 0%, rgba(11,31,58,0.88) 35%, rgba(11,31,58,0.60) 65%, rgba(11,31,58,0.20) 100%)' }} />
          <div className="absolute inset-0 dot-pattern opacity-15" />
        </div>
        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        {/* Decorative circle */}
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-gold/10 hidden xl:block pointer-events-none" />
        <div className="absolute right-16 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-gold/6 hidden xl:block pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="max-w-3xl">
            <span className="badge-gold mb-6 inline-block">About Us</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              Shaping Futures
              <br />
              <span className="text-gradient-gold">Since 2008</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold/25 rounded mb-7" />
            <p className="text-lg md:text-xl text-white/80 leading-relaxed max-w-2xl">
              Located in Bangarpet, Kolar District, Karnataka, Aashley International School 
              is an ICSE (CISCE)-affiliated co-educational institution nurturing young minds to become 
              confident, compassionate, and capable individuals since 2008.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['ICSE Affiliated', 'Est. 2008', '2000+ Students', '4.6/5 Rated'].map(tag => (
                <span key={tag} className="text-xs font-semibold tracking-wide text-white/70 px-3 py-1 rounded-full border border-white/15 bg-white/5">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CAMPUS IMAGE STRIP ── */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { img: buildingImage,  alt: "Aashley International School Building",           label: "Our Campus",       sub: "Bangarpet, Kolar" },
                { img: classroomImage, alt: "Students learning in classroom",                   label: "Modern Classrooms", sub: "ICSE Curriculum" },
                { img: teachersImage,  alt: "Teaching faculty of Aashley International School", label: "Expert Faculty",    sub: "Dedicated Teachers" },
              ].map(({ img, alt, label, sub }, i) => (
                <div key={i} className="group relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-400">
                  <img src={img} alt={alt} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108" />
                  {/* Always-visible bottom gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-primary/20 to-transparent" />
                  {/* Always-visible label */}
                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="font-bold text-white text-base font-serif">{label}</div>
                    <div className="text-xs text-gold/90 font-medium tracking-wider mt-0.5">{sub}</div>
                  </div>
                  {/* Gold top accent on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold to-gold-light opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VISION & MISSION ── */}
      <section className="py-24 relative overflow-hidden">
        {/* Soft pattern background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-background to-muted/20 pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="badge-gold mb-5 inline-block">Our Foundation</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
                Vision &amp; <span className="text-gradient-gold">Mission</span>
              </h2>
              <div className="section-divider mt-4" />
              <p className="text-muted-foreground mt-5 text-lg max-w-xl mx-auto">The guiding principles that shape every decision we make at Aashley</p>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Vision */}
            <Reveal delay={100} direction="left">
              <div className="h-full rounded-2xl overflow-hidden border border-primary/10 bg-primary relative shadow-lg" data-testid="card-vision">
                {/* Decorative giant letter */}
                <div className="absolute top-4 right-6 font-serif font-black text-white/5 leading-none select-none pointer-events-none" style={{ fontSize: '10rem' }}>V</div>
                <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-gradient-to-b from-gold via-gold/70 to-gold/20" />
                <div className="p-9 md:p-11">
                  <div className="flex items-center gap-4 mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center flex-shrink-0">
                      <Eye className="h-7 w-7 text-gold" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-white">Our Vision</h2>
                      <div className="w-10 h-0.5 bg-gold/60 mt-1.5 rounded" />
                    </div>
                  </div>
                  <p className="text-white/75 leading-relaxed text-lg relative z-10">
                    To be a globally recognized institution that empowers students to become 
                    innovative thinkers, ethical leaders, and responsible global citizens who 
                    contribute positively to society while staying rooted in their cultural values.
                  </p>
                </div>
              </div>
            </Reveal>

            {/* Mission */}
            <Reveal delay={200} direction="right">
              <div className="h-full rounded-2xl overflow-hidden border border-gold/25 bg-gradient-to-br from-amber-50 to-stone-50 relative shadow-lg" data-testid="card-mission">
                {/* Decorative giant letter */}
                <div className="absolute top-4 right-6 font-serif font-black text-amber-900/5 leading-none select-none pointer-events-none" style={{ fontSize: '10rem' }}>M</div>
                {/* Gold top line */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
                <div className="p-9 md:p-11">
                  <div className="flex items-center gap-4 mb-7">
                    <div className="w-14 h-14 rounded-2xl bg-gold/15 border border-gold/30 flex items-center justify-center flex-shrink-0">
                      <Target className="h-7 w-7 text-gold-dark" />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold font-serif text-foreground">Our Mission</h2>
                      <div className="w-10 h-0.5 bg-gold mt-1.5 rounded" />
                    </div>
                  </div>
                  <p className="text-foreground/70 leading-relaxed text-lg relative z-10">
                    To provide a holistic education that nurtures intellectual curiosity, 
                    develops critical thinking skills, and builds strong character through 
                    innovative teaching methods, a supportive environment, and an unwavering 
                    commitment to excellence in all endeavors.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="py-24 relative overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-muted/40 via-background to-muted/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">What We Stand For</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Our Core <span className="text-gradient-gold">Values</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">
                The principles that guide everything we do at Aashley
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <Reveal key={index} delay={index * 100}>
                <div
                  className="card-premium group text-center p-7"
                  data-testid={`card-value-${index}`}
                >
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${value.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <value.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-3 group-hover:text-primary transition-colors duration-200">
                    {value.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPAL'S MESSAGE ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center mb-14">
              <span className="badge-gold mb-4 inline-block">Leadership</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Principal's <span className="text-gradient-gold">Message</span>
              </h2>
              <div className="section-divider mt-4" />
            </div>
          </Reveal>

          <div className="max-w-5xl mx-auto">
            <Reveal>
              <div className="card-premium overflow-hidden" data-testid="card-leader-0">
                <div className="grid md:grid-cols-5 gap-0">
                  {/* Image */}
                  <div className="md:col-span-2 relative">
                    <img
                      src={teachersImage}
                      alt="Faculty of Aashley International School"
                      className="w-full h-full object-cover min-h-[300px]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent to-primary/10 hidden md:block" />
                    {/* Gold accent */}
                    <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold to-gold/30 hidden md:block" />
                  </div>
                  {/* Content */}
                  <div className="md:col-span-3 p-8 md:p-12 flex flex-col justify-center relative">
                    {/* Decorative quote */}
                    <div className="absolute top-6 right-8 text-8xl font-serif font-black text-gold/10 leading-none select-none pointer-events-none">
                      "
                    </div>

                    <div className="flex items-center gap-4 mb-8">
                      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/15 to-gold/10 border border-gold/20 flex items-center justify-center">
                        <GraduationCap className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-xl">Mrs. Veenarani B C</h3>
                        <p className="text-gold text-sm font-semibold tracking-wide">Principal</p>
                        <p className="text-muted-foreground text-xs mt-0.5">Aashley International School</p>
                      </div>
                    </div>

                    <blockquote className="text-foreground/80 leading-relaxed italic text-lg relative z-10 font-serif">
                      "At Aashley International School, we don't just educate — we nurture. Every child who 
                      walks through our doors is treated as a unique individual with limitless potential. ICSE 
                      curriculum, combined with value-based education, ensures that students don't just excel 
                      in examinations but grow as confident, compassionate human beings ready to face the world."
                    </blockquote>

                    <div className="mt-8 flex items-center gap-3">
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-gold text-gold" />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">4.6/5 School Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── MILESTONES / JOURNEY ── */}
      <section className="py-24 relative overflow-hidden section-navy-premium noise-overlay">
        {/* Ambient blobs */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Our History</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-3 leading-tight">
                Our <span className="text-gradient-gold">Journey</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-primary-foreground/60">
                Milestones that mark our path of excellence
              </p>
            </div>
          </Reveal>

          <div className="relative max-w-4xl mx-auto">
            {/* Center timeline line */}
            <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold/60 via-gold/30 to-transparent hidden md:block" />

            <div className="space-y-10">
              {milestones.map((milestone, index) => (
                <Reveal key={index} delay={index * 100} direction={index % 2 === 0 ? "left" : "right"}>
                  <div
                    className={`flex flex-col md:flex-row gap-6 md:gap-8 items-center ${
                      index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                    }`}
                    data-testid={`milestone-${index}`}
                  >
                    {/* Card */}
                    <div className="flex-1">
                      <div className="bg-primary-foreground/6 border border-primary-foreground/10 hover:border-gold/25 rounded-2xl p-6 transition-all duration-300 hover:bg-primary-foreground/10 group">
                        <div className="text-gold font-bold text-3xl font-serif mb-2 group-hover:scale-105 transition-transform duration-300 inline-block">
                          {milestone.year}
                        </div>
                        <h4 className="font-bold text-lg text-primary-foreground mb-2">{milestone.title}</h4>
                        <p className="text-sm text-primary-foreground/60 leading-relaxed">{milestone.description}</p>
                      </div>
                    </div>

                    {/* Center dot */}
                    <div className="hidden md:flex items-center justify-center flex-shrink-0 relative z-10">
                      <div className="w-5 h-5 rounded-full border-2 border-gold bg-primary shadow-gold" />
                    </div>

                    <div className="flex-1 hidden md:block" />
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── ACCREDITATIONS ── */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Recognition</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Accreditations &{" "}
                <span className="text-gradient-gold">Affiliations</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground">
                In recognition of our commitment to quality education
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {accreditations.map(({ icon: Icon, label }, index) => (
              <Reveal key={index} delay={index * 100}>
                <div
                  className="card-premium text-center p-8 group"
                  data-testid={`accreditation-${index}`}
                >
                  <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-5 group-hover:bg-gold/20 transition-all duration-300 group-hover:scale-110">
                    <Icon className="h-8 w-8 text-gold" />
                  </div>
                  <p className="font-semibold text-sm leading-snug">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
