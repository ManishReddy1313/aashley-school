import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Bell, Briefcase, CalendarDays, Megaphone, MessageSquare, UserPlus, Users } from "lucide-react";
import type { Announcement, Event, Resource } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { StatCard } from "@/components/portal/stat-card";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type TeacherClass = { id: string };
type TeacherStudent = { id: string };

export default function PortalDashboard() {
  const {
    user,
    roleLabel,
    isLoading: authLoading,
    isAuthenticated,
    isAdmin,
    isSuperAdmin,
    isPrincipal,
    isClassTeacher,
    isSubjectTeacher,
    can,
  } = useAuth();

  const isAdminRole = !!(isAdmin || isSuperAdmin || isPrincipal);
  const isTeacherRole = !!(isClassTeacher || isSubjectTeacher);

  const { data: announcements, isLoading: announcementsLoading } = useQuery<Announcement[]>({
    queryKey: ["/api/portal/announcements"],
    enabled: isAuthenticated,
  });
  const { data: events, isLoading: eventsLoading } = useQuery<Event[]>({
    queryKey: ["/api/portal/events"],
    enabled: isAuthenticated,
  });
  const { data: resources } = useQuery<Resource[]>({
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
  const { data: teacherClasses } = useQuery<TeacherClass[]>({
    queryKey: ["/api/teacher/classes/me"],
    enabled: isAuthenticated && isTeacherRole,
  });
  const { data: teacherStudents } = useQuery<TeacherStudent[]>({
    queryKey: ["/api/teacher/students/me"],
    enabled: isAuthenticated && isTeacherRole,
  });
  const { data: unreadMessageData } = useQuery<{ count: number }>({
    queryKey: ["/api/messages/unread-count"],
    enabled: isAuthenticated && (can("chat.initiate") || can("chat.respond")),
  });

  if (authLoading || !isAuthenticated) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  const now = new Date();
  const hour = now.getHours();
  const greeting = hour >= 5 && hour <= 11 ? "morning" : hour >= 12 && hour <= 17 ? "afternoon" : "evening";
  const dateLabel = format(now, "EEEE, d MMMM yyyy");

  const recentAnnouncements = (announcements ?? [])
    .slice()
    .sort((a, b) => {
      const t1 = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const t2 = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return t2 - t1;
    })
    .slice(0, 5);

  const upcomingEvents = (events ?? [])
    .filter((event) => event.eventDate)
    .slice()
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
    .slice(0, 3);

  const unreadMessages = (contactMessages ?? []).filter((message) => !message?.isRead).length;
  const unreadChatCount = unreadMessageData?.count ?? 0;
  const newEnquiries = (admissionEnquiries ?? []).filter((entry) => entry?.status === "new_enquiry").length;

  const priorityDotClass = (priority?: string | null) => {
    if (priority === "high") return "bg-destructive";
    if (priority === "normal") return "bg-gold";
    return "bg-muted-foreground";
  };

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background">
        <div className="px-6 pt-6 pb-4">
          <h1 className="font-serif font-normal text-3xl text-foreground">
            Good {greeting}, {user?.firstName || user?.username}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Signed in as {roleLabel || "User"}</p>
          <p className="text-sm text-muted-foreground mt-1">{dateLabel}</p>
        </div>

        {isAdminRole ? (
          <div className="px-6 grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Users" value={adminUsers?.length ?? 0} icon={Users} accent="primary" />
            <StatCard label="New Enquiries" value={newEnquiries} icon={UserPlus} accent="gold" />
            <StatCard label="Unread Messages" value={unreadMessages} icon={MessageSquare} accent="danger" />
            <StatCard label="Job Applications" value={jobApplications?.length ?? 0} icon={Briefcase} accent="success" />
          </div>
        ) : isTeacherRole ? (
          <div className="px-6 grid grid-cols-2 gap-4 max-w-xl">
            <StatCard label="My Classes" value={teacherClasses?.length ?? 0} icon={CalendarDays} accent="primary" />
            <StatCard label="My Students" value={teacherStudents?.length ?? 0} icon={Users} accent="gold" />
            <StatCard
              label="Unread Messages"
              value={unreadChatCount}
              icon={MessageSquare}
              accent={unreadChatCount > 0 ? "danger" : "primary"}
              href="/portal/messages"
            />
          </div>
        ) : (
          <div className="px-6">
            <Card className="rounded-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-xl">Welcome to your portal</CardTitle>
                <CardDescription>
                  {resources?.length
                    ? `You have ${resources.length} learning resources available.`
                    : "Your academic updates will appear here once published."}
                </CardDescription>
              </CardHeader>
            </Card>
            {unreadChatCount > 0 ? (
              <Card className="rounded-none shadow-sm mt-4">
                <CardContent className="py-4 flex items-center justify-between gap-3">
                  <p className="text-sm text-foreground">
                    You have {unreadChatCount} unread message(s) from the class teacher.
                  </p>
                  <Link href="/portal/messages">
                    <Button variant="outline" className="rounded-none">Open Messages</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : null}
          </div>
        )}

        <div className="px-6 py-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_18rem] gap-6">
          <div className="space-y-6">
            <Card className="rounded-none shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="font-serif font-normal text-xl flex items-center gap-2">
                  <Bell className="h-5 w-5 text-primary" />
                  Recent Announcements
                </CardTitle>
                <Link href="/portal/announcements">
                  <a className="text-sm text-primary hover:underline">View All</a>
                </Link>
              </CardHeader>
              <CardContent>
                {announcementsLoading ? (
                  <div className="space-y-3">
                    <div className="h-12 bg-muted animate-pulse" />
                    <div className="h-12 bg-muted animate-pulse" />
                    <div className="h-12 bg-muted animate-pulse" />
                  </div>
                ) : recentAnnouncements.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No announcements yet</p>
                ) : (
                  <div className="space-y-3">
                    {recentAnnouncements.map((announcement) => (
                      <div key={announcement.id} className="flex items-center gap-3 border border-border p-3">
                        <span className={`h-2 w-2 ${priorityDotClass(announcement.priority)}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-foreground truncate">{announcement.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {announcement.createdAt
                              ? formatDistanceToNow(new Date(announcement.createdAt), { addSuffix: true })
                              : "Recently"}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="rounded-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-xl flex items-center gap-2">
                  <Megaphone className="h-5 w-5 text-primary" />
                  Upcoming Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="space-y-3">
                    <div className="h-12 bg-muted animate-pulse" />
                    <div className="h-12 bg-muted animate-pulse" />
                    <div className="h-12 bg-muted animate-pulse" />
                  </div>
                ) : upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div key={event.id} className="flex items-center gap-3 border border-border p-3">
                        <div className="bg-primary text-primary-foreground px-2 py-1 text-xs font-medium">
                          {format(new Date(event.eventDate), "dd MMM").toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm text-foreground truncate">{event.title}</p>
                          <p className="text-xs text-muted-foreground">{event.location || "Location to be announced"}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div>
            <Card className="rounded-none shadow-sm">
              <CardHeader>
                <CardTitle className="font-serif font-normal text-xl">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {isAdminRole ? (
                  <>
                    <Link href="/portal/announcements">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <Megaphone className="h-4 w-4" />
                        + New Announcement
                      </Button>
                    </Link>
                    <Link href="/portal/admissions">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <UserPlus className="h-4 w-4" />
                        View Admissions
                      </Button>
                    </Link>
                    <Link href="/portal/manage-users">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <Users className="h-4 w-4" />
                        Manage Users
                      </Button>
                    </Link>
                  </>
                ) : isClassTeacher ? (
                  <>
                    <Link href="/portal/manage-classes">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <CalendarDays className="h-4 w-4" />
                        My Classes
                      </Button>
                    </Link>
                    <Link href="/portal/marks">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <Users className="h-4 w-4" />
                        Enter Marks
                      </Button>
                    </Link>
                    <Link href="/portal/timetable">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <CalendarDays className="h-4 w-4" />
                        View Timetable
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link href="/portal/timetable">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <CalendarDays className="h-4 w-4" />
                        View Timetable
                      </Button>
                    </Link>
                    <Link href="/portal/marks">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <Users className="h-4 w-4" />
                        My Marks
                      </Button>
                    </Link>
                    <Link href="/portal/messages">
                      <Button variant="outline" className="w-full justify-start rounded-none">
                        <MessageSquare className="h-4 w-4" />
                        Message Teacher
                      </Button>
                    </Link>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
