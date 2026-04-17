import { PublicLayout } from "@/components/public-layout";
import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import assemblyImage from "@assets/hero_assembly.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import labImage from "@assets/lab_1.jpg";
import sportsImage from "@assets/sports_1.jpg";
import exerciseImage from "@assets/home_6.jpg";
import buildingImage from "@assets/home_entrance2.jpg";
import { Sun, Coffee, BookOpen, Beaker, Utensils, Palette, Dumbbell, Music, Home, Clock, Users, Star, ArrowRight, Shield } from "lucide-react";

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

const dailySchedule = [
  { time: "7:45 AM", title: "Arrival & Preparation", description: "Students arrive at school and prepare for the day ahead. A quiet morning start.", icon: Sun, color: "from-primary/90 to-primary", image: buildingImage },
  { time: "8:45 AM", title: "Morning Assembly", description: "We gather together for prayer, national anthem, and important announcements that set the tone for the day.", icon: Users, color: "from-gold/90 to-gold", image: assemblyImage },
  { time: "9:10 AM", title: "First Academic Session", description: "Core subjects like Mathematics, Science, and Languages are taught during the most productive hours.", icon: BookOpen, color: "from-primary/90 to-primary", image: classroomImage },
  { time: "11:20 AM", title: "Short Break", description: "Time for a healthy snack and a short pause between sessions.", icon: Coffee, color: "from-gold/90 to-gold" },
  { time: "11:40 AM", title: "Second Academic Session", description: "Continuation of academic learning with hands-on activities and group discussions.", icon: Beaker, color: "from-primary/90 to-primary", image: labImage },
  { time: "12:40 PM", title: "Lunch Break", description: "Nutritious lunch followed by recreational time with friends.", icon: Utensils, color: "from-gold/90 to-gold" },
  { time: "1:10 PM", title: "Afternoon Session", description: "Art, craft, music, and other creative subjects that nurture imagination.", icon: Palette, color: "from-primary/90 to-primary" },
  { time: "2:30 PM", title: "Co-curricular Activities", description: "Sports, clubs, and extracurricular activities for holistic development.", icon: Dumbbell, color: "from-gold/90 to-gold", image: sportsImage },
  { time: "4:00 PM", title: "Dispersal", description: "Students head home with new knowledge and wonderful memories.", icon: Home, color: "from-primary/90 to-primary" },
];

const specialDays = [
  { day: "Monday", activity: "Library Hour", icon: BookOpen, color: "from-primary/90 to-primary" },
  { day: "Tuesday", activity: "Music & Dance", icon: Music, color: "from-gold/90 to-gold" },
  { day: "Wednesday", activity: "Sports Practice", icon: Dumbbell, color: "from-primary/90 to-primary" },
  { day: "Thursday", activity: "Art & Craft", icon: Palette, color: "from-gold/90 to-gold" },
  { day: "Friday", activity: "Club Activities", icon: Star, color: "from-primary/90 to-primary" },
];

export default function DayAtAashleyPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImage = useTransform(heroScroll, [0, 1], ["0%", "20%"]);
  
  // Timeline scroll
  const timelineRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: timelineProgress } = useScroll({
    target: timelineRef,
    offset: ["start center", "end center"]
  });
  const lineHeight = useTransform(timelineProgress, [0, 1], ["0%", "100%"]);
  const smoothHeight = useSpring(lineHeight, { stiffness: 100, damping: 30, restDelta: 0.001 });

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[65vh] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: yImage }}>
          <img src={exerciseImage} alt="Students during morning activities at Aashley" className="w-full h-full object-cover scale-110" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </motion.div>
        
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light z-20" />
        
        <div className="container mx-auto px-4 relative z-10 py-24">
          <motion.div 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: "easeOut" }}
            className="max-w-2xl"
          >
            <motion.span initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="bg-white text-accent px-4 py-2 font-serif font-bold uppercase tracking-widest text-sm mb-6 inline-block shadow-sm">
              Experience Aashley
            </motion.span>
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              A Day at
              <br /><span className="text-accent underline decoration-4 underline-offset-8">Aashley</span>
            </h1>
            <motion.div initial={{ width: 0 }} animate={{ width: "4rem" }} transition={{ delay: 0.5, duration: 0.6 }} className="h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-6" />
            <p className="text-lg md:text-xl text-white/85 leading-relaxed max-w-xl font-medium mt-8 border-l-4 border-accent pl-5 font-sans">
              From the morning bell to the afternoon dispersal, every moment is purposefully designed to inspire learning, build character, and create lasting memories.
            </p>
          </motion.div>
        </div>
        
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── VIDEO SPOTLIGHT ── */}
      <section className="pt-24 pb-8 bg-background relative">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="max-w-4xl mx-auto rounded-none overflow-hidden shadow-[0px_20px_50px_rgba(11,31,58,0.15)] border-8 border-white group">
              <div className="aspect-video relative bg-black">
                <iframe 
                  className="absolute inset-0 w-full h-full opacity-90 group-hover:opacity-100 transition-opacity duration-500"
                  src="https://www.youtube.com/embed/ZxopP6oYJU0?rel=0" 
                  title="A Day at Aashley International School" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── INTERACTIVE TIMELINE ── */}
      <section className="py-16 md:py-24 bg-background relative" ref={timelineRef}>
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Rhythm of Learning</span>
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif font-bold mb-6 leading-tight text-primary">
                Daily <span className="text-accent underline decoration-4 underline-offset-8">Schedule</span>
              </h2>
              <p className="text-muted-foreground text-lg px-4 font-sans">Trace the vibrant journey of a typical day at Aashley International School.</p>
            </div>
          </Reveal>

          <div className="max-w-6xl mx-auto relative cursor-default">
            {/* Scroll-filling timeline center line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-[2px] bg-border md:-translate-x-1/2 hidden md:block">
              <motion.div className="w-full bg-accent origin-top" style={{ height: smoothHeight }} />
            </div>

            {dailySchedule.map((item, index) => {
              const isEven = index % 2 === 0;
              const hasImage = "image" in item && item.image;
              
              return (
                <div key={index} className="relative flex flex-col md:flex-row gap-4 md:gap-8 mb-16 items-center">
                  {/* Timeline Dot (Desktop focus) */}
                  <div className="absolute left-8 md:left-1/2 -mt-4 md:mt-0 md:-translate-x-1/2 flex items-center justify-center z-20 hidden md:flex">
                     <motion.div 
                        initial={{ scale: 0, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} viewport={{ once: true, margin: "-200px" }}
                        className="w-5 h-5 rounded-none bg-accent shadow-[0px_0px_0px_6px_rgba(255,255,255,1),0px_0px_0px_8px_rgba(169,34,43,0.2)]" 
                     />
                  </div>

                  {/* Left spacer for Odd items on Desktop */}
                  {!isEven && <div className="flex-1 hidden md:block" />}
                  
                  {/* Content Card with Z-Space Overlapping */}
                  <Reveal 
                    direction={isEven ? "right" : "left"} delay={index % 2 * 100} 
                    className={`flex-1 w-full pl-16 md:pl-0 z-10 flex ${isEven ? 'md:justify-end' : 'md:justify-start'}`}
                  >
                    <div className="max-w-xl w-full">
                      <motion.div 
                        whileHover={{ y: -5 }}
                        className={`bg-white group relative p-10 border-l-4 border-accent shadow-[0px_10px_30px_rgba(0,0,0,0.07)] ${hasImage ? 'min-h-[22rem]' : ''} overflow-hidden`}
                      >
                         {/* Optional Image Background with Z-space overlap effect */}
                         {hasImage && (
                           <div className="absolute inset-0 opacity-10 group-hover:opacity-15 transition-opacity duration-700 pointer-events-none">
                             <img src={item.image} alt={item.title} className="w-full h-full object-cover grayscale mix-blend-overlay group-hover:grayscale-0 transition-all duration-700" />
                             <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
                           </div>
                         )}

                         <div className="relative z-10 flex flex-col h-full justify-center">
                            <div className="flex items-center gap-6 mb-6">
                              <div className={`w-14 h-14 bg-primary/5 flex items-center justify-center`}>
                                <item.icon className="h-7 w-7 text-accent" />
                              </div>
                              <div>
                                <h3 className="font-bold text-2xl font-serif text-primary">{item.title}</h3>
                                <div className="text-xs text-accent font-bold tracking-widest mt-2 uppercase font-sans">
                                  {item.time}
                                </div>
                              </div>
                            </div>
                            <p className="text-muted-foreground leading-relaxed text-base font-sans">{item.description}</p>
                         </div>
                      </motion.div>
                    </div>
                  </Reveal>

                  {/* Right spacer for Even items on Desktop */}
                  {isEven && <div className="flex-1 hidden md:block" />}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── WEEKLY ACTIVITY (Interactive Accordion / Cards) ── */}
      <section className="py-16 md:py-24 bg-[#F4F7F9] relative">
        <div className="absolute top-0 right-0 w-full max-w-4xl h-px bg-gradient-to-r from-transparent via-border to-transparent" />
        <div className="container mx-auto px-4">
          <Reveal>
             <div className="text-center max-w-2xl mx-auto mb-16">
               <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Weekly Rhythms</span>
               <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 leading-tight text-primary">
                 Activity <span className="text-accent underline decoration-4 underline-offset-8">Focus</span>
               </h2>
               <p className="text-muted-foreground text-lg font-sans">Every day brings a unique co-curricular flavor to foster well-rounded growth.</p>
             </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 max-w-6xl mx-auto h-[400px] md:h-[450px]">
             {specialDays.map((item, index) => (
                <motion.div 
                   key={index}
                   initial={{ opacity: 0, y: 30 }}
                   whileInView={{ opacity: 1, y: 0 }}
                   viewport={{ once: true }}
                   transition={{ delay: index * 0.1, ease: "easeOut" }}
                   className="relative rounded-none overflow-hidden group cursor-pointer border border-border shadow-[0px_10px_30px_rgba(0,0,0,0.07)] hover:shadow-[0px_20px_50px_rgba(0,0,0,0.15)] transition-all duration-500 bg-white"
                   whileHover={{ flexGrow: 1.5, zIndex: 10 }}
                   style={{ flexGrow: 1, display: 'flex', flexBasis: 0 }}
                >
                   {/* Background Highlight */}
                   <div className={`absolute inset-0 bg-primary opacity-0 group-hover:opacity-[0.02] transition-opacity duration-500`} />
                   
                   {/* Content Area */}
                   <div className="absolute inset-0 p-6 flex flex-col justify-end">
                      <div className="bg-white border-l-4 border-accent shadow-sm p-5 transform group-hover:-translate-y-4 transition-transform duration-500">
                         <div className={`w-12 h-12 bg-primary/5 flex items-center justify-center mb-4`}>
                            <item.icon className="h-6 w-6 text-accent" />
                         </div>
                         <div className="font-bold text-xl text-primary font-serif mb-1">{item.day}</div>
                         <div className="text-sm font-medium text-muted-foreground font-sans">{item.activity}</div>
                      </div>
                   </div>
                </motion.div>
             ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS (Bento Block) ── */}
      <section className="py-20 md:py-32 relative overflow-hidden text-white bg-primary">
        <div className="absolute inset-0">
          <img src={assemblyImage} alt="Students at Aashley" className="w-full h-full object-cover object-top opacity-20 mix-blend-overlay" />
          <div className="absolute inset-0 bg-primary/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center mb-16">
              <span className="bg-accent text-white px-4 py-1.5 text-xs font-bold uppercase tracking-widest mb-6 inline-block">Why Every Day Matters</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
                What Makes It <span className="text-accent underline decoration-4 underline-offset-8">Special</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-5xl mx-auto">
            {[
              { title: "Balanced Learning", description: "Perfect mix of rigorous academics, active sports, and creative arts for all-round development.", icon: BookOpen },
              { title: "Nutritious Wellbeing", description: "Dedicated breaks ensuring students are well-fed and rested before energized afternoon sessions.", icon: Utensils },
              { title: "Secure Environment", description: "A highly secure campus with trained staff ensuring absolute student safety at all times.", icon: Shield },
            ].map((item, index) => (
              <Reveal key={index} delay={index * 120} direction="up">
                <div className="text-center group p-10 bg-white/5 border border-white/10 hover:border-accent transition-all duration-300">
                  <div className={`w-20 h-20 bg-white/10 border border-white/20 flex items-center justify-center mx-auto mb-8 shadow-lg group-hover:-translate-y-2 group-hover:border-accent transition-all duration-300`}>
                    <item.icon className="h-10 w-10 text-white drop-shadow-sm group-hover:text-accent transition-colors" />
                  </div>
                  <h3 className="text-2xl font-bold font-serif mb-4 text-white">{item.title}</h3>
                  <p className="text-white/70 leading-relaxed text-lg font-sans">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
