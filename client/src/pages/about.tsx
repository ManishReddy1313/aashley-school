import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  Eye, 
  Heart, 
  Star, 
  Award,
  Users,
  BookOpen,
  GraduationCap,
  Lightbulb,
  Shield
} from "lucide-react";

const coreValues = [
  { icon: Heart, title: "Integrity", description: "We uphold honesty and strong moral principles in everything we do." },
  { icon: Star, title: "Excellence", description: "We strive for the highest standards in academics and character." },
  { icon: Users, title: "Respect", description: "We value every individual and foster a culture of mutual respect." },
  { icon: Lightbulb, title: "Innovation", description: "We embrace creativity and new ideas to stay ahead." },
  { icon: Shield, title: "Responsibility", description: "We nurture responsible citizens who contribute to society." },
  { icon: GraduationCap, title: "Lifelong Learning", description: "We inspire curiosity and a passion for continuous growth." },
];

const milestones = [
  { year: "1999", title: "Foundation", description: "Aashley International School was established with a vision to provide quality education." },
  { year: "2005", title: "CBSE Affiliation", description: "Received full affiliation from CBSE, marking a significant milestone." },
  { year: "2010", title: "Campus Expansion", description: "Inaugurated our state-of-the-art campus with modern facilities." },
  { year: "2015", title: "Excellence Award", description: "Recognized as one of the top schools in the region for academic excellence." },
  { year: "2020", title: "Digital Transformation", description: "Successfully transitioned to hybrid learning during global challenges." },
  { year: "2024", title: "Silver Jubilee", description: "Celebrating 25 years of nurturing young minds and building futures." },
];

const leadership = [
  {
    name: "Dr. Rajesh Kumar",
    role: "Principal",
    message: "At Aashley, we believe that education is not just about acquiring knowledge, but about developing the whole person. Our mission is to create an environment where every student can discover their unique potential and develop the skills, values, and confidence to succeed in life.",
  },
  {
    name: "Mrs. Priya Sharma",
    role: "Vice Principal",
    message: "We are committed to providing a nurturing environment that encourages curiosity, creativity, and critical thinking. Our dedicated team of educators works tirelessly to ensure that each child receives personalized attention.",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-about-hero">
              About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shaping Futures Since <span className="text-accent">1999</span>
            </h1>
            <p className="text-lg opacity-90">
              For over two decades, Aashley International School has been a beacon of excellence 
              in education, nurturing young minds to become confident, compassionate, and 
              capable individuals.
            </p>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="border-l-4 border-l-primary" data-testid="card-vision">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Eye className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-2xl font-bold">Our Vision</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To be a globally recognized institution that empowers students to become 
                  innovative thinkers, ethical leaders, and responsible global citizens who 
                  contribute positively to society while staying rooted in their cultural values.
                </p>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-accent" data-testid="card-mission">
              <CardContent className="p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Target className="h-6 w-6 text-accent" />
                  </div>
                  <h2 className="text-2xl font-bold">Our Mission</h2>
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  To provide a holistic education that nurtures intellectual curiosity, 
                  develops critical thinking skills, and builds strong character through 
                  innovative teaching methods, a supportive environment, and a commitment 
                  to excellence in all endeavors.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Core Values</h2>
            <p className="text-muted-foreground">
              The principles that guide everything we do at Aashley
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {coreValues.map((value, index) => (
              <Card key={index} className="text-center hover-elevate" data-testid={`card-value-${index}`}>
                <CardContent className="p-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <value.icon className="h-7 w-7 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground">{value.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Principal's Message */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Leadership Message</h2>
            <p className="text-muted-foreground">
              Words from our school leadership
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {leadership.map((leader, index) => (
              <Card key={index} data-testid={`card-leader-${index}`}>
                <CardContent className="p-8">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-8 w-8 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{leader.name}</h3>
                      <p className="text-muted-foreground">{leader.role}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground leading-relaxed italic">
                    "{leader.message}"
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Our Journey / Milestones */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Journey</h2>
            <p className="opacity-90">
              Milestones that mark our path of excellence
            </p>
          </div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full w-0.5 bg-primary-foreground/20 hidden md:block" />
            
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div 
                  key={index}
                  className={`flex flex-col md:flex-row gap-4 md:gap-8 ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  }`}
                  data-testid={`milestone-${index}`}
                >
                  <div className={`flex-1 ${index % 2 === 0 ? "md:text-right" : "md:text-left"}`}>
                    <div className="bg-primary-foreground/10 rounded-lg p-6 inline-block">
                      <div className="text-accent font-bold text-2xl mb-1">{milestone.year}</div>
                      <h4 className="font-semibold text-lg mb-2">{milestone.title}</h4>
                      <p className="text-sm opacity-80">{milestone.description}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-accent" />
                  </div>
                  <div className="flex-1" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Accreditations */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Accreditations & Affiliations</h2>
            <p className="text-muted-foreground">
              Recognized for our commitment to quality education
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["CBSE Affiliated", "ISO 9001:2015", "NABET Accredited", "Green School Certified"].map((item, index) => (
              <Card key={index} className="text-center" data-testid={`accreditation-${index}`}>
                <CardContent className="p-6">
                  <Award className="h-10 w-10 text-accent mx-auto mb-3" />
                  <p className="font-medium">{item}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
