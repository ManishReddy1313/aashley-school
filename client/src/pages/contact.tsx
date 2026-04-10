import { PublicLayout } from "@/components/public-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Send, Instagram } from "lucide-react";
import buildingImage from "@assets/home_entrance.jpg";

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

const contactColors = ["from-blue-400 to-blue-600", "from-emerald-400 to-emerald-600", "from-amber-400 to-amber-600", "from-purple-400 to-purple-600"];
const contactInfo = [
  { icon: Phone, title: "Phone", details: ["+91 94803 30967"], href: "tel:+919480330967" },
  { icon: Mail, title: "Email", details: ["contact@aashleyinternationalschool.in"], href: "mailto:contact@aashleyinternationalschool.in" },
  { icon: MapPin, title: "Address", details: ["Bangarpet Road, next to HP Gas Agency", "Budikote, Bangarpet, Kolar - 563114"], href: undefined },
  { icon: Clock, title: "Office Hours", details: ["Mon – Fri: 8:00 AM – 4:00 PM", "Sat: 9:00 AM – 1:00 PM"], href: undefined },
];

const formSchema = insertContactMessageSchema.extend({
  name: z.string().min(2, "Name is required"),
  email: z.string().email("Valid email is required"),
  subject: z.string().min(3, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});
type FormData = z.infer<typeof formSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const form = useForm<FormData>({ resolver: zodResolver(formSchema), defaultValues: { name: "", email: "", phone: "", subject: "", message: "" } });

  const submitMessage = useMutation({
    mutationFn: async (data: FormData) => apiRequest("POST", "/api/contact", data),
    onSuccess: () => { toast({ title: "Message Sent!", description: "Thank you for reaching out. We'll get back to you soon." }); form.reset(); },
    onError: (error: Error) => {
      const msg = error?.message || "";
      const match = msg.match(/\d+:\s*\{.*"message"\s*:\s*"([^"]+)"/);
      toast({ title: "Could not send message", description: match ? match[1] : "Please check your entries and try again.", variant: "destructive" });
    },
  });

  const onSubmit = (data: FormData) => submitMessage.mutate(data);
  const onInvalid = () => toast({ title: "Please fix the form", description: "Check the fields above and try again.", variant: "destructive" });

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section className="relative min-h-[55vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={buildingImage} alt="Aashley International School Campus" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/92 via-primary/78 to-primary/50" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold-dark via-gold to-gold-light" />
        <div className="container mx-auto px-4 relative z-10 py-20">
          <div className="max-w-2xl">
            <span className="badge-gold mb-5 inline-block">Get in Touch</span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-5 leading-tight">
              We'd Love to<br /><span className="text-gradient-gold">Hear From You</span>
            </h1>
            <div className="w-16 h-1 bg-gradient-to-r from-gold to-gold/30 rounded mb-5" />
            <p className="text-lg text-white/80 leading-relaxed max-w-xl">
              Have questions about admissions, academics, or anything else? We're here to help — reach out and we'll respond promptly.
            </p>
          </div>
        </div>
      </section>

      {/* ── CONTACT INFO CARDS ── */}
      <section className="py-16 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {contactInfo.map((info, index) => {
              const content = (
                <div className="card-premium group text-center p-7 h-full" data-testid={`contact-info-${index}`}>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${contactColors[index]} flex items-center justify-center mx-auto mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                    <info.icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="font-bold mb-3">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm text-muted-foreground leading-relaxed">{detail}</p>
                  ))}
                </div>
              );
              return (
                <Reveal key={index} delay={index * 100}>
                  {info.href ? <a href={info.href} className="block h-full">{content}</a> : content}
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FORM & MAP ── */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-14">
            {/* Form */}
            <Reveal>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight">
                Send Us a <span className="text-gradient-gold">Message</span>
              </h2>
              <div className="card-premium p-8">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-5" noValidate>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="name" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Your Name *</FormLabel>
                          <FormControl><Input placeholder="Enter your name" {...field} data-testid="input-contact-name" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="email" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Email Address *</FormLabel>
                          <FormControl><Input type="email" placeholder="Enter email" {...field} data-testid="input-contact-email" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <div className="grid md:grid-cols-2 gap-5">
                      <FormField control={form.control} name="phone" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Phone Number</FormLabel>
                          <FormControl><Input placeholder="Enter phone number" {...field} value={field.value || ""} data-testid="input-contact-phone" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                      <FormField control={form.control} name="subject" render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Subject *</FormLabel>
                          <FormControl><Input placeholder="What is this about?" {...field} data-testid="input-contact-subject" className="rounded-xl" /></FormControl>
                          <FormMessage />
                        </FormItem>
                      )} />
                    </div>
                    <FormField control={form.control} name="message" render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-semibold">Message *</FormLabel>
                        <FormControl><Textarea placeholder="Write your message here..." rows={5} {...field} data-testid="textarea-contact-message" className="rounded-xl" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <Button type="submit" className="w-full bg-gold text-white hover:bg-gold-dark border-0 font-bold text-base py-3 rounded-xl hover:shadow-gold transition-all duration-300" disabled={submitMessage.isPending} data-testid="button-send-message">
                      {submitMessage.isPending ? "Sending…" : <><Send className="mr-2 h-4 w-4" />Send Message</>}
                    </Button>
                  </form>
                </Form>
              </div>
            </Reveal>

            {/* Map */}
            <Reveal delay={150}>
              <h2 className="text-3xl md:text-4xl font-serif font-bold mb-8 leading-tight">
                Find <span className="text-gradient-gold">Us</span>
              </h2>
              <div className="card-premium overflow-hidden">
                <div className="rounded-2xl overflow-hidden" data-testid="map-placeholder">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.762844593029!2d78.170699!3d12.987014700000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bade9007e687007%3A0xfdaee093d678a252!2sAashley%20International%20School!5e0!3m2!1sen!2sin!4v1773438717841!5m2!1sen!2sin"
                    width="100%"
                    height="400"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Aashley International School Location"
                    data-testid="map-embed"
                  />
                </div>
              </div>

              {/* Social */}
              <div className="mt-8">
                <h3 className="text-xl font-serif font-bold mb-5">Connect <span className="text-gradient-gold">With Us</span></h3>
                <a
                  href="https://www.instagram.com/aashley__2009/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f093fb 0%, #f5576c 50%, #fda085 100%)" }}
                  data-testid="social-instagram"
                  aria-label="Instagram"
                >
                  <Instagram className="h-5 w-5" />
                  Follow @aashley__2009
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
