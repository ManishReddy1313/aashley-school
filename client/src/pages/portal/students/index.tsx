import { useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, Plus, Search, UserPlus } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

type ClassRow = {
  id: string;
  name: string;
  section: string | null;
  academicYear: string;
};

type StudentProfileRow = {
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
  };
  profile: {
    admissionNumber: string | null;
    classId: string | null;
    rollNumber: string | null;
    academicYear: string | null;
    isActive: boolean;
  } | null;
};

const getCurrentAcademicYear = () => {
  const year = new Date().getFullYear();
  return `${year}-${String(year + 1).slice(-2)}`;
};

const avatarColorByName = (value: string) => {
  const code = value.charCodeAt(0) % 3;
  if (code === 0) return "bg-primary/10 text-primary";
  if (code === 1) return "bg-gold/10 text-gold-dark";
  return "bg-emerald-50 text-emerald-700";
};

export default function StudentsPage() {
  const { can } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [classId, setClassId] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    admissionNumber: "",
    academicYear: getCurrentAcademicYear(),
    classId: "",
    rollNumber: "",
  });

  const classesQuery = useQuery<ClassRow[]>({
    queryKey: ["/api/admin/classes"],
    enabled: can("students.read"),
  });

  const studentsQuery = useQuery<StudentProfileRow[]>({
    queryKey: ["/api/admin/students", classId, academicYear],
    enabled: can("students.read"),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (classId !== "all") params.set("classId", classId);
      if (academicYear.trim()) params.set("academicYear", academicYear.trim());
      const response = await fetch(`/api/admin/students?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  const addStudentMutation = useMutation({
    mutationFn: async () => {
      const userRes = await apiRequest("POST", "/api/admin/users", {
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        role: "student",
      });
      const createdUser = await userRes.json();
      await apiRequest("PATCH", `/api/students/${createdUser.id}/profile`, {
        admissionNumber: form.admissionNumber.trim() || null,
        academicYear: form.academicYear.trim() || null,
        classId: form.classId || null,
        rollNumber: form.rollNumber.trim() || null,
      });
      return createdUser;
    },
    onSuccess: () => {
      setCreatedCredentials({ username: form.username.trim(), password: form.password });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      setForm({
        firstName: "",
        lastName: "",
        username: "",
        password: "",
        admissionNumber: "",
        academicYear: getCurrentAcademicYear(),
        classId: "",
        rollNumber: "",
      });
      toast({ title: "Student created", description: "Student account and profile were created." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add student", description: error.message, variant: "destructive" });
    },
  });

  const classMap = useMemo(() => {
    return new Map((classesQuery.data ?? []).map((row) => [row.id, `${row.name}${row.section ? ` ${row.section}` : ""}`]));
  }, [classesQuery.data]);

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (studentsQuery.data ?? []).filter((row) => {
      if (!q) return true;
      const fullName = `${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.toLowerCase();
      const admission = (row.profile?.admissionNumber ?? "").toLowerCase();
      return fullName.includes(q) || row.user.username.toLowerCase().includes(q) || admission.includes(q);
    });
  }, [search, studentsQuery.data]);

  if (!can("students.read")) {
    setLocation("/portal/dashboard");
    return null;
  }

  if (studentsQuery.isLoading) {
    return (
      <PortalLayout>
        <PageSkeleton />
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="Students"
          subtitle="Manage student profiles and class assignments"
          actions={
            can("students.update") ? (
              <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
                <SheetTrigger asChild>
                  <Button className="rounded-none">
                    <Plus className="h-4 w-4" />
                    Add Student
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xl">
                  <SheetHeader>
                    <SheetTitle className="font-serif font-normal text-2xl">Add Student</SheetTitle>
                    <SheetDescription>Create a student account and setup profile details.</SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-3">
                    {createdCredentials ? (
                      <div className="border border-border bg-secondary p-3 text-sm">
                        <p className="font-medium text-foreground">Student created successfully</p>
                        <p className="text-muted-foreground mt-1">
                          Username: <span className="text-foreground">{createdCredentials.username}</span>
                        </p>
                        <p className="text-muted-foreground">
                          Password: <span className="text-foreground">{createdCredentials.password}</span>
                        </p>
                        <p className="text-muted-foreground mt-1">Save this password - it won't be shown again.</p>
                      </div>
                    ) : null}

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label>First Name</Label>
                        <Input className="rounded-none" value={form.firstName} onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))} />
                      </div>
                      <div className="space-y-1">
                        <Label>Last Name</Label>
                        <Input className="rounded-none" value={form.lastName} onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))} />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label>Username *</Label>
                      <Input className="rounded-none" value={form.username} onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Password *</Label>
                      <Input type="password" className="rounded-none" value={form.password} onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))} />
                      <p className="text-xs text-muted-foreground">Save this password - it won't be shown again.</p>
                    </div>
                    <div className="space-y-1">
                      <Label>Admission Number</Label>
                      <Input className="rounded-none" value={form.admissionNumber} onChange={(e) => setForm((p) => ({ ...p, admissionNumber: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Academic Year</Label>
                      <Input className="rounded-none" value={form.academicYear} onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))} />
                    </div>
                    <div className="space-y-1">
                      <Label>Class</Label>
                      <Select value={form.classId || "none"} onValueChange={(value) => setForm((p) => ({ ...p, classId: value === "none" ? "" : value }))}>
                        <SelectTrigger className="rounded-none">
                          <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Unassigned</SelectItem>
                          {(classesQuery.data ?? []).map((row) => (
                            <SelectItem key={row.id} value={row.id}>
                              {row.name} {row.section || ""}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label>Roll Number</Label>
                      <Input className="rounded-none" value={form.rollNumber} onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))} />
                    </div>
                    <Button
                      className="w-full rounded-none"
                      disabled={addStudentMutation.isPending || !form.username.trim() || !form.password}
                      onClick={() => addStudentMutation.mutate()}
                    >
                      {addStudentMutation.isPending ? "Creating..." : "Create Student"}
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
            ) : undefined
          }
        />

        <div className="p-6 space-y-4">
          <div className="grid gap-3 md:grid-cols-3">
            <Input
              className="rounded-none"
              placeholder="Academic Year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger className="rounded-none">
                <SelectValue placeholder="Filter by Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {(classesQuery.data ?? []).map((row) => (
                  <SelectItem key={row.id} value={row.id}>
                    {row.name} {row.section || ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                className="rounded-none pl-9"
                placeholder="Search by name or admission no."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <Card className="rounded-none">
            <CardContent className="p-0">
              {filteredStudents.length === 0 ? (
                <div className="py-16 text-center">
                  <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-foreground">No students found</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {filteredStudents.map((row) => {
                    const fullName = `${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.trim() || row.user.username;
                    const initials = `${row.user.firstName?.[0] ?? row.user.username[0] ?? ""}${row.user.lastName?.[0] ?? ""}`.toUpperCase();
                    const avatarClass = avatarColorByName(fullName);
                    return (
                      <div key={row.user.id} className="p-4 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`h-10 w-10 grid place-items-center text-sm font-semibold ${avatarClass}`}>
                            {initials || "S"}
                          </div>
                          <div className="min-w-0">
                            <p className="text-foreground font-semibold truncate">{fullName}</p>
                            <p className="text-sm text-muted-foreground truncate">@{row.user.username}</p>
                          </div>
                        </div>
                        <div className="hidden md:block text-sm text-muted-foreground min-w-[170px]">
                          {row.profile?.admissionNumber || <em>No admission no.</em>}
                        </div>
                        <div className="hidden md:block text-sm text-foreground min-w-[170px]">
                          {row.profile?.classId ? classMap.get(row.profile.classId) ?? "Unassigned" : "Unassigned"}
                        </div>
                        <div className="hidden md:block text-sm text-foreground min-w-[80px]">
                          {row.profile?.rollNumber || "—"}
                        </div>
                        <div className="min-w-[90px]">
                          <Badge
                            variant="outline"
                            className={`rounded-none ${
                              row.profile?.isActive === false
                                ? "border-border bg-secondary text-muted-foreground"
                                : "border-emerald-200 bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            {row.profile?.isActive === false ? "Inactive" : "Active"}
                          </Badge>
                        </div>
                        <Link href={`/portal/students/${row.user.id}`}>
                          <Button variant="outline" className="rounded-none">
                            View Profile
                          </Button>
                        </Link>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PortalLayout>
  );
}
