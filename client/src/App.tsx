import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { SEOHead } from "@/components/seo/seo-head";
import { JsonLdSchema } from "@/components/seo/json-ld-schema";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/theme-provider";
import { ActiveClassProvider } from "@/contexts/active-class-context";
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
import PortalAdmissionsPage from "@/pages/portal/admissions";
import LeadDetailPage from "@/pages/portal/admissions/lead-detail";
import StudentsPage from "@/pages/portal/students";
import StudentProfilePage from "@/pages/portal/students/profile";
import PortalAnnouncementsPage from "@/pages/portal/announcements";
import MessagesPage from "@/pages/portal/messages";
import ThreadPage from "@/pages/portal/messages/thread";
import MarksPage from "@/pages/portal/marks";
import TimetablePage from "@/pages/portal/timetable";

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
      <Route path="/portal/login" component={PortalLoginPage} />
      <Route path="/portal/dashboard" component={PortalDashboard} />
      <Route path="/portal/manage-users" component={ManageUsersPage} />
      <Route path="/portal/manage-classes" component={ManageClassesPage} />
      <Route path="/portal/admin/users" component={ManageUsersPage} />
      <Route path="/portal/admin/classes" component={ManageClassesPage} />
      <Route path="/portal/teacher/students" component={TeacherStudentsPage} />
      <Route path="/portal/admissions" component={PortalAdmissionsPage} />
      <Route path="/portal/admissions/:id" component={LeadDetailPage} />
      <Route path="/portal/announcements" component={PortalAnnouncementsPage} />
      <Route path="/portal/messages" component={MessagesPage} />
      <Route path="/portal/messages/:studentUserId/:classId" component={ThreadPage} />
      <Route path="/portal/marks" component={MarksPage} />
      <Route path="/portal/timetable" component={TimetablePage} />
      <Route path="/portal/students" component={StudentsPage} />
      <Route path="/portal/students/:userId" component={StudentProfilePage} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="aashley-theme">
      <ActiveClassProvider>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <SEOHead />
            <JsonLdSchema />
            <Toaster />
            <Loader />
            <Router />
          </TooltipProvider>
        </QueryClientProvider>
      </ActiveClassProvider>
    </ThemeProvider>
  );
}

export default App;
