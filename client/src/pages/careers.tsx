import { useState } from "react";
import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertJobApplicationSchema, type JobPosting } from "@shared/schema";
import { z } from "zod";
import {
  Briefcase,
  MapPin,
  Clock,
  Users,
  Heart,
  Star,
  Quote,
  Send,
  GraduationCap,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import teachersImage from "@assets/teachers_group.jpg";
import classroomImage from "@assets/classroom_1.jpg";

const teacherReviews = [
  {
    name: "Mr. Kantharaj – MA, M.Ed, M.Phil",
    role: "Headmaster",
    quote:
      "As the headmaster of our esteemed school, I am proud to say that our institution is not just a place of learning but a haven for growth. Nestled in the embrace of lush greenery with more than 150 trees on our campus, it provides an environment conducive to both academic excellence and personal development.",
  },
  {
    name: "Mrs. Dhamayanthi B – BA, B.Ed",
    role: "Teacher",
    quote:
      "I'm proud to be a part of the Aashley community where every student is known and valued. The sense of unity, collaboration, and the personalized approach to education gives students the opportunity to succeed.",
  },
  {
    name: "Mrs. Pallavi K – M.Sc, B.Ed",
    role: "Teacher",
    quote:
      "AIS has good infrastructure with skilled staff supported by the management. Teachers are constantly trained to foster a positive work environment and implement strategic plans to equip children in every way, thus preparing them for the future.",
  },
  {
    name: "Mr. Pratap B.G – B.PEd, M.PEd",
    role: "Physical Education Teacher",
    quote:
      "AIS gives a great platform for all students to build their passion and hobbies. The school promotes excellent sportsmanship and encourages the best sporting spirit among students while nurturing each child’s inbuilt qualities.",
  },
  {
    name: "Mrs. Mary Shalini Ratna – M.Sc, B.Ed",
    role: "Teacher",
    quote:
      "It’s the learning environment that determines the success and motivation of a student to achieve. I strongly believe this suits AIS 100%. I have experienced the depth of quality education given from Montessori to Grade 10, where students flourish into all‑round development.",
  },
  {
    name: "Mrs. Shilpa B.S – M.Sc, B.Ed",
    role: "Teacher",
    quote:
      "Aashley teachers are professional, caring, and well organized. The school gives individual attention and creates a homely learning atmosphere which helps in developing the required qualities among students for the future society.",
  },
  {
    name: "Mrs. Aparna N – M.Sc, B.Ed",
    role: "Math Teacher",
    quote:
      "As your child's math teacher, our goal is not just to teach mathematical concepts but to instill a genuine understanding and appreciation for the subject, with personalised support for every learner.",
  },
  {
    name: "Mrs. Roopa M – D.Ed, BA, B.Ed",
    role: "Teacher",
    quote:
      "AIS has a strong academic reputation along with its focus on providing all‑round education that includes extracurricular activities and character development.",
  },
  {
    name: "Mrs. Geetha A.S – B.Sc, B.Ed",
    role: "Teacher",
    quote:
      "We strive to prepare all students to become lifelong learners and responsible citizens who are ready to meet the challenges of the future.",
  },
  {
    name: "Mr. Syed Jaffer – MBA, B.Ed",
    role: "Teacher",
    quote:
      "My desire has always been to be a deserving teacher for students in a caring institution. I am proud of the school for three Qs – Quality Education, Qualified Teachers, and Quality Infrastructure.",
  },
  {
    name: "Mrs. Pavithra V – D.Ed",
    role: "Teacher",
    quote:
      "AIS creates a safe and caring environment where every student can reach their potential under the guidance of dedicated teachers.",
  },
  {
    name: "Mrs. Shabhana Sultana – BA, B.Ed",
    role: "Teacher",
    quote:
      "Teaching for me is not just a job but nurturing young minds. I encourage my students to be strong, independent, and responsible individuals.",
  },
  {
    name: "Mrs. Jacintha Rani – TCH",
    role: "Teacher",
    quote:
      "Confidence has flourished in this school through love, attention, and care. Every child is safe and protected in our school.",
  },
  {
    name: "Mrs. Vanajamma B.J – D.Ed",
    role: "Teacher",
    quote:
      "Students of AIS are bold and active. The school has experienced faculty, creative teaching methods, and frequent teacher workshops. As a teacher, I aim to build self‑confident and successful human beings for society.",
  },
  {
    name: "Mrs. Vanajakshi R – D.Ed, MTT",
    role: "Homeroom Teacher",
    quote:
      "I am a passionate and dedicated homeroom teacher at Aashley. I foster an inclusive environment that helps students grow and succeed.",
  },
  {
    name: "Mrs. Suhasini G.K – D.Ed, MTT",
    role: "Teacher",
    quote:
      "Teaching for me is about nurturing young minds. I encourage freedom of expression, mutual respect, and a sense of responsibility among my students.",
  },
  {
    name: "Mrs. Uma S – B.Com, MTT",
    role: "Montessori Teacher",
    quote:
      "As a Montessori teacher, I believe education at Aashley is not just from board to paper but through unique learning materials relevant to each subject, where every child can excel.",
  },
  {
    name: "Ms. Selvi K – MTT",
    role: "Montessori Teacher",
    quote:
      "AIS Montessori is like heaven for both teacher and child. Children feel a homely atmosphere here where each child is individually cared for and observed carefully.",
  },
];

const benefits = [
  { icon: Heart, title: "Supportive Work Culture", description: "Family-like environment with open communication and mutual respect" },
  { icon: GraduationCap, title: "Professional Growth", description: "Regular training workshops and development opportunities" },
  { icon: Users, title: "Small Class Sizes", description: "Optimal student-teacher ratio for meaningful engagement" },
  { icon: Star, title: "Recognition & Rewards", description: "Performance-based incentives and appreciation programs" },
  { icon: BookOpen, title: "Creative Freedom", description: "Freedom to innovate and implement new teaching methodologies" },
  { icon: CheckCircle, title: "Competitive Compensation", description: "Fair salary structure with timely payments and benefits" },
];

const formSchema = insertJobApplicationSchema.extend({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  experience: z.string().min(1, "Experience is required"),
  qualification: z.string().min(2, "Qualification is required"),
  jobId: z.string().min(1, "Please select a position"),
});

type FormData = z.infer<typeof formSchema>;

function ApplicationDialog({ job, children }: { job: JobPosting; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      experience: "",
      qualification: "",
      coverLetter: "",
      resumeUrl: "",
      jobId: job.id,
    },
  });

  const submitApplication = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/careers/apply", data);
    },
    onSuccess: () => {
      toast({
        title: "Application Submitted!",
        description: "Thank you for your interest. We will review your application and get back to you.",
      });
      form.reset();
      setOpen(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply for: {job.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => submitApplication.mutate(data))} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} data-testid="input-apply-name" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Your email" {...field} data-testid="input-apply-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone *</FormLabel>
                    <FormControl>
                      <Input placeholder="Phone number" {...field} data-testid="input-apply-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="qualification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Highest Qualification *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., B.Ed, M.A., B.Sc." {...field} data-testid="input-apply-qualification" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="experience"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Years of Experience *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-apply-experience">
                        <SelectValue placeholder="Select experience" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="1-2">1-2 Years</SelectItem>
                      <SelectItem value="3-5">3-5 Years</SelectItem>
                      <SelectItem value="5-10">5-10 Years</SelectItem>
                      <SelectItem value="10+">10+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="coverLetter"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Why do you want to join Aashley?</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Tell us about yourself and why you'd be a great fit..."
                      rows={4}
                      {...field}
                      value={field.value || ""}
                      data-testid="textarea-apply-cover"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={submitApplication.isPending} data-testid="button-submit-application">
              {submitApplication.isPending ? "Submitting..." : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Submit Application
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default function CareersPage() {
  const { data: jobPostings = [], isLoading } = useQuery<JobPosting[]>({
    queryKey: ["/api/careers"],
  });

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative py-12 md:py-20">
        <div className="absolute inset-0">
          <img src={teachersImage} alt="Teaching faculty of Aashley International School" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-primary/85" />
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center text-primary-foreground">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-careers">
              Careers at Aashley
            </Badge>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-serif font-bold mb-6 text-white leading-tight tracking-tight">
              Join Our <span className="text-gradient-gold underline decoration-4 underline-offset-8">Teaching Family</span>
            </h1>
            <p className="text-base md:text-lg opacity-90">
              Be part of a school that values its educators as much as its students.
              At Aashley International, we believe great teachers create great futures.
            </p>
          </div>
        </div>
      </section>

      {/* Why Work Here */}
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-primary">
              Why Work at <span className="text-gradient-gold underline decoration-4 underline-offset-8">Aashley?</span>
            </h2>
            <p className="text-muted-foreground">
              We offer more than just a job — we offer a purpose-driven career where you can truly make a difference.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {benefits.map((benefit, index) => (
              <Card key={index} className="hover-elevate" data-testid={`card-benefit-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-none bg-accent/10 flex items-center justify-center mb-4">
                    <benefit.icon className="h-6 w-6 text-gold" />
                  </div>
                  <h3 className="font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Current Openings */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-primary">
              Current <span className="text-gradient-gold underline decoration-4 underline-offset-8">Openings</span>
            </h2>
            <p className="text-muted-foreground">
              Explore our available positions and find the right fit for your skills and passion
            </p>
          </div>

          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-6 bg-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-muted rounded w-1/2 mb-4" />
                    <div className="h-20 bg-muted rounded" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : jobPostings.length > 0 ? (
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {jobPostings.map((job) => (
                <Card key={job.id} className="hover-elevate" data-testid={`card-job-${job.id}`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <Badge variant="secondary">{job.department}</Badge>
                          <Badge variant="outline">{job.type}</Badge>
                        </div>
                      </div>
                      <Briefcase className="h-6 w-6 text-accent flex-shrink-0" />
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{job.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        Bangarpet, Kolar
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {job.type}
                      </span>
                    </div>
                    <ApplicationDialog job={job}>
                      <Button className="w-full" data-testid={`button-apply-${job.id}`}>
                        Apply Now
                      </Button>
                    </ApplicationDialog>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Briefcase className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Openings Currently</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                We don't have any open positions right now, but we're always looking for talented educators.
                Send us your application and we'll keep it on file.
              </p>
              <Card className="max-w-md mx-auto">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Send your resume and cover letter to:
                  </p>
                  <p className="font-semibold text-primary">contact@aashleyinternationalschool.in</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Subject: [Position] - [Your Name]
                  </p>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>


      {/* Teacher Reviews */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-white">
              What Our <span className="text-gradient-gold underline decoration-4 underline-offset-8">Teachers Say</span>
            </h2>
            <p className="opacity-90">
              Hear directly from the educators who make Aashley a special place to work and learn.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {teacherReviews.map((review, index) => (
              <Card
                key={index}
                className="bg-primary-foreground/10 border-primary-foreground/20"
                data-testid={`teacher-review-${index}`}
              >
                <CardContent className="p-6">
                  <Quote className="h-8 w-8 text-gold mb-4" />
                  <p className="text-primary-foreground/90 mb-6 leading-relaxed italic">
                    "{review.quote}"
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-none bg-gold/20 flex items-center justify-center">
                      <Users className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary-foreground text-sm">
                        {review.name}
                      </div>
                      <div className="text-xs text-primary-foreground/70">
                        {review.role}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold mb-6 text-primary">
            Ready to Shape <span className="text-gradient-gold underline decoration-4 underline-offset-8">Young Minds?</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            If you're passionate about education and want to make a real difference in children's lives,
            we'd love to hear from you. Join the Aashley International community today.
          </p>
          <div className="inline-flex flex-col sm:flex-row flex-wrap justify-center items-center gap-x-8 gap-y-4 px-6 sm:px-10 py-6 bg-white border-l-8 border-gold shadow-[0px_10px_30px_rgba(0,0,0,0.07)]">
            <div className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Contact HR:</div>
            <div className="flex items-center gap-2">
               <Mail className="h-4 w-4 text-gold" />
               <span className="font-bold text-primary break-all">contact@aashleyinternationalschool.in</span>
            </div>
            <div className="flex items-center gap-2">
               <Phone className="h-4 w-4 text-gold" />
               <span className="font-bold text-primary">+91 94803 30967</span>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
