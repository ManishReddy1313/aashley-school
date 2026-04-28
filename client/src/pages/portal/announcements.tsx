import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format, formatDistanceToNow } from "date-fns";
import { Inbox, Plus, X } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type AnnouncementType = "school" | "class" | "section";
type AnnouncementPriority = "low" | "normal" | "high";

type AnnouncementRow = {
  id: string;
  title: string;
  content: string;
  priority: AnnouncementPriority;
  type: AnnouncementType;
  classId: string | null;
  createdByUserId: string | null;
  isActive: boolean;
  createdAt: string | null;
  expiresAt: string | null;
};

type ClassOption = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

const typeLabels: Record<AnnouncementType, string> = {
  school: "School-Wide",
  class: "Class",
  section: "Section",
};

const typeChipClass: Record<AnnouncementType, string> = {
  school: "bg-primary/5 text-primary",
  class: "bg-gold/10 text-gold-dark",
  section: "bg-secondary text-muted-foreground",
};

const typeChipText: Record<AnnouncementType, string> = {
  school: "🏫 School-Wide",
  class: "📚 Class",
  section: "📌 Section",
};

const cardAccentClass: Record<AnnouncementPriority, string> = {
  high: "border-l-destructive",
  normal: "border-l-gold",
  low: "border-l-border",
};

export default function PortalAnnouncementsPage() {
  const { user, isAuthenticated, isLoading, can } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTypeFilter, setActiveTypeFilter] = useState<"all" | AnnouncementType>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [type, setType] = useState<AnnouncementType>("school");
  const [priority, setPriority] = useState<AnnouncementPriority>("normal");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [classId, setClassId] = useState("");
  const [expiresOn, setExpiresOn] = useState("");

  const canPostSchool = can("announcements.school");
  const canPostClass = can("announcements.class");
  const canPostAny = canPostSchool || canPostClass;

  const announcementsQuery = useQuery<AnnouncementRow[]>({
    queryKey: ["/api/portal/announcements"],
    enabled: isAuthenticated && can("portal.read"),
  });

  const adminClassesQuery = useQuery<ClassOption[]>({
    queryKey: ["/api/admin/classes"],
    enabled:
      isAuthenticated &&
      canPostAny &&
      user?.role !== "class_teacher" &&
      user?.role !== "subject_teacher",
  });

  const teacherClassesQuery = useQuery<{ classIds: string[]; classes: ClassOption[] }>({
    queryKey: ["/api/teacher/classes/me"],
    enabled: isAuthenticated && canPostClass && (user?.role === "class_teacher" || user?.role === "subject_teacher"),
  });

  const visibleTypeOptions = useMemo(() => {
    const options: AnnouncementType[] = [];
    if (canPostSchool) options.push("school");
    if (canPostClass) {
      options.push("class");
      options.push("section");
    }
    return options;
  }, [canPostSchool, canPostClass]);

  const classOptions = useMemo(() => {
    if (user?.role === "class_teacher" || user?.role === "subject_teacher") {
      return teacherClassesQuery.data?.classes ?? [];
    }
    return adminClassesQuery.data ?? [];
  }, [adminClassesQuery.data, teacherClassesQuery.data, user?.role]);

  const filteredAnnouncements = useMemo(() => {
    const rows = announcementsQuery.data ?? [];
    return rows.filter((row) => (activeTypeFilter === "all" ? true : row.type === activeTypeFilter));
  }, [activeTypeFilter, announcementsQuery.data]);

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload: Record<string, unknown> = {
        title: title.trim(),
        content: content.trim(),
        type,
        priority,
      };
      if (type === "class" || type === "section") payload.classId = classId;
      if (expiresOn) payload.expiresAt = new Date(`${expiresOn}T23:59:59`).toISOString();
      const res = await apiRequest("POST", "/api/portal/announcements", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      setSheetOpen(false);
      setTitle("");
      setContent("");
      setClassId("");
      setExpiresOn("");
      setPriority("normal");
      setType(visibleTypeOptions[0] ?? "school");
      toast({ title: "Announcement posted", description: "Your announcement is now live." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to post announcement", description: error.message, variant: "destructive" });
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await apiRequest("PATCH", `/api/portal/announcements/${id}/deactivate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/portal/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/announcements"] });
      toast({ title: "Announcement deactivated" });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to deactivate", description: error.message, variant: "destructive" });
    },
  });

  if (isLoading) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  if (!can("portal.read")) {
    return (
      <PortalLayout>
        <div className="min-h-screen bg-background p-6">
          <Card className="rounded-none max-w-7xl mx-auto">
            <CardContent className="py-12 text-center">
              <p className="text-foreground font-medium">Access denied</p>
              <p className="text-sm text-muted-foreground mt-1">You do not have permission to view announcements.</p>
            </CardContent>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const submitDisabled =
    createMutation.isPending ||
    !title.trim() ||
    !content.trim() ||
    ((type === "class" || type === "section") && !classId);

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background font-sans">
        <PageHeader
          title="Announcements"
          subtitle="School notices and class updates"
          actions={
            canPostAny ? (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="rounded-none">
                    <Plus className="h-4 w-4" />
                    Post Announcement
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xl border-border">
                  <SheetHeader>
                    <SheetTitle className="font-serif font-normal text-2xl">Post Announcement</SheetTitle>
                    <SheetDescription>Create a new announcement for school or class audiences.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-6 space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm text-foreground">Type</label>
                      <div className="flex flex-wrap gap-2">
                        {visibleTypeOptions.map((option) => (
                          <button
                            key={option}
                            type="button"
                            className={`border px-3 py-2 text-sm ${
                              option === type
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                            }`}
                            onClick={() => setType(option)}
                          >
                            {typeLabels[option]}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-foreground">Title *</label>
                      <Input className="rounded-none" value={title} onChange={(e) => setTitle(e.target.value)} />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-foreground">Content *</label>
                      <Textarea
                        rows={4}
                        className="rounded-none"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm text-foreground">Priority</label>
                      <div className="flex gap-2">
                        {(["normal", "high"] as const).map((value) => (
                          <button
                            key={value}
                            type="button"
                            className={`border px-3 py-2 text-sm ${
                              value === priority
                                ? "bg-primary text-primary-foreground border-primary"
                                : "bg-card border-border text-muted-foreground hover:text-foreground hover:border-primary/40"
                            }`}
                            onClick={() => setPriority(value)}
                          >
                            {value === "normal" ? "Normal" : "High"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {(type === "class" || type === "section") ? (
                      <div className="space-y-2">
                        <label className="text-sm text-foreground">Class *</label>
                        <Select value={classId} onValueChange={setClassId}>
                          <SelectTrigger className="rounded-none">
                            <SelectValue placeholder="Select class" />
                          </SelectTrigger>
                          <SelectContent>
                            {classOptions.map((cls) => (
                              <SelectItem key={cls.id} value={cls.id}>
                                {`${cls.name}${cls.section ? ` - ${cls.section}` : ""} (${cls.academicYear})`}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      <label className="text-sm text-foreground">Expires on</label>
                      <Input type="date" className="rounded-none" value={expiresOn} onChange={(e) => setExpiresOn(e.target.value)} />
                    </div>

                    <Button className="w-full rounded-none" disabled={submitDisabled} onClick={() => createMutation.mutate()}>
                      {createMutation.isPending ? "Posting..." : "Post Announcement"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : undefined
          }
        />

        <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {(["all", "school", "class", "section"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                className={`shrink-0 border px-3 py-2 text-sm transition-colors ${
                  activeTypeFilter === tab
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/40 hover:text-foreground"
                }`}
                onClick={() => setActiveTypeFilter(tab)}
              >
                {tab === "all" ? "All" : typeLabels[tab]}
              </button>
            ))}
          </div>

          {announcementsQuery.isLoading ? (
            <PageSkeleton />
          ) : filteredAnnouncements.length === 0 ? (
            <Card className="rounded-none">
              <CardContent className="py-14 text-center">
                <Inbox className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                <p className="font-medium text-foreground">No announcements yet</p>
                <p className="text-sm text-muted-foreground mt-1">New school or class updates will appear here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredAnnouncements.map((row) => {
                const canDeactivate = row.createdByUserId === user?.id || canPostSchool;
                const createdAtText = row.createdAt
                  ? formatDistanceToNow(new Date(row.createdAt), { addSuffix: true })
                  : "Just now";
                const expiryText = row.expiresAt ? format(new Date(row.expiresAt), "dd MMM yyyy") : null;
                return (
                  <Card key={row.id} className={`rounded-none border-l-2 ${cardAccentClass[row.priority]}`}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={`rounded-none ${typeChipClass[row.type]}`}>{typeChipText[row.type]}</Badge>
                          </div>
                          <p className="font-medium text-foreground">{row.title}</p>
                          <p className="text-sm text-muted-foreground mt-1 overflow-hidden [display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical]">
                            {row.content}
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                            <span>{createdAtText}</span>
                            {expiryText ? <span>Expires on {expiryText}</span> : null}
                            {row.priority === "high" ? (
                              <Badge variant="destructive" className="rounded-none">
                                Urgent
                              </Badge>
                            ) : null}
                          </div>
                        </div>
                        {canDeactivate ? (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-none shrink-0"
                            onClick={() => {
                              if (!window.confirm("Deactivate this announcement?")) return;
                              deactivateMutation.mutate(row.id);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        ) : null}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </PortalLayout>
  );
}
