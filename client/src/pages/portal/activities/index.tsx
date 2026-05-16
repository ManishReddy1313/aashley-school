import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { Activity, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useActiveClass } from "@/contexts/active-class-context";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CURRENT_ACADEMIC_YEAR = (() => {
  const now = new Date();
  const y = now.getFullYear();
  return now.getMonth() >= 3 ? `${y}-${String(y + 1).slice(2)}` : `${y - 1}-${String(y).slice(2)}`;
})();

type ActivityItem = {
  id: string;
  classId: string | null;
  type: string;
  title: string;
  description: string | null;
  activityDate: string;
  conductedByUserId: string | null;
  participants: string | null;
  academicYear: string;
  createdAt: string | null;
};

type ClassRow = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

export default function ActivitiesPage() {
  const { user, isAdmin, isSuperAdmin, isPrincipal, isClassTeacher, isSubjectTeacher, can } = useAuth();
  const { activeClassId, classes: teacherClasses } = useActiveClass();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const canCreate = can("content.create");

  const [academicYear, setAcademicYear] = useState(CURRENT_ACADEMIC_YEAR);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetType, setSheetType] = useState<"cocurricular" | "inclass">("cocurricular");
  const [form, setForm] = useState({
    classId: activeClassId ?? "",
    type: "cocurricular",
    title: "",
    description: "",
    activityDate: format(new Date(), "yyyy-MM-dd"),
    conductedBy: "",
  });

  const { data: classesData = [] } = useQuery<ClassRow[]>({
    queryKey: ["/api/admin/classes"],
    enabled: !!(isAdmin || isSuperAdmin || isPrincipal),
  });

  const { data: cocurricular = [], isLoading: loadingCo } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities", "cocurricular", academicYear],
    queryFn: async () => {
      const res = await fetch(`/api/activities?academicYear=${academicYear}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const all = await res.json() as ActivityItem[];
      return all.filter((a) => a.type === "cocurricular");
    },
  });

  const { data: inclass = [], isLoading: loadingIn } = useQuery<ActivityItem[]>({
    queryKey: ["/api/activities", "inclass", academicYear, activeClassId],
    queryFn: async () => {
      const params = new URLSearchParams({ academicYear });
      if (activeClassId) params.set("classId", activeClassId);
      const res = await fetch(`/api/activities?${params}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed");
      const all = await res.json() as ActivityItem[];
      return all.filter((a) => a.type === "inclass");
    },
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        classId: form.type === "inclass" ? (form.classId || null) : null,
        type: form.type,
        title: form.title,
        description: form.description || null,
        activityDate: form.activityDate,
        conductedByUserId: null,
        academicYear,
      };
      const res = await apiRequest("POST", "/api/activities", payload);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Activity added" });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
      setSheetOpen(false);
      setForm({ classId: activeClassId ?? "", type: sheetType, title: "", description: "", activityDate: format(new Date(), "yyyy-MM-dd"), conductedBy: "" });
    },
    onError: () => toast({ title: "Failed to add activity", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/activities/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Activity deleted" });
      queryClient.invalidateQueries({ queryKey: ["/api/activities"] });
    },
  });

  const openSheet = (type: "cocurricular" | "inclass") => {
    setSheetType(type);
    setForm((p) => ({ ...p, type, classId: activeClassId ?? "" }));
    setSheetOpen(true);
  };

  const allClasses = (classesData.length ? classesData : teacherClasses) as ClassRow[];

  return (
    <PortalLayout>
      <PageHeader
        title="Activities"
        subtitle="Co-curricular and classroom activities"
      />

      <div className="p-6 bg-secondary min-h-[calc(100vh-80px)]">
        <Tabs defaultValue="cocurricular">
          <TabsList className="mb-4">
            <TabsTrigger value="cocurricular">Co-curricular</TabsTrigger>
            <TabsTrigger value="inclass">Classroom Activities</TabsTrigger>
          </TabsList>

          {/* Co-curricular Tab */}
          <TabsContent value="cocurricular" className="space-y-4">
            <div className="flex justify-end">
              {canCreate && (
                <Button size="sm" onClick={() => openSheet("cocurricular")}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Activity
                </Button>
              )}
            </div>

            {loadingCo ? (
              <Card className="shadow-sm"><CardContent className="pt-6 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : cocurricular.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-muted-foreground">No co-curricular activities yet</p>
                  {canCreate && (
                    <Button size="sm" className="mt-4" onClick={() => openSheet("cocurricular")}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Add Activity
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {cocurricular.map((act) => (
                  <Card key={act.id} className="shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase tracking-wide text-primary">
                              {format(parseISO(act.activityDate), "dd MMM").toUpperCase()}
                            </span>
                            <Badge variant="secondary" className="text-xs rounded-lg">Co-curricular</Badge>
                          </div>
                          <h3 className="font-serif text-base font-normal text-foreground mb-1">{act.title}</h3>
                          {act.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2">{act.description}</p>
                          )}
                        </div>
                        {canCreate && (
                          <button onClick={() => deleteMutation.mutate(act.id)} className="text-muted-foreground hover:text-destructive transition-colors shrink-0">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Classroom Activities Tab */}
          <TabsContent value="inclass" className="space-y-4">
            <div className="flex justify-end">
              {canCreate && (
                <Button size="sm" onClick={() => openSheet("inclass")}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Log Activity
                </Button>
              )}
            </div>

            {loadingIn ? (
              <Card className="shadow-sm"><CardContent className="pt-6 text-center text-muted-foreground">Loading...</CardContent></Card>
            ) : inclass.length === 0 ? (
              <Card className="shadow-sm">
                <CardContent className="pt-8 pb-8 text-center">
                  <Activity className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
                  <p className="font-medium text-muted-foreground">No classroom activities logged</p>
                  {canCreate && (
                    <Button size="sm" className="mt-4" onClick={() => openSheet("inclass")}>
                      <Plus className="h-4 w-4 mr-1.5" />
                      Log Activity
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="pt-4">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Date</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Class</th>
                        <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Title</th>
                        <th className="text-left py-2 font-medium text-muted-foreground">Description</th>
                        {canCreate && <th className="py-2" />}
                      </tr>
                    </thead>
                    <tbody>
                      {inclass.map((act) => (
                        <tr key={act.id} className="border-b border-border/50 hover:bg-secondary/50">
                          <td className="py-3 pr-4 text-muted-foreground whitespace-nowrap">
                            {format(parseISO(act.activityDate), "d MMM yyyy")}
                          </td>
                          <td className="py-3 pr-4">
                            {act.classId ? (
                              <Badge variant="outline" className="rounded-lg text-xs">
                                {allClasses.find((c) => c.id === act.classId)?.name ?? act.classId.slice(0, 8)}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 font-medium">{act.title}</td>
                          <td className="py-3 text-muted-foreground max-w-xs truncate">{act.description ?? "—"}</td>
                          {canCreate && (
                            <td className="py-3 text-right">
                              <button onClick={() => deleteMutation.mutate(act.id)} className="text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal">
              {sheetType === "cocurricular" ? "Add Co-curricular Activity" : "Log Classroom Activity"}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {sheetType === "inclass" && allClasses.length > 0 && (
              <div className="space-y-1.5">
                <Label>Class</Label>
                <Select value={form.classId} onValueChange={(v) => setForm((p) => ({ ...p, classId: v }))}>
                  <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                  <SelectContent>
                    {allClasses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}{c.section ? ` ${c.section}` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>Title *</Label>
              <Input placeholder="Activity title" value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Textarea rows={3} placeholder="Describe the activity..." value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Activity Date *</Label>
              <Input type="date" value={form.activityDate} onChange={(e) => setForm((p) => ({ ...p, activityDate: e.target.value }))} />
            </div>
            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !form.title || !form.activityDate}
            >
              {createMutation.isPending ? "Saving..." : sheetType === "cocurricular" ? "Add Activity" : "Log Activity"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
}
