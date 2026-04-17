import { PublicLayout } from "@/components/public-layout";
import { useState, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import classroomImage from "@assets/classroom_1.jpg";
import labImage from "@assets/lab_1.jpg";
import scienceLabImage from "@assets/lab_3.jpg";
import classroomImage2 from "@assets/classroom_4.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labEquipment from "@assets/lab_6.jpg";
import {
  BookOpen, Calculator, Beaker, Globe, Languages, Palette,
  Music, Dumbbell, Code, Theater, Users, Trophy, CheckCircle, Star, ArrowRight, Heart, Lightbulb
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

const curriculumLevels = [
  { level: "Nursery - KG", fullTitle: "Pre-Primary Foundation", description: "The foundation years focus on play-based learning, social skills, and early literacy in a safe, vibrant environment.", subjects: ["English Literacy", "Kannada Basics", "Number Concepts", "Environmental Awareness", "Art & Craft", "Music & Movement"], highlights: ["Activity-Based Learning", "Play-Way Methods", "Safe & Nurturing Environment"] },
  { level: "Classes 1-5", fullTitle: "Primary School", description: "Building strong fundamentals through the ICSE curriculum with dynamic hands-on experiences and personalized support.", subjects: ["English Language", "Kannada/Hindi", "Mathematics", "EVS/Science", "Social Studies", "Computer Science", "Art & Music"], highlights: ["ICSE Curriculum Pattern", "Smart Classrooms Integration", "Regular Formative Evaluation"] },
  { level: "Classes 6-8", fullTitle: "Middle School", description: "Expanding horizons with advanced ICSE concepts, laboratory insights, and specialized subject-oriented focus.", subjects: ["English Literature", "Kannada/Hindi", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"], highlights: ["Subject Specialization", "Hands-on Lab Experiments", "Project-Based Assignments"] },
  { level: "Classes 9-10", fullTitle: "Secondary School", description: "Preparing intensely for ICSE board examinations with focused academic rigor, career guidance, and holistic mentorship.", subjects: ["English (Lang & Lit)", "Second Language", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"], highlights: ["Rigorous Board Preparation", "Career Guidance Counseling", "Proven Exam Strategies"] },
];

const activityColors = [
  "from-primary/90 to-primary",
  "from-gold/90 to-gold",
  "from-primary/90 to-primary",
  "from-gold/90 to-gold",
  "from-primary/90 to-primary",
  "from-gold/90 to-gold",
];

const coCurricularActivities = [
  { icon: Palette, name: "Visual Arts", description: "Painting, sketching, sculpture, and digital art expression." },
  { icon: Music, name: "Performing Arts", description: "Vocal music, instrumental training, and classical dance forms." },
  { icon: Theater, name: "Drama & Theater", description: "Acting workshops, stage productions, and public speaking." },
  { icon: Code, name: "Robotics & Tech", description: "Programming logic, robotics club, and modern tech innovations." },
  { icon: Globe, name: "Model UN & Debate", description: "Debates, MUN conferences, and global leadership skills." },
  { icon: Trophy, name: "Sports Academy", description: "Athletics, cricket, football, basketball, and physical excellence." },
];

const facilityImages = [
  { name: "Science Laboratories", description: "Fully equipped Physics, Chemistry & Biology labs meeting ICSE standards.", image: scienceLabImage },
  { name: "Tech Integration Lab", description: "Modern computing hubs with high-speed internet and coding environments.", image: labImage },
  { name: "Interactive Smart Classrooms", description: "50+ spacious classrooms augmented with the latest smart board tech.", image: classroomImage2 },
  { name: "Championship Sports Complex", description: "Dedicated sprawling playground and world-class indoor sports facilities.", image: sportsImage },
  { name: "Resource Library", description: "An extensive curated collection of physical books and vast digital resources.", image: classroomImage },
  { name: "Modern Lab Equipment", description: "Precision scientific instruments enabling advanced hands-on discovery.", image: labEquipment },
];

export default function AcademicsPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImage = useTransform(heroScroll, [0, 1], ["0%", "25%"]);
  const yContent = useTransform(heroScroll, [0, 1], ["0%", "40%"]);
  const opacityHero = useTransform(heroScroll, [0, 0.8], [1, 0]);

  // Framer Motion Custom Tabs state
  const [activeTab, setActiveTab] = useState(0);

  // Parallax ref for methodology section
  const methodologyRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: methodologyScroll } = useScroll({ target: methodologyRef, offset: ["start end", "end start"] });
  const methodY1 = useTransform(methodologyScroll, [0, 1], ["20%", "-20%"]);
  const methodY2 = useTransform(methodologyScroll, [0, 1], ["-20%", "20%"]);

  return (
    <PublicLayout>
      {/* ── CINEMATIC HERO ── */}
      <section ref={heroRef} className="relative min-h-[80vh] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: yImage }}>
          <img src={classroomImage} alt="Classroom at Aashley International School" className="w-full h-full object-cover scale-[1.15]" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(11,31,58,0.98) 0%, rgba(11,31,58,0.90) 30%, rgba(11,31,58,0.50) 60%, rgba(11,31,58,0.15) 100%)' }} />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </motion.div>
        
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light z-20" />
        
        {/* Decorative architectural geometry lines */}
        <motion.div initial={{ rotate: 0 }} animate={{ rotate: 360 }} transition={{ duration: 120, repeat: Infinity, ease: "linear" }} className="absolute right-[5%] top-1/2 -translate-y-1/2 w-[40rem] h-[40rem] rounded-none border border-accent/10 hidden xl:block pointer-events-none" />
        <motion.div initial={{ rotate: 360 }} animate={{ rotate: 0 }} transition={{ duration: 100, repeat: Infinity, ease: "linear" }} className="absolute right-[10%] top-1/2 -translate-y-1/2 w-[30rem] h-[30rem] rounded-none border border-dashed border-accent/20 hidden xl:block pointer-events-none" />
        
        <div className="container mx-auto px-4 relative z-10 pt-20">
          <motion.div className="max-w-3xl" style={{ y: yContent, opacity: opacityHero }}>
            <motion.span initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white text-accent px-4 py-2 font-serif font-bold uppercase tracking-widest text-sm mb-6 inline-block shadow-sm">
              Academics & Programs
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-4xl md:text-5xl lg:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight drop-shadow-lg">
              Shaping<br />
              <span className="text-accent underline decoration-4 underline-offset-8">Brilliant Minds</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-xl text-white/85 leading-relaxed max-w-2xl font-medium tracking-wide mt-8 border-l-4 border-accent pl-5 font-sans">
              Our comprehensive ICSE curriculum is masterfully designed to nurture intellectual curiosity, hone critical thinking,
              and cement a lifelong passion for discovery from Nursery through Class X.
            </motion.p>
            
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }} className="mt-10 flex flex-wrap gap-4">
              {['ICSE (CISCE) Affiliated', 'Nursery to Class X', '50+ Classrooms', 'Advanced Labs'].map((tag, i) => (
                <div key={tag} className="text-xs font-bold tracking-widest text-white/90 px-6 py-3 rounded-none border border-white/20 bg-white/5 backdrop-blur-md shadow-sm uppercase font-sans">
                  {tag}
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── CURRICULUM OVERVIEW (Custom Premium Tabs) ── */}
      <section className="py-16 md:py-24 bg-background relative overflow-hidden" id="curriculum">
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">ICSE Board Pattern</span>
              <h2 className="text-4xl md:text-5xl lg:text-5xl font-serif font-bold mb-6 leading-tight text-primary">
                Academic <span className="text-accent underline decoration-4 underline-offset-8">Progressions</span>
              </h2>
              <p className="text-muted-foreground text-xl font-sans">Developing extraordinarily well-rounded individuals by engaging multiple facets of creativity and athleticism.</p>
            </div>
          </Reveal>

          <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-10">
            {/* Sidebar Navigation */}
            <div className="md:w-1/3 flex flex-row md:flex-col gap-3 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
               {curriculumLevels.map((lvl, index) => {
                 const isActive = activeTab === index;
                 return (
                   <button
                     key={index}
                     onClick={() => setActiveTab(index)}
                     className={`text-left relative px-6 py-5 rounded-none transition-all duration-300 font-serif flex items-center justify-between min-w-[200px] md:min-w-0 border-l-4 ${isActive ? 'text-primary border-accent bg-white shadow-sm' : 'text-muted-foreground border-transparent hover:text-foreground hover:bg-muted/40'}`}
                   >
                     {/* Active Background Pill */}
                     {isActive && (
                       <motion.div 
                         layoutId="activeTabBg" 
                         className="absolute inset-0 bg-white shadow-[0px_10px_30px_rgba(0,0,0,0.05)] rounded-none -z-10"
                         transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                       />
                     )}
                     <div className="relative z-10 flex flex-col">
                        <span className={`text-2xl font-bold transition-colors font-serif ${isActive ? 'text-primary' : ''}`}>{lvl.level}</span>
                        <span className={`text-xs font-sans tracking-wider uppercase mt-1 font-semibold ${isActive ? 'text-accent' : 'opacity-0 h-0 hidden'}`}>View Details</span>
                     </div>
                     {isActive && <motion.div layoutId="activeArrow" className="hidden md:block"><ArrowRight className="h-5 w-5 text-accent" /></motion.div>}
                   </button>
                 );
               })}
            </div>
            
            {/* Tab Content */}
            <div className="md:w-2/3 min-h-[450px]">
                <AnimatePresence mode="wait">
                 <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20, filter: "blur(10px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -20, filter: "blur(10px)" }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    className="bg-white h-full p-8 md:p-12 border-t-8 border-accent shadow-[0px_20px_50px_rgba(0,0,0,0.1)] rounded-none"
                 >
                    <div className="mb-10">
                      <h3 className="text-3xl font-bold font-serif mb-6 text-primary">{curriculumLevels[activeTab].fullTitle}</h3>
                      <p className="text-muted-foreground text-lg leading-relaxed font-sans">{curriculumLevels[activeTab].description}</p>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                        <h4 className="font-bold flex items-center gap-4 text-lg font-serif">
                          <div className="w-12 h-12 rounded-none bg-primary/5 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-6 w-6 text-accent" />
                          </div>
                          Core Subjects
                        </h4>
                        <div className="flex flex-wrap gap-2.5">
                          {curriculumLevels[activeTab].subjects.map((subject, i) => (
                            <span key={i} className="px-4 py-2 rounded-none bg-background border border-border text-sm font-semibold text-primary font-sans">{subject}</span>
                          ))}
                        </div>
                      </div>
                      
                      <div className="space-y-6">
                        <h4 className="font-bold flex items-center gap-4 text-lg font-serif">
                          <div className="w-12 h-12 rounded-none bg-primary/5 flex items-center justify-center flex-shrink-0">
                            <Trophy className="h-6 w-6 text-accent" />
                          </div>
                          Key Priorities
                        </h4>
                        <ul className="space-y-4">
                          {curriculumLevels[activeTab].highlights.map((highlight, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <CheckCircle className="h-5 w-5 text-accent flex-shrink-0 mt-0.5" />
                              <span className="font-medium text-muted-foreground font-sans">{highlight}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                 </motion.div>
               </AnimatePresence>
            </div>
          </div>
        </div>
      </section>

      {/* ── TEACHING METHODOLOGY (Split-Screen Parallax) ── */}
      <section ref={methodologyRef} className="py-16 md:py-24 bg-muted/20 relative overflow-hidden">
        <div className="absolute inset-0 noise-overlay opacity-30" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center max-w-7xl mx-auto">
            
            <div className="order-2 lg:order-1 relative h-[600px] w-full hidden md:block">
              <motion.div style={{ y: methodY1 }} className="absolute left-0 top-10 w-[65%] h-[60%] rounded-none overflow-hidden shadow-[0px_20px_50px_rgba(0,0,0,0.15)] z-20 border-8 border-white">
                 <img src={labImage} alt="Interactive teaching" className="w-full h-full object-cover object-center" />
                 <div className="absolute inset-0 bg-gradient-to-t from-primary/80 to-transparent flex items-end p-6">
                    <span className="text-white font-bold text-lg font-serif">Tech-Enabled Rooms</span>
                 </div>
              </motion.div>
              
              <motion.div style={{ y: methodY2 }} className="absolute right-0 bottom-10 w-[60%] h-[70%] rounded-none overflow-hidden shadow-[0px_20px_50px_rgba(0,0,0,0.15)] z-10 border-8 border-white">
                 <img src={classroomImage2} alt="Students" className="w-full h-full object-cover object-center" />
                 <div className="absolute inset-0 bg-gradient-to-t from-accent/90 to-transparent flex flex-col justify-end p-6 text-white border-b-4 border-accent">
                    <div className="text-5xl font-black font-serif">15:1</div>
                    <div className="font-bold text-xs tracking-widest uppercase opacity-90 mt-1">Attention Ratio</div>
                 </div>
              </motion.div>
            </div>
            
            <div className="order-1 lg:order-2 space-y-8 relative z-20">
              <Reveal direction="left">
                <span className="bg-accent text-white px-3 py-1 font-bold uppercase tracking-widest text-[10px] mb-4 inline-block">Pedagogical Framework</span>
                <h2 className="text-3xl md:text-5xl lg:text-5xl font-serif font-black leading-tight tracking-tight text-primary">
                  Our Inspiring
                  <br /><span className="text-accent underline decoration-4 underline-offset-8">Methodology</span>
                </h2>
                <p className="text-muted-foreground text-xl leading-relaxed font-sans mt-6">
                  We passionately believe in fostering an immersive learning environment where students seamlessly transition from passive listeners to active architects of their own educational destiny.
                </p>
                <div className="grid gap-6 mt-10">
                  {[
                    { title: "Student-centered interactive modeling", icon: Users },
                    { title: "Seamless tech integration in classrooms", icon: Code },
                    { title: "Experiential & project-based sprints", icon: Beaker },
                    { title: "Continuous tailored formative assessments", icon: Calculator },
                    { title: "Hyper-personalized mentor attention", icon: Heart },
                    { title: "Deep conceptual mastery over rote learning", icon: Lightbulb }
                  ].map((item, index) => (
                    <motion.div 
                       key={index}
                       initial={{ opacity: 0, x: 20 }}
                       whileInView={{ opacity: 1, x: 0 }}
                       viewport={{ once: true }}
                       transition={{ delay: index * 0.1, duration: 0.5 }}
                       className="flex items-center gap-5 group p-3 bg-white shadow-[0px_5px_15px_rgba(0,0,0,0.05)] border border-border hover:border-accent transition-colors duration-300"
                    >
                      <div className="w-12 h-12 bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-accent transition-colors duration-300 shadow-sm">
                        <item.icon className="h-5 w-5 text-accent group-hover:text-white transition-colors" />
                      </div>
                      <span className="font-bold text-lg text-primary font-sans">{item.title}</span>
                    </motion.div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── CO-CURRICULAR (Geometric Bento Grids) ── */}
      <section className="py-32 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 z-10 relative">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Beyond Academics</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 leading-tight tracking-tight text-primary">
                Co-curricular <span className="text-accent underline decoration-4 underline-offset-8">Enrichment</span>
              </h2>
              <p className="text-muted-foreground text-xl font-sans">Developing extraordinarily well-rounded individuals by engaging multiple facets of creativity and athleticism.</p>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {coCurricularActivities.map((activity, index) => (
              <Reveal key={index} delay={index * 100} direction="up" className="h-full">
                <div className="group relative h-full rounded-none p-1 overflow-hidden bg-white shadow-[0px_5px_20px_rgba(0,0,0,0.05)] hover:shadow-[0px_10px_30px_rgba(0,0,0,0.1)] transition-all duration-500 border border-border hover:border-accent">
                   <div className="absolute inset-0 bg-white/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                   <div className="relative z-10 p-8 md:p-10 h-full flex flex-col justify-center text-center">
                      <div className={`w-20 h-20 bg-primary flex items-center justify-center mx-auto mb-8 group-hover:bg-accent transition-all duration-500`}>
                        <activity.icon className="h-10 w-10 text-white" />
                      </div>
                      <h3 className="font-bold font-serif text-2xl mb-4 text-primary">{activity.name}</h3>
                      <p className="text-base text-muted-foreground leading-relaxed px-4 font-sans">{activity.description}</p>
                   </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── VIDEO SHOWCASE ── */}
      <section className="py-20 md:py-32 bg-muted/20 relative overflow-hidden">
        <div className="container mx-auto px-4 z-10 relative">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Experience It Live</span>
              <h2 className="text-4xl md:text-5xl font-serif font-black mb-6 text-primary">
                Explore Our <span className="text-accent underline decoration-4 underline-offset-8">Programs</span>
              </h2>
            </div>
          </Reveal>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Reveal delay={100} direction="up">
               <div className="bg-white p-3 shadow-lg border border-border">
                 <div className="aspect-video relative w-full mb-4 bg-black">
                   <iframe className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500" src="https://www.youtube.com/embed/JW3N6JE3oOc?rel=0" title="Montessori Kids" allowFullScreen></iframe>
                 </div>
                 <h3 className="font-bold text-xl font-serif text-primary text-center pb-2">Montessori Environment</h3>
               </div>
            </Reveal>
            <Reveal delay={200} direction="up">
               <div className="bg-white p-3 shadow-lg border border-border">
                 <div className="aspect-video relative w-full mb-4 bg-black">
                   <iframe className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500" src="https://www.youtube.com/embed/yUo5-0oLYsk?rel=0" title="Championship Sports" allowFullScreen></iframe>
                 </div>
                 <h3 className="font-bold text-xl font-serif text-primary text-center pb-2">Championship Sports</h3>
               </div>
            </Reveal>
            <Reveal delay={300} direction="up">
               <div className="bg-white p-3 shadow-lg border border-border">
                 <div className="aspect-video relative w-full mb-4 bg-black">
                   <iframe className="absolute inset-0 w-full h-full opacity-90 hover:opacity-100 transition-opacity duration-500" src="https://www.youtube.com/embed/U-cHh73B51E?rel=0" title="Advanced Laboratories" allowFullScreen></iframe>
                 </div>
                 <h3 className="font-bold text-xl font-serif text-primary text-center pb-2">Advanced Laboratories</h3>
               </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── FACILITIES (Hover Expansion Gallery) ── */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-primary text-white">
        
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-3xl mx-auto mb-20 text-white">
              <span className="bg-accent text-white px-3 py-1 text-[10px] uppercase font-bold tracking-widest mb-4 inline-block tracking-widest">Infrastructure Elite</span>
              <h2 className="text-4xl md:text-5xl lg:text-7xl font-serif font-black mb-6 leading-tight tracking-tight text-white">
                World-Class <span className="text-accent underline decoration-4 underline-offset-8">Facilities</span>
              </h2>
              <p className="text-white/80 mt-6 text-xl max-w-2xl mx-auto font-sans">State-of-the-art infrastructure methodically engineered to radically elevate every conceivable dimension of the learning architecture.</p>
            </div>
          </Reveal>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
            {facilityImages.map((facility, index) => (
              <Reveal key={index} delay={index * 100} direction="scale">
                <div className="group relative overflow-hidden rounded-none shadow-[0px_20px_50px_rgba(0,0,0,0.3)] bg-black aspect-[4/3] md:aspect-[3/4] border border-white/10">
                  <img src={facility.image} alt={facility.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-1000 group-hover:scale-105" />
                  
                  {/* Heavy dark gradient at bottom moving up on hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F3A]/95 via-[#0B1F3A]/40 to-transparent opacity-90 transition-opacity duration-500" />
                  
                  <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-10 transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="w-12 h-1 bg-accent rounded-none mb-6 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100" />
                    <h4 className="font-bold text-3xl font-serif text-white mb-3 tracking-tight">{facility.name}</h4>
                    <p className="text-lg text-white/80 font-sans leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-200">{facility.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
