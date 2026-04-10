import { PublicLayout } from "@/components/public-layout";
import { useEffect, useRef } from "react";
import assemblyImage from "@assets/hero_assembly.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import labImage from "@assets/lab_1.jpg";
import sportsImage from "@assets/sports_1.jpg";
import exerciseImage from "@assets/home_6.jpg";
import buildingImage from "@assets/home_entrance2.jpg";
import { Sun, Coffee, BookOpen, Beaker, Utensils, Palette, Dumbbell, Music, Home, Clock, Users, Star } from "lucide-react";

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

const dailySchedule = [
  { time: "7:45 AM", title: "Arrival & Preparation", description: "Students arrive at school and prepare for the day ahead.", icon: Sun, color: "from-amber-400 to-orange-500", image: buildingImage },
  { time: "8:45 AM", title: "Morning Assembly", description: "We gather together for prayer, national anthem, and important announcements that set the tone for the day.", icon: Users, color: "from-blue-400 to-blue-600", image: assemblyImage },
  { time: "9:10 AM", title: "First Academic Session", description: "Core subjects like Mathematics, Science, and Languages are taught during the most productive hours.", icon: BookOpen, color: "from-emerald-400 to-emerald-600", image: classroomImage },
  { time: "11:20 AM", title: "Short Break", description: "Time for a healthy snack and a short pause between sessions.", icon: Coffee, color: "from-orange-400 to-orange-600" },
  { time: "11:40 AM", title: "Second Academic Session", description: "Continuation of academic learning with hands-on activities and group discussions.", icon: Beaker, color: "from-purple-400 to-purple-600", image: labImage },
  { time: "12:40 PM", title: "Lunch Break", description: "Nutritious lunch followed by recreational time with friends.", icon: Utensils, color: "from-rose-400 to-rose-600" },
  { time: "1:10 PM", title: "Afternoon Session", description: "Art, craft, music, and other creative subjects that nurture imagination.", icon: Palette, color: "from-pink-400 to-pink-600" },
  { time: "2:30 PM", title: "Co-curricular Activities", description: "Sports, clubs, and extracurricular activities for holistic development.", icon: Dumbbell, color: "from-cyan-400 to-cyan-600", image: sportsImage },
  { time: "4:00 PM", title: "Dispersal", description: "Students head home with new knowledge and wonderful memories.", icon: Home, color: "from-indigo-400 to-indigo-600" },
];

const specialDays = [
  { day: "Monday", activity: "Library Hour", icon: BookOpen, color: "from-blue-400 to-blue-600" },
  { day: "Tuesday", activity: "Music & Dance", icon: Music, color: "from-rose-400 to-rose-600" },
  { day: "Wednesday", activity: "Sports Practice", icon: Dumbbell, color: "from-emerald-400 to-emerald-600" },
  { day: "Thursday", activity: "Art & Craft", icon: Palette, color: "from-amber-400 to-amber-600" },
  { day: "Friday", activity: "Club Activities", icon: Star, color: "from-purple-400 to-purple-600" },
];

export default function DayAtAashleyPage() {
  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[58vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={exerciseImage} alt="Students during morning activities at Aashley" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/78 to-primary/50" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="badge-gold mb-5 inline-block">Experience Aashley</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-5 leading-tight">
              A Day at
              <br /><span className="text-gradient-gold">Aashley</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-5" />
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              From the morning bell to the afternoon dispersal, every moment is designed to inspire learning, build character, and create memories.
            </p>
          </div>
        </div>
      </section>

      {/* ── TIMELINE ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Our Timetable</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Daily <span className="text-gradient-gold">Schedule</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">A typical day at Aashley International School</p>
            </div>
          </Reveal>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              {/* Center timeline line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-gold via-gold/40 to-transparent md:-translate-x-1/2" />

              {dailySchedule.map((item, index) => (
                <Reveal key={index} delay={index * 80}>
                  <div
                    className={`relative flex flex-col md:flex-row gap-4 md:gap-8 mb-8 ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                    data-testid={`timeline-item-${index}`}
                  >
                    {/* Card */}
                    <div className={`flex-1 ml-20 md:ml-0 ${index % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}>
                      <div className="card-premium group inline-block w-full overflow-hidden hover:border-gold/30 transition-all duration-300">
                        {"image" in item && item.image && (
                          <div className="aspect-video overflow-hidden">
                            <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                          </div>
                        )}
                        <div className="p-6">
                          <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md flex-shrink-0 group-hover:scale-110 transition-transform duration-300`}>
                              <item.icon className="h-6 w-6 text-white" />
                            </div>
                            <div>
                              <div className="font-bold text-base">{item.title}</div>
                              <div className="text-xs text-gold font-semibold flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" /> {item.time}
                              </div>
                            </div>
                          </div>
                          <p className="text-muted-foreground text-sm leading-relaxed">{item.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Gold timeline dot */}
                    <div className="absolute left-8 md:left-1/2 top-6 -translate-x-1/2 flex items-center justify-center z-10">
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

      {/* ── WEEKLY ACTIVITY ── */}
      <section className="py-24 bg-muted/25">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Weekly Highlights</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Weekly Activity <span className="text-gradient-gold">Focus</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">Special activities run throughout the week, with a dedicated focus each day.</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-5 max-w-4xl mx-auto">
            {specialDays.map((item, index) => (
              <Reveal key={index} delay={index * 100}>
                <div className="card-premium group text-center p-8" data-testid={`special-day-${index}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <item.icon className="h-7 w-7 text-white" />
                  </div>
                  <div className="font-bold text-base mb-1">{item.day}</div>
                  <div className="text-sm text-muted-foreground">{item.activity}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── HIGHLIGHTS ── */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={assemblyImage} alt="Students at Aashley" className="w-full h-full object-cover" />
          <div className="absolute inset-0 section-navy-premium opacity-94" />
          <div className="absolute inset-0 noise-overlay opacity-50" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <Reveal>
            <div className="text-center mb-14">
              <span className="badge-gold mb-4 inline-block">Why Every Day Matters</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-3 leading-tight">
                What Makes It <span className="text-gradient-gold">Special</span>
              </h2>
              <div className="section-divider mt-4" />
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Balanced Learning", description: "Perfect mix of academics, sports, and arts for all-round development.", icon: BookOpen, color: "from-blue-400 to-blue-600" },
              { title: "Nutritious Lunch", description: "A break for lunch and rest before energized afternoon sessions.", icon: Utensils, color: "from-emerald-400 to-emerald-600" },
              { title: "Safe Environment", description: "Secure campus with trained staff ensuring student safety at all times.", icon: Users, color: "from-gold-dark to-gold" },
            ].map((item, index) => (
              <Reveal key={index} delay={index * 120}>
                <div className="text-center text-primary-foreground group" data-testid={`highlight-${index}`}>
                  <div className={`w-18 h-18 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`} style={{ width: "4.5rem", height: "4.5rem" }}>
                    <item.icon className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold font-serif mb-3">{item.title}</h3>
                  <p className="text-primary-foreground/70 leading-relaxed">{item.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
