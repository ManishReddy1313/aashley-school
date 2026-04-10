import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import type { Announcement, Event, Resource } from "@shared/schema";
import { 
  GraduationCap, 
  LogOut,
  Bell,
  Calendar,
  FileText,
  CreditCard,
  Clock,
  Users,
  BookOpen,
  Settings,
  ChevronRight,
  AlertCircle,
  Download,
  Home,
  ShieldCheck,
  BarChart3,
  Briefcase,
  MessageSquare,
  UserCog,
  Megaphone
} from "lucide-react";
import { formatDistanceToNow, format, differenceInDays } from "date-fns";

export default function PortalDashboard() {
  const { user, isLoading: authLoading, isAuthenticated, logout, isAdmin, isSuperAdmin, isStaff, can } = useAuth();
  const [, setLocation] = useLocation();
  const isAdminRole = !!(isAdmin || isSuperAdmin);
  const isTeacherRole = !!(isStaff && can("students.read"));

  // Fetch announcements
  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/portal/announcements"],
    enabled: isAuthenticated,
  });

  // Fetch events
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/portal/events"],
    enabled: isAuthenticated,
  });

  // Fetch resources
  const { data: resources, isLoading: resourcesLoading } = useQuery<Resource[]>({
    queryKey: ["/api/portal/resources"],
    enabled: isAuthenticated,
  });

  const { data: adminUsers } = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: isAuthenticated && isAdminRole,
  });

  const { data: admissionEnquiries } = useQuery<any[]>({
    queryKey: ["/api/admin/admission-enquiries"],
    enabled: isAuthenticated && isAdminRole,
  });

  const { data: contactMessages } = useQuery<any[]>({
    queryKey: ["/api/admin/contact-messages"],
    enabled: isAuthenticated && isAdminRole,
  });

  const { data: jobApplications } = useQuery<any[]>({
    queryKey: ["/api/admin/applications"],
    enabled: isAuthenticated && isAdminRole,
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      setLocation("/portal");
    }
  }, [authLoading, isAuthenticated, setLocation]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const userInitials = user?.firstName && user?.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}` 
    : user?.email?.[0]?.toUpperCase() || "U";
  const roleLabel = (user?.role || "student").replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  // Calculate days left for events
  const upcomingEventsWithDays = events?.slice(0, 3).map(event => ({
    ...event,
    daysLeft: differenceInDays(new Date(event.eventDate), new Date()),
    formattedDate: format(new Date(event.eventDate), "MMM d"),
  })) || [];

  // Fallback data for demo purposes
  const displayAnnouncements = announcements?.length ? announcements : [
    { id: 1, title: "Term 2 Examination Schedule Released", priority: "high", createdAt: new Date() },
    { id: 2, title: "Fee Payment Deadline: Jan 10, 2025", priority: "high", createdAt: new Date() },
    { id: 3, title: "Winter Vacation: Dec 25 - Jan 5", priority: "normal", createdAt: new Date() },
    { id: 4, title: "Parent-Teacher Meeting on Jan 20", priority: "normal", createdAt: new Date() },
  ];

  const displayEvents = upcomingEventsWithDays.length ? upcomingEventsWithDays : [
    { title: "Term 2 Exams Begin", daysLeft: 18, formattedDate: "Jan 15" },
    { title: "Annual Day Rehearsals", daysLeft: 13, formattedDate: "Jan 10" },
    { title: "Science Exhibition", daysLeft: 39, formattedDate: "Feb 5" },
  ];

  const displayResources = resources?.slice(0, 4) || [
    { id: 1, title: "Term 2 Exam Schedule", fileType: "PDF", category: "Exam" },
    { id: 2, title: "Fee Structure 2024-25", fileType: "PDF", category: "Accounts" },
    { id: 3, title: "Holiday List", fileType: "PDF", category: "Calendar" },
    { id: 4, title: "Bus Route Map", fileType: "PDF", category: "Transport" },
  ];

  const adminStats = [
    {
      label: "Total Users",
      value: String(adminUsers?.length ?? 0),
      icon: UserCog,
      color: "text-primary",
    },
    {
      label: "Admissions",
      value: String(admissionEnquiries?.length ?? 0),
      icon: Users,
      color: "text-amber-600",
    },
    {
      label: "Contact Messages",
      value: String(contactMessages?.length ?? 0),
      icon: MessageSquare,
      color: "text-blue-600",
    },
    {
      label: "Applications",
      value: String(jobApplications?.length ?? 0),
      icon: Briefcase,
      color: "text-green-600",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-primary text-primary-foreground">
        {/* Live Ticker */}
        <div className="bg-accent py-2 overflow-hidden">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-4">
              <Badge variant="secondary" className="flex-shrink-0" data-testid="badge-live-updates">
                <Bell className="h-3 w-3 mr-1" />
                Live Updates
              </Badge>
              <div className="flex gap-8 animate-scroll whitespace-nowrap">
                {displayAnnouncements.map((ann: any) => (
                  <span key={ann.id} className="text-sm text-accent-foreground flex items-center gap-2" data-testid={`ticker-announcement-${ann.id}`}>
                    {ann.priority === "high" && <AlertCircle className="h-3 w-3 text-destructive" />}
                    {ann.title}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                <GraduationCap className="h-6 w-6" />
              </div>
              <div className="hidden sm:block">
                <span className="font-semibold">Aashley Portal</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/">
                <Button variant="ghost" size="sm" className="text-primary-foreground hover:bg-primary-foreground/10" data-testid="button-back-to-website">
                  <Home className="h-4 w-4 mr-2" />
                  Website
                </Button>
              </Link>
              <ThemeToggle />
              <div className="flex items-center gap-2" data-testid="user-info">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={user?.profileImageUrl || undefined} />
                  <AvatarFallback className="bg-accent text-accent-foreground text-sm">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-sm">
                  <div className="font-medium" data-testid="text-user-name">{user?.firstName || user?.email}</div>
                  <Badge variant="secondary" data-testid="badge-user-role">{roleLabel}</Badge>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-primary-foreground hover:bg-primary-foreground/10"
                onClick={() => logout()}
                data-testid="button-logout"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-welcome">
            Welcome back, {user?.firstName || "Student"}!
          </h1>
          <p className="text-muted-foreground">
            {isAdminRole
              ? "Manage operations, users, and communications from one place."
              : "Here's what's happening at Aashley today."}
          </p>
        </div>

        {isAdminRole ? (
          <div className="space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                    Admin Overview
                  </CardTitle>
                  <CardDescription>
                    Dynamic role-based view for {roleLabel}
                  </CardDescription>
                </div>
                <Badge variant="secondary" data-testid="badge-dashboard-role">
                  {isSuperAdmin ? "Super Admin Access" : "Admin Access"}
                </Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {adminStats.map((stat) => (
                    <Card key={stat.label} data-testid={`admin-stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}>
                      <CardContent className="p-4 text-center">
                        <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                        <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                        <div className="text-xs text-muted-foreground">{stat.label}</div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCog className="h-5 w-5 text-primary" />
                    User Management
                  </CardTitle>
                  <CardDescription>Create users and assign roles/permissions</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Link href="/portal/admin/users">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-admin-manage-users">
                      Manage Users
                    </Button>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    {isSuperAdmin
                      ? "You can manage all roles including Super Admin."
                      : "You can manage Staff and Student accounts."}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="h-5 w-5 text-primary" />
                    Content Management
                  </CardTitle>
                  <CardDescription>Announcements, resources, events, and stories</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full justify-start" data-testid="button-admin-manage-content">
                    Create or Publish Content
                  </Button>
                  <Link href="/portal/admin/classes">
                    <Button variant="outline" className="w-full justify-start" data-testid="button-admin-manage-classes">
                      Manage Classes
                    </Button>
                  </Link>
                  <div className="text-sm text-muted-foreground">
                    Use admin APIs to manage content by role visibility.
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-primary" />
                    Admissions
                  </CardTitle>
                  <CardDescription>Review admission enquiries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1" data-testid="text-admin-admissions-count">
                    {admissionEnquiries?.length ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">Pending and recent records</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Contact Inbox
                  </CardTitle>
                  <CardDescription>Monitor incoming contact messages</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1" data-testid="text-admin-contact-count">
                    {contactMessages?.length ?? 0}
                  </div>
                  <p className="text-sm text-muted-foreground">All website contact submissions</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Admin Notes
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground space-y-1">
                <p>Dashboard loads dynamically based on your role and permissions.</p>
                <p>Super Admin has full access; Admin has scoped user-management controls.</p>
              </CardContent>
            </Card>
          </div>
        ) : isTeacherRole ? (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-primary" />
                Teacher Workspace
              </CardTitle>
              <CardDescription>
                Manage students assigned to your classes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/portal/teacher/students">
                <Button variant="outline" className="w-full justify-start" data-testid="button-teacher-manage-students">
                  Manage My Students
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                Access is limited to students in your assigned classes.
              </p>
            </CardContent>
          </Card>
        </div>
        ) : (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Announcements & Events */}
          <div className="lg:col-span-2 space-y-6">
            {/* Announcements */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    Announcements
                  </CardTitle>
                  <CardDescription>Important updates and circulars</CardDescription>
                </div>
                <Button variant="ghost" size="sm" data-testid="button-view-all-announcements">
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {displayAnnouncements.map((ann: any) => (
                      <div 
                        key={ann.id} 
                        className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                        data-testid={`announcement-${ann.id}`}
                      >
                        <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                          ann.priority === "high" ? "bg-destructive" : "bg-muted-foreground"
                        }`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium">{ann.title}</div>
                          <div className="text-sm text-muted-foreground">
                            {ann.createdAt ? formatDistanceToNow(new Date(ann.createdAt), { addSuffix: true }) : "Recently"}
                          </div>
                        </div>
                        {ann.priority === "high" && (
                          <Badge variant="destructive">Urgent</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="grid md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid md:grid-cols-3 gap-4">
                    {displayEvents.map((event: any, index: number) => (
                      <div 
                        key={index}
                        className="p-4 rounded-lg bg-muted/50 text-center"
                        data-testid={`event-${index}`}
                      >
                        <div className="text-3xl font-bold text-primary mb-1">{event.daysLeft}</div>
                        <div className="text-sm text-muted-foreground mb-2">days left</div>
                        <div className="font-medium text-sm">{event.title}</div>
                        <div className="text-xs text-muted-foreground">{event.formattedDate}</div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: BookOpen, label: "Attendance", value: "95%", color: "text-green-600" },
                { icon: FileText, label: "Assignments", value: "3 Due", color: "text-amber-600" },
                { icon: CreditCard, label: "Fee Status", value: "Paid", color: "text-green-600" },
                { icon: Clock, label: "Next Class", value: "Math", color: "text-primary" },
              ].map((stat, index) => (
                <Card key={index} data-testid={`stat-${index}`}>
                  <CardContent className="p-4 text-center">
                    <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                    <div className={`text-xl font-bold ${stat.color}`}>{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Right Column - Resources & Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Calendar, label: "Exam Schedule" },
                    { icon: CreditCard, label: "Fee Details" },
                    { icon: FileText, label: "Circulars" },
                    { icon: Users, label: "PTM Schedule" },
                  ].map((action, index) => (
                    <Button 
                      key={index}
                      variant="outline" 
                      className="h-auto py-4 flex-col gap-2"
                      data-testid={`action-${index}`}
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-xs">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Downloadable Resources */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-primary" />
                  Resources
                </CardTitle>
              </CardHeader>
              <CardContent>
                {resourcesLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4].map((i) => (
                      <Skeleton key={i} className="h-14 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {displayResources.map((resource: any, index: number) => (
                      <div 
                        key={resource.id || index}
                        className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover-elevate cursor-pointer"
                        data-testid={`resource-${index}`}
                      >
                        <FileText className="h-5 w-5 text-primary flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{resource.title}</div>
                          <div className="text-xs text-muted-foreground">{resource.fileType || "PDF"}</div>
                        </div>
                        <Download className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Help Card */}
            <Card className="bg-primary text-primary-foreground">
              <CardContent className="p-6 text-center">
                <GraduationCap className="h-10 w-10 mx-auto mb-3 text-accent" />
                <h3 className="font-semibold mb-2">Need Help?</h3>
                <p className="text-sm opacity-80 mb-4">
                  Contact the school office for any queries.
                </p>
                <Button variant="secondary" size="sm" className="bg-accent text-accent-foreground" data-testid="button-contact-support">
                  Contact Support
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
        )}
      </main>
    </div>
  );
}
