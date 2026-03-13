import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import classroomImage from "@assets/classroom_1.jpg";
import labImage from "@assets/lab_1.jpg";
import scienceLabImage from "@assets/lab_3.jpg";
import classroomImage2 from "@assets/classroom_4.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labEquipment from "@assets/lab_6.jpg";
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
    description: "Foundation years focused on play-based learning, social skills, and early literacy in a safe environment.",
    subjects: ["English", "Kannada", "Mathematics Concepts", "Environmental Awareness", "Art & Craft", "Music & Movement"],
    highlights: ["Activity-Based Learning", "Play-Way Methods", "Safe & Nurturing Environment"],
  },
  {
    level: "Primary (Classes 1-5)",
    description: "Building strong fundamentals through the ICSE curriculum with hands-on experiences.",
    subjects: ["English", "Kannada/Hindi", "Mathematics", "EVS/Science", "Social Studies", "Computer Science", "Art & Music"],
    highlights: ["ICSE Curriculum", "Smart Classrooms", "Regular Evaluation"],
  },
  {
    level: "Middle School (Classes 6-8)",
    description: "Expanding horizons with advanced ICSE concepts and specialized subjects.",
    subjects: ["English", "Kannada/Hindi", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"],
    highlights: ["Subject Specialization", "Lab Experiments", "Project-Based Learning"],
  },
  {
    level: "Secondary (Classes 9-10)",
    description: "Preparing for ICSE board examinations with focused academic rigor and career guidance.",
    subjects: ["English", "Second Language", "Mathematics", "Physics", "Chemistry", "Biology", "History & Civics", "Geography", "Computer Applications"],
    highlights: ["ICSE Board Preparation", "Career Guidance", "Exam Strategies"],
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

const facilityImages = [
  { name: "Science Labs", description: "Well-equipped Physics, Chemistry, and Biology labs", image: scienceLabImage },
  { name: "Computer Lab", description: "Modern computers with interactive smart boards", image: labImage },
  { name: "Classrooms", description: "50+ spacious, well-equipped smart classrooms", image: classroomImage2 },
  { name: "Sports Complex", description: "Dedicated playground and indoor sports facilities", image: sportsImage },
  { name: "Library", description: "Extensive collection of 500+ books and digital resources", image: classroomImage },
  { name: "Lab Equipment", description: "Modern scientific instruments for hands-on learning", image: labEquipment },
];

export default function AcademicsPage() {
  return (
    <PublicLayout>
      {/* Hero Section with Image */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img src={classroomImage} alt="Classroom at Aashley International School" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
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
              ICSE-affiliated curriculum tailored to meet global standards
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

      {/* Teaching Methodology with Image */}
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
            <div className="space-y-4">
              <div className="rounded-lg overflow-hidden aspect-video">
                <img src={labImage} alt="Interactive smart board teaching at Aashley" className="w-full h-full object-cover" />
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
              </div>
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

      {/* Facilities with Real Images */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">World-Class Facilities</h2>
            <p className="opacity-90">
              State-of-the-art infrastructure to support learning
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {facilityImages.map((facility, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-lg"
                data-testid={`facility-${index}`}
              >
                <div className="aspect-[4/3]">
                  <img 
                    src={facility.image} 
                    alt={facility.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <h4 className="font-semibold text-white mb-1">{facility.name}</h4>
                    <p className="text-sm text-white/80">{facility.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
