import { useState, useEffect, useRef } from "react";
import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Camera, X, ChevronLeft, ChevronRight, Instagram } from "lucide-react";

import buildingImg1 from "@assets/home_entrance.jpg";
import buildingImg2 from "@assets/home_entrance2.jpg";
import assemblyImg1 from "@assets/hero_2.jpg";
import assemblyImg2 from "@assets/hero_assembly.jpg";
import assemblyImg3 from "@assets/hero_3.jpg";
import studentsImg1 from "@assets/hero_1.jpg";
import studentsImg2 from "@assets/hero_indoor1.jpg";
import exerciseImg from "@assets/home_6.jpg";
import classroomImg1 from "@assets/classroom_1.jpg";
import classroomImg2 from "@assets/classroom_2.jpg";
import classroomImg3 from "@assets/classroom_3.jpg";
import labImg1 from "@assets/lab_1.jpg";
import labImg2 from "@assets/lab_3.jpg";
import labImg3 from "@assets/lab_4.jpg";
import labImg4 from "@assets/lab_6.jpg";
import sportsImg1 from "@assets/sports_1.jpg";
import sportsImg2 from "@assets/sports_2.jpg";
import sportsImg3 from "@assets/sports_3.jpg";
import sportsImg4 from "@assets/sports_6.jpg";
import teachersImg from "@assets/teachers_group.jpg";
import prayerImg from "@assets/hero_building.jpg";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("scroll-revealed"); obs.unobserve(e.target); } }); }, { threshold: 0.05 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-reveal ${className}`} style={{ transitionDelay: `${delay}ms`, transitionDuration: '0.5s', transform: 'translateY(15px)' }}>{children}</div>;
}

const categories = ["All", "Campus", "Daily Life", "Sports", "Academics", "Labs", "Faculty"];

const galleryItems = [
  { id: 1, title: "School Building", category: "Campus", description: "The majestic Aashley International School campus", size: "large" as const, image: buildingImg1 },
  { id: 2, title: "Morning Assembly", category: "Daily Life", description: "Students gathered for the morning assembly", size: "medium" as const, image: assemblyImg1 },
  { id: 3, title: "Smart Board Teaching", category: "Academics", description: "Chemistry class with interactive smart board", size: "medium" as const, image: labImg1 },
  { id: 4, title: "Chess Club", category: "Sports", description: "Student developing strategic thinking through chess", size: "small" as const, image: sportsImg1 },
  { id: 5, title: "Pre-Primary Assembly", category: "Daily Life", description: "Young students in formation during morning assembly", size: "small" as const, image: assemblyImg2 },
  { id: 6, title: "Science Lab", category: "Labs", description: "Students conducting physics experiments", size: "small" as const, image: labImg2 },
  { id: 7, title: "Trophy Winners", category: "Sports", description: "Girls volleyball team with championship trophy", size: "medium" as const, image: sportsImg2 },
  { id: 8, title: "Campus Panorama", category: "Campus", description: "Students at assembly with school building backdrop", size: "large" as const, image: buildingImg2 },
  { id: 9, title: "Physical Training", category: "Daily Life", description: "Students participating in morning exercises", size: "small" as const, image: exerciseImg },
  { id: 10, title: "Classroom Learning", category: "Academics", description: "Senior students studying with teacher supervision", size: "medium" as const, image: classroomImg1 },
  { id: 11, title: "Senior Students", category: "Daily Life", description: "Senior girls during school assembly", size: "small" as const, image: studentsImg2 },
  { id: 12, title: "Creative Learning", category: "Academics", description: "Young student engaged in classroom activities", size: "small" as const, image: prayerImg },
  { id: 13, title: "Lab Experiments", category: "Labs", description: "Students with physics lab equipment", size: "small" as const, image: labImg3 },
  { id: 14, title: "Our Faculty", category: "Faculty", description: "The dedicated teaching team of Aashley International", size: "large" as const, image: teachersImg },
  { id: 15, title: "Outdoor Sports", category: "Sports", description: "Students enjoying outdoor activities", size: "small" as const, image: sportsImg3 },
  { id: 16, title: "Classroom Session", category: "Academics", description: "Interactive classroom learning", size: "medium" as const, image: classroomImg2 },
  { id: 17, title: "Junior Students", category: "Daily Life", description: "Pre-primary students in school uniform", size: "small" as const, image: assemblyImg3 },
  { id: 18, title: "Team Sports", category: "Sports", description: "Students competing in team sports", size: "small" as const, image: sportsImg4 },
  { id: 19, title: "Science Practical", category: "Labs", description: "Hands-on learning in the science laboratory", size: "medium" as const, image: labImg4 },
  { id: 20, title: "Senior Classroom", category: "Academics", description: "Students focused on their studies", size: "small" as const, image: classroomImg3 },
  { id: 21, title: "Boys Assembly", category: "Daily Life", description: "Boys standing in formation during assembly", size: "small" as const, image: studentsImg1 },
];

export default function GalleryPage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedImage, setSelectedImage] = useState<number | null>(null);

  const filteredItems = selectedCategory === "All" ? galleryItems : galleryItems.filter(item => item.category === selectedCategory);
  const currentImageIndex = selectedImage !== null ? filteredItems.findIndex(item => item.id === selectedImage) : -1;

  const navigateImage = (direction: "prev" | "next") => {
    if (currentImageIndex === -1) return;
    const newIndex = direction === "prev"
      ? (currentImageIndex - 1 + filteredItems.length) % filteredItems.length
      : (currentImageIndex + 1) % filteredItems.length;
    setSelectedImage(filteredItems[newIndex].id);
  };

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={buildingImg2} alt="Aashley International School Bangarpet campus" className="w-full h-full object-cover" />
          {/* Proper cinematic navy overlay to ensure text legibility */}
          <div className="absolute inset-0 hero-gradient-cinema" />
          <div className="absolute inset-0 noise-overlay" />
          <div className="absolute inset-0 dot-pattern opacity-30" />
        </div>
        
        {/* Premium Gold Accent Bar */}
        <div className="absolute top-0 left-0 right-0 gold-accent-bar" />
        
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl reveal">
            <span className="badge-gold mb-6 inline-block">
              Photo Stories
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-6 font-serif font-black leading-tight tracking-tight">
              Moments of
              <br />
              <span className="font-serif italic text-gradient-gold">Learning & Joy</span>
            </h1>
            <p className="text-xl text-white/80 leading-relaxed max-w-xl font-sans mt-4 font-light">
              Capturing the essence of life at Aashley — where every day brings new experiences and lasting memories.
            </p>
          </div>
        </div>
        
        {/* Decorative graphic bottom right */}
        <div className="absolute bottom-0 right-0 opacity-10 pointer-events-none transform translate-x-1/4 translate-y-1/4">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50" cy="50" r="40" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="30" stroke="url(#goldGrad)" strokeWidth="0.5" />
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                <stop stopColor="#D4AF37" />
                <stop offset="1" stopColor="#FFDF73" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </section>

      {/* ── CATEGORY FILTER ── */}
      <section className="py-6 border-b sticky top-[64px] md:top-[88px] bg-background/95 backdrop-blur-md z-40 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2.5 rounded-none text-sm font-semibold transition-all duration-250 border font-sans ${
                  selectedCategory === category
                    ? "bg-accent text-white border-accent shadow-sm"
                    : "bg-white text-foreground/70 border-border hover:border-accent hover:text-primary"
                }`}
                data-testid={`filter-${category.toLowerCase().replace(/\s+/g, '-')}`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── GALLERY GRID ── */}
      <section className="py-10">
        <div className="container-fluid mx-auto px-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-0">
            {filteredItems.map((item, index) => (
              <Reveal key={item.id} delay={index * 30}>
                <div
                  className={`group relative cursor-pointer overflow-hidden transition-all duration-300 ${
                    item.size === "large" ? "col-span-2 row-span-2" :
                    item.size === "medium" ? "col-span-1 row-span-2 md:col-span-1" : ""
                  }`}
                  onClick={() => setSelectedImage(item.id)}
                  data-testid={`gallery-item-${item.id}`}
                >
                  <div className={`relative ${
                    item.size === "large" ? "aspect-square" :
                    item.size === "medium" ? "aspect-[3/4]" : "aspect-square"
                  }`}>
                    <img src={item.image} alt={`${item.title} - Aashley International School`} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-primary/80 opacity-0 group-hover:opacity-100 transition-opacity duration-400" />
                    {/* Top accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    {/* Caption on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-400 text-left">
                      <h4 className="font-bold text-white text-xl mb-2 font-serif">{item.title}</h4>
                      <span className="text-accent text-[10px] uppercase font-bold tracking-widest">{item.category}</span>
                    </div>
                    {/* Category chip (always visible) */}
                    <div className="absolute top-4 right-4 opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                      <span className="text-[10px] bg-white border border-border text-primary px-3 py-1 font-bold uppercase tracking-widest">{item.category}</span>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Camera className="h-10 w-10 text-accent" />
              </div>
              <p className="text-muted-foreground text-lg">No images found in this category.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      <Dialog open={selectedImage !== null} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-black/95 border border-white/10 rounded-none overflow-hidden">
          <div className="relative">
            {/* Top bar */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-accent z-20" />
            <Button variant="ghost" size="icon" className="absolute top-4 right-4 z-10 text-white hover:bg-white/10 rounded-none" onClick={() => setSelectedImage(null)} data-testid="button-close-lightbox">
              <X className="h-6 w-6" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-none" onClick={() => navigateImage("prev")} data-testid="button-prev-image">
              <ChevronLeft className="h-8 w-8" />
            </Button>
            <Button variant="ghost" size="icon" className="absolute right-14 top-1/2 -translate-y-1/2 z-10 text-white hover:bg-white/10 rounded-none" onClick={() => navigateImage("next")} data-testid="button-next-image">
              <ChevronRight className="h-8 w-8" />
            </Button>
            {selectedImage && (() => {
              const item = filteredItems.find(i => i.id === selectedImage);
              return item ? (
                <div className="flex flex-col items-center">
                  <img src={item.image} alt={item.title} className="max-h-[80vh] w-full object-contain" />
                  <div className="p-6 text-center border-t border-white/10 w-full bg-black/50">
                    <h3 className="text-2xl font-bold text-white mb-2 font-serif">{item.title}</h3>
                    <span className="text-accent text-xs font-bold uppercase tracking-widest">{item.category}</span>
                  </div>
                </div>
              ) : null;
            })()}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── INSTAGRAM STRIP ── */}
      <section className="py-24 bg-[#F4F7F9]">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-accent font-bold uppercase tracking-widest text-sm mb-4 block">Social</span>
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-black mb-6 leading-tight tracking-tight text-primary">
                Follow Us on <span className="text-accent underline decoration-4 underline-offset-8">Instagram</span>
              </h2>
              <p className="text-muted-foreground text-xl font-sans mt-4">Stay updated with daily moments from #AashleyLife</p>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-0">
            {[assemblyImg2, sportsImg2, classroomImg1, prayerImg, labImg1, exerciseImg].map((img, index) => (
              <Reveal key={index} delay={index * 40}>
                <div className="aspect-square overflow-hidden transition-all duration-300 cursor-pointer group" data-testid={`instagram-item-${index}`}>
                  <img src={img} alt={`Aashley International School campus life - ${index + 1}`} className="w-full h-full object-cover object-center transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={200}>
            <div className="text-center mt-10">
              <a
                href="https://www.instagram.com/aashley__2009/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-white font-bold uppercase tracking-widest text-sm hover:-translate-y-1 transition-transform duration-300 border-b-4 border-accent shadow-md"
                data-testid="button-follow-instagram"
              >
                <Instagram className="h-5 w-5 text-accent" />
                Follow @aashley__2009
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </PublicLayout>
  );
}
