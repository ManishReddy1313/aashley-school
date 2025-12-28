import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-news">
              Stay Connected
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              News & <span className="text-accent">Events</span>
            </h1>
            <p className="text-lg opacity-90">
              Stay updated with the latest happenings, achievements, and upcoming 
              events at Aashley International School.
            </p>
          </div>
        </div>
      </section>

      {/* Announcements Ticker */}
      <section className="py-4 bg-accent">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 overflow-hidden">
            <Badge variant="secondary" className="flex-shrink-0">
              <Bell className="h-3 w-3 mr-1" />
              Announcements
            </Badge>
            <div className="flex gap-8 animate-scroll">
              {announcements.map((item) => (
                <span key={item.id} className="whitespace-nowrap text-accent-foreground">
                  {item.title}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="news" className="w-full">
            <TabsList className="flex justify-center gap-2 h-auto bg-transparent mb-12">
              <TabsTrigger 
                value="news"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                data-testid="tab-news"
              >
                <Newspaper className="h-4 w-4 mr-2" />
                Latest News
              </TabsTrigger>
              <TabsTrigger 
                value="events"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
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
                  <Card key={item.id} className="lg:col-span-2 lg:row-span-2" data-testid={`news-featured-${item.id}`}>
                    <CardContent className="p-0">
                      <div className="aspect-video bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Trophy className="h-16 w-16 text-primary/30" />
                      </div>
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Badge variant="secondary">{item.category}</Badge>
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-3">{item.title}</h3>
                        <p className="text-muted-foreground mb-4">{item.excerpt}</p>
                        <Button variant="outline" size="sm" data-testid="button-read-more-featured">
                          Read More
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {/* Other News */}
                {newsItems.filter(n => !n.featured).map((item) => (
                  <Card key={item.id} className="hover-elevate" data-testid={`news-item-${item.id}`}>
                    <CardContent className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" size="sm">{item.category}</Badge>
                        <span className="text-xs text-muted-foreground">{item.date}</span>
                      </div>
                      <h4 className="font-semibold mb-2 line-clamp-2">{item.title}</h4>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="events">
              <div className="max-w-3xl mx-auto space-y-4">
                {upcomingEvents.map((event) => (
                  <Card key={event.id} className="hover-elevate" data-testid={`event-item-${event.id}`}>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row gap-6">
                        {/* Date box */}
                        <div className="flex-shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-primary text-primary-foreground flex flex-col items-center justify-center">
                            <div className="text-2xl font-bold">{event.date.split(" ")[1].replace(",", "")}</div>
                            <div className="text-xs uppercase">{event.date.split(" ")[0]}</div>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                          <p className="text-muted-foreground mb-3">{event.description}</p>
                          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              {event.time}
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4" />
                              {event.location}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Subscribe Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <PartyPopper className="h-12 w-12 text-accent mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Never Miss an Update</h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Follow us on social media or check the portal regularly for the latest news and announcements.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button data-testid="button-follow-us">Follow Us on Instagram</Button>
            <Button variant="outline" data-testid="button-portal-updates">Login to Portal</Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
