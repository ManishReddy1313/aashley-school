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
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAdmissionEnquirySchema } from "@shared/schema";
import { z } from "zod";
import { 
  FileText, 
  Calendar, 
  ClipboardCheck, 
  UserCheck,
  Download,
  CheckCircle,
  ArrowRight,
  Phone,
  Mail
} from "lucide-react";

const admissionSteps = [
  { 
    icon: FileText, 
    step: "Step 1", 
    title: "Submit Enquiry", 
    description: "Fill out the online enquiry form with student and parent details." 
  },
  { 
    icon: Calendar, 
    step: "Step 2", 
    title: "Schedule Visit", 
    description: "Book a campus tour to experience our learning environment firsthand." 
  },
  { 
    icon: ClipboardCheck, 
    step: "Step 3", 
    title: "Assessment", 
    description: "Students appear for an age-appropriate interaction/assessment." 
  },
  { 
    icon: UserCheck, 
    step: "Step 4", 
    title: "Enrollment", 
    description: "Complete formalities and welcome your child to the Aashley family." 
  },
];

const grades = [
  "Nursery", "LKG", "UKG", 
  "Class 1", "Class 2", "Class 3", "Class 4", "Class 5",
  "Class 6", "Class 7", "Class 8",
  "Class 9", "Class 10",
];

const documents = [
  { name: "Admission Prospectus 2025-26", size: "2.4 MB" },
  { name: "Fee Structure 2025-26", size: "0.5 MB" },
  { name: "School Calendar 2025-26", size: "1.2 MB" },
];

const formSchema = insertAdmissionEnquirySchema.extend({
  studentName: z.string().min(2, "Student name is required"),
  parentName: z.string().min(2, "Parent name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  grade: z.string().min(1, "Please select a grade"),
});

type FormData = z.infer<typeof formSchema>;

export default function AdmissionsPage() {
  const { toast } = useToast();
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentName: "",
      parentName: "",
      email: "",
      phone: "",
      grade: "",
      message: "",
    },
  });

  const submitEnquiry = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/admission-enquiries", data);
    },
    onSuccess: () => {
      toast({
        title: "Enquiry Submitted!",
        description: "Thank you for your interest. We will contact you soon.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit enquiry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitEnquiry.mutate(data);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-admissions">
              Admissions Open 2025-26
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Join the <span className="text-accent">Aashley Family</span>
            </h1>
            <p className="text-lg opacity-90">
              Begin your child's journey to excellence. We welcome students who are 
              eager to learn, grow, and make a difference.
            </p>
          </div>
        </div>
      </section>

      {/* Admission Process */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Admission Process</h2>
            <p className="text-muted-foreground">
              Simple steps to become part of our learning community
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {admissionSteps.map((step, index) => (
              <div key={index} className="relative" data-testid={`step-${index}`}>
                <Card className="h-full text-center hover-elevate">
                  <CardContent className="p-6">
                    <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <step.icon className="h-7 w-7 text-primary" />
                    </div>
                    <Badge variant="secondary" className="mb-3">{step.step}</Badge>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
                {index < admissionSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="h-6 w-6 text-muted-foreground" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry Form & Downloads */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Enquiry Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Admission Enquiry</h2>
              <Card>
                <CardContent className="p-6">
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="studentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Student Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter student name" 
                                  {...field} 
                                  data-testid="input-student-name"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="parentName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Parent/Guardian Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter parent name" 
                                  {...field} 
                                  data-testid="input-parent-name"
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
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email Address *</FormLabel>
                              <FormControl>
                                <Input 
                                  type="email"
                                  placeholder="Enter email" 
                                  {...field} 
                                  data-testid="input-email"
                                />
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
                              <FormLabel>Phone Number *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter phone number" 
                                  {...field} 
                                  data-testid="input-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="grade"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Grade Seeking Admission *</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-grade">
                                  <SelectValue placeholder="Select grade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {grades.map((grade) => (
                                  <SelectItem key={grade} value={grade}>
                                    {grade}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Additional Message (Optional)</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Any specific questions or requirements?"
                                rows={4}
                                {...field}
                                value={field.value || ""}
                                data-testid="textarea-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitEnquiry.isPending}
                        data-testid="button-submit-enquiry"
                      >
                        {submitEnquiry.isPending ? "Submitting..." : "Submit Enquiry"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Downloads & Contact */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold mb-6">Download Brochures</h2>
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <Card key={index} className="hover-elevate" data-testid={`download-${index}`}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{doc.name}</div>
                              <div className="text-sm text-muted-foreground">PDF - {doc.size}</div>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon" data-testid={`button-download-${index}`}>
                            <Download className="h-5 w-5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold mb-4">Need Help?</h3>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-muted-foreground mb-4">
                      Our admissions team is here to assist you with any queries.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3" data-testid="contact-phone">
                        <Phone className="h-5 w-5 text-primary" />
                        <span>+91 81234 56789</span>
                      </div>
                      <div className="flex items-center gap-3" data-testid="contact-email">
                        <Mail className="h-5 w-5 text-primary" />
                        <span>admissions@aashleyschool.edu</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eligibility */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Eligibility Criteria</h2>
            <p className="text-muted-foreground">
              Age requirements for admission to various classes
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {[
              { grade: "Nursery", age: "3+ years as of 31st March" },
              { grade: "LKG", age: "4+ years as of 31st March" },
              { grade: "UKG", age: "5+ years as of 31st March" },
              { grade: "Class 1", age: "6+ years as of 31st March" },
              { grade: "Classes 2-8", age: "Previous class completion" },
              { grade: "Classes 9-12", age: "Board requirements apply" },
            ].map((item, index) => (
              <Card key={index} data-testid={`eligibility-${index}`}>
                <CardContent className="p-4 flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-accent flex-shrink-0" />
                  <div>
                    <div className="font-medium">{item.grade}</div>
                    <div className="text-sm text-muted-foreground">{item.age}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
