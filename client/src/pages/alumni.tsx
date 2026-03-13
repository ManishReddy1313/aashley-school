import { PublicLayout } from "@/components/public-layout";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAlumniSchema } from "@shared/schema";
import heroImage from "@assets/hero_2.jpg";
import { z } from "zod";
import { 
  GraduationCap, 
  Users, 
  Briefcase, 
  Quote,
  ArrowRight,
  Building2
} from "lucide-react";

const alumniStories = [
  {
    name: "Mr. Chandan N Swaraj",
    highlight: "Founder of CNS Constructions, CNS Creations & CNS School of Dance",
    summary:
      "As a proud graduate of Aashley’s inaugural batch, he credits the school’s holistic education and support from teachers and management for nurturing both his academic foundation and passion for cultural activities, shaping his multifaceted career.",
  },
  {
    name: "Ms. Shivani M V",
    highlight: "Clinical Psychologist",
    summary:
      "Studying at Aashley helped her understand herself better, build friendships, and grow in confidence. With strong mentorship, her four years at Aashley shaped her personality and will always hold a special place in her heart.",
  },
  {
    name: "Mr. Srikanth T R",
    highlight: "CS & AI student at IIITDM Kancheepuram (AIR 13888, 98.6%)",
    summary:
      "From Grade 1 to 10, Aashley’s rigorous academics, innovative teaching and focus on sports and extracurriculars laid the foundation for his success in Computer Science & AI, building both his academic strength and leadership skills.",
  },
  {
    name: "Mr. Mohith N P",
    highlight: "Student at School of Planning and Architecture, New Delhi",
    summary:
      "Aashley’s teachers taught him to think creatively, balance hard work and smart work, and develop life skills like time management and perseverance, which helped him secure top ranks in JEE (AIR 1385, Category Rank 59).",
  },
  {
    name: "Ms. Ganavi Gowda",
    highlight: "Frontend Developer at Lenovo Pvt. Ltd.",
    summary:
      "She recalls late‑night study sessions at school, constant teacher support even on Sundays, and a nurturing environment that removed stage fear and built the confidence she now uses daily in her IT career.",
  },
  {
    name: "Mr. Tarun Rao",
    highlight: "Student Pilot",
    summary:
      "He describes Aashley as the bedrock of his educational journey, where dedicated teachers not only guided his academics but also offered career advice, helping him pursue his dream of becoming a pilot.",
  },
];

const stats = [
  { icon: Users, value: "5000+", label: "Alumni Worldwide" },
  { icon: Building2, value: "500+", label: "Companies Represented" },
  { icon: GraduationCap, value: "200+", label: "Higher Education Scholars" },
  { icon: Briefcase, value: "50+", label: "Entrepreneurs" },
];

const formSchema = insertAlumniSchema.extend({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  graduationYear: z.number().min(1999, "Graduation year must be 1999 or later").max(new Date().getFullYear(), "Invalid graduation year"),
});

type FormData = z.infer<typeof formSchema>;

export default function AlumniPage() {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      graduationYear: new Date().getFullYear(),
      currentRole: "",
      organization: "",
      story: "",
    },
  });

  const submitAlumni = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/alumni", data);
    },
    onSuccess: () => {
      toast({
        title: "Registration Submitted!",
        description: "Thank you for registering. We'll review your submission soon.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit registration. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitAlumni.mutate(data);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-20">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Aashley International School" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-alumni">
              Alumni Network
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Once an <span className="text-accent">Aashleyite</span>, Always an Aashleyite
            </h1>
            <p className="text-lg opacity-90">
              Connect with fellow alumni, share your success stories, and stay connected 
              with your alma mater.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-accent">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <div key={index} className="text-center" data-testid={`stat-${index}`}>
                <stat.icon className="h-8 w-8 mx-auto mb-2 text-accent-foreground" />
                <div className="text-2xl font-bold text-accent-foreground">{stat.value}</div>
                <div className="text-sm text-accent-foreground/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Alumni Achievers */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Alumni Achievers</h2>
            <p className="text-muted-foreground">
              Real journeys from Aashley alumni whose achievements span engineering, design, psychology, IT and aviation.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {alumniStories.map((story, index) => (
              <Card key={index} data-testid={`alumni-story-${index}`}>
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-accent mb-4" />
                  <p className="text-muted-foreground mb-6 leading-relaxed">
                    {story.summary}
                  </p>
                  <div className="border-t pt-4 mt-2 flex flex-col">
                    <span className="font-semibold">{story.name}</span>
                    <span className="text-sm text-muted-foreground">{story.highlight}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Registration Form */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Join the Alumni Network</h2>
              <p className="text-muted-foreground mb-6">
                Register yourself as an Aashley alumnus and stay connected with your 
                schoolmates and the school community.
              </p>
              
              <div className="space-y-4">
                {[
                  "Get invited to alumni meets and reunions",
                  "Share your success story to inspire current students",
                  "Network with fellow alumni across industries",
                  "Receive school newsletters and updates",
                  "Opportunity to mentor current students",
                ].map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3" data-testid={`benefit-${index}`}>
                    <div className="w-6 h-6 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="h-3 w-3 text-accent" />
                    </div>
                    <span>{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            <Card>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name *</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your name" 
                                {...field} 
                                data-testid="input-alumni-name"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address *</FormLabel>
                            <FormControl>
                              <Input 
                                type="email"
                                placeholder="Enter email" 
                                {...field} 
                                data-testid="input-alumni-email"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="graduationYear"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Graduation Year *</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                min={1999}
                                max={new Date().getFullYear()}
                                placeholder="e.g., 2015" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                data-testid="input-graduation-year"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="currentRole"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Current Role</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="e.g., Software Engineer" 
                                {...field}
                                value={field.value || ""}
                                data-testid="input-current-role"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="organization"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Organization</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Where do you work?" 
                              {...field}
                              value={field.value || ""}
                              data-testid="input-organization"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="story"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Story (Optional)</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your journey and how Aashley shaped your life..."
                              rows={4}
                              {...field}
                              value={field.value || ""}
                              data-testid="textarea-alumni-story"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={submitAlumni.isPending}
                      data-testid="button-submit-alumni"
                    >
                      {submitAlumni.isPending ? "Submitting..." : "Register as Alumni"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
