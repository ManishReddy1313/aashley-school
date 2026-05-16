import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { useActiveClass } from "@/contexts/active-class-context";
import {
  BookOpen, CalendarDays, GraduationCap, Megaphone, MessageSquare,
  Users, School, UserPlus, ArrowRight, CheckCircle2, AlertTriangle,
  TrendingUp, Activity
} from "lucide-react";
import type { Announcement } from "@shared/schema";
import { useAuth } from "@/hooks/use-auth";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
})();

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function StatCard({
  label, value, icon: Icon, trend, iconBg, valueClass,
}: {
  label: string; value: string | number; icon: React.ComponentType<{ className?: string }>;
  trend?: string; iconBg?: string; valueClass?: string;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="pt-4">
        <div className="flex items-start justify-between mb-3">
          <div className={`h-9 w-9 grid place-items-center ${iconBg ?? "bg-primary/10"}`}>
            <Icon className="h-4 w-4 text-primary" />
          </div>
        </div>
        <p className={`font-serif text-4xl font-normal ${valueClass ?? "text-foreground"}`}>{value}</p>
        <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{label}</p>
        {trend ? <p className="text-xs text-muted-foreground mt-1">{trend}</p> : null}
      </CardContent>
    </Card>
  );
}

// ===================== ADMIN DASHBOARD =====================
function AdminDashboard({ user }: { user: any }) {
  const { data: adminUsers = [] } = useQuery<any[]>({ queryKey: ["/api/admin/users"] });
  const { data: classes = [] } = useQuery<any[]>({ queryKey: ["/api/admin/classes"] });
  const { data: admissionLeads = [] } = useQuery<any[]>({ queryKey: ["/api/admissions/leads"] });
  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/portal/announcements"] });
  const { data: unreadMessages } = useQuery<{ count: number }>({ queryKey: ["/api/messages/unread-count"] });

  const students = adminUsers.filter((u: any) => u.role === "student");
  const staff = adminUsers.filter((u: any) => u.role !== "student");

  const today = format(new Date(), "yyyy-MM-dd");
  const todayLeads = admissionLeads.filter((l: any) => l.createdAt && l.createdAt.slice(0, 10) === today);

  // Admissions funnel data
  const statusGroups: Record<string, number> = {};
  for (const lead of admissionLeads) {
    const s = lead.status ?? "unknown";
    statusGroups[s] = (statusGroups[s] ?? 0) + 1;
  }
  const funnelData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));

  // Students per class
  const classStudentCounts: Record<string, number> = {};
  for (const u of students) {
    if (u.classId) {
      classStudentCounts[u.classId] = (classStudentCounts[u.classId] ?? 0) + 1;
    }
  }
  const perClassData = classes.slice(0, 8).map((c: any) => ({
    name: `${c.name}${c.section ? ` ${c.section}` : ""}`.slice(0, 10),
    students: classStudentCounts[c.id] ?? 0,
  }));

  // Recent activity feed
  const feedItems = [
    ...admissionLeads.slice(0, 3).map((l: any) => ({
      id: `lead-${l.id}`,
      dot: "bg-primary",
      text: `New admission lead: ${l.studentName ?? "Unknown"}`,
      time: l.createdAt ? formatDistanceToNow(new Date(l.createdAt), { addSuffix: true }) : "recently",
      href: `/portal/admissions/${l.id}`,
    })),
    ...announcements.slice(0, 3).map((a: any) => ({
      id: `ann-${a.id}`,
      dot: "bg-gold",
      text: `Announcement: ${a.title}`,
      time: a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : "recently",
      href: "/portal/announcements",
    })),
    ...adminUsers.slice(0, 3).map((u: any) => ({
      id: `user-${u.id}`,
      dot: "bg-emerald-500",
      text: `New user: ${u.firstName ?? u.username}`,
      time: u.createdAt ? formatDistanceToNow(new Date(u.createdAt), { addSuffix: true }) : "recently",
      href: "/portal/manage-users",
    })),
  ].sort(() => Math.random() - 0.5).slice(0, 10);

  return (
    <div className="p-6 bg-secondary min-h-[calc(100vh-80px)] space-y-6">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            {getGreeting()}, {user.firstName ?? user.username}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {user.roleLabel ?? "Administrator"} · {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>
        <Badge variant="outline" className="rounded-lg shrink-0">{CURRENT_ACADEMIC_YEAR}</Badge>
      </div>

      {/* Stats Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="Total Students" value={students.length} icon={GraduationCap} iconBg="bg-primary/10" trend={`Across ${classes.length} classes`} />
        <StatCard label="Total Staff" value={staff.length} icon={Users} iconBg="bg-emerald-50" />
        <StatCard label="Total Classes" value={classes.length} icon={School} iconBg="bg-blue-50" />
      </div>

      {/* Stats Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard label="New Enquiries Today" value={todayLeads.length} icon={UserPlus} iconBg="bg-gold/10" />
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="flex items-start justify-between mb-3">
              <div className="h-9 w-9 grid place-items-center bg-orange-50">
                <TrendingUp className="h-4 w-4 text-orange-600" />
              </div>
              <Badge variant="outline" className="text-xs rounded-lg">Coming Soon</Badge>
            </div>
            <p className="font-serif text-4xl font-normal text-foreground">—</p>
            <p className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Pending Fees</p>
          </CardContent>
        </Card>
        <StatCard label="Unread Messages" value={unreadMessages?.count ?? 0} icon={MessageSquare} iconBg="bg-purple-50" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif font-normal text-base">Admissions Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {funnelData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No admission data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={funnelData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif font-normal text-base">Students per Class</CardTitle>
          </CardHeader>
          <CardContent>
            {perClassData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No class data</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={perClassData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="students" fill="hsl(var(--gold))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Activity Feed */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="font-serif font-normal text-base">Recent Activity</CardTitle>
            <Link href="/portal/admissions"><a className="text-xs text-primary hover:underline">View all</a></Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {feedItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            ) : feedItems.map((item) => (
              <Link key={item.id} href={item.href}>
                <a className="flex items-start gap-3 hover:bg-secondary/50 -mx-2 px-2 py-1 rounded-none transition-colors">
                  <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${item.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{item.text}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                </a>
              </Link>
            ))}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif font-normal text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { label: "+ New Announcement", desc: "Post to students and parents", href: "/portal/announcements", icon: Megaphone },
              { label: "View Admissions", desc: "Review and manage leads", href: "/portal/admissions", icon: UserPlus },
              { label: "Manage Users", desc: "Add or edit staff and students", href: "/portal/manage-users", icon: Users },
              { label: "Manage Classes", desc: "Configure classes and assignments", href: "/portal/manage-classes", icon: School },
            ].map((action) => {
              const Icon = action.icon;
              return (
                <Link key={action.href} href={action.href}>
                  <a className="flex items-center gap-3 px-3 py-2.5 border border-border hover:border-primary/30 hover:bg-primary/5 transition-colors">
                    <Icon className="h-4 w-4 text-primary shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground ml-auto shrink-0" />
                  </a>
                </Link>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===================== TEACHER DASHBOARD =====================
function TeacherDashboard({ user }: { user: any }) {
  const { activeClassId, activeClass } = useActiveClass();
  const today = format(new Date(), "yyyy-MM-dd");

  // Use context from useActiveClass
  const { data: myStudents = [] } = useQuery<any[]>({
    queryKey: ["/api/admin/students", activeClassId],
    queryFn: async () => {
      if (!activeClassId) return [];
      const res = await fetch(`/api/admin/students?classId=${activeClassId}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!activeClassId,
  });
  const { data: todayAttendance = [] } = useQuery<any[]>({
    queryKey: ["/api/attendance", activeClassId, today],
    queryFn: async () => {
      if (!activeClassId) return [];
      const res = await fetch(`/api/attendance/${activeClassId}?date=${today}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!activeClassId,
  });
  const { data: homework = [] } = useQuery<any[]>({
    queryKey: ["/api/homework", activeClassId, CURRENT_ACADEMIC_YEAR],
    queryFn: async () => {
      if (!activeClassId) return [];
      const res = await fetch(`/api/homework/${activeClassId}?academicYear=${CURRENT_ACADEMIC_YEAR}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!activeClassId,
  });
  const { data: unreadMessages } = useQuery<{ count: number }>({ queryKey: ["/api/messages/unread-count"] });

  const present = todayAttendance.filter((r: any) => r.status === "present").length;
  const absent = todayAttendance.filter((r: any) => r.status === "absent").length;
  const totalMarked = todayAttendance.filter((r: any) => r.status !== null).length;
  const attendanceMarked = totalMarked > 0 && totalMarked >= myStudents.length;

  const thisWeekStart = format(new Date(Date.now() - 7 * 86400000), "yyyy-MM-dd");
  const weeklyHomework = homework.filter((h: any) => h.createdAt && h.createdAt.slice(0, 10) >= thisWeekStart);

  // Attendance trend data (last 7 days placeholder)
  const trendData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() - (6 - i) * 86400000);
    return { date: format(d, "EEE"), pct: Math.round(70 + Math.random() * 25) };
  });

  // Homework by subject
  const subjectCounts: Record<string, number> = {};
  for (const h of homework) {
    subjectCounts[h.subjectName] = (subjectCounts[h.subjectName] ?? 0) + 1;
  }
  const homeworkData = Object.entries(subjectCounts).slice(0, 6).map(([name, count]) => ({ name, count }));

  return (
    <div className="p-6 bg-secondary min-h-[calc(100vh-80px)] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl text-foreground">
            {getGreeting()}, {user.firstName ?? user.username}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Class Teacher · {format(new Date(), "EEEE, d MMMM yyyy")}
          </p>
        </div>
        <Badge variant="outline" className="rounded-lg shrink-0">{CURRENT_ACADEMIC_YEAR}</Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="My Students" value={myStudents.length} icon={GraduationCap} />
        <StatCard
          label="Today's Attendance"
          value={attendanceMarked ? `${present}/${myStudents.length}` : "—"}
          icon={CheckCircle2}
          iconBg={attendanceMarked ? "bg-emerald-50" : "bg-orange-50"}
          trend={attendanceMarked ? `${absent} absent` : "Not marked"}
        />
        <StatCard label="Homework This Week" value={weeklyHomework.length} icon={BookOpen} iconBg="bg-blue-50" />
        <StatCard label="Unread Messages" value={unreadMessages?.count ?? 0} icon={MessageSquare} iconBg="bg-purple-50" />
      </div>

      {/* Attendance Card */}
      {!attendanceMarked ? (
        <div className="flex items-start gap-4 p-5 bg-orange-50 border border-orange-200">
          <AlertTriangle className="h-5 w-5 text-orange-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-orange-900">Attendance not marked for today</p>
            <p className="text-sm text-orange-700 mt-0.5">Take a few minutes to mark today's attendance.</p>
          </div>
          <Link href="/portal/attendance">
            <a>
              <Button size="sm">Mark Attendance Now →</Button>
            </a>
          </Link>
        </div>
      ) : (
        <div className="flex items-start gap-4 p-4 bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="h-5 w-5 text-emerald-600 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-emerald-900">Attendance marked · {present} present, {absent} absent</p>
          </div>
          <Link href="/portal/attendance">
            <a className="text-sm text-emerald-700 hover:underline">View Details</a>
          </Link>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif font-normal text-base">Attendance Trend (Last 7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={trendData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v) => [`${v}%`, "Present"]} />
                <Line type="monotone" dataKey="pct" stroke="hsl(var(--primary))" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif font-normal text-base">Homework by Subject</CardTitle>
          </CardHeader>
          <CardContent>
            {homeworkData.length === 0 ? (
              <div className="h-44 flex items-center justify-center text-muted-foreground text-sm">No homework yet</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={homeworkData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--gold))" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="font-serif font-normal text-base">Recent Homework</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {homework.slice(0, 5).length === 0 ? (
              <p className="text-sm text-muted-foreground">No homework posted yet</p>
            ) : homework.slice(0, 5).map((h: any) => (
              <div key={h.id} className="flex items-center justify-between gap-2 py-1.5 border-b border-border/50">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{h.title}</p>
                  <p className="text-xs text-muted-foreground">{h.subjectName}</p>
                </div>
                <span className="text-xs text-muted-foreground shrink-0">Due {h.dueDate}</span>
              </div>
            ))}
            <Link href="/portal/homework"><a className="text-xs text-primary hover:underline">View all homework →</a></Link>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-2 flex flex-row items-center justify-between">
            <CardTitle className="font-serif font-normal text-base">Messages</CardTitle>
            <Link href="/portal/messages"><a className="text-xs text-primary hover:underline">Open Messages</a></Link>
          </CardHeader>
          <CardContent>
            {(unreadMessages?.count ?? 0) > 0 ? (
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                <p className="text-sm">You have <strong>{unreadMessages!.count}</strong> unread message(s)</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No unread messages</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ===================== STUDENT DASHBOARD =====================
function StudentDashboard({ user }: { user: any }) {
  const { data: announcements = [] } = useQuery<Announcement[]>({ queryKey: ["/api/portal/announcements"] });
  const { data: attendanceSummary } = useQuery<any>({
    queryKey: ["/api/student/attendance", CURRENT_ACADEMIC_YEAR],
    queryFn: async () => {
      const res = await fetch(`/api/student/attendance?academicYear=${CURRENT_ACADEMIC_YEAR}`, { credentials: "include" });
      if (!res.ok) return null;
      return res.json();
    },
  });
  const { data: homework = [] } = useQuery<any[]>({
    queryKey: ["/api/student/homework", CURRENT_ACADEMIC_YEAR],
    queryFn: async () => {
      const res = await fetch(`/api/student/homework?academicYear=${CURRENT_ACADEMIC_YEAR}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
  });
  const { data: unreadMessages } = useQuery<{ count: number }>({ queryKey: ["/api/messages/unread-count"] });

  const today = format(new Date(), "yyyy-MM-dd");
  const present = attendanceSummary?.present ?? 0;
  const absent = attendanceSummary?.absent ?? 0;
  const late = attendanceSummary?.late ?? 0;
  const total = attendanceSummary?.total ?? 0;
  const attendancePct = total > 0 ? Math.round((present / total) * 100) : 0;

  const dueToday = homework.filter((h: any) => h.dueDate === today);

  // Group homework by day of week
  const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const upcomingHw = homework.filter((h: any) => h.dueDate >= today).slice(0, 10);

  return (
    <div className="p-6 bg-secondary min-h-[calc(100vh-80px)] space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary text-primary-foreground grid place-items-center font-serif text-xl font-semibold">
            {(user.firstName?.[0] ?? user.username?.[0] ?? "S").toUpperCase()}
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground">
              {user.firstName ?? user.username}
            </h2>
            <p className="text-sm text-muted-foreground">{CURRENT_ACADEMIC_YEAR} · {user.username}</p>
          </div>
        </div>
      </div>

      {/* Today's Status Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Card className={`shadow-sm border-l-4 ${attendanceSummary ? "border-l-emerald-500" : "border-l-border"}`}>
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Attendance Today</p>
            <p className={`font-serif text-xl mt-1 ${attendanceSummary ? "text-emerald-700" : "text-muted-foreground"}`}>
              {attendanceSummary ? "Present" : "Not marked yet"}
            </p>
          </CardContent>
        </Card>
        <Card className={`shadow-sm border-l-4 ${dueToday.length > 0 ? "border-l-orange-400" : "border-l-border"}`}>
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Homework Due Today</p>
            <p className={`font-serif text-xl mt-1 ${dueToday.length > 0 ? "text-orange-700" : "text-foreground"}`}>
              {dueToday.length > 0 ? `${dueToday.length} assignment${dueToday.length > 1 ? "s" : ""}` : "None"}
            </p>
            {dueToday.length > 0 && (
              <p className="text-xs text-muted-foreground mt-0.5">{dueToday.map((h: any) => h.subjectName).join(", ")}</p>
            )}
          </CardContent>
        </Card>
        <Card className="shadow-sm border-l-4 border-l-border">
          <CardContent className="pt-4">
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Messages</p>
            <p className="font-serif text-xl mt-1 text-foreground">
              {(unreadMessages?.count ?? 0) > 0 ? `${unreadMessages!.count} unread` : "None"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif font-normal text-base">This Week's Homework</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {upcomingHw.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No homework this week 🎉</p>
              ) : upcomingHw.map((h: any) => (
                <div key={h.id} className="flex items-start justify-between gap-2 py-1.5 border-b border-border/50">
                  <div className="min-w-0">
                    <span className="inline-block px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-lg mr-2">{h.subjectName}</span>
                    <span className="text-sm">{h.title}</span>
                  </div>
                  <span className={`text-xs shrink-0 ${h.dueDate === today ? "text-destructive font-medium" : "text-muted-foreground"}`}>
                    {h.dueDate === today ? "Today!" : h.dueDate}
                  </span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif font-normal text-base">Recent Exam Results</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground py-2">No recent results</p>
              <Link href="/portal/marks"><a className="text-xs text-primary hover:underline">View all marks →</a></Link>
            </CardContent>
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif font-normal text-base">Attendance Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`w-20 h-20 rounded-full border-4 grid place-items-center ${attendancePct >= 75 ? "border-emerald-400" : attendancePct >= 60 ? "border-orange-400" : "border-destructive"}`}>
                  <span className={`font-serif text-xl ${attendancePct >= 75 ? "text-emerald-700" : attendancePct >= 60 ? "text-orange-700" : "text-destructive"}`}>
                    {attendancePct}%
                  </span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span className="text-muted-foreground">Present:</span>
                    <span className="font-medium">{present}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <span className="text-muted-foreground">Absent:</span>
                    <span className="font-medium">{absent}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="h-2 w-2 rounded-full bg-orange-400" />
                    <span className="text-muted-foreground">Late:</span>
                    <span className="font-medium">{late}</span>
                  </div>
                </div>
              </div>
              {attendancePct < 75 && total > 0 && (
                <div className="mt-3 flex items-center gap-1.5 text-orange-700 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5" />
                  Below 75% — attendance at risk
                </div>
              )}
              <Link href="/portal/attendance"><a className="text-xs text-primary hover:underline mt-2 block">View full report →</a></Link>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="font-serif font-normal text-base">Latest Announcements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {announcements.slice(0, 3).length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements</p>
              ) : announcements.slice(0, 3).map((a: any) => (
                <div key={a.id} className="py-1.5 border-b border-border/50">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Badge variant="outline" className="text-xs rounded-lg">{a.type}</Badge>
                    {a.priority === "high" && <Badge className="text-xs rounded-lg bg-destructive">Urgent</Badge>}
                  </div>
                  <p className="text-sm font-medium">{a.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.createdAt ? formatDistanceToNow(new Date(a.createdAt), { addSuffix: true }) : ""}
                  </p>
                </div>
              ))}
              <Link href="/portal/announcements"><a className="text-xs text-primary hover:underline">View all →</a></Link>
            </CardContent>
          </Card>

          {(unreadMessages?.count ?? 0) > 0 && (
            <Card className="shadow-sm border-l-4 border-l-primary">
              <CardContent className="pt-4">
                <p className="text-sm font-medium">You have {unreadMessages!.count} unread message(s)</p>
                <Link href="/portal/messages">
                  <a><Button size="sm" className="mt-2">Open Messages →</Button></a>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

// ===================== MAIN EXPORT =====================
export default function PortalDashboard() {
  const { user, isLoading, isAuthenticated, isAdmin, isSuperAdmin, isPrincipal, isClassTeacher, isSubjectTeacher } = useAuth();

  if (isLoading) return <PortalLayout><PageSkeleton /></PortalLayout>;
  if (!isAuthenticated || !user) return null;

  const isAdminRole = !!(isAdmin || isSuperAdmin || isPrincipal);
  const isTeacherRole = !!(isClassTeacher || isSubjectTeacher);

  return (
    <PortalLayout>
      {isAdminRole ? (
        <AdminDashboard user={user} />
      ) : isTeacherRole ? (
        <TeacherDashboard user={user} />
      ) : (
        <StudentDashboard user={user} />
      )}
    </PortalLayout>
  );
}
