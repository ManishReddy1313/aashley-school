import { KeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type MessageRow = {
  id: string;
  senderRole: string;
  message: string;
  createdAt: string | null;
};

type StudentProfileResponse = {
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
};

type ClassRow = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

export default function ThreadPage() {
  const [, params] = useRoute("/portal/messages/:studentUserId/:classId");
  const studentUserId = params?.studentUserId ?? "";
  const classId = params?.classId ?? "";
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading, can } = useAuth();
  const isTeacher = can("chat.respond");
  const isParent = can("chat.initiate");
  const [draft, setDraft] = useState("");
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isLoading && !isTeacher && !isParent) {
      setLocation("/portal/dashboard");
    }
  }, [isLoading, isParent, isTeacher, setLocation]);

  const threadQuery = useQuery<MessageRow[]>({
    queryKey: ["/api/messages/thread", studentUserId, classId],
    queryFn: async () => {
      const response = await fetch(`/api/messages/thread/${studentUserId}/${classId}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isAuthenticated && !!studentUserId && !!classId,
    refetchInterval: 30000,
  });

  const studentQuery = useQuery<StudentProfileResponse>({
    queryKey: ["/api/students", studentUserId, "profile"],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentUserId}/profile`, { credentials: "include" });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    enabled: isAuthenticated && !!studentUserId,
  });

  const classesQuery = useQuery<ClassRow[]>({
    queryKey: ["/api/admin/classes"],
    queryFn: async () => {
      const response = await fetch("/api/admin/classes", { credentials: "include" });
      if (!response.ok) return [];
      return response.json();
    },
    enabled: isAuthenticated,
  });

  const markReadMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/messages/thread/${studentUserId}/${classId}/read`);
    },
  });

  useEffect(() => {
    if (!studentUserId || !classId || !isAuthenticated) return;
    markReadMutation.mutate();
  }, [classId, isAuthenticated, studentUserId]);

  const sendMutation = useMutation({
    mutationFn: async () => {
      const endpoint = isTeacher ? "/api/messages/respond" : "/api/messages/send";
      const response = await apiRequest("POST", endpoint, {
        studentUserId,
        classId,
        message: draft.trim(),
      });
      return response.json();
    },
    onSuccess: () => {
      setDraft("");
      queryClient.invalidateQueries({ queryKey: ["/api/messages/thread", studentUserId, classId] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["/api/messages/threads"] });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to send message", description: error.message, variant: "destructive" });
    },
  });

  const className = useMemo(() => {
    const row = (classesQuery.data ?? []).find((item) => item.id === classId);
    if (!row) return classId;
    return `${row.name}${row.section ? ` - ${row.section}` : ""}`;
  }, [classId, classesQuery.data]);

  const studentName = useMemo(() => {
    const user = studentQuery.data?.user;
    if (!user) return "Conversation";
    return `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim() || user.username;
  }, [studentQuery.data?.user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [threadQuery.data]);

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (!draft.trim() || sendMutation.isPending) return;
      sendMutation.mutate();
    }
  };

  if (isLoading || threadQuery.isLoading || studentQuery.isLoading) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  if (!isTeacher && !isParent) return null;

  const messages = threadQuery.data ?? [];
  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans flex flex-col">
        <PageHeader
          title={studentName}
          subtitle={className}
          backHref="/portal/messages"
          backLabel="Messages"
        />

        <div className="max-w-7xl mx-auto w-full px-6 py-6 flex-1 min-h-0">
          <Card className="rounded-none h-[calc(100vh-14rem)] flex flex-col">
            <CardContent className="p-0 flex-1 min-h-0 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <div className="h-full grid place-items-center text-center">
                    <p className="text-sm text-muted-foreground">
                      {isTeacher
                        ? "No messages yet. The parent hasn't sent a message yet."
                        : "Send a message to start the conversation with the class teacher."}
                    </p>
                  </div>
                ) : (
                  messages.map((message, index) => {
                    const isTeacherMessage = message.senderRole === "class_teacher";
                    const isSameAsPrev = index > 0 && messages[index - 1].senderRole === message.senderRole;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isTeacherMessage ? "justify-end" : "justify-start"}`}
                      >
                        <div className="max-w-[80%]">
                          {!isSameAsPrev ? (
                            <p className="text-xs text-muted-foreground mb-1">
                              {isTeacherMessage ? "Class Teacher" : "Parent"}
                            </p>
                          ) : null}
                          <div
                            className={`px-3 py-2 text-sm whitespace-pre-wrap ${
                              isTeacherMessage
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground border border-border"
                            }`}
                          >
                            {message.message}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">
                            {message.createdAt ? format(new Date(message.createdAt), "dd MMM, h:mm a") : ""}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              <div className="border-t border-border p-3 sticky bottom-0 bg-card">
                <div className="flex flex-col sm:flex-row gap-2">
                  <Textarea
                    rows={3}
                    className="rounded-none resize-none"
                    placeholder="Type a message..."
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={onKeyDown}
                  />
                  <Button
                    className="rounded-none sm:self-end"
                    disabled={!draft.trim() || sendMutation.isPending}
                    onClick={() => sendMutation.mutate()}
                  >
                    {sendMutation.isPending ? "Sending..." : "Send"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
