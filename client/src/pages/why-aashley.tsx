import { Link } from "wouter";
import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import heroImage from "@assets/home_entrance2.jpg";
import assemblyImage from "@assets/hero_5.jpg";
import classroomImage from "@assets/classroom_1.jpg";
import sportsImage from "@assets/sports_2.jpg";
import labImage from "@assets/lab_3.jpg";
import teachersImage from "@assets/teachers_group.jpg";
import {
  GraduationCap,
  Users,
  BookOpen,
  Trophy,
  Heart,
  Star,
  Shield,
  Lightbulb,
  Globe,
  Palette,
  Dumbbell,
  Bus,
  Utensils,
  Monitor,
  ArrowRight,
  Quote,
  CheckCircle,
  Beaker,
  Music,
  TreePine,
} from "lucide-react";

const uniqueFeatures = [
  {
    icon: BookOpen,
    title: "ICSE Curriculum Excellence",
    description: "Affiliated with CISCE, our ICSE curriculum emphasizes conceptual understanding, analytical skills, and holistic development beyond textbooks.",
  },
  {
    icon: Heart,
    title: "Values-First Education",
    description: "Daily prayer, moral education, and character-building activities ensure students grow as compassionate, responsible individuals.",
  },
  {
    icon: Users,
    title: "Personalized Attention",
    description: "With an optimal student-teacher ratio, every child receives individual attention, ensuring no student is left behind.",
  },
  {
    icon: Monitor,
    title: "Smart Classrooms",
    description: "20 well-equipped classrooms with modern teaching aids and technology make learning interactive and engaging for every student.",
  },
  {
    icon: Beaker,
    title: "Hands-on Lab Learning",
    description: "Fully equipped computer and science labs let students experiment, explore, and discover concepts through practical experience.",
  },
  {
    icon: Dumbbell,
    title: "Sports & Physical Fitness",
    description: "Dedicated playground and sports facilities encourage physical development, teamwork, and healthy competition among students.",
  },
  {
    icon: Palette,
    title: "Creative Arts Program",
    description: "Art, craft, music, and performing arts programs unlock creative potential and build confidence through self-expression.",
  },
  {
    icon: Shield,
    title: "Safe & Secure Campus",
    description: "Boundary walls with security fencing, dedicated security staff, and a caring environment ensure every child's safety.",
  },
  {
    icon: Utensils,
    title: "Nutritious Mid-day Meals",
    description: "Healthy, balanced meals provided daily ensure students stay energized and focused throughout the school day.",
  },
  {
    icon: Globe,
    title: "English Medium Instruction",
    description: "Complete English-medium education from Pre-Primary to Class 10 prepares students for national and global opportunities.",
  },
  {
    icon: Lightbulb,
    title: "Activity-Based Learning",
    description: "Play-based methods in early years and project-based learning in higher classes make education meaningful and enjoyable.",
  },
  {
    icon: TreePine,
    title: "Green Campus Environment",
    description: "A clean, well-maintained campus surrounded by nature provides the perfect atmosphere for learning and growth.",
  },
];

const keyStats = [
  { value: "2008", label: "Established", icon: Star },
  { value: "500+", label: "Happy Students", icon: Users },
  { value: "4.6/5", label: "Parent Rating", icon: Trophy },
  { value: "20+", label: "Classrooms", icon: BookOpen },
  { value: "ICSE", label: "Board Affiliation", icon: GraduationCap },
  { value: "Pre-K to 10", label: "Classes Offered", icon: Globe },
];

const parentTestimonials = [
  {
    name: "Mrs. Kavitha R.",
    role: "Parent of Class 5 Student",
    quote: "Choosing Aashley was the best decision for my child. The teachers are incredibly dedicated and the values-based approach has truly shaped my son's character. He loves going to school every day!",
  },
  {
    name: "Mr. Suresh Kumar",
    role: "Parent of Class 8 Student",
    quote: "The ICSE curriculum at Aashley prepares students thoroughly. My daughter's analytical skills and confidence have grown tremendously since joining. The school's attention to each student is remarkable.",
  },
  {
    name: "Mrs. Priya Gowda",
    role: "Parent of Class 3 Student",
    quote: "What sets Aashley apart is the genuine care for every child. The mid-day meals, clean campus, and the morning prayer sessions create a nurturing atmosphere that goes beyond just academics.",
  },
  {
    name: "Mr. Ravi Shankar",
    role: "Parent of Class 7 Student",
    quote: "We relocated to Bangarapet specifically for Aashley International. The combination of quality education, reasonable fees, and a safe environment is unmatched in this region.",
  },
];

const whyNotOthers = [
  { feature: "ICSE Board (CISCE Affiliated)", aashley: true, others: "Mostly State Board" },
  { feature: "English Medium from Pre-Primary", aashley: true, others: "Often mixed medium" },
  { feature: "Daily Values & Prayer Sessions", aashley: true, others: "Rarely offered" },
  { feature: "Mid-day Meals Included", aashley: true, others: "Extra charge" },
  { feature: "Computer Lab Access", aashley: true, others: "Limited or unavailable" },
  { feature: "Dedicated Playground", aashley: true, others: "Shared or none" },
  { feature: "Reasonable Fee Structure", aashley: true, others: "Often expensive" },
  { feature: "Regular Evaluation System", aashley: true, others: "Exam-only approach" },
];

export default function WhyAashleyPage() {
  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Aashley International School Campus"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-why-hero">
              Discover the Aashley Difference
            </Badge>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              Why Choose{" "}
              <span className="text-accent">Aashley International?</span>
            </h1>
            <p className="text-lg md:text-xl text-white/90 mb-8 leading-relaxed">
              Since 2008, we've been shaping young minds in Bangarapet, Kolar with an
              ICSE curriculum, values-driven education, and a commitment to every child's success.
            </p>
            <Link href="/admissions">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90" data-testid="button-why-apply">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Key Stats */}
      <section className="py-12 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {keyStats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-why-${index}`}>
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-accent" />
                <div className="text-2xl md:text-3xl font-bold">{stat.value}</div>
                <div className="text-xs opacity-80 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Unique Features Grid */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What Makes Aashley <span className="text-primary">Unique</span>
            </h2>
            <p className="text-muted-foreground">
              Every aspect of our school is designed to provide the best possible
              education and development experience for your child.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {uniqueFeatures.map((feature, index) => (
              <Card key={index} className="hover-elevate group" data-testid={`card-feature-why-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-lg bg-accent/10 group-hover:bg-accent/20 flex items-center justify-center mb-4 transition-colors">
                    <feature.icon className="h-6 w-6 text-accent" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Photo Showcase */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Experience <span className="text-primary">Campus Life</span>
            </h2>
            <p className="text-muted-foreground">
              A glimpse into the vibrant daily life at Aashley International School
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="relative group overflow-hidden rounded-lg aspect-[4/3]" data-testid="photo-campus-1">
              <img src={classroomImage} alt="Classroom Learning at Aashley" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-semibold text-white">Classroom Learning</h4>
                <p className="text-white/80 text-sm">Interactive, student-centered education</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg aspect-[4/3]" data-testid="photo-campus-2">
              <img src={labImage} alt="Science Lab at Aashley" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-semibold text-white">Hands-on Science</h4>
                <p className="text-white/80 text-sm">Fully equipped labs for practical learning</p>
              </div>
            </div>
            <div className="relative group overflow-hidden rounded-lg aspect-[4/3]" data-testid="photo-campus-3">
              <img src={sportsImage} alt="Sports Champions at Aashley" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-semibold text-white">Sports Excellence</h4>
                <p className="text-white/80 text-sm">Championship-winning sports teams</p>
              </div>
            </div>
          </div>
          <div className="mt-6">
            <div className="relative group overflow-hidden rounded-lg aspect-[21/9]" data-testid="photo-campus-teachers">
              <img src={teachersImage} alt="Our dedicated teaching faculty" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h4 className="font-semibold text-white text-lg">Our Dedicated Faculty</h4>
                <p className="text-white/80 text-sm">Individual Attention, Homely Care, Promising Future</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              The Aashley <span className="text-primary">Advantage</span>
            </h2>
            <p className="text-muted-foreground">
              See how Aashley International stands apart from other schools in the region
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-primary text-primary-foreground">
                        <th className="text-left p-4 font-semibold">Feature</th>
                        <th className="text-center p-4 font-semibold">Aashley International</th>
                        <th className="text-center p-4 font-semibold">Other Schools</th>
                      </tr>
                    </thead>
                    <tbody>
                      {whyNotOthers.map((item, index) => (
                        <tr key={index} className="border-b last:border-0" data-testid={`comparison-row-${index}`}>
                          <td className="p-4 font-medium">{item.feature}</td>
                          <td className="p-4 text-center">
                            <CheckCircle className="h-5 w-5 text-green-500 mx-auto" />
                          </td>
                          <td className="p-4 text-center text-sm text-muted-foreground">{item.others}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Parent Testimonials */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              What <span className="text-accent">Parents Say</span>
            </h2>
            <p className="opacity-90">
              Real experiences from parents who chose Aashley for their children
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {parentTestimonials.map((testimonial, index) => (
              <Card key={index} className="bg-primary-foreground/10 border-primary-foreground/20" data-testid={`testimonial-why-${index}`}>
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-accent mb-4" />
                  <p className="text-primary-foreground/90 mb-6 italic leading-relaxed">
                    "{testimonial.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-foreground">{testimonial.name}</div>
                      <div className="text-sm text-primary-foreground/70">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Principal's Promise */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              A Message from Our Principal
            </h2>
            <blockquote className="text-lg text-muted-foreground italic leading-relaxed mb-6">
              "At Aashley International School, we don't just educate — we nurture. Every child who walks
              through our doors is treated as a unique individual with limitless potential. Our ICSE
              curriculum, combined with values-based education, ensures that students don't just excel in
              examinations but grow as confident, compassionate human beings ready to face the world."
            </blockquote>
            <div className="font-semibold text-lg">Mrs. Veenarani B C</div>
            <div className="text-muted-foreground">Principal, Aashley International School</div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-accent/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Give Your Child the <span className="text-primary">Best Start?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            Join hundreds of families who have trusted Aashley International School
            with their children's future. Admissions are now open for 2025-26.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/admissions">
              <Button size="lg" data-testid="button-why-apply-now">
                Apply for Admission
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="outline" data-testid="button-why-visit">
                Schedule a Campus Visit
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
