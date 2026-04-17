import { Link } from "wouter";
import { PublicLayout } from "@/components/public-layout";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/home_entrance2.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labImage from "@assets/lab_3.jpg";
import teachersImage from "@assets/teachers_group.jpg";
import principalVideo from "@assets/Principal Message.mp4";
import {
  GraduationCap, Users, BookOpen, Trophy, Heart, Star, Shield,
  Lightbulb, Globe, Palette, Dumbbell, Monitor, ArrowRight,
  CheckCircle, Beaker, Music, TreePine,
} from "lucide-react";

// Using Framer Motion for better reveal animations
function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" | "opacity" }) {
  let y = 0, x = 0, scale = 1, opacity = 0;
  if (direction === "up") y = 20;
  if (direction === "left") x = -20;
  if (direction === "right") x = 20;
  if (direction === "scale") scale = 0.95;

  return (
    <motion.div
      initial={{ opacity, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Stats stagger
const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

const featureColors = [
  "from-primary/90 to-primary", "from-gold/90 to-gold", "from-primary/90 to-primary",
  "from-gold/90 to-gold", "from-primary/90 to-primary", "from-gold/90 to-gold",
  "from-primary/90 to-primary", "from-gold/90 to-gold", "from-primary/90 to-primary",
  "from-gold/90 to-gold", "from-primary/90 to-primary",
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
  { icon: Monitor, title: "Smart Classrooms", description: "20 well-equipped classrooms with modern teaching aids and technology make learning interactive and engaging for every student." },
  { icon: Users, title: "Personalized Attention", description: "With an optimal student-teacher ratio, every child receives individual attention, ensuring no student is left behind." },
  { icon: Beaker, title: "Hands-on Lab Learning", description: "Fully equipped computer and science labs let students experiment, explore, and discover concepts through practical experience." },
  { icon: Palette, title: "Creative Arts Program", description: "Art, craft, music, and performing arts programs unlock creative potential and build confidence through self-expression." },
  { icon: Dumbbell, title: "Sports & Fitness", description: "Dedicated playground and sports facilities encourage physical development." },
  { icon: Shield, title: "Safe & Secure Campus", description: "Boundary walls with security fencing and a caring environment ensure child safety." },
  { icon: Globe, title: "English Medium", description: "Complete English-medium education from Pre-Primary to Class 10." },
  { icon: Lightbulb, title: "Activity-Based", description: "Play-based methods in early years." },
  { icon: TreePine, title: "Green Campus", description: "A clean, well-maintained campus surrounded by nature." },
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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImage = useTransform(heroScroll, [0, 1], ["0%", "20%"]);
  const opacityHero = useTransform(heroScroll, [0, 0.8], [1, 0]);

  const principalVideoRef = useRef<HTMLVideoElement>(null);
  const isVideoInView = useInView(principalVideoRef, { once: false, margin: "-100px" });

  useEffect(() => {
    if (isVideoInView && principalVideoRef.current) {
      principalVideoRef.current.play().catch(e => console.log("Auto-play prevented", e));
    } else if (principalVideoRef.current) {
      principalVideoRef.current.pause();
    }
  }, [isVideoInView]);

  return (
    <PublicLayout>
      {/* ── HERO WITH PARALLAX ── */}
      <section ref={heroRef} className="relative min-h-[75vh] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: yImage }}>
          <img src={heroImage} alt="Aashley International School Campus" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/65 to-primary/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </motion.div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light z-20" />

        <div className="container mx-auto px-4 relative z-10 py-20">
          <motion.div
            className="max-w-3xl"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ opacity: opacityHero }}
          >
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white text-accent px-4 py-2 font-serif font-bold uppercase tracking-widest text-sm mb-6 inline-block shadow-sm">
              Discover the Aashley Difference
            </motion.span>

            <h1 className="text-3xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-[1.1] tracking-tight">
              Why Choose<br />
              <span className="text-gradient-gold underline decoration-4 underline-offset-8">Aashley International?</span>
            </h1>

            <p className="text-lg md:text-xl text-white/85 mb-10 leading-relaxed max-w-2xl font-sans mt-8 border-l-4 border-gold pl-5">
              Since 2008, we've been shaping young minds in Bangarpet, Kolar with an ICSE curriculum, values-driven education, and a commitment to every child's success.
            </p>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
              <Link href="/admissions">
                <Button size="lg" className="bg-accent text-white hover:bg-accent/90 border-0 font-bold px-10 rounded-none transition-all duration-300 h-14 text-lg shadow-[0px_10px_30px_rgba(0,0,0,0.1)]">
                  Start Your Journey <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>

        {/* Cinematic gradient overlay at bottom to blend into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0B1F3A] to-transparent z-10" />
      </section>

      {/* ── STAGGERED STATS BAND ── */}
      <section className="relative overflow-hidden section-navy-premium pt-4 pb-16">
        <div className="absolute top-0 right-1/4 w-[30rem] h-[30rem] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <motion.div
            variants={containerVariants} initial="hidden" whileInView="show" viewport={{ once: true, margin: "-50px" }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6"
          >
            {keyStats.map((stat, index) => (
              <motion.div key={index} variants={itemVariants} className="text-center group py-8 px-4 rounded-none border border-white/10 hover:border-accent bg-transparent transition-all duration-300">
                <div className="w-16 h-16 rounded-none bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-6 group-hover:-translate-y-2 transition-transform">
                  <stat.icon className="h-8 w-8 text-white drop-shadow-sm" />
                </div>
                <div className="text-3xl md:text-4xl font-bold text-white font-serif tracking-tight">{stat.value}</div>
                <div className="text-xs text-white/50 mt-3 tracking-widest uppercase font-semibold font-sans">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── BENTO GRID FEATURES ── */}
      <section className="py-16 md:py-24 bg-background relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-4">
          <Reveal direction="up">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">The Premium Approach</span>
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif font-bold mb-6 leading-tight text-primary">
                What Makes Aashley <br /><span className="text-gradient-gold underline decoration-4 underline-offset-8">Unique</span>
              </h2>
              <p className="text-muted-foreground text-lg px-4 font-sans">Every facet of our institution is carefully crafted to deliver world-class education.</p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 auto-rows-[minmax(180px,auto)] max-w-7xl mx-auto">
            {uniqueFeatures.map((feature, index) => {
              // Bento Logic: Make the first two items larger (col-span-2)
              const isLarge = index === 0 || index === 1;
              const isTall = index === 2; // Make the third one tall
              return (
                <Reveal
                  key={index} delay={index * 50} direction="scale"
                  className={`h-full ${isLarge ? 'md:col-span-2' : ''} ${isTall ? 'md:row-span-2' : ''}`}
                >
                  <div className={`card-premium group p-8 h-full flex flex-col justify-center relative overflow-hidden backdrop-blur-xl border border-border/60 ${isLarge ? 'bg-gradient-to-br from-card to-muted/30' : 'bg-card'}`}>
                    {/* Subtle glowing orb in background on hover */}
                    <div className={`absolute -right-10 -top-10 w-32 h-32 bg-gradient-to-br ${featureColors[index]} rounded-full blur-[50px] opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />

                    <div className={`w-12 h-12 rounded-none bg-gradient-to-br ${featureColors[index]} flex items-center justify-center mb-6 shadow-md group-hover:scale-110 transition-transform duration-300 ring-4 ring-background z-10`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>

                    <h3 className={`${isLarge ? 'text-2xl' : 'text-lg'} font-bold mb-3 group-hover:text-primary transition-colors duration-200 z-10 font-serif`}>{feature.title}</h3>
                    <p className={`text-muted-foreground leading-relaxed z-10 ${isLarge ? 'text-base' : 'text-sm'}`}>{feature.description}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── INTERACTIVE PHOTO SHOWCASE (Masonry-like overlap) ── */}
      <section className="py-16 md:py-24 bg-muted/30 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Visual Tour</span>
              <h2 className="text-4xl md:text-5xl font-serif font-bold mb-4 leading-tight text-primary">
                Experience <span className="text-gradient-gold underline decoration-4 underline-offset-8">Campus Life</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-12 gap-2 max-w-6xl mx-auto">
            {/* Left Big Image */}
            <div className="md:col-span-8 relative group rounded-none overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.07)] aspect-[16/10]">
              <img src={classroomImage} alt="Classroom" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
              <div className="absolute inset-x-0 bottom-0 p-8 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <span className="px-3 py-1 bg-accent text-white text-[10px] font-bold rounded-none mb-3 inline-block uppercase tracking-widest">Learning</span>
                <h3 className="text-2xl font-serif font-bold text-white mb-2">Interactive Classrooms</h3>
                <p className="text-white/80 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 font-sans">Student-centered education focused on active participation.</p>
              </div>
            </div>

            {/* Right Stack */}
            <div className="md:col-span-4 flex flex-col gap-2">
              <div className="flex-1 relative group rounded-none overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.07)] aspect-square md:aspect-auto">
                <img src={labImage} alt="Lab" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h4 className="font-bold text-white text-xl font-serif">Hands-on Science</h4>
                  <p className="text-white/70 text-sm mt-1 font-sans">Fully equipped dedicated laboratories.</p>
                </div>
              </div>
              <div className="flex-1 relative group rounded-none overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.07)] aspect-square md:aspect-auto">
                <img src={sportsImage} alt="Sports" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/90 via-transparent to-transparent opacity-80" />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <h4 className="font-bold text-white text-xl font-serif">Sports Excellence</h4>
                  <p className="text-white/70 text-sm mt-1 font-sans">Championship-winning sports teams.</p>
                </div>
              </div>
            </div>

            {/* Bottom Full Wide Image */}
            <div className="md:col-span-12 relative group rounded-none overflow-hidden shadow-[0px_10px_30px_rgba(0,0,0,0.15)] aspect-[21/7]">
              <img src={teachersImage} alt="Faculty" className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/50 to-transparent" />
              <div className="absolute left-0 bottom-0 top-0 w-2 bg-accent" />
              <div className="absolute left-0 inset-y-0 flex flex-col justify-center p-10 max-w-2xl">
                <span className="bg-accent text-white px-3 py-1 text-[10px] uppercase font-bold tracking-widest mb-4 inline-block w-max">Our Team</span>
                <h3 className="text-3xl md:text-4xl font-serif font-bold text-white mb-3">Dedicated, Expert Faculty</h3>
                <p className="text-white/80 text-lg font-sans">Individual Attention · Homely Care · A Promising Future</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── THE ADVANTAGE (Animated Comparison Table) ── */}
      <section className="py-16 md:py-24 relative">
        <div className="container mx-auto px-4 z-10 relative">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">The Comparison</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-4 leading-tight">
                The Aashley <span className="text-gradient-gold">Advantage</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">See how Aashley International stands strictly apart.</p>
            </div>
          </Reveal>

          <div className="max-w-4xl mx-auto">
            <Reveal direction="scale">
              <div className="bg-white overflow-hidden rounded-none shadow-[0px_20px_50px_rgba(0,0,0,0.08)] border-t-4 border-accent">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="bg-primary border-b border-primary">
                        <th className="text-left p-6 font-bold text-white text-lg font-serif">Key Feature</th>
                        <th className="text-center p-6 font-bold text-accent text-lg bg-black/20 w-1/3 font-serif">Aashley International</th>
                        <th className="text-center p-6 font-medium text-white/50 text-sm w-1/3 font-sans">Other Regional Schools</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whyNotOthers.map((item, index) => (
                        <motion.tr
                          key={index}
                          initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                          viewport={{ once: true, margin: "-50px" }}
                          className="border-b border-border last:border-0 hover:bg-muted/50 group transition-colors"
                        >
                          <td className="p-5 font-semibold text-primary font-sans">{item.feature}</td>
                          <td className="p-5 text-center bg-accent/5 group-hover:bg-accent/10 transition-colors">
                            <div className="inline-flex items-center justify-center w-10 h-10 rounded-none bg-accent/15 border border-accent/30 shadow-sm group-hover:scale-110 transition-transform">
                              <CheckCircle className="h-5 w-5 text-accent" />
                            </div>
                          </td>
                          <td className="p-5 text-center text-sm text-muted-foreground font-sans">{item.others}</td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS (Frosted Cards) ── */}
      <section className="py-16 md:py-32 relative overflow-hidden bg-[#F4F7F9]">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Parent Voices</span>
              <h2 className="text-4xl md:text-5xl font-serif font-black text-primary mb-4 leading-tight tracking-tight">
                What <span className="text-gradient-gold underline decoration-4 underline-offset-8">Parents Say</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {parentFeedback.map((item, index) => (
              <Reveal key={index} delay={index * 150} direction="up" className="h-full">
                <div className="relative h-full bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.07)] rounded-none p-10 transition-all duration-500 hover:-translate-y-2 group border-t-2 border-transparent hover:border-accent">
                  <div className="absolute top-6 right-8 text-8xl font-serif font-black text-accent/10 leading-none select-none pointer-events-none group-hover:text-accent/20 transition-colors">"</div>

                  <div className="mb-6 flex space-x-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-5 w-5 fill-accent text-accent" />)}
                  </div>

                  <blockquote className="text-primary italic leading-relaxed mb-8 relative z-10 text-lg font-serif">"{item.quote}"</blockquote>

                  <div className="flex items-center gap-4 mt-auto border-t border-border pt-6">
                    <div className="w-12 h-12 rounded-none bg-primary flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold font-serif text-lg">{item.name.charAt(0)}</span>
                    </div>
                    <div>
                      <div className="font-bold text-primary text-base font-sans tracking-wide">{item.name}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 uppercase tracking-wide font-sans">{item.relation}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRINCIPAL ── */}
      <section className="py-16 md:py-32 bg-white">
        <div className="container mx-auto px-4">
          <Reveal direction="scale">
            <div className="max-w-5xl mx-auto rounded-none relative shadow-[0px_20px_50px_rgba(0,0,0,0.1)] overflow-hidden bg-white flex flex-col">

              {/* Top Video Profile (Native Video) */}
              <div className="relative aspect-video w-full bg-black overflow-hidden border-b border-border">
                <motion.div
                  className="absolute inset-0 flex items-center justify-center bg-black"
                  initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 1.5, ease: "easeOut" }}
                  viewport={{ once: true }}
                >
                  <video
                    ref={principalVideoRef}
                    src={principalVideo}
                    className="w-full h-full object-contain opacity-95 transition-opacity"
                    controls
                    playsInline
                    muted
                    preload="metadata"
                  />
                </motion.div>
              </div>

              {/* Bottom Content */}
              <div className="p-10 md:p-14 lg:p-16 flex flex-col justify-center relative bg-white border-t-0 md:border-t-0 border-accent">
                <div className="absolute top-8 right-8 text-8xl font-serif font-black text-primary/[0.03] leading-none select-none pointer-events-none">"</div>

                <div className="mb-8 border-b border-border pb-6">
                  <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary">
                    A Message from the <span className="text-gradient-gold underline decoration-4 underline-offset-8">Principal</span>
                  </h2>
                </div>

                <blockquote className="text-xl md:text-2xl text-muted-foreground italic leading-relaxed font-serif relative z-10">
                  "At Aashley International School, we don't just educate — we nurture. Every child who walks through our doors is treated as a unique individual with limitless potential. ICSE curriculum, combined with value-based education, ensures that students don't just excel in examinations but grow as confident, compassionate human beings ready to face the world."
                </blockquote>

                <div className="mt-12 flex items-center gap-6">
                  <div className="w-16 h-16 bg-primary/5 flex items-center justify-center flex-shrink-0">
                    <GraduationCap className="h-8 w-8 text-gold" />
                  </div>
                  <div>
                    <div className="font-black text-2xl font-serif text-primary mb-1">Mrs. Veenarani B C</div>
                    <div className="text-accent font-bold text-sm tracking-widest uppercase font-sans">Principal, Aashley International School</div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-primary shadow-inner">
        <div className="absolute top-0 right-0 opacity-5 pointer-events-none">
          <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect width="400" height="400" fill="white" />
          </svg>
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Reveal direction="up">
            <span className="bg-accent text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 inline-block">Admissions Open 2026-27</span>
            <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif font-bold mb-6 leading-tight tracking-tight text-white">
              Give Your Child the <br /><span className="text-gradient-gold underline decoration-4 underline-offset-8">Best Start</span>
            </h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-10 text-xl leading-relaxed font-sans">
              Join hundreds of families who have trusted Aashley International School with their children's future. Discover an environment designed for excellence.
            </p>
            <div className="flex flex-wrap justify-center gap-6">
              <Link href="/admissions">
                <Button size="lg" className="bg-white text-primary hover:bg-white/90 border-0 font-bold px-10 rounded-none transition-all duration-300 h-14 text-lg shadow-[0px_10px_30px_rgba(0,0,0,0.1)]">
                  Apply for Admission <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button size="lg" variant="outline" className="border-2 border-white bg-transparent text-white font-medium px-8 rounded-none hover:bg-white hover:text-primary transition-all duration-300 h-14 text-lg">
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
