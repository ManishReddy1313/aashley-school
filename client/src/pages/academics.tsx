import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useRef } from "react";
import classroomImage from "@assets/classroom_1.jpg";
import labImage from "@assets/lab_1.jpg";
import scienceLabImage from "@assets/lab_3.jpg";
import classroomImage2 from "@assets/classroom_4.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labEquipment from "@assets/lab_6.jpg";
import {
  BookOpen, Calculator, Beaker, Globe, Languages, Palette,
  Music, Dumbbell, Code, Theater, Users, Trophy, CheckCircle, Star
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
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const curriculumLevels = [
  { level: "Pre-Primary (Nursery - KG)", description: "Foundation years focused on play-based learning, social skills, and early literacy in a safe environment.", subjects: ["English", "Kannada", "Mathematics Concepts", "Environmental Awareness", "Art & Craft", "Music & Movement"], highlights: ["Activity-Based Learning", "Play-Way Methods", "Safe & Nurturing Environment"] },
  { level: "Primary (Classes 1-5)", description: "Building strong fundamentals through the ICSE curriculum with hands-on experiences.", subjects: ["English", "Kannada/Hindi", "Mathematics", "EVS/Science", "Social Studies", "Computer Science", "Art & Music"], highlights: ["ICSE Curriculum", "Smart Classrooms", "Regular Evaluation"] },
  { level: "Middle School (Classes 6-8)", description: "Expanding horizons with advanced ICSE concepts and specialized subjects.", subjects: ["English", "Kannada/Hindi", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"], highlights: ["Subject Specialization", "Lab Experiments", "Project-Based Learning"] },
  { level: "Secondary (Classes 9-10)", description: "Preparing for ICSE board examinations with focused academic rigor and career guidance.", subjects: ["English", "Second Language", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"], highlights: ["ICSE Board Preparation", "Career Guidance", "Exam Strategies"] },
];

const activityColors = [
  "from-rose-400 to-rose-600",
  "from-purple-400 to-purple-600",
  "from-indigo-400 to-indigo-600",
  "from-emerald-400 to-emerald-600",
  "from-amber-400 to-amber-600",
  "from-cyan-400 to-cyan-600",
];

const coCurricularActivities = [
  { icon: Palette, name: "Visual Arts", description: "Painting, sketching, sculpture, and digital art" },
  { icon: Music, name: "Performing Arts", description: "Vocal music, instrumental, and classical dance" },
  { icon: Theater, name: "Drama & Theater", description: "Acting workshops, stage plays, and public speaking" },
  { icon: Code, name: "Robotics & Coding", description: "Programming, robotics club, and tech innovations" },
  { icon: Globe, name: "Model UN", description: "Debates, MUN conferences, and leadership skills" },
  { icon: Trophy, name: "Sports Academy", description: "Cricket, football, basketball, athletics, and more" },
];

const facilityImages = [
  { name: "Science Labs", description: "Well-equipped Physics, Chemistry & Biology labs", image: scienceLabImage },
  { name: "Computer Lab", description: "Modern computers with interactive smart boards", image: labImage },
  { name: "Classrooms", description: "50+ spacious, well-equipped smart classrooms", image: classroomImage2 },
  { name: "Sports Complex", description: "Dedicated playground and indoor sports facilities", image: sportsImage },
  { name: "Library", description: "Extensive collection of 500+ books & digital resources", image: classroomImage },
  { name: "Lab Equipment", description: "Modern scientific instruments for hands-on learning", image: labEquipment },
];

export default function AcademicsPage() {
  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[65vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={classroomImage} alt="Classroom at Aashley International School" className="w-full h-full object-cover scale-105" />
          <div className="absolute inset-0" style={{ background: 'linear-gradient(105deg, rgba(11,31,58,0.97) 0%, rgba(11,31,58,0.85) 40%, rgba(11,31,58,0.50) 70%, rgba(11,31,58,0.15) 100%)' }} />
          <div className="absolute inset-0 dot-pattern opacity-15" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        {/* Decorative circles */}
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-72 h-72 rounded-full border border-gold/10 hidden xl:block pointer-events-none" />
        <div className="absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-gold/6 hidden xl:block pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10 py-24">
          <div className="max-w-2xl">
            <span className="badge-gold mb-6 inline-block">Academics &amp; Programs</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-serif font-bold text-white mb-6 leading-tight tracking-tight">
              Excellence in
              <br /><span className="text-gradient-gold">Education</span>
            </h1>
            <div className="w-20 h-1 bg-gradient-to-r from-gold to-gold/25 rounded mb-7" />
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              Our comprehensive ICSE curriculum nurtures intellectual curiosity, critical thinking,
              and a lifelong love for learning — from Nursery to Class X.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              {['ICSE (CISCE) Affiliated', 'Nursery to Class X', '50+ Classrooms', 'Science & Computer Labs'].map(tag => (
                <span key={tag} className="text-xs font-semibold tracking-wide text-white/70 px-3 py-1 rounded-full border border-white/15 bg-white/5">{tag}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CURRICULUM OVERVIEW ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Academic Structure</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Curriculum <span className="text-gradient-gold">Overview</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">ICSE-affiliated curriculum tailored to meet global standards</p>
            </div>
          </Reveal>
          <Tabs defaultValue="0" className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-10">
              {curriculumLevels.map((level, index) => (
                <TabsTrigger
                  key={index}
                  value={index.toString()}
                  className="data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-gold font-semibold px-6 py-2.5 rounded-full border border-border/50 transition-all duration-250 hover:border-gold/30"
                  data-testid={`tab-level-${index}`}
                >
                  {level.level.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>
            {curriculumLevels.map((level, index) => (
              <TabsContent key={index} value={index.toString()}>
                <div className="card-premium p-8 md:p-10" data-testid={`card-curriculum-${index}`}>
                  <div className="mb-6">
                    <h3 className="text-2xl font-bold font-serif mb-2">{level.level}</h3>
                    <div className="w-12 h-0.5 bg-gold rounded mb-3" />
                    <p className="text-muted-foreground text-lg">{level.description}</p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-10">
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2 text-base">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <BookOpen className="h-4 w-4 text-primary" />
                        </div>
                        Subjects Offered
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {level.subjects.map((subject, i) => (
                          <span key={i} className="px-3 py-1.5 rounded-full bg-muted text-sm font-medium border border-border/60">{subject}</span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-4 flex items-center gap-2 text-base">
                        <div className="w-8 h-8 rounded-lg bg-gold/10 flex items-center justify-center flex-shrink-0">
                          <Trophy className="h-4 w-4 text-gold" />
                        </div>
                        Highlights
                      </h4>
                      <ul className="space-y-3">
                        {level.highlights.map((highlight, i) => (
                          <li key={i} className="flex items-center gap-3 text-muted-foreground">
                            <CheckCircle className="h-5 w-5 text-gold flex-shrink-0" />
                            <span className="font-medium">{highlight}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ── TEACHING METHODOLOGY ── */}
      <section className="py-24 bg-muted/25">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <Reveal direction="left" className="scroll-reveal-left">
              <span className="badge-gold mb-5 inline-block">Our Approach</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-5 leading-tight">
                Our Teaching
                <br /><span className="text-gradient-gold">Methodology</span>
              </h2>
              <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-6" />
              <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
                We believe in creating an engaging learning environment where students actively participate in their educational journey.
              </p>
              <div className="space-y-4">
                {["Student-centered learning approach", "Integration of technology in classrooms", "Experiential and project-based learning", "Regular formative and summative assessments", "Personalized attention for every student", "Focus on conceptual understanding over rote learning"].map((item, index) => (
                  <div key={index} className="flex items-center gap-4 group" data-testid={`methodology-${index}`}>
                    <div className="w-9 h-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-200">
                      <CheckCircle className="h-4 w-4 text-gold" />
                    </div>
                    <span className="font-medium text-foreground/80">{item}</span>
                  </div>
                ))}
              </div>
            </Reveal>
            <Reveal direction="right" className="scroll-reveal-right">
              <div className="space-y-4">
                <div className="rounded-2xl overflow-hidden aspect-video shadow-lg">
                  <img src={labImage} alt="Interactive smart board teaching at Aashley" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-premium p-6 text-center section-navy-premium text-primary-foreground noise-overlay">
                    <div className="relative z-10">
                      <div className="text-4xl font-bold font-serif mb-2">15:1</div>
                      <div className="text-sm text-primary-foreground/70">Student-Teacher Ratio</div>
                    </div>
                  </div>
                  <div className="card-premium p-6 text-center" style={{ background: "linear-gradient(135deg, hsl(var(--gold-dark)), hsl(var(--gold)))" }}>
                    <div className="text-4xl font-bold text-white font-serif mb-2">100%</div>
                    <div className="text-sm text-white/90">Smart Classrooms</div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── CO-CURRICULAR ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Beyond Academics</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Co-curricular <span className="text-gradient-gold">Activities</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">Developing well-rounded individuals through diverse activities</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {coCurricularActivities.map((activity, index) => (
              <Reveal key={index} delay={index * 90}>
                <div className="card-premium group text-center p-8" data-testid={`card-activity-${index}`}>
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${activityColors[index]} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <activity.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors duration-200">{activity.name}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{activity.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FACILITIES ── */}
      <section className="py-24 relative overflow-hidden section-navy-premium noise-overlay">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Infrastructure</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-primary-foreground mb-3 leading-tight">
                World-Class <span className="text-gradient-gold">Facilities</span>
              </h2>
              <div className="section-divider mt-4" />
              <p className="text-primary-foreground/60 mt-4">State-of-the-art infrastructure to support every kind of learning</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5">
            {facilityImages.map((facility, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-400 hover:-translate-y-1" data-testid={`facility-${index}`}>
                  <div className="aspect-[4/3]">
                    <img src={facility.image} alt={facility.name} className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
                    {/* Gold top accent on hover */}
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-5">
                      <h4 className="font-bold text-white mb-1">{facility.name}</h4>
                      <p className="text-sm text-white/70">{facility.description}</p>
                    </div>
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
