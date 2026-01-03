import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PublicLayout } from "@/components/public-layout";
import heroImage from "@assets/IMG_7873_1767427250737.JPG";
import heroStudents from "@assets/IMG_7852_1767427250728.JPG";
import prayerImage from "@assets/IMG_8154_1767427250738.JPG";
import assemblyImage from "@assets/IMG_7974_1767427250737.JPG";
import craftImage from "@assets/MVI_8914.00_03_26_02.Still024_1767427250738.png";
import studentPortrait from "@assets/IMG_7891_1767427250737.JPG";
import { 
  GraduationCap, 
  Users, 
  BookOpen, 
  Trophy, 
  Heart, 
  Star,
  ArrowRight,
  Quote,
  Calendar,
  Clock
} from "lucide-react";

const stats = [
  { icon: GraduationCap, value: "25+", label: "Years of Excellence" },
  { icon: Users, value: "2000+", label: "Happy Students" },
  { icon: BookOpen, value: "100+", label: "Expert Teachers" },
  { icon: Trophy, value: "500+", label: "Awards Won" },
];

const features = [
  {
    icon: Heart,
    title: "Values-Based Education",
    description: "We nurture character alongside academics, building responsible citizens with strong moral foundations.",
  },
  {
    icon: Star,
    title: "Holistic Development",
    description: "Our curriculum balances academics, sports, arts, and life skills for complete personality development.",
  },
  {
    icon: BookOpen,
    title: "Modern Curriculum",
    description: "Innovative teaching methods combined with cutting-edge technology prepare students for the future.",
  },
];

const photoStories = [
  { title: "Morning Assembly", category: "Daily Life", size: "large", image: assemblyImage },
  { title: "Morning Prayer", category: "Values", size: "medium", image: prayerImage },
  { title: "Creative Arts", category: "Activities", size: "medium", image: craftImage },
  { title: "School Assembly", category: "Daily Life", size: "small", image: heroStudents },
  { title: "Student Life", category: "Campus", size: "small", image: studentPortrait },
  { title: "Our Campus", category: "Campus", size: "small", image: heroImage },
];

const growthStories = [
  {
    name: "Priya Sharma",
    role: "Parent",
    quote: "My son has transformed completely at Aashley. From a shy child to a confident public speaker, the teachers here truly understand each child's potential.",
  },
  {
    name: "Rahul Kumar",
    role: "Alumni (Batch 2018)",
    quote: "The values I learned at Aashley shaped who I am today. Now at IIT Delhi, I still apply the discipline and curiosity this school instilled in me.",
  },
  {
    name: "Mrs. Anita Reddy",
    role: "Parent",
    quote: "As a vendor's daughter, my child gets the same opportunities as everyone else. Aashley truly believes in inclusive education.",
  },
];

const upcomingEvents = [
  { title: "Annual Day 2024", date: "Jan 15", time: "5:00 PM" },
  { title: "Parent-Teacher Meeting", date: "Jan 20", time: "10:00 AM" },
  { title: "Science Exhibition", date: "Feb 5", time: "9:00 AM" },
];

export default function HomePage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="Students learning at Aashley International School" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-hero">
              Excellence in Education Since 1999
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Nurturing Young Minds,{" "}
              <span className="text-accent">Building Tomorrow's Leaders</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              At Aashley International School, we believe every child has unique potential. 
              Our holistic approach combines academic excellence with character development.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/admissions">
                <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-hero-admissions">
                  Apply for Admission
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/about">
                <Button size="lg" variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm" data-testid="button-hero-learn-more">
                  Learn More
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <stat.icon className="h-10 w-10 mx-auto mb-3 text-accent" />
                <div className="text-3xl md:text-4xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm opacity-80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Why Choose <span className="text-primary">Aashley?</span>
            </h2>
            <p className="text-muted-foreground">
              We provide a nurturing environment where children discover their passions and develop skills for life.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Stories Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Photo Stories</h2>
              <p className="text-muted-foreground">Capturing moments of learning, growth, and joy</p>
            </div>
            <Link href="/gallery">
              <Button variant="outline" data-testid="button-view-gallery">
                View Full Gallery
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {photoStories.map((story, index) => (
              <div 
                key={index}
                className={`relative group overflow-hidden rounded-lg ${
                  story.size === "large" ? "col-span-2 row-span-2" : 
                  story.size === "medium" ? "col-span-1 row-span-2" : ""
                }`}
                data-testid={`photo-story-${index}`}
              >
                <div className={`relative ${
                  story.size === "large" ? "aspect-square" : 
                  story.size === "medium" ? "aspect-[3/4]" : "aspect-square"
                }`}>
                  <img 
                    src={story.image} 
                    alt={story.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="font-semibold text-white">{story.title}</h4>
                    <Badge variant="secondary" size="sm" className="mt-2">{story.category}</Badge>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Growth Stories / Testimonials */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Real <span className="text-primary">Journeys</span>
            </h2>
            <p className="text-muted-foreground">
              Stories of transformation from our students and parents
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {growthStories.map((story, index) => (
              <Card key={index} className="relative" data-testid={`testimonial-${index}`}>
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-accent mb-4" />
                  <p className="text-muted-foreground mb-6 italic">
                    "{story.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="font-semibold">{story.name}</div>
                      <div className="text-sm text-muted-foreground">{story.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* A Day at Aashley Teaser */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Experience <span className="text-accent">A Day at Aashley</span>
              </h2>
              <p className="opacity-90 mb-6">
                From the morning bell to the afternoon dispersal, every moment at Aashley is designed 
                to inspire curiosity, foster friendships, and build character.
              </p>
              <Link href="/day-at-aashley">
                <Button className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-day-at-aashley">
                  See the Full Day
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <Clock className="h-6 w-6 text-accent mb-2" />
                <div className="text-sm opacity-80">8:00 AM</div>
                <div className="font-medium">Morning Assembly</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <BookOpen className="h-6 w-6 text-accent mb-2" />
                <div className="text-sm opacity-80">9:00 AM</div>
                <div className="font-medium">Academic Classes</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <Users className="h-6 w-6 text-accent mb-2" />
                <div className="text-sm opacity-80">1:00 PM</div>
                <div className="font-medium">Lunch & Recreation</div>
              </div>
              <div className="bg-primary-foreground/10 rounded-lg p-4">
                <Star className="h-6 w-6 text-accent mb-2" />
                <div className="text-sm opacity-80">3:00 PM</div>
                <div className="font-medium">Co-curricular Activities</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">Upcoming Events</h2>
              <p className="text-muted-foreground">Stay updated with school activities</p>
            </div>
            <Link href="/news">
              <Button variant="outline" data-testid="button-view-events">
                View All Events
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {upcomingEvents.map((event, index) => (
              <Card key={index} className="hover-elevate" data-testid={`event-card-${index}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-accent/10 flex flex-col items-center justify-center flex-shrink-0">
                      <Calendar className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-semibold mb-1">{event.title}</h4>
                      <div className="text-sm text-muted-foreground flex items-center gap-2">
                        <span>{event.date}</span>
                        <span>•</span>
                        <span>{event.time}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Join the <span className="text-primary">Aashley Family?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Give your child the gift of quality education. Start your journey with us today.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admissions">
              <Button size="lg" data-testid="button-cta-apply">
                Apply Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" data-testid="button-cta-contact">
                Schedule a Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
