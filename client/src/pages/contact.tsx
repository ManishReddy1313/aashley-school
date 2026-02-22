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
import { insertContactMessageSchema } from "@shared/schema";
import { z } from "zod";
import { 
  Phone, 
  Mail, 
  MapPin, 
  Clock,
  Send,
  Facebook,
  Twitter,
  Instagram,
  Youtube
} from "lucide-react";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    details: ["+91 81234 56789"],
  },
  {
    icon: Mail,
    title: "Email",
    details: ["info@aashleyschool.edu", "admissions@aashleyschool.edu"],
  },
  {
    icon: MapPin,
    title: "Address",
    details: ["Bangarpet Road, next to HP Gas Agency", "Budikote, Bangarapet, Kolar - 563114"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: ["Mon - Fri: 8:00 AM - 4:00 PM", "Sat: 9:00 AM - 1:00 PM"],
  },
];

const departments = [
  { name: "Admissions Office", email: "admissions@aashleyschool.edu", phone: "+91 81234 56789" },
  { name: "Principal's Office", email: "principal@aashleyschool.edu", phone: "+91 81234 56789" },
  { name: "Accounts Department", email: "accounts@aashleyschool.edu", phone: "+91 81234 56789" },
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
  
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });

  const submitMessage = useMutation({
    mutationFn: async (data: FormData) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent!",
        description: "Thank you for reaching out. We'll get back to you soon.",
      });
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    submitMessage.mutate(data);
  };

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4 bg-accent text-accent-foreground" data-testid="badge-contact">
              Get in Touch
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              We'd Love to <span className="text-accent">Hear From You</span>
            </h1>
            <p className="text-lg opacity-90">
              Have questions about admissions, academics, or anything else? 
              We're here to help.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {contactInfo.map((info, index) => (
              <Card key={index} data-testid={`contact-info-${index}`}>
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <info.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold mb-2">{info.title}</h3>
                  {info.details.map((detail, i) => (
                    <p key={i} className="text-sm text-muted-foreground">{detail}</p>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send Us a Message</h2>
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
                              <FormLabel>Your Name *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter your name" 
                                  {...field} 
                                  data-testid="input-contact-name"
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
                                  data-testid="input-contact-email"
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
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Phone Number</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Enter phone number" 
                                  {...field}
                                  value={field.value || ""}
                                  data-testid="input-contact-phone"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="subject"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Subject *</FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="What is this about?" 
                                  {...field} 
                                  data-testid="input-contact-subject"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Message *</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write your message here..."
                                rows={5}
                                {...field}
                                data-testid="textarea-contact-message"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={submitMessage.isPending}
                        data-testid="button-send-message"
                      >
                        {submitMessage.isPending ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>

            {/* Map & Quick Contacts */}
            <div className="space-y-8">
              {/* Map placeholder */}
              <div>
                <h2 className="text-3xl font-bold mb-6">Find Us</h2>
                <div className="aspect-video bg-muted rounded-lg flex items-center justify-center" data-testid="map-placeholder">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.0!2d78.17!3d12.99!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDU5JzI0LjAiTiA3OMKwMTAnMTIuMCJF!5e0!3m2!1sen!2sin!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0, minHeight: "300px" }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Aashley International School Location"
                    data-testid="map-embed"
                  />
                </div>
              </div>

              {/* Department Contacts */}
              <div>
                <h3 className="text-xl font-bold mb-4">Department Contacts</h3>
                <div className="space-y-3">
                  {departments.map((dept, index) => (
                    <Card key={index} className="hover-elevate" data-testid={`dept-${index}`}>
                      <CardContent className="p-4">
                        <div className="font-medium mb-1">{dept.name}</div>
                        <div className="text-sm text-muted-foreground flex flex-wrap gap-4">
                          <span className="flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {dept.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {dept.phone}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="text-xl font-bold mb-4">Connect With Us</h3>
                <div className="flex gap-3">
                  <a href="#" className="w-12 h-12 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" data-testid="social-facebook">
                    <Facebook className="h-6 w-6 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" data-testid="social-twitter">
                    <Twitter className="h-6 w-6 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" data-testid="social-instagram">
                    <Instagram className="h-6 w-6 text-primary" />
                  </a>
                  <a href="#" className="w-12 h-12 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center transition-colors" data-testid="social-youtube">
                    <Youtube className="h-6 w-6 text-primary" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
