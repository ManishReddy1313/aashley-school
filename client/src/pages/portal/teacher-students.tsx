import { useState } from "react";
import { Link } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users } from "lucide-react";

type StudentRow = {
  id: string;
  username: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  classIds?: string[];
};

type TeacherClass = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

export default function TeacherStudentsPage() {
  const queryClient = useQueryClient();
  const [editingStudentId, setEditingStudentId] = useState<string | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    profileImageUrl: "",
  });
  const [search, setSearch] = useState("");
  const [activeClassId, setActiveClassId] = useState<string>("all");

  const classesQuery = useQuery<{ classIds: string[]; classes: TeacherClass[] }>({
    queryKey: ["/api/teacher/classes/me"],
  });
  const studentsQuery = useQuery<StudentRow[]>({
    queryKey: ["/api/teacher/students/me"],
  });

  const updateStudentMutation = useMutation({
    mutationFn: async () => {
      if (!editingStudentId) return null;
      const res = await apiRequest("PATCH", `/api/teacher/students/${editingStudentId}`, {
        firstName: form.firstName || null,
        lastName: form.lastName || null,
        email: form.email || null,
        profileImageUrl: form.profileImageUrl || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/teacher/students/me"] });
      setEditingStudentId(null);
    },
  });

  const classNameById = (classesQuery.data?.classes || []).reduce<Record<string, string>>((acc, cls) => {
    acc[cls.id] = `${cls.name}${cls.section ? ` ${cls.section}` : ""} (${cls.academicYear})`;
    return acc;
  }, {});

  const filteredStudents = (studentsQuery.data || []).filter((student) => {
    const fullName = `${student.firstName || ""} ${student.lastName || ""} ${student.username} ${student.email || ""}`.toLowerCase();
    const matchesSearch = fullName.includes(search.toLowerCase());
    const matchesClass = activeClassId === "all" || (student.classIds || []).includes(activeClassId);
    return matchesSearch && matchesClass;
  });

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          My Students
        </h1>
        <Link href="/portal/dashboard">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Teacher Scope</CardTitle>
          <CardDescription>
            You can edit students only in your assigned classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary">
            Assigned Classes: {classesQuery.data?.classIds?.length ?? 0}
          </Badge>
          {(classesQuery.data?.classes?.length || 0) > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {(classesQuery.data?.classes || []).map((cls) => (
                <Badge key={cls.id} variant="outline">
                  {cls.name} {cls.section || ""} ({cls.academicYear})
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Students</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <Input
              placeholder="Search students by name/email/username"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              className="w-full border rounded-md h-10 px-3 bg-background"
              value={activeClassId}
              onChange={(e) => setActiveClassId(e.target.value)}
            >
              <option value="all">All Assigned Classes</option>
              {(classesQuery.data?.classes || []).map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.name} {cls.section || ""} ({cls.academicYear})
                </option>
              ))}
            </select>
          </div>
          {filteredStudents.map((student) => (
            <div key={student.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <div>
                <div className="font-medium">{student.firstName || student.username} {student.lastName || ""}</div>
                <div className="text-sm text-muted-foreground">{student.email || "No email"}</div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(student.classIds || []).map((classId) => (
                    <Badge key={`${student.id}-${classId}`} variant="outline">
                      {classNameById[classId] || classId}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setEditingStudentId(student.id);
                  setForm({
                    firstName: student.firstName || "",
                    lastName: student.lastName || "",
                    email: student.email || "",
                    profileImageUrl: "",
                  });
                }}
              >
                Edit Student
              </Button>
            </div>
          ))}
          {filteredStudents.length === 0 && (
            <p className="text-sm text-muted-foreground">No students match the current filter.</p>
          )}
        </CardContent>
      </Card>

      {editingStudentId && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Student</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={form.email} onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Profile Image URL</Label>
              <Input value={form.profileImageUrl} onChange={(e) => setForm((p) => ({ ...p, profileImageUrl: e.target.value }))} />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <Button onClick={() => updateStudentMutation.mutate()} disabled={updateStudentMutation.isPending}>
                {updateStudentMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
              <Button variant="ghost" onClick={() => setEditingStudentId(null)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
