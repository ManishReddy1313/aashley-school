import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, EyeOff, Search } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { PageSkeleton } from "@/components/portal/page-skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";
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

export default function ManageUsersPage() {
  const { user, can } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tabRole, setTabRole] = useState("all");
  const [search, setSearch] = useState("");
  const [showAddSheet, setShowAddSheet] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [createdCredentials, setCreatedCredentials] = useState<{ username: string; password: string } | null>(null);
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
      setCreatedCredentials({ username: createForm.username.trim(), password: createForm.password });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateForm({ role: "student", username: "", password: "", firstName: "", lastName: "", phone: "", email: "", classId: "" });
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

  if (!canView) return <PortalLayout><div className="p-6">You do not have permission to manage users.</div></PortalLayout>;
  if (usersQuery.isLoading) return <PortalLayout><PageSkeleton /></PortalLayout>;

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title="User Management"
          subtitle="Manage staff and student accounts"
          actions={
            <Sheet open={showAddSheet} onOpenChange={setShowAddSheet}>
              <SheetTrigger asChild><Button className="rounded-none">+ Add User</Button></SheetTrigger>
              <SheetContent side="right" className="w-full sm:max-w-xl">
                <SheetHeader><SheetTitle>Add User</SheetTitle></SheetHeader>
                <div className="mt-4 space-y-3">
                  {createdCredentials ? (
                    <Card className="rounded-none border-primary"><CardContent className="p-3 text-sm">
                      <p className="font-medium">User created. Give these credentials to the parent:</p>
                      <p>Username: {createdCredentials.username}</p>
                      <p>Password: {createdCredentials.password}</p>
                      <Button className="rounded-none mt-2" variant="outline" onClick={async () => {
                        await navigator.clipboard.writeText(`Username: ${createdCredentials.username}\nPassword: ${createdCredentials.password}`);
                        toast({ title: "Copied credentials" });
                      }}>Copy to clipboard</Button>
                    </CardContent></Card>
                  ) : null}
                  <div className="space-y-1"><Label>Role</Label><Select value={createForm.role} onValueChange={(value) => setCreateForm((p) => ({ ...p, role: value }))}><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger><SelectContent>{creatableRoles.map((role) => <SelectItem key={role} value={role}>{roleLabels[role] ?? role}</SelectItem>)}</SelectContent></Select></div>
                  <div className="space-y-1"><Label>{createForm.role === "student" ? "Admission Number / Username" : "Username"}</Label><Input className="rounded-none" value={createForm.username} onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Password</Label><div className="relative"><Input className="rounded-none pr-10" type={showCreatePassword ? "text" : "password"} value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} /><button type="button" className="absolute right-2 top-2" onClick={() => setShowCreatePassword((p) => !p)}>{showCreatePassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div>
                  <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label>First Name</Label><Input className="rounded-none" value={createForm.firstName} onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))} /></div><div className="space-y-1"><Label>Last Name</Label><Input className="rounded-none" value={createForm.lastName} onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))} /></div></div>
                  <div className="space-y-1"><Label>Phone</Label><Input className="rounded-none" value={createForm.phone} onChange={(e) => setCreateForm((p) => ({ ...p, phone: e.target.value }))} /></div>
                  <div className="space-y-1"><Label>Email</Label><Input className="rounded-none" value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} /></div>
                  {createForm.role === "student" ? <div className="space-y-1"><Label>Class</Label><Select value={createForm.classId} onValueChange={(value) => setCreateForm((p) => ({ ...p, classId: value }))}><SelectTrigger className="rounded-none"><SelectValue placeholder="Select class" /></SelectTrigger><SelectContent>{classOptions.map((cls) => <SelectItem key={cls.id} value={cls.id}>{`${cls.name}${cls.section ? ` ${cls.section}` : ""}`}</SelectItem>)}</SelectContent></Select></div> : null}
                  <Button className="rounded-none w-full" disabled={createUserMutation.isPending || !createForm.username.trim() || !createForm.password || (createForm.role === "student" && !createForm.classId)} onClick={() => createUserMutation.mutate()}>{createUserMutation.isPending ? "Creating..." : "Create User"}</Button>
                </div>
              </SheetContent>
            </Sheet>
          }
        />
        <div className="px-6 py-4 space-y-4">
          <Tabs value={tabRole} onValueChange={setTabRole}><TabsList className="rounded-none flex-wrap h-auto">{visibleTabs.map((role) => <TabsTrigger key={role} value={role} className="rounded-none">{role === "all" ? "All" : (roleLabels[role] ?? role)}</TabsTrigger>)}</TabsList></Tabs>
          <div className="relative"><Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" /><Input className="rounded-none pl-9" placeholder="Search name, username, phone" value={search} onChange={(e) => setSearch(e.target.value)} /></div>
          {filtered.length === 0 ? <Card className="rounded-none"><CardContent className="p-8 text-center text-muted-foreground">No users found for this filter.</CardContent></Card> : (
            <div className="space-y-3">
              {filtered.map((row) => {
                const fullName = `${row.firstName ?? ""} ${row.lastName ?? ""}`.trim() || row.username;
                const initials = `${row.firstName?.[0] ?? row.username[0] ?? ""}${row.lastName?.[0] ?? ""}`.toUpperCase();
                return (
                  <Card key={row.id} className="rounded-none">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3"><div className="h-10 w-10 bg-secondary text-foreground grid place-items-center text-sm font-semibold">{initials}</div><div><p className="font-medium">{fullName}</p><p className="text-sm text-muted-foreground">@{row.username}</p>{row.phone ? <p className="text-xs text-muted-foreground">{row.phone}</p> : null}</div></div>
                        <div className="flex items-center gap-2 flex-wrap justify-end">
                          <Badge variant="outline" className="rounded-none">{roleLabels[row.role] ?? row.role}</Badge>
                          <span className={`inline-flex items-center gap-1 text-xs ${row.isActive ? "text-emerald-700" : "text-destructive"}`}><span className={`h-2 w-2 rounded-full ${row.isActive ? "bg-emerald-600" : "bg-destructive"}`} />{row.isActive ? "Active" : "Disabled"}</span>
                          <Button variant="outline" className="rounded-none" onClick={() => setPasswordRowId(passwordRowId === row.id ? null : row.id)}>Set Password</Button>
                          <Button variant="outline" className="rounded-none" onClick={() => (row.isActive ? disableMutation.mutate(row.id) : enableMutation.mutate(row.id))}>{row.isActive ? "Disable" : "Enable"}</Button>
                          <Button variant="outline" className="rounded-none" onClick={() => { setEditingUser(row); setEditForm({ role: row.role, firstName: row.firstName ?? "", lastName: row.lastName ?? "", phone: row.phone ?? "", email: row.email ?? "", isActive: row.isActive }); setShowEditSheet(true); }}>Edit</Button>
                        </div>
                      </div>
                      {passwordRowId === row.id ? <div className="mt-4 border-t pt-3 space-y-2"><div className="grid grid-cols-1 md:grid-cols-2 gap-2"><Input type={showInlinePassword ? "text" : "password"} className="rounded-none" placeholder="New password" value={passwordForm.password} onChange={(e) => setPasswordForm((p) => ({ ...p, password: e.target.value }))} /><Input type={showInlinePassword ? "text" : "password"} className="rounded-none" placeholder="Confirm password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} /></div><div className="flex items-center gap-2"><Button className="rounded-none" onClick={() => setPasswordMutation.mutate()} disabled={setPasswordMutation.isPending || passwordForm.password.length < 6 || passwordForm.password !== passwordForm.confirmPassword}>Update Password</Button><Button variant="outline" className="rounded-none" onClick={() => setShowInlinePassword((p) => !p)}>{showInlinePassword ? "Hide" : "Show"}</Button></div></div> : null}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Sheet open={showEditSheet} onOpenChange={setShowEditSheet}>
        <SheetContent side="right" className="w-full sm:max-w-xl">
          <SheetHeader><SheetTitle>Edit User</SheetTitle></SheetHeader>
          <div className="mt-4 space-y-2">
            <div className="grid grid-cols-2 gap-2"><div className="space-y-1"><Label>First Name</Label><Input className="rounded-none" value={editForm.firstName} onChange={(e) => setEditForm((p) => ({ ...p, firstName: e.target.value }))} /></div><div className="space-y-1"><Label>Last Name</Label><Input className="rounded-none" value={editForm.lastName} onChange={(e) => setEditForm((p) => ({ ...p, lastName: e.target.value }))} /></div></div>
            <div className="space-y-1"><Label>Phone</Label><Input className="rounded-none" value={editForm.phone} onChange={(e) => setEditForm((p) => ({ ...p, phone: e.target.value }))} /></div>
            <div className="space-y-1"><Label>Email</Label><Input className="rounded-none" value={editForm.email} onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))} /></div>
            {canManageRole ? <div className="space-y-1"><Label>Role</Label><Select value={editForm.role} onValueChange={(value) => setEditForm((p) => ({ ...p, role: value }))}><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger><SelectContent>{creatableRoles.map((role) => <SelectItem key={role} value={role}>{roleLabels[role] ?? role}</SelectItem>)}</SelectContent></Select></div> : null}
            <div className="space-y-1"><Label>Status</Label><Select value={editForm.isActive ? "active" : "inactive"} onValueChange={(value) => setEditForm((p) => ({ ...p, isActive: value === "active" }))}><SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Disabled</SelectItem></SelectContent></Select></div>
            <Button className="rounded-none w-full" onClick={() => updateUserMutation.mutate()} disabled={updateUserMutation.isPending}>{updateUserMutation.isPending ? "Saving..." : "Save Changes"}</Button>
          </div>
        </SheetContent>
      </Sheet>
    </PortalLayout>
  );
}
