import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { School } from "lucide-react";

type UserRow = { id: string; username: string; firstName: string | null; lastName: string | null; role: string };
type ClassRow = { id: string; name: string; section: string | null; academicYear: string; isActive: boolean };

export default function ManageClassesPage() {
  const queryClient = useQueryClient();
  const [createForm, setCreateForm] = useState({ name: "", section: "", academicYear: "2026-27" });
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  const classesQuery = useQuery<ClassRow[]>({ queryKey: ["/api/admin/classes"] });
  const usersQuery = useQuery<UserRow[]>({ queryKey: ["/api/admin/users"] });
  const assignmentsQuery = useQuery<{ teacherUserIds: string[]; studentUserIds: string[] }>({
    queryKey: ["/api/admin/classes", selectedClassId, "assignments"],
    enabled: !!selectedClassId,
    queryFn: async () => {
      const res = await fetch(`/api/admin/classes/${selectedClassId}/assignments`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load assignments");
      return res.json();
    },
  });

  const teacherOptions = useMemo(
    () => (usersQuery.data || []).filter((u) => u.role === "staff"),
    [usersQuery.data]
  );
  const studentOptions = useMemo(
    () => (usersQuery.data || []).filter((u) => u.role === "student"),
    [usersQuery.data]
  );

  const createClassMutation = useMutation({
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
    },
  });

  const loadAssignments = async (classId: string) => {
    setSelectedClassId(classId);
    const res = await fetch(`/api/admin/classes/${classId}/assignments`, { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setSelectedTeachers(data.teacherUserIds || []);
    setSelectedStudents(data.studentUserIds || []);
  };

  const saveAssignmentsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedClassId) return;
      await apiRequest("PUT", `/api/admin/classes/${selectedClassId}/teachers`, { teacherUserIds: selectedTeachers });
      await apiRequest("PUT", `/api/admin/classes/${selectedClassId}/students`, { studentUserIds: selectedStudents });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/classes", selectedClassId, "assignments"] });
    },
  });

  return (
    <PortalLayout>
      <div className="min-h-screen container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <School className="h-6 w-6 text-primary" />
            Manage Classes
          </h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Class</CardTitle>
            <CardDescription>Admins can create classes and assign teachers/students.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-4 gap-3">
            <div className="space-y-2">
              <Label>Name</Label>
              <Input value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} placeholder="Grade 8" />
            </div>
            <div className="space-y-2">
              <Label>Section</Label>
              <Input value={createForm.section} onChange={(e) => setCreateForm((p) => ({ ...p, section: e.target.value }))} placeholder="A" />
            </div>
            <div className="space-y-2">
              <Label>Academic Year</Label>
              <Input value={createForm.academicYear} onChange={(e) => setCreateForm((p) => ({ ...p, academicYear: e.target.value }))} />
            </div>
            <div className="flex items-end">
              <Button onClick={() => createClassMutation.mutate()} disabled={createClassMutation.isPending}>
                {createClassMutation.isPending ? "Creating..." : "Create"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(classesQuery.data || []).map((cls) => (
              <div key={cls.id} className="border rounded-lg p-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{cls.name} {cls.section || ""}</div>
                  <div className="text-sm text-muted-foreground">{cls.academicYear}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{cls.isActive ? "Active" : "Inactive"}</Badge>
                  <Button variant="outline" size="sm" onClick={() => loadAssignments(cls.id)}>
                    Manage Assignment
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {selectedClassId && (
          <Card>
            <CardHeader>
              <CardTitle>Assignments</CardTitle>
              <CardDescription>Assign multiple teachers and students to this class.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label className="mb-2 block">Teachers</Label>
                <div className="grid md:grid-cols-2 gap-2">
                  {teacherOptions.map((t) => {
                    const checked = selectedTeachers.includes(t.id);
                    return (
                      <label key={t.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedTeachers((prev) => e.target.checked ? [...prev, t.id] : prev.filter((id) => id !== t.id));
                          }}
                        />
                        <span>{t.firstName || t.username} {t.lastName || ""}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <Label className="mb-2 block">Students</Label>
                <div className="grid md:grid-cols-2 gap-2 max-h-64 overflow-auto">
                  {studentOptions.map((s) => {
                    const checked = selectedStudents.includes(s.id);
                    return (
                      <label key={s.id} className="flex items-center gap-2 text-sm border rounded-md p-2">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            setSelectedStudents((prev) => e.target.checked ? [...prev, s.id] : prev.filter((id) => id !== s.id));
                          }}
                        />
                        <span>{s.firstName || s.username} {s.lastName || ""}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <Button onClick={() => saveAssignmentsMutation.mutate()} disabled={saveAssignmentsMutation.isPending}>
                {saveAssignmentsMutation.isPending ? "Saving..." : "Save Assignments"}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </PortalLayout>
  );
}
