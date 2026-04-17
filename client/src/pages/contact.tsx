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
import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { Phone, Mail, MapPin, Clock, Send, Instagram, ArrowRight } from "lucide-react";
import buildingImage from "@assets/home_entrance.jpg";

// Custom Reveal using Framer Motion
function Reveal({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode; className?: string; delay?: number; direction?: "up" | "left" | "right" | "scale" }) {
  let y = 0, x = 0, scale = 1;
  if (direction === "up") y = 20;
  if (direction === "left") x = -20;
  if (direction === "right") x = 20;
  if (direction === "scale") scale = 0.95;
  
  return (
    <motion.div
      initial={{ opacity: 0, y, x, scale }}
      whileInView={{ opacity: 1, y: 0, x: 0, scale: 1 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay: delay / 1000, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

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

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const yImage = useTransform(heroScroll, [0, 1], ["0%", "20%"]);
  const yContent = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const opacityHero = useTransform(heroScroll, [0, 0.8], [1, 0]);

  return (
    <PublicLayout>
      {/* ── HERO ── */}
      <section ref={heroRef} className="relative min-h-[60vh] flex items-center overflow-hidden">
        <motion.div className="absolute inset-0" style={{ y: yImage }}>
          <img src={buildingImage} alt="Aashley International School Campus" className="w-full h-full object-cover scale-[1.05]" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/80 via-primary/65 to-primary/40 backdrop-blur-[2px]" />
          <div className="absolute inset-0 dot-pattern opacity-20" />
        </motion.div>
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-gold-dark via-gold to-gold-light z-20" />
        
        <div className="container mx-auto px-4 relative z-10 py-24">
          <motion.div className="max-w-2xl" style={{ y: yContent, opacity: opacityHero }}>
            <motion.span initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-accent text-white px-3 py-1 font-bold uppercase tracking-widest text-[10px] mb-6 inline-block">
              Get In Touch
            </motion.span>
            <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }} className="text-4xl md:text-5xl lg:text-7xl font-serif font-black text-white mb-6 leading-tight tracking-tight">
              We'd Love To<br /><span className="text-gradient-gold underline decoration-4 underline-offset-8">Hear From You</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5, duration: 0.8 }} className="text-lg md:text-xl text-white/85 leading-relaxed font-medium font-sans mt-8">
              Have questions about admissions, academics, or anything else? We are here to help — reach out and we'll respond promptly.
            </motion.p>
          </motion.div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />
      </section>

      {/* ── FLOATING SPLIT SCREEN: CONNECT & MAP ── */}
      <section className="py-16 md:py-24 bg-background relative -mt-16 z-20">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[60rem] bg-gold/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="container mx-auto px-4 relative">
          <div className="grid lg:grid-cols-12 gap-10">
            
            {/* Left: Contact Info & Premium Interactive Map */}
            <div className="lg:col-span-5 space-y-10">
              <Reveal direction="scale">
                <div className="p-8 md:p-10 rounded-none bg-white border border-border shadow-[0px_20px_50px_rgba(0,0,0,0.1)]">
                  <h3 className="text-3xl font-black font-serif mb-8 text-primary">Direct <span className="text-gradient-gold underline decoration-2 underline-offset-4">Contacts</span></h3>
                  
                  <div className="space-y-6">
                    {contactInfo.map((info, index) => {
                      const content = (
                        <div className="flex items-start gap-5 group">
                          <div className={`w-14 h-14 bg-primary/5 flex items-center justify-center flex-shrink-0 group-hover:bg-gold/10 transition-all duration-300`}>
                            <info.icon className="h-6 w-6 text-gold" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm text-foreground/60 tracking-wider uppercase mb-1 font-sans">{info.title}</h4>
                            {info.details.map((detail, i) => (
                              <p key={i} className="text-base font-semibold text-primary font-sans">{detail}</p>
                            ))}
                          </div>
                        </div>
                      );
                      
                      return (
                        <div key={index} className="pb-6 last:pb-0 last:border-0 border-b border-border/40">
                          {info.href ? <a href={info.href} className="block w-full">{content}</a> : content}
                        </div>
                      );
                    })}
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-border">
                    <a
                      href="https://www.instagram.com/aashley__2009/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-3 w-full py-4 bg-primary text-white font-bold uppercase tracking-widest text-sm hover:-translate-y-1 transition-transform duration-300 border-b-4 border-accent shadow-md"
                    >
                      <Instagram className="h-6 w-6 text-accent" />
                      Follow @aashley__2009
                    </a>
                  </div>
                </div>
              </Reveal>

              <Reveal direction="up" delay={150}>
                <div className="w-full bg-white p-2 border border-border h-[300px] shadow-sm">
                   <iframe
                     src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3887.762844593029!2d78.170699!3d12.987014700000001!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bade9007e687007%3A0xfdaee093d678a252!2sAashley%20International%20School!5e0!3m2!1sen!2sin!4v1773438717841!5m2!1sen!2sin"
                     width="100%"
                     height="100%"
                     className="border-0 filter grayscale-[20%] contrast-[1.1] hover:grayscale-0 transition-all duration-500"
                     allowFullScreen
                     loading="lazy"
                     referrerPolicy="no-referrer-when-downgrade"
                     title="Aashley International School Location"
                   />
                </div>
              </Reveal>
            </div>
            
            {/* Right: Message Form */}
            <div className="lg:col-span-7">
              <Reveal direction="scale" delay={100} className="h-full">
                <div className="h-full rounded-none border border-border border-l-[12px] border-l-primary shadow-[0px_20px_50px_rgba(0,0,0,0.1)] bg-white relative p-8 md:p-14">
                   
                   <div className="relative z-10 flex flex-col h-full">
                     <div className="mb-10">
                        <span className="bg-primary/5 text-primary font-bold px-3 py-1 text-[10px] uppercase tracking-widest inline-block mb-4">Online Inquiry</span>
                        <h2 className="text-4xl md:text-5xl font-serif font-black leading-tight text-primary">
                          Send Us a <span className="text-gradient-gold underline decoration-4 underline-offset-8">Message</span>
                        </h2>
                     </div>
                     
                     <Form {...form}>
                       <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6 flex-grow flex flex-col font-sans" noValidate>
                         <div className="grid md:grid-cols-2 gap-6">
                           <FormField control={form.control} name="name" render={({ field }) => (
                             <FormItem>
                               <FormLabel className="font-bold text-primary tracking-widest text-xs uppercase">Your Name *</FormLabel>
                               <FormControl><Input placeholder="John Doe" {...field} className="rounded-none bg-transparent border-border h-14 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent" /></FormControl>
                               <FormMessage />
                             </FormItem>
                           )} />
                           <FormField control={form.control} name="email" render={({ field }) => (
                             <FormItem>
                               <FormLabel className="font-bold text-primary tracking-widest text-xs uppercase">Email Address *</FormLabel>
                               <FormControl><Input type="email" placeholder="john@example.com" {...field} className="rounded-none bg-transparent border-border h-14 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent" /></FormControl>
                               <FormMessage />
                             </FormItem>
                           )} />
                         </div>
                         <div className="grid md:grid-cols-2 gap-6">
                           <FormField control={form.control} name="phone" render={({ field }) => (
                             <FormItem>
                               <FormLabel className="font-bold text-primary tracking-widest text-xs uppercase">Phone Number</FormLabel>
                               <FormControl><Input placeholder="+91 XXXXX XXXXX" {...field} value={field.value || ""} className="rounded-none bg-transparent border-border h-14 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent" /></FormControl>
                               <FormMessage />
                             </FormItem>
                           )} />
                           <FormField control={form.control} name="subject" render={({ field }) => (
                             <FormItem>
                               <FormLabel className="font-bold text-primary tracking-widest text-xs uppercase">Subject *</FormLabel>
                               <FormControl><Input placeholder="Admission Query" {...field} className="rounded-none bg-transparent border-border h-14 focus-visible:ring-1 focus-visible:ring-accent focus-visible:border-accent" /></FormControl>
                               <FormMessage />
                             </FormItem>
                           )} />
                         </div>
                         <FormField control={form.control} name="message" render={({ field }) => (
                           <FormItem className="flex-grow flex flex-col">
                             <FormLabel className="font-bold text-primary tracking-widest text-xs uppercase">Message *</FormLabel>
                             <FormControl><Textarea placeholder="How can we assist you today?" rows={6} {...field} className="rounded-none bg-transparent border-border flex-grow resize-none pt-4 focus-visible:ring-1 focus-visible:ring-gold focus-visible:border-gold" /></FormControl>
                             <FormMessage />
                           </FormItem>
                         )} />
                          <Button type="submit" className="w-full mt-auto bg-primary hover:bg-primary/95 text-white font-bold tracking-widest uppercase text-sm h-16 rounded-none shadow-none transition-all duration-300 border-b-4 border-gold" disabled={submitMessage.isPending}>
                            {submitMessage.isPending ? "Transmitting..." : <><Send className="mr-3 h-5 w-5 text-gold" /> Send Message</>}
                          </Button>
                       </form>
                     </Form>
                   </div>
                </div>
              </Reveal>
            </div>

          </div>
        </div>
      </section>

    </PublicLayout>
  );
}
