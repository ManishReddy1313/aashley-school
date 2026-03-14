import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import assemblyImage from "@assets/hero_assembly.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import labImage from "@assets/lab_1.jpg";
import sportsImage from "@assets/sports_1.jpg";
import exerciseImage from "@assets/home_6.jpg";
import buildingImage from "@assets/home_entrance2.jpg";
import { 
  Sun, 
  Coffee, 
  BookOpen, 
  Beaker, 
  Utensils, 
  Palette,
  Dumbbell,
  Music,
  Home,
  Clock,
  Users,
  Star
} from "lucide-react";

const dailySchedule = [
  {
    time: "7:45 AM",
    title: "Arrival & Preparation",
    description: "Students arrive at school and prepare for the day ahead.",
    icon: Sun,
    color: "bg-amber-500/10 text-amber-600",
    image: buildingImage,
  },
  {
    time: "8:45 AM",
    title: "Morning Assembly",
    description: "We gather together for prayer, national anthem, and important announcements that set the tone for the day.",
    icon: Users,
    color: "bg-blue-500/10 text-blue-600",
    image: assemblyImage,
  },
  {
    time: "9:10 AM",
    title: "First Academic Session",
    description: "Core subjects like Mathematics, Science, and Languages are taught during the most productive hours.",
    icon: BookOpen,
    color: "bg-green-500/10 text-green-600",
    image: classroomImage,
  },
  {
    time: "10:30 AM",
    title: "Short Break",
    description: "Time for a healthy snack and a short pause between sessions.",
    icon: Coffee,
    color: "bg-orange-500/10 text-orange-600",
  },
  {
    time: "10:45 AM",
    title: "Second Academic Session",
    description: "Continuation of academic learning with hands-on activities and group discussions.",
    icon: Beaker,
    color: "bg-purple-500/10 text-purple-600",
    image: labImage,
  },
  {
    time: "12:45 PM",
    title: "Lunch Break",
    description: "Nutritious lunch followed by recreational time with friends.",
    icon: Utensils,
    color: "bg-red-500/10 text-red-600",
  },
  {
    time: "1:30 PM",
    title: "Afternoon Session",
    description: "Art, craft, music, and other creative subjects that nurture imagination.",
    icon: Palette,
    color: "bg-pink-500/10 text-pink-600",
  },
  {
    time: "2:30 PM",
    title: "Co-curricular Activities",
    description: "Sports, clubs, and extracurricular activities for holistic development.",
    icon: Dumbbell,
    color: "bg-teal-500/10 text-teal-600",
    image: sportsImage,
  },
  {
    time: "3:30 PM",
    title: "Dispersal",
    description: "Students head home with new knowledge and wonderful memories.",
    icon: Home,
    color: "bg-indigo-500/10 text-indigo-600",
  },
];

const specialDays = [
  { day: "Monday", activity: "Library Hour", icon: BookOpen },
  { day: "Tuesday", activity: "Music & Dance", icon: Music },
  { day: "Wednesday", activity: "Sports Practice", icon: Dumbbell },
  { day: "Thursday", activity: "Art & Craft", icon: Palette },
  { day: "Friday", activity: "Club Activities", icon: Star },
];

export default function DayAtAashleyPage() {
  return (
    <PublicLayout>
      {/* Hero Section with Image */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img src={exerciseImage} alt="Students during morning activities at Aashley" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-day">
              Experience Aashley
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              A Day at <span className="text-accent">Aashley</span>
            </h1>
            <p className="text-lg opacity-90">
              From the morning bell to the afternoon dispersal, every moment is designed 
              to inspire learning and creativity.
            </p>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Daily Schedule</h2>
            <p className="text-muted-foreground">
              A typical day at Aashley International School
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="relative">
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border transform md:-translate-x-1/2" />

              {dailySchedule.map((item, index) => (
                <div 
                  key={index}
                  className={`relative flex flex-col md:flex-row gap-4 md:gap-8 mb-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  data-testid={`timeline-item-${index}`}
                >
                  <div className={`flex-1 ml-20 md:ml-0 ${index % 2 === 0 ? "md:text-right md:pr-8" : "md:text-left md:pl-8"}`}>
                    <Card className="inline-block hover-elevate overflow-hidden">
                      {'image' in item && item.image && (
                        <div className="aspect-video">
                          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <CardContent className="p-6">
                        <div className={`flex items-center gap-3 mb-3 ${index % 2 === 0 ? "md:flex-row-reverse" : ""}`}>
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${item.color}`}>
                            <item.icon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="font-semibold">{item.title}</div>
                            <div className="text-sm text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {item.time}
                            </div>
                          </div>
                        </div>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="absolute left-8 md:left-1/2 top-6 transform -translate-x-1/2 flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-primary border-4 border-background" />
                  </div>

                  <div className="flex-1 hidden md:block" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Special Days */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Special Activity Days</h2>
            <p className="text-muted-foreground">
              Each day brings unique opportunities for exploration
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {specialDays.map((item, index) => (
              <Card key={index} className="text-center hover-elevate" data-testid={`special-day-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
                    <item.icon className="h-6 w-6 text-accent" />
                  </div>
                  <div className="font-semibold mb-1">{item.day}</div>
                  <div className="text-sm text-muted-foreground">{item.activity}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Highlights with image */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={assemblyImage} alt="Students at Aashley" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/90" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { 
                title: "Balanced Learning", 
                description: "Perfect mix of academics, sports, and arts for all-round development.",
                icon: BookOpen 
              },
              { 
                title: "Lunch Break", 
                description: "A break for lunch and rest before afternoon sessions.",
                icon: Utensils 
              },
              { 
                title: "Safe Environment", 
                description: "Secure campus with trained staff ensuring student safety at all times.",
                icon: Users 
              },
            ].map((item, index) => (
              <div key={index} className="text-center text-primary-foreground" data-testid={`highlight-${index}`}>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-8 w-8 text-accent" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="opacity-80">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
