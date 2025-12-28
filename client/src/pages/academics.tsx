import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Calculator, 
  Beaker, 
  Globe, 
  Languages, 
  Palette,
  Music,
  Dumbbell,
  Code,
  Theater,
  Users,
  Trophy
} from "lucide-react";

const curriculumLevels = [
  {
    level: "Pre-Primary (Nursery - KG)",
    description: "Foundation years focused on play-based learning, social skills, and early literacy.",
    subjects: ["English", "Hindi", "Mathematics Concepts", "Environmental Awareness", "Art & Craft", "Music & Movement"],
    highlights: ["Montessori Methods", "Activity-Based Learning", "Safe & Nurturing Environment"],
  },
  {
    level: "Primary (Classes 1-5)",
    description: "Building strong fundamentals through engaging curriculum and hands-on experiences.",
    subjects: ["English", "Hindi", "Mathematics", "EVS/Science", "Social Studies", "Computer Science", "Art & Music"],
    highlights: ["CBSE Curriculum", "Smart Classrooms", "Regular Assessments"],
  },
  {
    level: "Middle School (Classes 6-8)",
    description: "Expanding horizons with advanced concepts and specialized subjects.",
    subjects: ["English", "Hindi", "Sanskrit", "Mathematics", "Science", "Social Science", "Computer Science"],
    highlights: ["Subject Specialization", "Lab Experiments", "Project-Based Learning"],
  },
  {
    level: "Secondary (Classes 9-10)",
    description: "Preparing for board examinations with focused academic rigor.",
    subjects: ["English", "Hindi/Sanskrit", "Mathematics", "Science", "Social Science", "IT/Computer"],
    highlights: ["CBSE Board Preparation", "Career Guidance", "Exam Strategies"],
  },
  {
    level: "Senior Secondary (Classes 11-12)",
    description: "Specialized streams for higher education and career readiness.",
    subjects: ["Science (PCM/PCB)", "Commerce", "Humanities"],
    highlights: ["Stream Selection", "Competitive Exam Prep", "Career Counseling"],
  },
];

const coCurricularActivities = [
  { icon: Palette, name: "Visual Arts", description: "Painting, sketching, sculpture, and digital art" },
  { icon: Music, name: "Performing Arts", description: "Vocal music, instrumental, and classical dance" },
  { icon: Theater, name: "Drama & Theater", description: "Acting workshops, stage plays, and public speaking" },
  { icon: Code, name: "Robotics & Coding", description: "Programming, robotics club, and tech innovations" },
  { icon: Globe, name: "Model UN", description: "Debates, MUN conferences, and leadership skills" },
  { icon: Trophy, name: "Sports Academy", description: "Cricket, football, basketball, athletics, and more" },
];

const facilities = [
  { icon: Beaker, name: "Science Labs", description: "Well-equipped Physics, Chemistry, and Biology labs" },
  { icon: Code, name: "Computer Lab", description: "Modern computers with high-speed internet" },
  { icon: BookOpen, name: "Library", description: "Extensive collection of books and digital resources" },
  { icon: Dumbbell, name: "Sports Complex", description: "Indoor and outdoor sports facilities" },
  { icon: Music, name: "Music Room", description: "Instruments and soundproof practice rooms" },
  { icon: Palette, name: "Art Studio", description: "Dedicated space for creative expression" },
];

export default function AcademicsPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-academics">
              Academics & Programs
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Excellence in <span className="text-accent">Education</span>
            </h1>
            <p className="text-lg opacity-90">
              Our comprehensive curriculum is designed to nurture intellectual curiosity, 
              critical thinking, and a lifelong love for learning.
            </p>
          </div>
        </div>
      </section>

      {/* Curriculum Overview */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Curriculum Overview</h2>
            <p className="text-muted-foreground">
              CBSE-affiliated curriculum tailored to meet global standards
            </p>
          </div>

          <Tabs defaultValue="0" className="w-full">
            <TabsList className="flex flex-wrap justify-center gap-2 h-auto bg-transparent mb-8">
              {curriculumLevels.map((level, index) => (
                <TabsTrigger 
                  key={index} 
                  value={index.toString()}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                  data-testid={`tab-level-${index}`}
                >
                  {level.level.split(" ")[0]}
                </TabsTrigger>
              ))}
            </TabsList>

            {curriculumLevels.map((level, index) => (
              <TabsContent key={index} value={index.toString()}>
                <Card data-testid={`card-curriculum-${index}`}>
                  <CardHeader>
                    <CardTitle className="text-2xl">{level.level}</CardTitle>
                    <p className="text-muted-foreground">{level.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-8">
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-primary" />
                          Subjects Offered
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {level.subjects.map((subject, i) => (
                            <Badge key={i} variant="secondary">{subject}</Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-4 flex items-center gap-2">
                          <Trophy className="h-5 w-5 text-accent" />
                          Highlights
                        </h4>
                        <ul className="space-y-2">
                          {level.highlights.map((highlight, i) => (
                            <li key={i} className="flex items-center gap-2 text-muted-foreground">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                              {highlight}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* Teaching Methodology */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Our Teaching <span className="text-primary">Methodology</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                We believe in creating an engaging learning environment where students 
                actively participate in their educational journey.
              </p>
              <div className="space-y-4">
                {[
                  "Student-centered learning approach",
                  "Integration of technology in classrooms",
                  "Experiential and project-based learning",
                  "Regular formative and summative assessments",
                  "Personalized attention for every student",
                  "Focus on conceptual understanding over rote learning",
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-3" data-testid={`methodology-${index}`}>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    </div>
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-primary text-primary-foreground">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">15:1</div>
                  <div className="text-sm opacity-80">Student-Teacher Ratio</div>
                </CardContent>
              </Card>
              <Card className="bg-accent text-accent-foreground">
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold mb-2">100%</div>
                  <div className="text-sm">Smart Classrooms</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">98%</div>
                  <div className="text-sm text-muted-foreground">Board Exam Pass Rate</div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="text-4xl font-bold text-primary mb-2">50+</div>
                  <div className="text-sm text-muted-foreground">Activity Clubs</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Co-curricular Activities */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Co-curricular Activities</h2>
            <p className="text-muted-foreground">
              Developing well-rounded individuals through diverse activities
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {coCurricularActivities.map((activity, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-activity-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-4">
                    <activity.icon className="h-7 w-7 text-accent" />
                  </div>
                  <h3 className="font-semibold mb-2">{activity.name}</h3>
                  <p className="text-sm text-muted-foreground">{activity.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Facilities */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">World-Class Facilities</h2>
            <p className="opacity-90">
              State-of-the-art infrastructure to support learning
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {facilities.map((facility, index) => (
              <div 
                key={index} 
                className="bg-primary-foreground/10 rounded-lg p-6 text-center"
                data-testid={`facility-${index}`}
              >
                <facility.icon className="h-10 w-10 text-accent mx-auto mb-3" />
                <h4 className="font-semibold mb-1">{facility.name}</h4>
                <p className="text-sm opacity-80">{facility.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
