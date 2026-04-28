import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";
import { PortalLayout } from "@/components/portal/portal-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { UserCog } from "lucide-react";

type UserRow = {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  role: string;
  permissionGrants?: string[];
  permissionRevokes?: string[];
};

const roleOptions = ["student", "staff", "admin", "super_admin"];

export default function ManageUsersPage() {
  const { user, isSuperAdmin, isAdmin, can } = useAuth();
  const queryClient = useQueryClient();
  const [createForm, setCreateForm] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "student",
  });
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState("student");
  const [editDetails, setEditDetails] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
  });
  const [grantPermissions, setGrantPermissions] = useState<string[]>([]);
  const [revokePermissions, setRevokePermissions] = useState<string[]>([]);

  const canView = isSuperAdmin || isAdmin || can("users.read");

  const usersQuery = useQuery<UserRow[]>({
    queryKey: ["/api/admin/users"],
    enabled: !!canView,
  });
  const permissionsCatalogQuery = useQuery<{ permissions: string[] }>({
    queryKey: ["/api/admin/permissions/catalog"],
    enabled: !!canView,
  });

  const createUserMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/admin/users", {
        ...createForm,
        email: createForm.email || null,
        firstName: createForm.firstName || null,
        lastName: createForm.lastName || null,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setCreateForm({
        username: "",
        password: "",
        email: "",
        firstName: "",
        lastName: "",
        role: "student",
      });
    },
  });

  const updateRoleMutation = useMutation({
    mutationFn: async () => {
      if (!editUserId) return null;
      const res = await apiRequest("PATCH", `/api/admin/users/${editUserId}/role`, { role: editRole });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditUserId(null);
    },
  });
  const updateUserMutation = useMutation({
    mutationFn: async () => {
      if (!editUserId) return null;
      const payload: Record<string, unknown> = {
        firstName: editDetails.firstName || null,
        lastName: editDetails.lastName || null,
        email: editDetails.email || null,
        role: editRole,
      };
      if (isSuperAdmin && editDetails.password) {
        payload.password = editDetails.password;
      }
      if (isSuperAdmin) {
        payload.permissionGrants = grantPermissions;
        payload.permissionRevokes = revokePermissions;
      }
      const res = await apiRequest("PATCH", `/api/admin/users/${editUserId}`, payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      setEditDetails({ firstName: "", lastName: "", email: "", password: "" });
    },
  });

  const visibleRoleOptions = useMemo(() => {
    if (isSuperAdmin) return roleOptions;
    return ["student", "staff"];
  }, [isSuperAdmin]);

  if (!canView) {
    return (
      <PortalLayout>
        <div className="min-h-screen container mx-auto px-4 py-10">
          <Card>
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You do not have permission to manage users.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout>
      <div className="min-h-screen container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <UserCog className="h-6 w-6 text-primary" />
              Manage Users
            </h1>
            <p className="text-muted-foreground text-sm">
              Signed in as {user?.role?.replace(/_/g, " ")}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create User</CardTitle>
            <CardDescription>Super Admin can create any role; Admin can create Staff/Student.</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Username</Label>
              <Input value={createForm.username} onChange={(e) => setCreateForm((p) => ({ ...p, username: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Password</Label>
              <Input type="password" value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Role</Label>
              <select
                className="w-full border rounded-md h-10 px-3 bg-background"
                value={createForm.role}
                onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}
              >
                {visibleRoleOptions.map((role) => (
                  <option key={role} value={role}>{role}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label>First Name</Label>
              <Input value={createForm.firstName} onChange={(e) => setCreateForm((p) => ({ ...p, firstName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Last Name</Label>
              <Input value={createForm.lastName} onChange={(e) => setCreateForm((p) => ({ ...p, lastName: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} />
            </div>
            <div className="md:col-span-3">
              <Button onClick={() => createUserMutation.mutate()} disabled={createUserMutation.isPending} data-testid="button-create-user">
                {createUserMutation.isPending ? "Creating..." : "Create User"}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(usersQuery.data || []).map((u) => (
                <div key={u.id} className="border rounded-lg p-3 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                  <div>
                    <div className="font-medium">{u.firstName || u.username} {u.lastName || ""}</div>
                    <div className="text-sm text-muted-foreground">{u.username} {u.email ? `• ${u.email}` : ""}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{u.role}</Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditUserId(u.id);
                        setEditRole(u.role);
                        setEditDetails({
                          firstName: u.firstName || "",
                          lastName: u.lastName || "",
                          email: u.email || "",
                          password: "",
                        });
                        setGrantPermissions(u.permissionGrants || []);
                        setRevokePermissions(u.permissionRevokes || []);
                      }}
                      data-testid={`button-edit-role-${u.id}`}
                    >
                      Edit Role
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {editUserId && (
              <div className="mt-4 border rounded-lg p-4 space-y-4">
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Role</Label>
                    <select
                      className="border rounded-md h-10 px-3 bg-background w-full"
                      value={editRole}
                      onChange={(e) => setEditRole(e.target.value)}
                    >
                      {visibleRoleOptions.map((role) => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={editDetails.email} onChange={(e) => setEditDetails((p) => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>First Name</Label>
                    <Input value={editDetails.firstName} onChange={(e) => setEditDetails((p) => ({ ...p, firstName: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name</Label>
                    <Input value={editDetails.lastName} onChange={(e) => setEditDetails((p) => ({ ...p, lastName: e.target.value }))} />
                  </div>
                  {isSuperAdmin && (
                    <div className="space-y-2 md:col-span-2">
                      <Label>Reset Password (optional)</Label>
                      <Input
                        type="password"
                        value={editDetails.password}
                        onChange={(e) => setEditDetails((p) => ({ ...p, password: e.target.value }))}
                        placeholder="Leave blank to keep unchanged"
                      />
                    </div>
                  )}
                </div>

                {isSuperAdmin && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label className="mb-2 block">Permission Grants</Label>
                      <div className="space-y-1 max-h-44 overflow-auto border rounded-md p-2">
                        {(permissionsCatalogQuery.data?.permissions || []).map((perm) => (
                          <label key={`grant-${perm}`} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={grantPermissions.includes(perm)}
                              onChange={(e) =>
                                setGrantPermissions((prev) =>
                                  e.target.checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                                )
                              }
                            />
                            <span>{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label className="mb-2 block">Permission Revokes</Label>
                      <div className="space-y-1 max-h-44 overflow-auto border rounded-md p-2">
                        {(permissionsCatalogQuery.data?.permissions || []).map((perm) => (
                          <label key={`revoke-${perm}`} className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={revokePermissions.includes(perm)}
                              onChange={(e) =>
                                setRevokePermissions((prev) =>
                                  e.target.checked ? [...prev, perm] : prev.filter((p) => p !== perm)
                                )
                              }
                            />
                            <span>{perm}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <Button
                    onClick={() => updateRoleMutation.mutate()}
                    disabled={updateRoleMutation.isPending}
                    data-testid="button-save-role"
                  >
                    Save Role Only
                  </Button>
                  <Button onClick={() => updateUserMutation.mutate()} disabled={updateUserMutation.isPending} data-testid="button-save-user-all">
                    Save Full User
                  </Button>
                  <Button variant="ghost" onClick={() => setEditUserId(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PortalLayout>
  );
}
