import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Eye, EyeOff, Search, Upload } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { BulkUploadSheet } from "@/components/portal/bulk-upload-sheet";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
import { generatePassword } from "@/lib/excel-parser";
import { useToast } from "@/hooks/use-toast";

type UserRow = {
  id: string;
  username: string;
  email: string | null;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
};
type ClassRow = { id: string; name: string; section: string | null; academicYear: string };

const roleLabels: Record<string, string> = {
  super_admin: "Super Admin",
  principal: "Principal",
  admin_staff: "Admin Staff",
  admissions_officer: "Admissions Officer",
  class_teacher: "Class Teacher",
  subject_teacher: "Subject Teacher",
  student: "Student",
};

const roleAvatarColors: Record<string, string> = {
  super_admin: "bg-primary text-primary-foreground",
  principal: "bg-yellow-600 text-white",
  admin_staff: "bg-blue-600 text-white",
  class_teacher: "bg-emerald-600 text-white",
  subject_teacher: "bg-teal-600 text-white",
  admissions_officer: "bg-violet-600 text-white",
  student: "bg-secondary text-foreground",
};

const roleBadgeColors: Record<string, string> = {
  super_admin: "bg-primary/10 text-primary border-primary/20",
  principal: "bg-yellow-50 text-yellow-800 border-yellow-200",
  admin_staff: "bg-blue-50 text-blue-800 border-blue-200",
  class_teacher: "bg-emerald-50 text-emerald-800 border-emerald-200",
  subject_teacher: "bg-teal-50 text-teal-800 border-teal-200",
  admissions_officer: "bg-violet-50 text-violet-800 border-violet-200",
  student: "bg-secondary text-muted-foreground border-border",
};

const STAFF_ROLES = new Set([
  "class_teacher",
  "subject_teacher",
  "admissions_officer",
  "admin_staff",
  "principal",
  "super_admin",
]);

export default function ManageUsersPage() {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabRole, setTabRole] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [bulkUploadType, setBulkUploadType] = useState<"teacher" | "student">("teacher");
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string; role: string } | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(false);
  const [showInlinePassword, setShowInlinePassword] = useState(false);
  const [passwordRowId, setPasswordRowId] = useState<string | null>(null);
  const [passwordForm, setPasswordForm] = useState({ password: "", confirmPassword: "" });
  const [createForm, setCreateForm] = useState({
    role: "student",
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    classId: "",
  });
  const [editingUser, setEditingUser] = useState<UserRow | null>(null);
  const [editForm, setEditForm] = useState({
    role: "student",
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    isActive: true,
  });

  const canView = can("users.manage");
  const canManageRole = user?.role === "super_admin" || user?.role === "principal" || user?.role === "admin_staff";

  const creatableRoles = useMemo(() => {
    const role = user?.role;
    if (role === "super_admin") return ["super_admin", "principal", "admin_staff", "admissions_officer", "class_teacher", "subject_teacher", "student"];
    if (role === "principal") return ["admin_staff", "class_teacher", "subject_teacher", "admissions_officer"];
    if (role === "admin_staff") return ["class_teacher", "subject_teacher", "admissions_officer", "student"];
    if (role === "class_teacher") return ["student"];
    return [];
  }, [user?.role]);

  const usersQuery = useQuery<UserRow[]>({ queryKey: ["/api/admin/users"], enabled: canView });
  const classesQuery = useQuery<ClassRow[]>({ queryKey: ["/api/admin/classes"], enabled: canView });
  const teacherClassesQuery = useQuery<{ classIds: string[]; classes: ClassRow[] }>({
    queryKey: ["/api/teacher/classes/me"],
    enabled: user?.role === "class_teacher",
  });

  const classOptions = useMemo(
    () => (user?.role === "class_teacher" ? teacherClassesQuery.data?.classes ?? [] : classesQuery.data ?? []),
    [user?.role, teacherClassesQuery.data?.classes, classesQuery.data],
  );

  const bulkClasses = useMemo(
    () =>
      classOptions.map((cls) => ({
        id: cls.id,
        name: cls.name,
        section: cls.section,
      })),
    [classOptions],
  );

  const resolveBulkTypeForTab = (): "teacher" | "student" => {
    if (tabRole === "student") return "student";
    if (tabRole === "all") return "teacher";
    if (STAFF_ROLES.has(tabRole)) return "teacher";
    return "teacher";
  };

  const openBulkUpload = (type: "teacher" | "student") => {
    setBulkUploadType(type);
    setBulkUploadOpen(true);
  };

  const createUserMutation = useMutation({
    mutationFn: async () => (await apiRequest("POST", "/api/admin/users", {
      role: createForm.role,
      username: createForm.username.trim(),
      password: createForm.password,
      firstName: createForm.firstName || null,
      lastName: createForm.lastName || null,
      phone: createForm.phone || null,
      email: createForm.email || null,
      classId: createForm.role === "student" ? createForm.classId : null,
    })).json(),
    onSuccess: () => {
      setCreatedCredentials({
        username: createForm.username.trim(),
        password: createForm.password,
        role: createForm.role,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User created successfully" });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editingUser) return null;
      return (await apiRequest("PATCH", `/api/admin/users/${editingUser.id}`, {
        role: editForm.role,
        firstName: editForm.firstName || null,
        lastName: editForm.lastName || null,
        phone: editForm.phone || null,
        email: editForm.email || null,
        isActive: editForm.isActive,
      })).json();
    },
    onSuccess: () => {
      setShowEditSheet(false);
      setEditingUser(null);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      toast({ title: "User updated" });
    },
  });

  const setPasswordMutation = useMutation({
    mutationFn: async () => {
      if (!passwordRowId) return null;
      return (await apiRequest("PATCH", `/api/admin/users/${passwordRowId}/password`, { password: passwordForm.password })).json();
    },
    onSuccess: () => {
      setPasswordRowId(null);
      setPasswordForm({ password: "", confirmPassword: "" });
      toast({ title: "Password updated successfully" });
    },
  });
  const disableMutation = useMutation({
    mutationFn: async (id: string) => (await apiRequest("PATCH", `/api/admin/users/${id}/disable`)).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
  });
  const enableMutation = useMutation({
    mutationFn: async (id: string) => (await apiRequest("PATCH", `/api/admin/users/${id}/enable`)).json(),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] }),
  });

  const visibleTabs = useMemo(() => ["all", ...creatableRoles], [creatableRoles]);
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (usersQuery.data ?? [])
      .filter((row) => tabRole === "all" || row.role === tabRole)
      .filter((row) => {
        if (!q) return true;
        const fullName = `${row.firstName ?? ""} ${row.lastName ?? ""}`.toLowerCase();
        return fullName.includes(q) || row.username.toLowerCase().includes(q) || (row.phone ?? "").toLowerCase().includes(q);
      });
  }, [usersQuery.data, tabRole, search]);

  const resetCreateForm = () => {
    setCreateForm({
      role: tabRole !== "all" && creatableRoles.includes(tabRole) ? tabRole : "student",
      username: "",
      password: "",
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      classId: "",
    });
    setCreatedCredentials(null);
  };

  if (!canView) return <PortalLayout><div className="p-6">You do not have permission to manage users.</div></PortalLayout>;
  if (usersQuery.isLoading) return <PortalLayout><PageSkeleton /></PortalLayout>;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="User Management"
          subtitle="Manage staff and student accounts"
          actions={
            <div className="flex flex-wrap gap-2">
              {tabRole === "all" ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-none">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Excel
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-none">
                    <DropdownMenuItem className="rounded-none" onClick={() => openBulkUpload("teacher")}>
                      Upload Teachers
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-none" onClick={() => openBulkUpload("student")}>
                      Upload Students
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="outline"
                  className="rounded-none"
                  onClick={() => openBulkUpload(resolveBulkTypeForTab())}
                >
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Excel
                </Button>
              )}
              <Sheet
                open={showAddSheet}
                onOpenChange={(open) => {
                  setShowAddSheet(open);
                  if (!open) resetCreateForm();
                }}
              >
                <SheetTrigger asChild>
                  <Button className="rounded-none">+ Add User</Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full sm:max-w-xl">
                  <SheetHeader>
                    <SheetTitle className="font-serif font-normal text-2xl">Add User</SheetTitle>
                  </SheetHeader>
                  <div className="mt-4 space-y-3">
                    {createdCredentials ? (
                      <Card className="rounded-none border-primary">
                        <CardContent className="p-4 space-y-3 text-sm">
                          <p className="font-medium text-foreground">
                            {createdCredentials.role === "student"
                              ? "Student account created successfully"
                              : "Teacher account created successfully"}
                          </p>
                          <p className="text-muted-foreground">
                            {createdCredentials.role === "student" ? "Admission Number" : "Username"}:{" "}
                            <span className="text-foreground font-mono">{createdCredentials.username}</span>
                          </p>
                          <p className="text-muted-foreground">
                            Password: <span className="text-foreground font-mono">{createdCredentials.password}</span>
                          </p>
                          <p className="text-xs text-muted-foreground">Save these credentials — they will not be shown again.</p>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              className="rounded-none"
                              variant="outline"
                              onClick={async () => {
                                await navigator.clipboard.writeText(
                                  `${createdCredentials.role === "student" ? "Admission Number" : "Username"}: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`,
                                );
                                toast({ title: "Copied credentials" });
                              }}
                            >
                              Copy both to clipboard
                            </Button>
                            <Button
                              className="rounded-none"
                              variant="outline"
                              onClick={() => {
                                resetCreateForm();
                              }}
                            >
                              Create Another
                            </Button>
                            <Button
                              className="rounded-none"
                              onClick={() => {
                                setShowAddSheet(false);
                                resetCreateForm();
                              }}
                            >
                              Done
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ) : (
                      <>
                        <div className="space-y-1">
                          <Label>Role</Label>
                          <Select
                            value={createForm.role}
                            onValueChange={(value) => setCreateForm((p) => ({ ...p, role: value }))}
                          >
                            <SelectTrigger className="rounded-none">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {creatableRoles.map((role) => (
                                <SelectItem key={role} value={role}>
                                  {roleLabels[role] ?? role}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label>{createForm.role === "student" ? "Admission Number *" : "Username *"}</Label>
                          <Input
                            className="rounded-none"
                            value={createForm.username}
                            onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))}
                          />
                          {createForm.role === "student" ? (
                            <p className="text-xs text-muted-foreground">This will be the student&apos;s login ID</p>
                          ) : null}
                        </div>
                        <div className="space-y-1">
                          <Label>Password *</Label>
                          <div className="flex gap-2">
                            <div className="relative flex-1">
                              <Input
                                className="rounded-none pr-10"
                                type={showCreatePassword ? "text" : "password"}
                                value={createForm.password}
                                onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))}
                              />
                              <button
                                type="button"
                                className="absolute right-2 top-2"
                                onClick={() => setShowCreatePassword((p) => !p)}
                              >
                                {showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </button>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-none shrink-0"
                              onClick={() => {
                                const generated = generatePassword(
                                  createForm.role === "student" ? createForm.username.trim() : undefined,
                                );
                                setCreateForm((p) => ({ ...p, password: generated }));
                              }}
                            >
                              Generate
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <Label>First Name</Label>
                            <Input
                              className="rounded-none"
                              value={createForm.firstName}
                              onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))}
                            />
                          </div>
                          <div className="space-y-1">
                            <Label>Last Name</Label>
                            <Input
                              className="rounded-none"
                              value={createForm.lastName}
                              onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))}
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <Label>Phone</Label>
                          <Input
                            className="rounded-none"
                            value={createForm.phone}
                            onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label>Email</Label>
                          <Input
                            className="rounded-none"
                            value={createForm.email}
                            onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
                          />
                        </div>
                        {createForm.role === "student" ? (
                          <div className="space-y-1">
                            <Label>Class *</Label>
                            <Select
                              value={createForm.classId}
                              onValueChange={(value) => setCreateForm((p) => ({ ...p, classId: value }))}
                            >
                              <SelectTrigger className="rounded-none">
                                <SelectValue placeholder="Select class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classOptions.map((cls) => (
                                  <SelectItem key={cls.id} value={cls.id}>
                                    {`${cls.name}${cls.section ? ` - ${cls.section}` : ""}`}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : null}
                        <Button
                          className="rounded-none w-full"
                          disabled={
                            createUserMutation.isPending ||
                            !createForm.username.trim() ||
                            !createForm.password ||
                            (createForm.role === "student" && !createForm.classId)
                          }
                          onClick={() => createUserMutation.mutate()}
                        >
                          {createUserMutation.isPending ? "Creating..." : "Create User"}
                        </Button>
                      </>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          }
        />
        <div className="px-6 py-4 space-y-4">
          {/* Stats bar */}
          {usersQuery.data && (
            <div className="flex flex-wrap gap-4 text-sm pb-2 border-b border-border">
              {[
                { label: "Total", value: usersQuery.data.length },
                { label: "Teachers", value: usersQuery.data.filter((u) => STAFF_ROLES.has(u.role)).length },
                { label: "Students", value: usersQuery.data.filter((u) => u.role === "student").length },
                { label: "Disabled", value: usersQuery.data.filter((u) => !u.isActive).length },
              ].map((s) => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <span className="text-muted-foreground">{s.label}:</span>
                  <span className="font-semibold text-foreground">{s.value}</span>
                </div>
              ))}
            </div>
          )}

          <Tabs value={tabRole} onValueChange={setTabRole}>
            <TabsList className="rounded-none flex-wrap h-auto">
              {visibleTabs.map((role) => (
                <TabsTrigger key={role} value={role} className="rounded-none">
                  {role === "all" ? "All" : (roleLabels[role] ?? role)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            <Input
              className="rounded-none pl-9"
              placeholder="Search name, username, phone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {filtered.length === 0 ? (
            <Card className="rounded-none">
              <CardContent className="p-8 text-center text-muted-foreground">No users found for this filter.</CardContent>
            </Card>
          ) : (
            <Card className="rounded-none shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-secondary">
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Role</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden md:table-cell">Phone</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-muted-foreground hidden lg:table-cell">Last Login</th>
                      <th className="py-3 px-4" />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((row) => {
                      const fullName = `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || row.username;
                      const initials = `${row.firstName?.[0] ?? row.username[0] ?? ""}${row.lastName?.[0] ?? ""}`.toUpperCase();
                      return (
                        <>
                          <tr key={row.id} className="border-b border-border/50 hover:bg-secondary/40 transition-colors">
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg grid place-items-center text-xs font-semibold shrink-0 ${roleAvatarColors[row.role] ?? "bg-secondary text-foreground"}`}>
                                  {initials || "?"}
                                </div>
                                <div>
                                  <p className="font-medium leading-tight">{fullName}</p>
                                  <p className="text-xs text-muted-foreground">@{row.username}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-medium border rounded-lg ${roleBadgeColors[row.role] ?? "bg-secondary text-muted-foreground border-border"}`}>
                                {roleLabels[row.role] ?? row.role}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden md:table-cell text-muted-foreground">
                              {row.phone ?? "—"}
                            </td>
                            <td className="py-3 px-4">
                              <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${row.isActive ? "text-emerald-700" : "text-destructive"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${row.isActive ? "bg-emerald-600" : "bg-destructive"}`} />
                                {row.isActive ? "Active" : "Disabled"}
                              </span>
                            </td>
                            <td className="py-3 px-4 hidden lg:table-cell text-muted-foreground text-xs">
                              {row.lastLoginAt
                                ? formatDistanceToNow(new Date(row.lastLoginAt), { addSuffix: true })
                                : "Never"}
                            </td>
                            <td className="py-3 px-4 text-right">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.625 7.5a.875.875 0 1 1-1.75 0 .875.875 0 0 1 1.75 0Zm4.25 0a.875.875 0 1 1-1.75 0 .875.875 0 0 1 1.75 0Zm3.375.875a.875.875 0 1 0 0-1.75.875.875 0 0 0 0 1.75Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd" /></svg>
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="rounded-none">
                                  <DropdownMenuItem className="rounded-none" onClick={() => setPasswordRowId(passwordRowId === row.id ? null : row.id)}>
                                    Set Password
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-none" onClick={() => {
                                    setEditingUser(row);
                                    setEditForm({ role: row.role, firstName: row.firstName ?? "", lastName: row.lastName ?? "", phone: row.phone ?? "", email: row.email ?? "", isActive: row.isActive });
                                    setShowEditSheet(true);
                                  }}>
                                    Edit
                                  </DropdownMenuItem>
                                  <DropdownMenuItem className="rounded-none" onClick={() => (row.isActive ? disableMutation.mutate(row.id) : enableMutation.mutate(row.id))}>
                                    {row.isActive ? "Disable" : "Enable"}
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </td>
                          </tr>
                          {passwordRowId === row.id ? (
                            <tr key={`pw-${row.id}`} className="border-b border-border bg-secondary/40">
                              <td colSpan={6} className="px-4 py-3">
                                <div className="flex flex-wrap items-end gap-2">
                                  <Input
                                    type={showInlinePassword ? "text" : "password"}
                                    className="rounded-none w-40"
                                    placeholder="New password"
                                    value={passwordForm.password}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))}
                                  />
                                  <Input
                                    type={showInlinePassword ? "text" : "password"}
                                    className="rounded-none w-40"
                                    placeholder="Confirm password"
                                    value={passwordForm.confirmPassword}
                                    onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                                  />
                                  <Button
                                    className="rounded-none"
                                    size="sm"
                                    onClick={() => setPasswordMutation.mutate()}
                                    disabled={setPasswordMutation.isPending || passwordForm.password.length < 6 || passwordForm.password !== passwordForm.confirmPassword}
                                  >
                                    Update
                                  </Button>
                                  <Button variant="outline" className="rounded-none" size="sm" onClick={() => setShowInlinePassword((p) => !p)}>
                                    {showInlinePassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                  </Button>
                                </div>
                              </td>
                            </tr>
                          ) : null}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      </div>

      <BulkUploadSheet
        type={bulkUploadType}
        open={bulkUploadOpen}
        onOpenChange={setBulkUploadOpen}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
          queryClient.invalidateQueries({ queryKey: ["/api/admin/students"] });
        }}
        availableClasses={bulkClasses}
      />

      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader>
            <SheetTitle className="font-serif font-normal text-2xl">Edit User</SheetTitle>
          </SheetHeader>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>First Name</Label>
                <Input
                  className="rounded-none"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))}
                />
              </div>
              <div className="space-y-1">
                <Label>Last Name</Label>
                <Input
                  className="rounded-none"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Phone</Label>
              <Input
                className="rounded-none"
                value={editForm.phone}
                onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))}
              />
            </div>
            <div className="space-y-1">
              <Label>Email</Label>
              <Input
                className="rounded-none"
                value={editForm.email}
                onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
              />
            </div>
            {canManageRole ? (
              <div className="space-y-1">
                <Label>Role</Label>
                <Select value={editForm.role} onValueChange={(value) => setEditForm((p) => ({ ...p, role: value }))}>
                  <SelectTrigger className="rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {creatableRoles.map((role) => (
                      <SelectItem key={role} value={role}>
                        {roleLabels[role] ?? role}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={editForm.isActive ? "active" : "inactive"}
                onValueChange={(value) => setEditForm((p) => ({ ...p, isActive: value === "active" }))}
              >
                <SelectTrigger className="rounded-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Disabled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button
              className="rounded-none w-full"
              onClick={() => updateUserMutation.mutate()}
              disabled={updateUserMutation.isPending}
            >
              {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
}
