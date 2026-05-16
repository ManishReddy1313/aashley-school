import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { GraduationCap, MoreHorizontal, Plus, Search, Upload } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { BulkUploadSheet } from "@/components/portal/bulk-upload-sheet";
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
import { useActiveClass } from "@/contexts/active-class-context";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { generatePassword } from "@/lib/excel-parser";

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

const formatClassLabel = (name: string, section: string | null) =>
  section ? `${name} - ${section}` : name;

const avatarColorByName = (value: string) => {
  const code = value.charCodeAt(0) % 3;
  if (code === 0) return "bg-primary/10 text-primary";
  if (code === 1) return "bg-gold/10 text-gold-dark";
  return "bg-emerald-50 text-emerald-700";
};

export default function StudentsPage() {
  const { user, can } = useAuth();
  const { activeClassId, activeClass, classes: teacherClasses } = useActiveClass();
  const isClassTeacher = user?.role === "class_teacher";
  const isSubjectTeacher = user?.role === "subject_teacher";
  const isTeacher = isClassTeacher || isSubjectTeacher;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [classId, setClassId] = useState("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    username: "",
    password: "",
    classId: "",
    academicYear: getCurrentAcademicYear(),
    rollNumber: "",
  });

  const classesQuery = useQuery<ClassRow[]>({
    queryKey: isTeacher ? ["/api/teacher/classes/me"] : ["/api/admin/classes"],
    enabled: can("students.read"),
    queryFn: async () => {
      if (isTeacher) {
        const res = await fetch("/api/teacher/classes/me", { credentials: "include" });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        return (data.classes ?? []) as ClassRow[];
      }
      const res = await fetch("/api/admin/classes", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return (await res.json()) as ClassRow[];
    },
  });

  const effectiveClassId = isTeacher ? activeClassId : classId === "all" ? undefined : classId;

  const studentsQuery = useQuery<StudentProfileRow[]>({
    queryKey: ["/api/admin/students", effectiveClassId ?? "all", academicYear],
    enabled: can("students.read") && (!isTeacher || !!activeClassId),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (effectiveClassId) params.set("classId", effectiveClassId);
      if (academicYear.trim()) params.set("academicYear", academicYear.trim());
      const response = await fetch(`/api/admin/students?${params.toString()}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
  });

  useEffect(() => {
    if (isTeacher && activeClassId) {
      setClassId(activeClassId);
      setForm((p) => ({ ...p, classId: activeClassId }));
    }
  }, [isTeacher, activeClassId]);

  const bulkClasses = useMemo(() => {
    const source = isTeacher ? teacherClasses : (classesQuery.data ?? []);
    return source.map((cls) => ({
      id: cls.id,
      name: cls.name,
      section: cls.section,
    }));
  }, [isTeacher, teacherClasses, classesQuery.data]);

  const classMap = useMemo(() => {
    return new Map(
      (classesQuery.data ?? []).map((row) => [row.id, formatClassLabel(row.name, row.section)]),
    );
  }, [classesQuery.data]);

  const resetForm = () => {
    setForm({
      firstName: "",
      lastName: "",
      username: "",
      password: "",
      classId: isTeacher && activeClassId ? activeClassId : "",
      academicYear: getCurrentAcademicYear(),
      rollNumber: "",
    });
    setCreatedCredentials(null);
  };

  const addStudentMutation = useMutation({
    mutationFn: async () => {
      const targetClassId = form.classId || (isTeacher ? activeClassId : "");
      const userRes = await apiRequest("POST", "/api/admin/users", {
        username: form.username.trim(),
        password: form.password,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        role: "student",
        classId: targetClassId,
        academicYear: form.academicYear.trim() || getCurrentAcademicYear(),
        rollNumber: form.rollNumber.trim() || null,
      });
      return userRes.json();
    },
    onSuccess: () => {
      setCreatedCredentials({ username: form.username.trim(), password: form.password });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
      toast({ title: "Student created", description: "Student account and profile were created." });
    },
    onError: (error: Error) => {
      toast({ title: "Failed to add student", description: error.message, variant: "destructive" });
    },
  });

  const filteredStudents = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (studentsQuery.data ?? []).filter((row) => {
      if (!q) return true;
      const fullName = `${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.toLowerCase();
      const admission = (row.profile?.admissionNumber ?? "").toLowerCase();
      return fullName.includes(q) || row.user.username.toLowerCase().includes(q) || admission.includes(q);
    });
  }, [search, studentsQuery.data]);

  const pageSubtitle = isTeacher && activeClass
    ? `Students in ${formatClassLabel(activeClass.name, activeClass.section)}`
    : "Manage student profiles and class assignments";

  const canUpload = can("students.update") || can("users.manage");
  const canAddStudent = can("students.update") || can("users.manage");

  if (!can("students.read")) {
    setLocation("/portal/dashboard");
    return null;
  }

  if (studentsQuery.isLoading && (!isTeacher || activeClassId)) {
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
          subtitle={pageSubtitle}
          actions={
            canAddStudent ? (
              <div className="flex flex-wrap gap-2">
                {canUpload ? (
                  <Button
                    variant="outline"
                    className="rounded-none"
                    onClick={() => setBulkUploadOpen(true)}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Students
                  </Button>
                ) : null}
                <Sheet
                  open={sheetOpen}
                  onOpenChange={(open) => {
                    setSheetOpen(open);
                    if (!open) resetForm();
                  }}
                >
                  <SheetTrigger asChild>
                    <Button className="rounded-none">
                      <Plus className="h-4 w-4 mr-2" />
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
                        <Card className="rounded-none border-primary">
                          <CardContent className="p-4 space-y-3 text-sm">
                            <p className="font-medium text-foreground">Student account created successfully</p>
                            <p className="text-muted-foreground">
                              Admission Number:{" "}
                              <span className="text-foreground font-mono">{createdCredentials.username}</span>
                            </p>
                            <p className="text-muted-foreground">
                              Password:{" "}
                              <span className="text-foreground font-mono">{createdCredentials.password}</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Save this password — it will not be shown again.
                            </p>
                            <div className="flex flex-wrap gap-2">
                              <Button
                                variant="outline"
                                className="rounded-none"
                                onClick={async () => {
                                  await navigator.clipboard.writeText(
                                    `Admission Number: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`,
                                  );
                                  toast({ title: "Copied credentials" });
                                }}
                              >
                                Copy both to clipboard
                              </Button>
                              <Button
                                variant="outline"
                                className="rounded-none"
                                onClick={() => resetForm()}
                              >
                                Create Another
                              </Button>
                              <Button
                                className="rounded-none"
                                onClick={() => {
                                  setSheetOpen(false);
                                  resetForm();
                                }}
                              >
                                Done
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <Label>First Name *</Label>
                              <Input
                                className="rounded-none"
                                value={form.firstName}
                                onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                              />
                            </div>
                            <div className="space-y-1">
                              <Label>Last Name *</Label>
                              <Input
                                className="rounded-none"
                                value={form.lastName}
                                onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label>Admission Number *</Label>
                            <Input
                              className="rounded-none"
                              value={form.username}
                              onChange={(e) => setForm((p) => ({ ...p, username: e.target.value }))}
                            />
                            <p className="text-xs text-muted-foreground">This will be the student&apos;s login ID</p>
                          </div>
                          <div className="space-y-1">
                            <Label>Password *</Label>
                            <div className="flex gap-2">
                              <Input
                                type="password"
                                className="rounded-none flex-1"
                                value={form.password}
                                onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-none shrink-0"
                                onClick={() => {
                                  const generated = generatePassword(form.username.trim());
                                  setForm((p) => ({ ...p, password: generated }));
                                }}
                              >
                                Generate
                              </Button>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <Label>Academic Year *</Label>
                            <Input
                              className="rounded-none"
                              value={form.academicYear}
                              onChange={(e) => setForm((p) => ({ ...p, academicYear: e.target.value }))}
                            />
                          </div>
                          {!isTeacher ? (
                            <div className="space-y-1">
                              <Label>Class *</Label>
                              <Select
                                value={form.classId || "none"}
                                onValueChange={(value) =>
                                  setForm((p) => ({ ...p, classId: value === "none" ? "" : value }))
                                }
                              >
                                <SelectTrigger className="rounded-none">
                                  <SelectValue placeholder="Select class" />
                                </SelectTrigger>
                                <SelectContent>
                                  {(classesQuery.data ?? []).map((row) => (
                                    <SelectItem key={row.id} value={row.id}>
                                      {formatClassLabel(row.name, row.section)}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          ) : activeClass ? (
                            <div className="text-sm text-muted-foreground border border-border p-3">
                              Class: {formatClassLabel(activeClass.name, activeClass.section)}
                            </div>
                          ) : null}
                          <div className="space-y-1">
                            <Label>Roll Number</Label>
                            <Input
                              className="rounded-none"
                              value={form.rollNumber}
                              onChange={(e) => setForm((p) => ({ ...p, rollNumber: e.target.value }))}
                            />
                          </div>
                          <Button
                            className="w-full rounded-none"
                            disabled={
                              addStudentMutation.isPending ||
                              !form.username.trim() ||
                              !form.password ||
                              (!isTeacher && !form.classId) ||
                              (isTeacher && !activeClassId)
                            }
                            onClick={() => addStudentMutation.mutate()}
                          >
                            {addStudentMutation.isPending ? "Creating..." : "Create Student"}
                          </Button>
                        </>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            ) : undefined
          }
        />

        <div className="p-6 bg-secondary min-h-full space-y-4">
          {isTeacher && !activeClassId ? (
            <Card className="shadow-sm">
              <CardContent className="py-16 text-center">
                <GraduationCap className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-foreground font-medium">Select a class from the sidebar to view students</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your student list is scoped to the active class.
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Stats bar */}
              {studentsQuery.data && (
                <div className="flex flex-wrap gap-4 text-sm pb-2 border-b border-border bg-card px-4 py-3 shadow-sm">
                  {[
                    { label: "Total", value: studentsQuery.data.length },
                    { label: "Active", value: studentsQuery.data.filter((s) => s.profile?.isActive !== false).length },
                    { label: "Inactive", value: studentsQuery.data.filter((s) => s.profile?.isActive === false).length },
                    { label: "Unassigned", value: studentsQuery.data.filter((s) => !s.profile?.classId).length },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span className="text-muted-foreground">{s.label}:</span>
                      <span className="font-semibold text-foreground">{s.value}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="grid gap-3 md:grid-cols-3">
                <Input
                  className="rounded-none"
                  placeholder="Academic Year"
                  value={academicYear}
                  onChange={(e) => setAcademicYear(e.target.value)}
                />
                {!isTeacher ? (
                  <Select value={classId} onValueChange={setClassId}>
                    <SelectTrigger className="rounded-none">
                      <SelectValue placeholder="Filter by Class" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Classes</SelectItem>
                      {(classesQuery.data ?? []).map((row) => (
                        <SelectItem key={row.id} value={row.id}>
                          {formatClassLabel(row.name, row.section)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center text-sm text-muted-foreground border border-border px-3 bg-card">
                    {activeClass ? formatClassLabel(activeClass.name, activeClass.section) : "—"}
                  </div>
                )}
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

              <Card className="shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  {filteredStudents.length === 0 ? (
                    <div className="py-16 text-center">
                      <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                      <p className="text-foreground">No students found</p>
                    </div>
                  ) : (
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary">
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground w-10">#</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Student</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Admission No.</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Class</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Roll No.</th>
                          <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                          <th className="py-3 px-4" />
                        </tr>
                      </thead>
                      <tbody>
                        {filteredStudents.map((row, idx) => {
                          const fullName = `${row.user.firstName ?? ""} ${row.user.lastName ?? ""}`.trim() || row.user.username;
                          const initials = `${row.user.firstName?.[0] ?? row.user.username[0] ?? ""}${row.user.lastName?.[0] ?? ""}`.toUpperCase();
                          const avatarClass = avatarColorByName(fullName);
                          const isActive = row.profile?.isActive !== false;
                          return (
                            <tr key={row.user.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                              <td className="py-3 px-4 text-muted-foreground">{idx + 1}</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <div className={`h-8 w-8 rounded-lg grid place-items-center text-xs font-semibold shrink-0 ${avatarClass}`}>
                                    {initials || "S"}
                                  </div>
                                  <div>
                                    <p className="font-medium leading-tight">{fullName}</p>
                                    <p className="text-xs text-muted-foreground">@{row.user.username}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                                {row.profile?.admissionNumber ?? "—"}
                              </td>
                              <td className="py-3 px-4 hidden md:table-cell">
                                {row.profile?.classId
                                  ? classMap.get(row.profile.classId) ?? "Unassigned"
                                  : <span className="text-muted-foreground">Unassigned</span>}
                              </td>
                              <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground">
                                {row.profile?.rollNumber ?? "—"}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${isActive ? "text-emerald-700" : "text-muted-foreground"}`}>
                                  <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-emerald-600" : "bg-secondary-foreground/30"}`} />
                                  {isActive ? "Active" : "Inactive"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end" className="rounded-none">
                                    <DropdownMenuItem className="rounded-none" asChild>
                                      <Link href={`/portal/students/${row.user.id}`}>
                                        <a className="w-full cursor-pointer">View Profile</a>
                                      </Link>
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                </div>
              </Card>
            </>
          )}
        </div>
      </div>

      <BulkUploadSheet
        type="student"
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onSuccess={() => queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] })}
        availableClasses={bulkClasses}
      />
    </PortalLayout>
  );
}
