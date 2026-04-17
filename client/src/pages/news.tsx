import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { 
  Calendar, 
  Clock, 
  MapPin, 
  ArrowRight,
  Newspaper,
  Trophy,
  PartyPopper,
  Bell
} from "lucide-react";
import heroImage from "@assets/hero_5.jpg";

const newsItems = [
  {
    id: 1,
    title: "Aashley Students Win State-Level Science Olympiad",
    date: "Dec 20, 2024",
    category: "Achievement",
    excerpt: "Our students secured first position in the state-level science olympiad, demonstrating exceptional problem-solving skills.",
    featured: true,
  },
  {
    id: 2,
    title: "New STEM Lab Inaugurated",
    date: "Dec 15, 2024",
    category: "Campus",
    excerpt: "State-of-the-art STEM laboratory inaugurated to enhance practical learning experiences.",
    featured: false,
  },
  {
    id: 3,
    title: "Annual Sports Day Celebrations",
    date: "Dec 10, 2024",
    category: "Event",
    excerpt: "A grand celebration of sportsmanship with inter-house competitions and awards ceremony.",
    featured: false,
  },
  {
    id: 4,
    title: "Teachers' Workshop on Modern Pedagogy",
    date: "Dec 5, 2024",
    category: "Development",
    excerpt: "Faculty members participated in a two-day workshop on innovative teaching methodologies.",
    featured: false,
  },
  {
    id: 5,
    title: "Community Service Initiative",
    date: "Nov 28, 2024",
    category: "Social",
    excerpt: "Students organized a donation drive for underprivileged children in the community.",
    featured: false,
  },
];

const upcomingEvents = [
  {
    id: 1,
    title: "Annual Day 2024",
    date: "Jan 15, 2025",
    time: "5:00 PM",
    location: "School Auditorium",
    description: "A grand celebration showcasing student talents through cultural performances.",
  },
  {
    id: 2,
    title: "Parent-Teacher Meeting",
    date: "Jan 20, 2025",
    time: "10:00 AM - 2:00 PM",
    location: "Respective Classrooms",
    description: "An opportunity for parents to discuss their child's progress with teachers.",
  },
  {
    id: 3,
    title: "Science Exhibition",
    date: "Feb 5, 2025",
    time: "9:00 AM - 4:00 PM",
    location: "School Ground",
    description: "Students present innovative science projects and experiments.",
  },
  {
    id: 4,
    title: "Republic Day Celebration",
    date: "Jan 26, 2025",
    time: "8:00 AM",
    location: "School Ground",
    description: "Patriotic celebrations with flag hoisting and cultural programs.",
  },
  {
    id: 5,
    title: "Inter-School Debate Competition",
    date: "Feb 12, 2025",
    time: "10:00 AM",
    location: "Conference Hall",
    description: "Students compete with peers from other schools in a battle of ideas.",
  },
];

const announcements = [
  { id: 1, title: "Winter Vacation: Dec 25 - Jan 5", priority: "normal" },
  { id: 2, title: "Admission Open for 2025-26 Academic Year", priority: "high" },
  { id: 3, title: "Term 2 Examination Schedule Released", priority: "high" },
  { id: 4, title: "School Bus Route Changes from January", priority: "normal" },
];

export default function NewsPage() {
  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Aashley International School Events" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/80 to-primary/50" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="badge-gold mb-5 inline-block" data-testid="badge-news">Stay Connected</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-5 leading-tight">
              News &amp;<br /><span className="text-gradient-gold">Events</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-5" />
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              Stay updated with the latest happenings, achievements, and upcoming events at Aashley International School.
            </p>
          </div>
        </div>
      </section>


      {/* ── ANNOUNCEMENTS TICKER ── */}
      <section className="py-4 bg-gradient-to-r from-gold-dark via-gold to-gold-dark text-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="flex items-center gap-1.5 bg-white/20 rounded-full px-3 py-1 flex-shrink-0">
              <Bell className="h-3 w-3" />
              <span className="text-xs font-bold tracking-wider uppercase">Announcements</span>
            </div>
            <div className="flex gap-8 overflow-hidden">
              {announcements.map((item) => (
                <span key={item.id} className="whitespace-nowrap text-white/95 text-sm font-medium">
                  • {item.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TABS SECTION ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="flex justify-center gap-3 h-auto bg-transparent mb-14">
              <TabsTrigger
                value="news"
                className="data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-gold px-6 py-2.5 rounded-full border border-border/50 font-semibold transition-all duration-250"
                data-testid="tab-news"
              >
                <Newspaper className="h-4 w-4 mr-2" />
                Latest News
              </TabsTrigger>
              <TabsTrigger
                value="events"
                className="data-[state=active]:bg-gold data-[state=active]:text-white data-[state=active]:shadow-gold px-6 py-2.5 rounded-full border border-border/50 font-semibold transition-all duration-250"
                data-testid="tab-events"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming Events
              </TabsTrigger>
            </TabsList>

            <TabsContent value="news">
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Featured News */}
                {newsItems.filter(n => n.featured).map((item) => (
                  <div key={item.id} className="card-premium lg:col-span-2 lg:row-span-2" data-testid={`news-featured-${item.id}`}>
                    <div className="aspect-video bg-gradient-to-br from-primary/15 via-primary/8 to-gold/5 flex items-center justify-center">
                      <div className="w-24 h-24 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                        <Trophy className="h-12 w-12 text-gold" />
                      </div>
                    </div>
                    <div className="p-8">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="badge-gold text-[10px]">{item.category}</span>
                        <span className="text-sm text-muted-foreground">{item.date}</span>
                      </div>
                      <h3 className="text-2xl font-bold font-serif mb-3 leading-tight">{item.title}</h3>
                      <p className="text-muted-foreground mb-6 leading-relaxed">{item.excerpt}</p>
                      <Button variant="outline" size="sm" className="border-border/60 hover:border-gold/40 hover:text-gold transition-all duration-200" data-testid="button-read-more-featured">
                        Read More <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                {/* Other News */}
                {newsItems.filter(n => !n.featured).map((item) => (
                  <div key={item.id} className="card-premium" data-testid={`news-item-${item.id}`}>
                    <div className="p-7">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="badge-gold text-[10px]">{item.category}</span>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <h4 className="font-bold text-base mb-2 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{item.excerpt}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="max-w-3xl mx-auto space-y-5">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="card-premium" data-testid={`event-item-${event.id}`}>
                    <div className="p-7 flex flex-col md:flex-row gap-6">
                      {/* Date box */}
                      <div className="flex-shrink-0">
                        <div className="w-20 h-20 rounded-2xl section-navy-premium text-primary-foreground flex flex-col items-center justify-center shadow-md">
                          <div className="text-2xl font-bold font-serif text-gold">{event.date.split(" ")[1].replace(",", "")}</div>
                          <div className="text-xs uppercase tracking-wider text-primary-foreground/70">{event.date.split(" ")[0]}</div>
                        </div>
                      </div>
                      {/* Content */}
                      <div className="flex-1">
                        <h3 className="text-xl font-bold font-serif mb-2 leading-tight">{event.title}</h3>
                        <p className="text-muted-foreground mb-4 leading-relaxed">{event.description}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-gold" />
                            {event.time}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-gold" />
                            {event.location}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 relative overflow-hidden section-navy-premium noise-overlay">
        <div className="absolute top-20 left-20 w-72 h-72 bg-gold/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-20 right-20 w-72 h-72 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="container mx-auto px-4 text-center relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center mx-auto mb-6">
            <PartyPopper className="h-8 w-8 text-gold" />
          </div>
          <span className="badge-gold mb-5 inline-block">Stay Updated</span>
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-primary-foreground mb-5 leading-tight">
            Never Miss an <span className="text-gradient-gold">Update</span>
          </h2>
          <p className="text-primary-foreground/65 max-w-xl mx-auto mb-10 text-lg">
            Follow us on social media or check the portal regularly for the latest news and announcements.
          </p>
          <div className="flex flex-wrap justify-center gap-5">
            <a href="https://www.instagram.com/aashley__2009/" target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center gap-2 px-8 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
               style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%)' }}
               data-testid="button-follow-us">
              Follow @aashley__2009
            </a>
            <Button variant="outline" className="border-primary-foreground/25 text-primary-foreground hover:bg-primary-foreground/10 px-8 rounded-xl" data-testid="button-portal-updates">Login to Portal</Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
