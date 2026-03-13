import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import buildingImage from "@assets/home_entrance.jpg";
import teachersImage from "@assets/teachers_group.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import assemblyImage from "@assets/hero_2.jpg";
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
  { year: "2008", title: "Foundation", description: "Aashley International School was established in Bangarpet, Kolar with a vision to provide quality English medium education." },
  { year: "2010", title: "ICSE Affiliation", description: "Received affiliation from CISCE (Council for Indian School Certificate Examinations) for the ICSE curriculum." },
  { year: "2013", title: "Campus Development", description: "Expanded facilities with 50+ classrooms, well-equipped science labs, a computer lab, and a dedicated playground." },
  { year: "2016", title: "Growing Community", description: "Crossed 300+ student enrollment with increasing recognition in Kolar district for quality education." },
  { year: "2020", title: "Resilient Learning", description: "Successfully adapted to hybrid learning methods while maintaining academic standards during global challenges." },
  { year: "2025", title: "Leading in Excellence", description: "Rated 4.6/5 by 388+ parents, serving 2000+ students with a commitment to holistic development." },
];

const leadership = [
  {
    name: "Mrs. Veenarani B C",
    role: "Principal",
    message: "At Aashley International School, we don't just educate — we nurture. Every child who walks through our doors is treated as a unique individual with limitless potential. ICSE curriculum, combined with value-based education, ensures that students don't just excel in examinations but grow as confident, compassionate human beings ready to face the world.",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      {/* Hero Section with Image */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img src={assemblyImage} alt="Aashley International School Assembly" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-about-hero">
              About Us
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Shaping Futures Since <span className="text-accent">2008</span>
            </h1>
            <p className="text-lg opacity-90">
              Located in Bangarpet, Kolar District, Karnataka, Aashley International School 
              is a CBSE-affiliated co-educational institution nurturing young minds to become 
              confident, compassionate, and capable individuals since 2008.
            </p>
          </div>
        </div>
      </section>

      {/* Campus Image Strip */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="aspect-video rounded-lg overflow-hidden">
              <img src={buildingImage} alt="Aashley International School Building" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img src={classroomImage} alt="Students in classroom" className="w-full h-full object-cover" />
            </div>
            <div className="aspect-video rounded-lg overflow-hidden">
              <img src={teachersImage} alt="Teaching faculty of Aashley International School" className="w-full h-full object-cover" />
            </div>
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

      {/* Principal's Message with Teachers Image */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Leadership Message</h2>
            <p className="text-muted-foreground">
              Words from our school leader
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            {leadership.map((leader, index) => (
              <Card key={index} className="overflow-hidden" data-testid={`card-leader-${index}`}>
                <div className="grid md:grid-cols-5 gap-0">
                  <div className="md:col-span-2">
                    <img 
                      src={teachersImage} 
                      alt="Faculty of Aashley International School" 
                      className="w-full h-full object-cover min-h-[250px]"
                    />
                  </div>
                  <div className="md:col-span-3">
                    <CardContent className="p-8">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                          <GraduationCap className="h-8 w-8 text-primary" />
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
                  </div>
                </div>
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
            In recognition of our commitment to quality education
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {["ICSE Affiliated (CISCE)", "English Medium", "Co-Educational", "Pre-Primary to Class 10"].map((item, index) => (
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
