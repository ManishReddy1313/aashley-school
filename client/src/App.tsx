import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { SEOHead } from "@/components/seo/seo-head";
import { JsonLdSchema } from "@/components/seo/json-ld-schema";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "@/pages/not-found";
import { Loader } from "@/components/loader";

// Public Pages
import HomePage from "@/pages/home";
import AboutPage from "@/pages/about";
import AcademicsPage from "@/pages/academics";
import AdmissionsPage from "@/pages/admissions";
import GalleryPage from "@/pages/gallery";
import DayAtAashleyPage from "@/pages/day-at-aashley";
import NewsPage from "@/pages/news";
import AlumniPage from "@/pages/alumni";
import ContactPage from "@/pages/contact";
import WhyAashleyPage from "@/pages/why-aashley";
import CareersPage from "@/pages/careers";

// Portal Pages
import PortalLoginPage from "@/pages/portal/login";
import PortalDashboard from "@/pages/portal/dashboard";
import ManageUsersPage from "@/pages/portal/manage-users";
import ManageClassesPage from "@/pages/portal/manage-classes";
import TeacherStudentsPage from "@/pages/portal/teacher-students";

function Router() {
  return (
    <Switch>
      {/* Public Pages */}
      <Route path="/" component={HomePage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/academics" component={AcademicsPage} />
      <Route path="/admissions" component={AdmissionsPage} />
      <Route path="/gallery" component={GalleryPage} />
      <Route path="/day-at-aashley" component={DayAtAashleyPage} />
      {/* News page hidden for now */}
      {/* <Route path="/news" component={NewsPage} /> */}
      <Route path="/alumni" component={AlumniPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/why-aashley" component={WhyAashleyPage} />
      <Route path="/careers" component={CareersPage} />
      
      {/* Portal Pages */}
      <Route path="/portal" component={PortalLoginPage} />
      <Route path="/portal/dashboard" component={PortalDashboard} />
      <Route path="/portal/admin/users" component={ManageUsersPage} />
      <Route path="/portal/admin/classes" component={ManageClassesPage} />
      <Route path="/portal/teacher/students" component={TeacherStudentsPage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="aashley-theme">
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <SEOHead />
          <JsonLdSchema />
          <Toaster />
          <Loader />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
