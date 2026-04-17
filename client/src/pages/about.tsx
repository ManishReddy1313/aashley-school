import { PublicLayout } from "@/components/public-layout";
import { useRef, useEffect } from "react";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import buildingImage from "@assets/home_entrance.jpg";
import teachersImage from "@assets/teachers_group.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import assemblyImage from "@assets/hero_2.jpg";
import principalVideo from "@assets/Principal Message.mp4";
import { 
  Target, Eye, Heart, Star, Award, Users, BookOpen, GraduationCap, Lightbulb, Shield
} from "lucide-react";

// Standard Reveal with Framer Motion
function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" }) {
  let y = 0, x = 0, scale = 1;
  if (direction === "up") y = 20;
  if (direction === "left") x = -20;
  if (direction === "right") x = 20;
  if (direction === "scale") scale = 0.95;
  
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

const coreValues = [
  { icon: Heart,         title: "Integrity",        description: "We uphold honesty and strong moral principles in everything we do.", color: "from-primary/90 to-primary" },
  { icon: Star,          title: "Excellence",       description: "We strive for the highest standards in academics and character.",      color: "from-gold/90 to-gold" },
  { icon: Users,         title: "Respect",          description: "We value every individual and foster a culture of mutual respect.",    color: "from-primary/90 to-primary" },
  { icon: Lightbulb,     title: "Innovation",       description: "We embrace creativity and new ideas to stay ahead in education.",     color: "from-primary/90 to-primary" },
  { icon: Shield,        title: "Responsibility",   description: "We nurture responsible citizens who contribute positively to society.", color: "from-gold/90 to-gold" },
  { icon: GraduationCap, title: "Lifelong Learning", description: "We inspire curiosity and a passion for continuous growth.",          color: "from-primary/90 to-primary" },
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
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImage = useTransform(heroScroll, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const opacityHero = useTransform(heroScroll, [0, 0.8], [1, 0]);

  // Timeline Scroll Line
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  const lineScaleY = useTransform(timelineProgress, [0, 1], [0, 1]);

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
      {/* ── CINEMATIC HERO ── */}
      <section ref={heroRef} className="relative min-h-[75vh] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: yImage }}>
          <img src={assemblyImage} alt="Aashley International School Assembly" className="w-full h-full object-cover scale-[1.1]" style={{ objectPosition: '50% 30%' }} />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(11,31,58,0.98) 0%, rgba(11,31,58,0.92) 30%, rgba(11,31,58,0.60) 65%, rgba(11,31,58,0.20) 100%)' }} />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </motion.div>
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light z-20" />
        
        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 180, repeat: Infinity, ease: "linear" }} className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[45rem] h-[45rem] rounded-none border border-accent/10 hidden xl:block pointer-events-none" />
        <motion.div initial={{ rotate: 360 }} animate={{ rotate: 0 }} transition={{ duration: 150, repeat: Infinity, ease: "linear" }} className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[35rem] h-[35rem] rounded-none border border-dashed border-accent/20 hidden xl:block pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10 py-24">
          <motion.div className="max-w-3xl" style={{ y: yContent, opacity: opacityHero }}>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white text-accent px-4 py-2 font-serif font-bold uppercase tracking-widest text-sm mb-6 inline-block shadow-sm">
              About Us
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-4xl md:text-5xl lg:text-7xl font-serif font-black text-white mb-6 leading-[1.1] tracking-tight">
              Shaping Futures
              <br />
              <span className="text-gradient-gold underline decoration-4 underline-offset-8">Since 2008</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-lg md:text-xl text-white/85 leading-relaxed max-w-2xl font-medium font-sans mt-8 border-l-4 border-accent pl-5">
              Located in Bangarpet, Karnataka, Aashley International School 
              is an elite ICSE-affiliated institution nurturing young minds to become 
              confident, compassionate, and capable global leaders.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-10 flex flex-wrap gap-4">
              {['Est. 2008', '2000+ Students', '4.6/5 Rated', 'CISCE Board'].map(tag => (
                <div key={tag} className="text-xs font-bold tracking-widest text-white/90 px-6 py-3 rounded-none border border-white/20 bg-white/5 backdrop-blur-md shadow-sm uppercase font-sans">
                  {tag}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── VISION & MISSION (Floating Panels) ── */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-background -mt-10 z-20">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center mb-16">
               <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Our Foundation</span>
               <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif font-black mb-6 leading-tight tracking-tight text-primary">
                 Vision & <span className="text-gradient-gold underline decoration-4 underline-offset-8">Mission</span>
               </h2>
            </div>
          </Reveal>

          <div className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto items-center">
            {/* Vision (Left Panel - Floated Up) */}
            <Reveal direction="scale" delay={100} className="lg:-mt-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="h-full rounded-none overflow-hidden border-8 border-[#12315c] bg-primary relative shadow-[0px_20px_50px_rgba(0,0,0,0.15)]"
              >
                <div className="absolute top-4 right-8 font-serif font-black text-white/[0.03] leading-none select-none pointer-events-none" style={{ fontSize: '14rem' }}>V</div>
                
                <div className="p-10 md:p-14 relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm">
                      <Eye className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black font-serif text-white tracking-tight">Our Vision</h2>
                    </div>
                  </div>
                  <p className="text-white/80 leading-relaxed text-xl font-medium font-sans">
                    To seamlessly evolve into a globally recognized institution that empowers students to become 
                    innovative thinkers, ethical leaders, and responsible global citizens who 
                    contribute positively to society while remaining passionately rooted in their cultural values.
                  </p>
                </div>
              </motion.div>
            </Reveal>

            {/* Mission (Right Panel - Floated Down) */}
            <Reveal direction="scale" delay={200} className="lg:mt-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="h-full rounded-none overflow-hidden bg-white border border-border border-l-[12px] border-l-accent relative shadow-[0px_20px_50px_rgba(0,0,0,0.1)]"
              >
                <div className="absolute top-4 right-8 font-serif font-black text-foreground/[0.02] leading-none select-none pointer-events-none" style={{ fontSize: '14rem' }}>M</div>
                
                <div className="p-10 md:p-14 relative z-10">
                  <div className="flex items-center gap-6 mb-8">
                    <div className="w-16 h-16 bg-primary/5 border border-primary/10 flex items-center justify-center flex-shrink-0 shadow-lg backdrop-blur-sm">
                      <Target className="h-8 w-8 text-accent" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-black font-serif text-foreground tracking-tight">Our Mission</h2>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed text-xl font-medium font-sans">
                    To impeccably provide a holistic education that radically nurtures intellectual curiosity, 
                    develops impenetrable critical thinking skills, and builds robust character through 
                    state-of-the-art teaching methodologies.
                  </p>
                </div>
              </motion.div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES (Bento Grid) ── */}
      <section className="py-16 md:py-24 relative overflow-hidden bg-muted/20">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16 text-foreground">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">What We Stand For</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 leading-tight tracking-tight text-primary">
                Our Core <span className="text-gradient-gold underline decoration-4 underline-offset-8">Values</span>
              </h2>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {coreValues.map((value, index) => (
              <Reveal key={index} delay={index * 100} direction="up" className="h-full">
                <motion.div
                  whileHover={{ y: -8 }}
                  className="h-full relative overflow-hidden rounded-none bg-white border border-border p-8 shadow-[0px_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0px_20px_50px_rgba(0,0,0,0.1)] transition-all duration-300 hover:border-accent"
                >
                  <div className={`w-14 h-14 bg-primary/5 flex items-center justify-center mb-6`}>
                    <value.icon className="h-7 w-7 text-accent" />
                  </div>
                  
                  <h3 className="font-bold font-serif text-2xl mb-3 text-primary tracking-tight">
                    {value.title}
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed font-sans">
                    {value.description}
                  </p>
                </motion.div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── RICH HISTORY TIMELINE ── */}
      <section ref={timelineRef} className="py-20 md:py-32 relative overflow-hidden bg-primary text-white">
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="absolute top-[10%] left-[10%] w-[30rem] h-[30rem] bg-white/5 rounded-none blur-[100px] pointer-events-none" />

        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="bg-accent text-white px-3 py-1 font-bold tracking-widest text-[10px] uppercase mb-4 inline-block">Our Legacy</span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black mb-6 leading-tight tracking-tight text-white drop-shadow-sm">
                A Journey of <span className="text-gradient-gold underline decoration-4 underline-offset-8">Excellence</span>
              </h2>
            </div>
          </Reveal>

          <div className="relative max-w-5xl mx-auto cursor-default">
            {/* Center Animated Timeline Line */}
            <div className="absolute left-6 md:left-1/2 transform md:-translate-x-1/2 top-0 bottom-0 w-1 bg-white/10 hidden md:block">
              <motion.div 
                className="absolute top-0 left-0 right-0 bg-accent origin-top"
                style={{ scaleY: lineScaleY, height: "100%" }}
              />
            </div>

            <div className="space-y-16">
              {milestones.map((milestone, index) => {
                const isEven = index % 2 === 0;
                return (
                  <div key={index} className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-center" data-testid={`milestone-${index}`}>
                    {/* Center Dot */}
                    <div className="absolute left-6 md:left-1/2 -mt-4 md:mt-0 md:-translate-x-1/2 flex items-center justify-center z-20 hidden md:flex">
                        <Reveal delay={100} direction="scale">
                           <div className="w-6 h-6 rounded-none border-4 border-accent bg-primary shadow-[0_0_15px_rgba(255,255,255,0.1)]" />
                        </Reveal>
                    </div>

                    {!isEven && <div className="flex-1 hidden md:block" />}

                    {/* Content Card */}
                    <Reveal 
                      direction={isEven ? "right" : "left"} 
                      className={`flex-1 w-full pl-16 md:pl-0 z-10 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}
                    >
                      <motion.div 
                         whileHover={{ y: -5, scale: 1.02 }}
                         className={`max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 border-l-4 hover:border-l-accent rounded-none p-8 md:p-10 transition-all duration-300 relative group text-left ${isEven ? 'md:mr-8' : 'md:ml-8'}`}
                      >
                         <h3 className="text-gold font-black text-5xl font-serif mb-4 flex items-center tracking-tighter drop-shadow-md">
                           {milestone.year}
                         </h3>
                         <h4 className="font-bold text-2xl text-white mb-3 tracking-tight">{milestone.title}</h4>
                         <p className="text-lg text-white/70 leading-relaxed font-sans">{milestone.description}</p>
                      </motion.div>
                    </Reveal>

                    {isEven && <div className="flex-1 hidden md:block" />}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ── IMAGE-MASKED LEADERSHIP PROFILE ── */}
      <section className="py-24 bg-background relative overflow-hidden">
        <div className="absolute top-0 right-0 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center mb-20">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Executive Leadership</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 leading-tight tracking-tight text-primary">
                Principal's <span className="text-gradient-gold underline decoration-4 underline-offset-8">Message</span>
              </h2>
            </div>
          </Reveal>

          <div className="max-w-5xl mx-auto">
            <Reveal direction="up">
              <div className="overflow-hidden rounded-none shadow-[0px_20px_50px_rgba(0,0,0,0.1)] border border-border bg-white flex flex-col">
                
                {/* Top Video Profile (Horizontal Video) */}
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
                <div className="p-10 md:p-14 lg:p-16 relative flex flex-col justify-center">
                  <div className="absolute top-8 right-8 text-8xl font-serif font-black text-primary/[0.03] leading-none select-none pointer-events-none">"</div>

                    <blockquote className="text-primary/90 leading-relaxed italic text-2xl relative z-10 font-serif font-medium">
                      "At Aashley International School, we don't just educate — we nurture. Every child who 
                      walks through our doors is treated as a unique individual with limitless potential. Our 
                      impeccable ICSE curriculum, seamlessly merged with an uncompromising value-based education, 
                      ensures that students don't just excel in examinations but grow as profoundly confident, 
                      compassionate human beings entirely ready to pioneer the future."
                    </blockquote>

                    <div className="mt-12 flex flex-col sm:flex-row items-center sm:items-start gap-6 border-t border-border pt-8">
                       <div className="w-16 h-16 bg-primary/5 flex items-center justify-center flex-shrink-0">
                         <GraduationCap className="h-8 w-8 text-accent" />
                       </div>
                       <div className="text-center sm:text-left">
                         <div className="text-3xl font-black font-serif text-primary mb-1 tracking-tight">Mrs. Veenarani B C</div>
                         <div className="text-accent font-bold text-sm tracking-widest uppercase font-sans">Principal</div>
                         <div className="text-muted-foreground font-sans mt-1">Aashley International School</div>
                        </div>
                     </div>
                  </div>
                </div>
              </Reveal>
          </div>
        </div>
      </section>

      {/* ── ACCREDITATIONS ── */}
      <section className="py-24 bg-[#F4F7F9] relative">
        <div className="absolute top-0 right-1/2 translate-x-1/2 w-full max-w-3xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {accreditations.map(({ icon: Icon, label }, index) => (
              <Reveal key={index} delay={index * 100} direction="scale">
                <div className="h-full flex flex-col items-center text-center p-8 lg:p-10 group rounded-none border border-border border-l-4 hover:border-l-accent hover:shadow-[0px_10px_30px_rgba(0,0,0,0.05)] bg-white transition-all">
                  <div className="w-16 h-16 bg-primary/5 flex items-center justify-center mx-auto mb-5 group-hover:bg-accent/10 transition-all duration-300">
                    <Icon className="h-8 w-8 text-accent" />
                  </div>
                  <p className="font-bold text-primary font-sans text-base tracking-tight leading-snug">{label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
