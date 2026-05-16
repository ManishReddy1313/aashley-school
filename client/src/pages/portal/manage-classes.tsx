import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Plus, School, Search, Trash2, UserPlus, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRow = { id: string; username: string; firstName: string | null; lastName: string | null; role: string };
type ClassRow = { id: string; name: string; section: string | null; academicYear: string; isActive: boolean };
type SubjectRow = { id: string; classId: string; name: string; academicYear: string };

function userName(u: UserRow) {
  return `${u.firstName ?? ""} ${u.lastName ?? ""}`.trim() || u.username;
}

function classLabel(cls: ClassRow) {
  return `${cls.name}${cls.section ? ` — ${cls.section}` : ""}`;
}

export default function ManageClassesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [createOpen, setCreateOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassRow | null>(null);
  const [createForm, setCreateForm] = useState({ name: "", section: "", academicYear: "2026-27" });
  const [searchTeacher, setSearchTeacher] = useState("");

  const classesQuery = useQuery<ClassRow[]>({ queryKey: ["/api/admin/classes"] });
  const usersQuery = useQuery<UserRow[]>({ queryKey: ["/api/admin/users"] });
  const subjectsQuery = useQuery<SubjectRow[]>({
    queryKey: ["/api/classes", selectedClass?.id, "subjects"],
    queryFn: async () => {
      if (!selectedClass) return [];
      const res = await fetch(`/api/classes/${selectedClass.id}/subjects?academicYear=${selectedClass.academicYear}`, { credentials: "include" });
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!selectedClass,
  });
  const assignmentsQuery = useQuery<{ teacherUserIds: string[]; studentUserIds: string[] }>({
    queryKey: ["/api/admin/classes", selectedClass?.id, "assignments"],
    enabled: !!selectedClass,
    queryFn: async () => {
      const res = await fetch(`/api/admin/classes/${selectedClass!.id}/assignments`, { credentials: "include" });
      if (!res.ok) return { teacherUserIds: [], studentUserIds: [] };
      return res.json();
    },
  });

  const teachers = useMemo(() => (usersQuery.data ?? []).filter((u) => u.role !== "student"), [usersQuery.data]);
  const students = useMemo(() => (usersQuery.data ?? []).filter((u) => u.role === "student"), [usersQuery.data]);
  const assignedTeacherIds = assignmentsQuery.data?.teacherUserIds ?? [];
  const assignedStudentIds = assignmentsQuery.data?.studentUserIds ?? [];

  const assignedTeachers = teachers.filter((t) => assignedTeacherIds.includes(t.id));
  const assignedStudents = students.filter((s) => assignedStudentIds.includes(s.id));
  const availableTeachers = teachers.filter((t) => !assignedTeacherIds.includes(t.id));

  const filteredAvailableTeachers = useMemo(
    () => availableTeachers.filter((t) => userName(t).toLowerCase().includes(searchTeacher.toLowerCase())),
    [availableTeachers, searchTeacher]
  );

  const [newSubjectName, setNewSubjectName] = useState("");

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/classes", {
        name: createForm.name,
        section: createForm.section || null,
        academicYear: createForm.academicYear,
        isActive: true,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/classes"] });
      setCreateForm({ name: "", section: "", academicYear: "2026-27" });
      setCreateOpen(false);
      toast({ title: "Class created" });
    },
    onError: (e: any) => toast({ title: e.message ?? "Failed to create class", variant: "destructive" }),
  });

  const addTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const newIds = [...assignedTeacherIds, teacherId];
      await apiRequest("PUT", `/api/admin/classes/${selectedClass!.id}/teachers`, { teacherUserIds: newIds });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/classes", selectedClass?.id, "assignments"] }),
  });

  const removeTeacherMutation = useMutation({
    mutationFn: async (teacherId: string) => {
      const newIds = assignedTeacherIds.filter((id) => id !== teacherId);
      await apiRequest("PUT", `/api/admin/classes/${selectedClass!.id}/teachers`, { teacherUserIds: newIds });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/classes", selectedClass?.id, "assignments"] }),
  });

  const removeStudentMutation = useMutation({
    mutationFn: async (studentId: string) => {
      const newIds = assignedStudentIds.filter((id) => id !== studentId);
      await apiRequest("PUT", `/api/admin/classes/${selectedClass!.id}/students`, { studentUserIds: newIds });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/classes", selectedClass?.id, "assignments"] }),
  });

  const addSubjectMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", `/api/classes/${selectedClass!.id}/subjects`, {
        name: newSubjectName,
        academicYear: selectedClass!.academicYear,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClass?.id, "subjects"] });
      setNewSubjectName("");
      toast({ title: "Subject added" });
    },
  });

  const deleteSubjectMutation = useMutation({
    mutationFn: async (subjectId: string) => {
      await apiRequest("DELETE", `/api/classes/${selectedClass!.id}/subjects/${subjectId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/classes", selectedClass?.id, "subjects"] }),
  });

  const openManage = (cls: ClassRow) => {
    setSelectedClass(cls);
    setManageOpen(true);
    setSearchTeacher("");
  };

  if (classesQuery.isLoading) return <PortalLayout><PageSkeleton /></PortalLayout>;

  const classes = classesQuery.data ?? [];

  return (
    <PortalLayout>
      <PageHeader
        title="Classes"
        subtitle="Manage classes, teachers and student assignments"
        actions={
          <Button size="sm" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Create Class
          </Button>
        }
      />

      <div className="p-6 bg-secondary min-h-[calc(100vh-80px)]">
        {classes.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="pt-8 pb-8 text-center">
              <School className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
              <p className="font-medium text-muted-foreground">No classes yet</p>
              <Button size="sm" className="mt-4" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4 mr-1.5" />
                Create First Class
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {classes.map((cls) => {
              const classTeacherCount = 0; // Would need separate query
              return (
                <Card key={cls.id} className="shadow-sm hover:shadow-md hover:border-primary/30 transition-all">
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-serif text-xl font-normal text-foreground">{classLabel(cls)}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs rounded-lg">{cls.academicYear}</Badge>
                          <Badge
                            className={`text-xs rounded-lg ${cls.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-secondary text-muted-foreground border border-border"}`}
                            variant="outline"
                          >
                            {cls.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openManage(cls)}>Manage</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                      <div className="flex gap-4 text-sm text-muted-foreground">
                        <span>Section: <strong className="text-foreground">{cls.section ?? "—"}</strong></span>
                      </div>
                      <Button size="sm" variant="outline" onClick={() => openManage(cls)}>
                        Manage →
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Class Sheet */}
      <Sheet open={createOpen} onOpenChange={setCreateOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal">Create Class</SheetTitle>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            <div className="space-y-1.5">
              <Label>Class Name *</Label>
              <Input placeholder="e.g. Grade 8" value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Section</Label>
              <Input placeholder="e.g. A" value={createForm.section} onChange={(e) => setCreateForm((p) => ({ ...p, section: e.target.value }))} />
            </div>
            <div className="space-y-1.5">
              <Label>Academic Year *</Label>
              <Input value={createForm.academicYear} onChange={(e) => setCreateForm((p) => ({ ...p, academicYear: e.target.value }))} />
            </div>
            <Button
              className="w-full"
              onClick={() => createMutation.mutate()}
              disabled={createMutation.isPending || !createForm.name}
            >
              {createMutation.isPending ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Manage Class Sheet */}
      <Sheet open={manageOpen} onOpenChange={setManageOpen}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal">
              {selectedClass ? classLabel(selectedClass) : "Manage Class"}
            </SheetTitle>
          </SheetHeader>
          {selectedClass && (
            <div className="mt-4">
              <Tabs defaultValue="teachers">
                <TabsList className="w-full">
                  <TabsTrigger value="teachers" className="flex-1">Teachers</TabsTrigger>
                  <TabsTrigger value="students" className="flex-1">Students</TabsTrigger>
                  <TabsTrigger value="subjects" className="flex-1">Subjects</TabsTrigger>
                </TabsList>

                {/* Teachers Tab */}
                <TabsContent value="teachers" className="space-y-3 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Assigned Teachers</p>
                  {assignedTeachers.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No teachers assigned</p>
                  ) : assignedTeachers.map((t) => (
                    <div key={t.id} className="flex items-center justify-between py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary grid place-items-center text-xs font-medium">
                          {(t.firstName?.[0] ?? t.username[0]).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{userName(t)}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => removeTeacherMutation.mutate(t.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  <div className="pt-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Assign Teacher</p>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                      <Input
                        className="pl-9 h-8 text-sm"
                        placeholder="Search teachers..."
                        value={searchTeacher}
                        onChange={(e) => setSearchTeacher(e.target.value)}
                      />
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1">
                      {filteredAvailableTeachers.slice(0, 10).map((t) => (
                        <button
                          key={t.id}
                          onClick={() => addTeacherMutation.mutate(t.id)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-left hover:bg-secondary transition-colors text-sm"
                        >
                          <UserPlus className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                          {userName(t)}
                          <span className="text-xs text-muted-foreground ml-auto">{t.role}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                {/* Students Tab */}
                <TabsContent value="students" className="space-y-3 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {assignedStudents.length} Students
                  </p>
                  <div className="max-h-80 overflow-y-auto space-y-1">
                    {assignedStudents.length === 0 ? (
                      <p className="text-sm text-muted-foreground py-2">No students assigned</p>
                    ) : assignedStudents.map((s, idx) => (
                      <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-5">{idx + 1}</span>
                          <div className="h-6 w-6 rounded-lg bg-secondary text-muted-foreground grid place-items-center text-xs font-medium">
                            {(s.firstName?.[0] ?? s.username[0]).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-medium">{userName(s)}</p>
                            <p className="text-xs text-muted-foreground">{s.username}</p>
                          </div>
                        </div>
                        <Button
                          variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeStudentMutation.mutate(s.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* Subjects Tab */}
                <TabsContent value="subjects" className="space-y-3 mt-4">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subjects</p>
                  {(subjectsQuery.data ?? []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">No subjects added</p>
                  ) : (subjectsQuery.data ?? []).map((s) => (
                    <div key={s.id} className="flex items-center justify-between py-1.5 border-b border-border/50">
                      <span className="text-sm font-medium">{s.name}</span>
                      <Button
                        variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => deleteSubjectMutation.mutate(s.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  ))}

                  <div className="pt-3 flex gap-2">
                    <Input
                      placeholder="Subject name..."
                      value={newSubjectName}
                      onChange={(e) => setNewSubjectName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter" && newSubjectName.trim()) addSubjectMutation.mutate(); }}
                    />
                    <Button
                      size="sm"
                      onClick={() => addSubjectMutation.mutate()}
                      disabled={!newSubjectName.trim() || addSubjectMutation.isPending}
                    >
                      Add
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
}
