import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO, startOfWeek, addDays, isAfter } from "date-fns";
import { BookOpen, Plus, Trash2, List, Grid, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useActiveClass } from "@/contexts/active-class-context";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
})();

type HomeworkItem = {
  id: string;
  classId: string;
  subjectName: string;
  title: string;
  description: string;
  dueDate: string;
  attachmentUrl: string | null;
  createdByUserId: string;
  academicYear: string;
  createdAt: string | null;
};

const SUBJECT_COLORS: Record<string, string> = {};
const PALETTE = ["bg-blue-100 text-blue-800", "bg-purple-100 text-purple-800", "bg-emerald-100 text-emerald-800", "bg-orange-100 text-orange-800", "bg-pink-100 text-pink-800", "bg-cyan-100 text-cyan-800"];
let colorIdx = 0;
function subjectColor(name: string) {
  if (!SUBJECT_COLORS[name]) {
    SUBJECT_COLORS[name] = PALETTE[colorIdx % PALETTE.length];
    colorIdx++;
  }
  return SUBJECT_COLORS[name];
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function HomeworkPage() {
  const { user, isAdmin, isSuperAdmin, isPrincipal, isClassTeacher, isSubjectTeacher, can } = useAuth();
  const { activeClassId, activeClass } = useActiveClass();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isTeacher = !!(isClassTeacher || isSubjectTeacher);
  const isAdminRole = !!(isAdmin || isSuperAdmin || isPrincipal);
  const isStudent = user?.role === "student" || user?.role === "parent";
  const canPost = can("marks.enter");

  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [viewMode, setViewMode] = useState<"weekly" | "list">("weekly");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [form, setForm] = useState({ subjectName: "", title: "", description: "", dueDate: "", attachmentUrl: "" });

  const classId = activeClassId ?? "";

  const { data: teacherHomework = [], isLoading: teacherLoading } = useQuery<HomeworkItem[]>({
    queryKey: ["/api/homework", classId, academicYear],
    queryFn: async () => {
      if (!classId) return [];
      const res = await fetch(`/api/homework/${classId}?academicYear=${academicYear}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: !!(classId && (isTeacher || isAdminRole)),
  });

  const { data: studentHomework = [], isLoading: studentLoading } = useQuery<HomeworkItem[]>({
    queryKey: ["/api/student/homework", academicYear],
    queryFn: async () => {
      const res = await fetch(`/api/student/homework?academicYear=${academicYear}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    enabled: isStudent,
  });

  const homework = isStudent ? studentHomework : teacherHomework;
  const isLoading = isStudent ? studentLoading : teacherLoading;

  const postMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/homework/${classId}`, {
        ...form,
        academicYear,
        attachmentUrl: form.attachmentUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Homework posted" });
      queryClient.invalidateQueries({ queryKey: ["/api/homework", classId] });
      setSheetOpen(false);
      setForm({ subjectName: "", title: "", description: "", dueDate: "", attachmentUrl: "" });
    },
    onError: () => toast({ title: "Failed to post homework", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/homework/${classId}/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Homework deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/homework", classId] });
    },
    onError: () => toast({ title: "Failed to delete", variant: "destructive" }),
  });

  // Group by week day of due date
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weeklyGroups = useMemo(() => {
    const groups: Record<string, HomeworkItem[]> = {};
    DAYS.forEach((d) => (groups[d] = []));
    for (const hw of homework) {
      try {
        const due = parseISO(hw.dueDate);
        const dayName = format(due, "EEEE");
        if (groups[dayName] !== undefined) groups[dayName].push(hw);
        else groups[dayName] = [hw];
      } catch {}
    }
    return groups;
  }, [homework]);

  const today = format(new Date(), "yyyy-MM-dd");

  if (!classId && !isStudent) {
    return (
      <PortalLayout>
        <PageHeader title="Homework" />
        <div className="p-6 bg-secondary min-h-[calc(100vh-80px)] flex items-center justify-center">
          <Card className="shadow-sm max-w-sm w-full text-center p-8">
            <BookOpen className="h-8 w-8 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium">No class selected</p>
            <p className="text-sm text-muted-foreground mt-1">Select a class from the sidebar to view homework.</p>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  const subtitle = isStudent ? "My Homework" : activeClass ? `${activeClass.name}${activeClass.section ? ` ${activeClass.section}` : ""}` : "";

  return (
    <PortalLayout>
      <PageHeader
        title="Homework"
        subtitle={subtitle}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(v => v === "weekly" ? "list" : "weekly")}>
              {viewMode === "weekly" ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
            {canPost && !isStudent && (
              <Button size="sm" onClick={() => setSheetOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Post Homework
              </Button>
            )}
          </div>
        }
      />

      <div className="p-6 bg-secondary min-h-[calc(100vh-80px)]">
        {isLoading ? (
          <Card className="shadow-sm"><CardContent className="pt-6 text-center text-muted-foreground">Loading...</CardContent></Card>
        ) : homework.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <BookOpen className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No homework this week</p>
              {canPost && !isStudent && (
                <Button size="sm" className="mt-4" onClick={() => setSheetOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Post Homework
                </Button>
              )}
            </CardContent>
          </Card>
        ) : viewMode === "weekly" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {DAYS.map((day) => (
              <Card key={day} className="shadow-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wide">{day}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {(weeklyGroups[day] ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground/50 italic">No homework</p>
                  ) : (
                    (weeklyGroups[day] ?? []).map((hw) => {
                      const isPast = hw.dueDate < today;
                      return (
                        <div key={hw.id} className={`p-3 border border-border bg-card ${isPast ? "opacity-60" : ""}`}>
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <span className={`inline-block px-2 py-0.5 text-xs font-medium rounded-lg mb-1 ${subjectColor(hw.subjectName)}`}>{hw.subjectName}</span>
                              <p className="font-medium text-sm truncate">{hw.title}</p>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{hw.description}</p>
                            </div>
                            {canPost && !isStudent && (
                              <button
                                onClick={() => deleteMutation.mutate(hw.id)}
                                className="text-muted-foreground hover:text-destructive transition-colors shrink-0"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className={`text-xs mt-2 ${isPast ? "text-destructive" : "text-muted-foreground"}`}>
                            Due: {format(parseISO(hw.dueDate), "d MMM yyyy")}
                          </p>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="shadow-sm">
            <CardContent className="pt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Subject</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Due Date</th>
                    <th className="text-left py-2 font-medium text-muted-foreground">Posted</th>
                    {canPost && !isStudent && <th className="py-2" />}
                  </tr>
                </thead>
                <tbody>
                  {homework.map((hw) => {
                    const isPast = hw.dueDate < today;
                    return (
                      <tr key={hw.id} className="border-b border-border/50 hover:bg-secondary/50">
                        <td className="py-3 pr-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-lg ${subjectColor(hw.subjectName)}`}>{hw.subjectName}</span>
                        </td>
                        <td className="py-3 pr-4 font-medium">{hw.title}</td>
                        <td className={`py-3 pr-4 ${isPast ? "text-destructive" : "text-foreground"}`}>
                          {format(parseISO(hw.dueDate), "d MMM yyyy")}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {hw.createdAt ? format(new Date(hw.createdAt), "d MMM") : "—"}
                        </td>
                        {canPost && !isStudent && (
                          <td className="py-3 text-right">
                            <button
                              onClick={() => deleteMutation.mutate(hw.id)}
                              className="text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        )}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal">Post Homework</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Subject *</Label>
              <Input placeholder="e.g. Mathematics" value={form.subjectName} onChange={(e) => setForm((p) => ({ ...p, subjectName: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="e.g. Chapter 5 Exercise" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description *</Label>
              <Textarea rows={4} placeholder="Describe the homework..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date *</Label>
              <Input type="date" value={form.dueDate} onChange={(e) => setForm((p) => ({ ...p, dueDate: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Attachment URL (optional)</Label>
              <Input placeholder="https://..." value={form.attachmentUrl} onChange={(e) => setForm((p) => ({ ...p, attachmentUrl: e.target.value }))} />
            </div>
            <Button
              className="w-full"
              onClick={() => postMutation.mutate()}
              disabled={postMutation.isPending || !form.subjectName || !form.title || !form.description || !form.dueDate}
            >
              {postMutation.isPending ? "Posting..." : "Post Homework"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
}
