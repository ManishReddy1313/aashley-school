import { useEffect, useMemo } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { MessageSquare } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";

type ThreadSummary = {
  studentUserId: string;
  classId: string;
  lastMessage: {
    message: string;
    createdAt: string | null;
  };
  unreadCount: number;
  studentFirstName: string | null;
  studentLastName: string | null;
  studentUsername: string;
};

type StudentProfileResponse = {
  user: { id: string; username: string; firstName: string | null; lastName: string | null };
  profile: { classId: string | null } | null;
};

type ClassRow = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

function getInitials(firstName: string | null, lastName: string | null, username: string) {
  const first = firstName?.trim()?.[0];
  const last = lastName?.trim()?.[0];
  if (first || last) return `${first ?? ""}${last ?? ""}`.toUpperCase();
  return username.slice(0, 2).toUpperCase();
}

export default function MessagesPage() {
  const [, setLocation] = useLocation();
  const { isLoading, isAuthenticated, can, user } = useAuth();
  const isTeacher = can("chat.respond");
  const isStudent = can("chat.initiate") && !isTeacher;

  useEffect(() => {
    if (!isLoading && isAuthenticated && !isTeacher && !isStudent) {
      setLocation("/portal/dashboard");
    }
  }, [isAuthenticated, isLoading, isStudent, isTeacher, setLocation]);

  const teacherThreadsQuery = useQuery<ThreadSummary[]>({
    queryKey: ["/api/messages/threads"],
    enabled: isAuthenticated && isTeacher,
  });

  const studentProfileQuery = useQuery<StudentProfileResponse>({
    queryKey: ["/api/student/profile"],
    enabled: isAuthenticated && isStudent,
  });

  const classesQuery = useQuery<ClassRow[]>({
    queryKey: ["/api/admin/classes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/classes", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated && isStudent,
  });

  const classNameById = useMemo(() => {
    return new Map(
      (classesQuery.data ?? []).map((row) => [
        row.id,
        `${row.name}${row.section ? ` - ${row.section}` : ""}`,
      ])
    );
  }, [classesQuery.data]);

  if (isLoading) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  if (!isTeacher && !isStudent) return null;

  if (isTeacher) {
    const threads = teacherThreadsQuery.data ?? [];
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background font-sans">
          <PageHeader title="Messages" subtitle="Parent conversations from your classes" />
          <div className="max-w-7xl mx-auto px-6 py-6">
            {teacherThreadsQuery.isLoading ? (
              <PageSkeleton />
            ) : threads.length === 0 ? (
              <Card className="rounded-none">
                <CardContent className="py-14 text-center">
                  <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="font-medium text-foreground">No messages yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Parents will appear here when they contact you.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {threads.map((thread) => {
                  const studentName =
                    `${thread.studentFirstName ?? ""} ${thread.studentLastName ?? ""}`.trim() ||
                    thread.studentUsername;
                  const preview = thread.lastMessage?.message ?? "";
                  const timeText = thread.lastMessage?.createdAt
                    ? formatDistanceToNow(new Date(thread.lastMessage.createdAt), { addSuffix: true })
                    : "Just now";
                  return (
                    <Link
                      key={`${thread.studentUserId}-${thread.classId}`}
                      href={`/portal/messages/${thread.studentUserId}/${thread.classId}`}
                    >
                      <a className="block border border-border p-3 hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-3 min-w-0">
                            <div className="h-10 w-10 bg-primary/10 text-primary grid place-items-center font-semibold text-sm">
                              {getInitials(thread.studentFirstName, thread.studentLastName, thread.studentUsername)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground">{studentName}</p>
                              <p className="text-sm text-muted-foreground truncate">{preview}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-xs text-muted-foreground">{timeText}</p>
                            {thread.unreadCount > 0 ? (
                              <span className="mt-1 ml-auto inline-flex min-w-[18px] h-[18px] items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold px-1">
                                {thread.unreadCount}
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </a>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </PortalLayout>
    );
  }

  const student = studentProfileQuery.data;
  const classId = student?.profile?.classId ?? null;
  const studentName =
    `${student?.user?.firstName ?? ""} ${student?.user?.lastName ?? ""}`.trim() || student?.user?.username || user?.username || "Student";
  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans">
        <PageHeader title="Messages" subtitle="Contact your class teacher" />
        <div className="max-w-7xl mx-auto px-6 py-6">
          {studentProfileQuery.isLoading ? (
            <PageSkeleton />
          ) : !classId ? (
            <Card className="rounded-none">
              <CardContent className="py-14 text-center">
                <MessageSquare className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">
                  No class is assigned to this student account yet. Contact the school admin.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              <div className="border border-border p-4">
                <p className="font-medium text-foreground">{studentName}</p>
                <p className="text-sm text-muted-foreground mt-1">Class {classNameById.get(classId) || classId}</p>
                <div className="mt-3">
                  <Link href={`/portal/messages/${student?.user?.id || user?.id}/${classId}`}>
                    <Button variant="outline" className="rounded-none">Message Teacher →</Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
