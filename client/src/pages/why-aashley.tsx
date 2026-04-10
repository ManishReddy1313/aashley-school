import { Link } from "wouter";
import { PublicLayout } from "@/components/public-layout";
import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/home_entrance2.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labImage from "@assets/lab_3.jpg";
import teachersImage from "@assets/teachers_group.jpg";
import {
  GraduationCap, Users, BookOpen, Trophy, Heart, Star, Shield,
  Lightbulb, Globe, Palette, Dumbbell, Monitor, ArrowRight,
  CheckCircle, Beaker, Music, TreePine,
} from "lucide-react";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("scroll-revealed"); obs.unobserve(e.target); } }); }, { threshold: 0.08 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" }) {
  const ref = useScrollReveal();
  const cls = direction === "left" ? "scroll-reveal-left" : direction === "right" ? "scroll-reveal-right" : "scroll-reveal";
  return <div ref={ref} className={`${cls} ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const featureColors = [
  "from-blue-400 to-blue-600", "from-rose-400 to-rose-600", "from-emerald-400 to-emerald-600",
  "from-indigo-400 to-indigo-600", "from-amber-400 to-amber-600", "from-cyan-400 to-cyan-600",
  "from-pink-400 to-pink-600", "from-purple-400 to-purple-600", "from-teal-400 to-teal-600",
  "from-orange-400 to-orange-600", "from-green-400 to-green-600",
];

const parentFeedback = [
  { name: "Mr. Srirama B. V.", relation: "Parent of Unnathi (VIII Std) & Kruthika (VI Std)", quote: "We are very much impressed with the curriculum and teaching methods. Well-planned worksheets make our daughters think beyond textbooks, and the school's vision is to turn young novices into value-oriented, energetic citizens of tomorrow." },
  { name: "Mrs. Padma Sathish R.", relation: "Parent", quote: "We are very much satisfied. Aashley teachers are friendly and caring, and the school has been successful in striking the right balance between academics and co-curricular activities. Our child gets ample opportunities to explore and progress in all aspects." },
  { name: "Dr. Umme Habiba", relation: "Parent", quote: "AIS is a very good platform for our children's education. My children always get good opportunities to explore and progress in all aspects, with a strong balance between academics and co-curricular activities." },
  { name: "Mrs. Shilpa Vinay M. V.", relation: "Parent", quote: "Aashley International School prepared my children to face the real world. It helped them love learning and taught them real-life skills like decision-making, prioritising and problem-solving, shaping their personalities and giving them memories for life." },
];

const uniqueFeatures = [
  { icon: BookOpen, title: "ICSE Curriculum Excellence", description: "Affiliated with CISCE, ICSE curriculum emphasizes conceptual understanding, analytical skills, and holistic development beyond textbooks." },
  { icon: Heart, title: "Values-First Education", description: "Daily prayer, moral education, and character-building activities ensure students grow as compassionate, responsible individuals." },
  { icon: Users, title: "Personalized Attention", description: "With an optimal student-teacher ratio, every child receives individual attention, ensuring no student is left behind." },
  { icon: Monitor, title: "Smart Classrooms", description: "20 well-equipped classrooms with modern teaching aids and technology make learning interactive and engaging for every student." },
  { icon: Beaker, title: "Hands-on Lab Learning", description: "Fully equipped computer and science labs let students experiment, explore, and discover concepts through practical experience." },
  { icon: Dumbbell, title: "Sports & Physical Fitness", description: "Dedicated playground and sports facilities encourage physical development, teamwork, and healthy competition among students." },
  { icon: Palette, title: "Creative Arts Program", description: "Art, craft, music, and performing arts programs unlock creative potential and build confidence through self-expression." },
  { icon: Shield, title: "Safe & Secure Campus", description: "Boundary walls with security fencing, dedicated security staff, and a caring environment ensure every child's safety." },
  { icon: Globe, title: "English Medium Instruction", description: "Complete English-medium education from Pre-Primary to Class 10 prepares students for national and global opportunities." },
  { icon: Lightbulb, title: "Activity-Based Learning", description: "Play-based methods in early years and project-based learning in higher classes make education meaningful and enjoyable." },
  { icon: TreePine, title: "Clean Green Campus", description: "A clean, well-maintained campus surrounded by nature provides the perfect learning and natural environment for growth." },
];

const keyStats = [
  { value: "2008", label: "Established", icon: Star },
  { value: "2000+", label: "Happy Students", icon: Users },
  { value: "4.6/5", label: "Parent Rating", icon: Trophy },
  { value: "50+", label: "Classrooms", icon: BookOpen },
  { value: "ICSE", label: "Board Affiliation", icon: GraduationCap },
  { value: "Pre-K–10", label: "Classes Offered", icon: Globe },
];

const whyNotOthers = [
  { feature: "ICSE Board (CISCE Affiliated)", others: "Mostly State Board" },
  { feature: "English Medium from Pre-Primary", others: "Often mixed medium" },
  { feature: "Daily Values & Prayer Sessions", others: "Rarely offered" },
  { feature: "Computer Lab Access", others: "Limited or unavailable" },
  { feature: "Dedicated Playground", others: "Shared or none" },
  { feature: "Reasonable Fee Structure", others: "Often expensive" },
  { feature: "Regular Evaluation System", others: "Exam-only approach" },
];

export default function WhyAashleyPage() {
  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Aashley International School Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 hero-gradient-cinema" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-3xl">
            <span className="badge-gold mb-5 inline-block">Discover the Aashley Difference</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-5 leading-tight">
              Why Choose<br />
              <span className="text-gradient-gold">Aashley International?</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-6" />
            <p className="text-lg md:text-xl text-white/80 mb-10 leading-relaxed max-w-2xl">
              Since 2008, we've been shaping young minds in Bangarpet, Kolar with an ICSE curriculum, values-driven education, and a commitment to every child's success.
            </p>
            <Link href="/admissions">
              <Button size="lg" className="bg-gold text-white hover:bg-gold-dark border-0 font-bold px-10 hover:shadow-gold hover:-translate-y-1 transition-all duration-300" data-testid="button-why-apply">
                Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section className="relative overflow-hidden section-navy-premium noise-overlay">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 py-14 relative z-10">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
            {keyStats.map((stat, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="text-center group py-5 px-3 rounded-2xl border border-primary-foreground/8 hover:border-gold/20 bg-primary-foreground/4 hover:bg-primary-foreground/8 transition-all duration-300" data-testid={`stat-why-${index}`}>
                  <div className="w-10 h-10 rounded-xl bg-gold/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="h-5 w-5 text-gold" />
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-primary-foreground font-serif">{stat.value}</div>
                  <div className="text-xs text-primary-foreground/55 mt-1 tracking-wide">{stat.label}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── UNIQUE FEATURES ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Our Edge</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                What Makes Aashley <span className="text-gradient-gold">Unique</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">Every aspect of our school is designed to provide the best possible education and development experience.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueFeatures.map((feature, index) => (
              <Reveal key={index} delay={index * 70}>
                <div className="card-premium group p-7" data-testid={`card-feature-why-${index}`}>
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${featureColors[index]} flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-3 group-hover:text-primary transition-colors duration-200">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHOTO SHOWCASE ── */}
      <section className="py-24 bg-muted/25">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Visual Tour</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Experience <span className="text-gradient-gold">Campus Life</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">A glimpse into the vibrant daily life at Aashley International School</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { img: classroomImage, alt: "Classroom Learning at Aashley", title: "Classroom Learning", sub: "Interactive, student-centered education", id: "photo-campus-1" },
              { img: labImage, alt: "Science Lab at Aashley", title: "Hands-on Science", sub: "Fully equipped labs for practical learning", id: "photo-campus-2" },
              { img: sportsImage, alt: "Sports Champions at Aashley", title: "Sports Excellence", sub: "Championship-winning sports teams", id: "photo-campus-3" },
            ].map(({ img, alt, title, sub, id }) => (
              <Reveal key={id}>
                <div className="relative group overflow-hidden rounded-2xl aspect-[4/3] shadow-md hover:shadow-xl transition-all duration-400" data-testid={id}>
                  <img src={img} alt={alt} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                  <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-full group-hover:translate-y-0 transition-transform duration-400">
                    <h4 className="font-bold text-white">{title}</h4>
                    <p className="text-white/75 text-sm mt-1">{sub}</p>
                  </div>
                  <div className="absolute top-3 left-3 opacity-90 group-hover:opacity-0 transition-opacity duration-300">
                    <span className="badge-gold text-[10px]">{title}</span>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="mt-5 relative group overflow-hidden rounded-2xl aspect-[21/9] shadow-md hover:shadow-xl transition-all duration-400" data-testid="photo-campus-teachers">
              <img src={teachersImage} alt="Our dedicated teaching faculty" className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/70 via-transparent to-transparent" />
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-gradient-to-b from-gold via-gold to-gold/30" />
              <div className="absolute bottom-0 left-0 right-0 p-8 md:p-10">
                <span className="badge-gold mb-3 inline-block">Our Team</span>
                <h4 className="font-bold text-white text-xl md:text-2xl font-serif">Our Dedicated Faculty</h4>
                <p className="text-white/75 text-sm mt-1">Individual Attention · Homely Care · Promising Future</p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── COMPARISON TABLE ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">The Comparison</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                The Aashley <span className="text-gradient-gold">Advantage</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">See how Aashley International stands apart from other schools in the region</p>
            </div>
          </Reveal>
          <div className="max-w-3xl mx-auto">
            <div className="card-premium overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="section-navy-premium">
                      <th className="text-left p-5 font-semibold text-primary-foreground">Feature</th>
                      <th className="text-center p-5 font-semibold text-gold">Aashley International</th>
                      <th className="text-center p-5 font-semibold text-primary-foreground/60">Other Schools</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whyNotOthers.map((item, index) => (
                      <tr key={index} className="border-b border-border/60 last:border-0 hover:bg-muted/40 transition-colors duration-150" data-testid={`comparison-row-${index}`}>
                        <td className="p-4 font-medium">{item.feature}</td>
                        <td className="p-4 text-center">
                          <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-gold/10 border border-gold/20">
                            <CheckCircle className="h-4 w-4 text-gold" />
                          </div>
                        </td>
                        <td className="p-4 text-center text-sm text-muted-foreground">{item.others}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-24 relative overflow-hidden section-navy-premium noise-overlay">
        <div className="absolute top-20 left-20 w-80 h-80 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Parent Voices</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-3 leading-tight">
                What <span className="text-gradient-gold">Parents Say</span>
              </h2>
              <div className="section-divider mt-4" />
              <p className="text-primary-foreground/60 mt-4">Real experiences from parents who chose Aashley for their children.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 gap-6">
            {parentFeedback.map((item, index) => (
              <Reveal key={index} delay={index * 120}>
                <div className="relative bg-primary-foreground/6 border border-primary-foreground/10 hover:border-gold/25 rounded-2xl p-8 transition-all duration-300 hover:bg-primary-foreground/10" data-testid={`testimonial-why-${index}`}>
                  <div className="absolute top-4 right-6 text-5xl font-serif font-black text-gold/15 leading-none select-none pointer-events-none">"</div>
                  <div className="flex gap-1 mb-5">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-gold text-gold" />)}
                  </div>
                  <blockquote className="text-primary-foreground/80 italic leading-relaxed mb-6 relative z-10">"{item.quote}"</blockquote>
                  <div className="flex items-center gap-4 pt-4 border-t border-primary-foreground/10">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-gold font-bold font-serif">{item.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-primary-foreground text-sm">{item.name}</div>
                      <div className="text-xs text-primary-foreground/55 mt-0.5">{item.relation}</div>
                    </div>
                  </div>
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
            <div className="max-w-3xl mx-auto text-center">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/15 to-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
                <GraduationCap className="h-10 w-10 text-primary" />
              </div>
              <span className="badge-gold mb-4 inline-block">From the Principal</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight">
                A Message from Our <span className="text-gradient-gold">Principal</span>
              </h2>
              <div className="relative">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-6xl font-serif font-black text-gold/15 pointer-events-none select-none">"</div>
                <blockquote className="text-lg text-muted-foreground italic leading-relaxed mb-8 font-serif relative z-10">
                  "At Aashley International School, we don't just educate — we nurture. Every child who walks through our doors is treated as a unique individual with limitless potential. ICSE curriculum, combined with value-based education, ensures that students don't just excel in examinations but grow as confident, compassionate human beings ready to face the world."
                </blockquote>
              </div>
              <div className="font-bold text-xl font-serif">Mrs. Veenarani B C</div>
              <div className="text-gold font-semibold text-sm tracking-wide mt-1">Principal, Aashley International School</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 relative overflow-hidden bg-muted/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />
        <div className="container mx-auto px-4 text-center">
          <Reveal>
            <span className="badge-gold mb-5 inline-block">Apply Today</span>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight">
              Ready to Give Your Child the <span className="text-gradient-gold">Best Start?</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-10 text-lg">
              Join hundreds of families who have trusted Aashley International School with their children's future. Admissions are now open for 2025–26.
            </p>
            <div className="flex flex-wrap justify-center gap-5">
              <Link href="/admissions">
                <Button size="lg" className="bg-gold text-white hover:bg-gold-dark border-0 font-bold px-10 hover:shadow-gold hover:-translate-y-1 transition-all duration-300" data-testid="button-why-apply-now">
                  Apply for Admission <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-border/60 font-medium px-8 hover:-translate-y-1 transition-all duration-300" data-testid="button-why-visit">
                  Schedule a Campus Visit
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}
