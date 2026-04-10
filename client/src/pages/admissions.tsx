import { PublicLayout } from "@/components/public-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { insertAdmissionEnquirySchema } from "@shared/schema";
import { z } from "zod";
import { FileText, Calendar, ClipboardCheck, UserCheck, Download, CheckCircle, ArrowRight, Phone, Mail, Sparkles } from "lucide-react";
import assemblyImage from "@assets/hero_assembly.jpg";

function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const obs = new IntersectionObserver(entries => { entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("scroll-revealed"); obs.unobserve(e.target); } }); }, { threshold: 0.08 });
    obs.observe(el); return () => obs.disconnect();
  }, []);
  return ref;
}
function Reveal({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const ref = useScrollReveal();
  return <div ref={ref} className={`scroll-reveal ${className}`} style={{ transitionDelay: `${delay}ms` }}>{children}</div>;
}

const stepColors = ["from-blue-400 to-blue-600", "from-emerald-400 to-emerald-600", "from-purple-400 to-purple-600", "from-gold-dark to-gold"];
const admissionSteps = [
  { icon: FileText, step: "Step 1", title: "Submit Enquiry", description: "Fill out the online enquiry form with student and parent details." },
  { icon: Calendar, step: "Step 2", title: "Schedule Visit", description: "Book a campus tour to experience our learning environment firsthand." },
  { icon: ClipboardCheck, step: "Step 3", title: "Assessment", description: "Students appear for an age-appropriate interaction/assessment." },
  { icon: UserCheck, step: "Step 4", title: "Enrollment", description: "Complete formalities and welcome your child to the Aashley family." },
];

const grades = ["Nursery", "LKG", "UKG", "Class 1", "Class 2", "Class 3", "Class 4", "Class 5", "Class 6", "Class 7", "Class 8", "Class 9", "Class 10"];
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
    defaultValues: { studentName: "", parentName: "", email: "", phone: "", grade: "", message: "" },
  });

  const submitEnquiry = useMutation({
    mutationFn: async (data: FormData) => apiRequest("POST", "/api/admission-enquiries", data),
    onSuccess: () => { toast({ title: "Enquiry Submitted!", description: "Thank you for your interest. We will contact you soon." }); form.reset(); },
    onError: (error: Error) => {
      const msg = error?.message || "";
      const match = msg.match(/\d+:\s*\{.*"message"\s*:\s*"([^"]+)"/);
      toast({ title: "Could not submit enquiry", description: match ? match[1] : "Please check your entries and try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => submitEnquiry.mutate(data);
  const onInvalid = () => toast({ title: "Please fix the form", description: "Check the fields above and try again.", variant: "destructive" });

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[58vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={assemblyImage} alt="Students at Aashley International School" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/78 to-primary/50" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold/20 border border-gold/30 mb-5">
              <Sparkles className="h-4 w-4 text-gold" />
              <span className="text-xs font-semibold tracking-widest text-gold uppercase">Admissions Open 2025–26</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-5 leading-tight">
              Join the
              <br /><span className="text-gradient-gold">Aashley Family</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-5" />
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              Begin your child's journey to excellence. We welcome students who are eager to learn, grow, and make a difference.
            </p>
          </div>
        </div>
      </section>

      {/* ── ADMISSION PROCESS ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="badge-gold mb-4 inline-block">Simple Steps</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Admission <span className="text-gradient-gold">Process</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">Simple steps to become part of our learning community</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-4 gap-6">
            {admissionSteps.map((step, index) => (
              <Reveal key={index} delay={index * 120}>
                <div className="relative" data-testid={`step-${index}`}>
                  <div className="card-premium group text-center p-8">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${stepColors[index]} flex items-center justify-center mx-auto mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      <step.icon className="h-8 w-8 text-white" />
                    </div>
                    <div className="badge-gold mb-3 inline-block text-[10px]">{step.step}</div>
                    <h3 className="font-bold text-lg mb-3">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </div>
                  {index < admissionSteps.length - 1 && (
                    <div className="hidden md:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10 items-center justify-center w-6 h-6 rounded-full bg-gold/20 border border-gold/30">
                      <ArrowRight className="h-3 w-3 text-gold" />
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── FORM & DOWNLOADS ── */}
      <section className="py-24 bg-muted/25">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Form */}
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight">
                Admission <span className="text-gradient-gold">Enquiry</span>
              </h2>
              <div className="card-premium p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="studentName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Student Name *</FormLabel>
                          <FormControl><Input placeholder="Enter student name" {...field} data-testid="input-student-name" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="parentName" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Parent/Guardian Name *</FormLabel>
                          <FormControl><Input placeholder="Enter parent name" {...field} data-testid="input-parent-name" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Email Address *</FormLabel>
                          <FormControl><Input type="email" placeholder="Enter email" {...field} data-testid="input-email" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Phone Number *</FormLabel>
                          <FormControl><Input placeholder="Enter phone number" {...field} data-testid="input-phone" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="grade" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Grade Seeking Admission *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl><SelectTrigger data-testid="select-grade" className="rounded-xl"><SelectValue placeholder="Select grade" /></SelectTrigger></FormControl>
                          <SelectContent>{grades.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Additional Message (Optional)</FormLabel>
                        <FormControl><Textarea placeholder="Any specific questions or requirements?" rows={4} {...field} value={field.value || ""} data-testid="textarea-message" className="rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-gold text-white hover:bg-gold-dark border-0 font-bold text-base py-3 rounded-xl hover:shadow-gold transition-all duration-300" disabled={submitEnquiry.isPending} data-testid="button-submit-enquiry">
                      {submitEnquiry.isPending ? "Submitting…" : "Submit Enquiry →"}
                    </Button>
                  </form>
                </Form>
              </div>
            </Reveal>

            {/* Downloads & Contact */}
            <Reveal delay={150}>
              <div className="space-y-10">
                <div>
                  <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight">
                    Download <span className="text-gradient-gold">Brochures</span>
                  </h2>
                  <div className="space-y-3">
                    {documents.map((doc, index) => (
                      <div key={index} className="card-premium group flex items-center justify-between gap-4 p-5" data-testid={`download-${index}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-11 h-11 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/20 transition-colors duration-200">
                            <FileText className="h-5 w-5 text-gold" />
                          </div>
                          <div>
                            <div className="font-semibold">{doc.name}</div>
                            <div className="text-xs text-muted-foreground mt-0.5">PDF — {doc.size}</div>
                          </div>
                        </div>
                        <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gold/10 hover:text-gold transition-colors duration-200" data-testid={`button-download-${index}`}>
                          <Download className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-serif font-bold mb-5">Need <span className="text-gradient-gold">Help?</span></h3>
                  <div className="card-premium p-7 relative overflow-hidden">
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold to-gold/30" />
                    <p className="text-muted-foreground mb-6 leading-relaxed">Our admissions team is here to assist you with any queries about joining Aashley.</p>
                    <div className="space-y-4">
                      <a href="tel:+919480330967" className="flex items-center gap-4 group" data-testid="contact-phone">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                          <Phone className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors duration-200">+91 94803 30967</span>
                      </a>
                      <a href="mailto:contact@aashleyinternationalschool.in" className="flex items-center gap-4 group" data-testid="contact-email">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors duration-200">
                          <Mail className="h-5 w-5 text-primary" />
                        </div>
                        <span className="font-medium group-hover:text-primary transition-colors duration-200 text-sm">contact@aashleyinternationalschool.in</span>
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ELIGIBILITY ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <Reveal>
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="badge-gold mb-4 inline-block">Age Requirements</span>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold mb-3 leading-tight">
                Eligibility <span className="text-gradient-gold">Criteria</span>
              </h2>
              <div className="section-divider mt-4 mb-5" />
              <p className="text-muted-foreground text-lg">Age requirements for admission to various classes</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
            {[
              { grade: "Nursery", age: "3+ years as of 1st June" },
              { grade: "LKG", age: "4+ years as of 1st June" },
              { grade: "UKG", age: "5+ years as of 1st June" },
              { grade: "Class 1", age: "6+ years as of 1st June" },
              { grade: "Classes 2–8", age: "Previous class completion" },
              { grade: "Classes 9–10", age: "Board requirements apply" },
            ].map((item, index) => (
              <Reveal key={index} delay={index * 80}>
                <div className="card-premium flex items-center gap-4 p-5" data-testid={`eligibility-${index}`}>
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-5 w-5 text-gold" />
                  </div>
                  <div>
                    <div className="font-bold">{item.grade}</div>
                    <div className="text-sm text-muted-foreground mt-0.5">{item.age}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
