import { useMemo, useState } from "react";
import { Link, useRoute, useLocation } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { GraduationCap, Link2, Mail, Phone, UserRound } from "lucide-react";
import { PortalLayout } from "@/components/portal/portal-layout";
import { PageHeader } from "@/components/portal/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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

type ProfileResponse = {
  user: {
    id: string;
    username: string;
    firstName: string | null;
    lastName: string | null;
    role: string;
  };
  profile: {
    admissionNumber: string | null;
    classId: string | null;
    rollNumber: string | null;
    dateOfBirth: string | null;
    gender: string | null;
    bloodGroup: string | null;
    address: string | null;
    photoUrl: string | null;
    academicYear: string | null;
    isActive: boolean;
  } | null;
};

type ClassRow = { id: string; name: string; section: string | null };

const avatarColorByName = (value: string) => {
  const code = value.charCodeAt(0) % 3;
  if (code === 0) return "bg-primary/10 text-primary";
  if (code === 1) return "bg-gold/10 text-gold-dark";
  return "bg-emerald-50 text-emerald-700";
};

export default function StudentProfilePage() {
  const [, params] = useRoute("/portal/students/:userId");
  const studentUserId = params?.userId ?? "";
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { user: authUser, can } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [parentSearch, setParentSearch] = useState("");
  const [relationship, setRelationship] = useState("parent");
  const [editForm, setEditForm] = useState({
    admissionNumber: "",
    classId: "",
    rollNumber: "",
    dateOfBirth: "",
    gender: "",
    bloodGroup: "",
    address: "",
    academicYear: "",
    isActive: true,
  });

  const canView = can("students.read") || authUser?.id === studentUserId;
  if (!canView) {
    setLocation("/portal/dashboard");
    return null;
  }

  const profileQuery = useQuery<ProfileResponse>({
    queryKey: ["/api/students", studentUserId, "profile"],
    queryFn: async () => {
      const res = await fetch(`/api/students/${studentUserId}/profile`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!studentUserId,
  });

  const classesQuery = useQuery<ClassRow[]>({
    queryKey: ["/api/admin/classes"],
    queryFn: async () => {
      const res = await fetch("/api/admin/classes", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: can("students.read"),
  });

  const parentsQuery = useQuery<any[]>({
    queryKey: ["/api/students", studentUserId, "parents"],
    queryFn: async () => {
      const res = await fetch(`/api/students/${studentUserId}/parents`, { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      return res.json();
    },
    enabled: !!studentUserId && can("students.read"),
  });

  const usersQuery = useQuery<any[]>({
    queryKey: ["/api/admin/users"],
    enabled: can("users.manage"),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("PATCH", `/api/students/${studentUserId}/profile`, {
        admissionNumber: editForm.admissionNumber || null,
        classId: editForm.classId || null,
        rollNumber: editForm.rollNumber || null,
        dateOfBirth: editForm.dateOfBirth || null,
        gender: editForm.gender || null,
        bloodGroup: editForm.bloodGroup || null,
        address: editForm.address || null,
        academicYear: editForm.academicYear || null,
        isActive: editForm.isActive,
      });
    },
    onSuccess: () => {
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentUserId, "profile"] });
      toast({ title: "Profile updated", description: "Student profile has been saved." });
    },
    onError: (error: Error) => {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    },
  });

  const linkParentMutation = useMutation({
    mutationFn: async (parentUserId: string) => {
      const res = await apiRequest("POST", "/api/admin/parent-student-links", {
        parentUserId,
        studentUserId,
        relationship,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentUserId, "parents"] });
      setParentSearch("");
    },
  });

  const unlinkMutation = useMutation({
    mutationFn: async (parentUserId: string) => {
      await apiRequest("DELETE", `/api/admin/parent-student-links/${parentUserId}/${studentUserId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/students", studentUserId, "parents"] });
    },
  });

  const classMap = useMemo(
    () => new Map((classesQuery.data ?? []).map((row) => [row.id, `${row.name}${row.section ? ` ${row.section}` : ""}`])),
    [classesQuery.data]
  );

  const parentMatches = useMemo(() => {
    const q = parentSearch.trim().toLowerCase();
    if (!q) return [];
    return (usersQuery.data ?? [])
      .filter((row) => row.role !== "student")
      .filter((row) => row.username.toLowerCase().includes(q))
      .slice(0, 5);
  }, [parentSearch, usersQuery.data]);

  const profile = profileQuery.data?.profile;
  const user = profileQuery.data?.user;
  const fullName = `${user?.firstName ?? ""} ${user?.lastName ?? ""}`.trim() || user?.username || "Student";
  const initials = `${user?.firstName?.[0] ?? user?.username?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase();

  const startEdit = () => {
    setEditForm({
      admissionNumber: profile?.admissionNumber ?? "",
      classId: profile?.classId ?? "",
      rollNumber: profile?.rollNumber ?? "",
      dateOfBirth: profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), "yyyy-MM-dd") : "",
      gender: profile?.gender ?? "",
      bloodGroup: profile?.bloodGroup ?? "",
      address: profile?.address ?? "",
      academicYear: profile?.academicYear ?? "",
      isActive: profile?.isActive ?? true,
    });
    setIsEditing(true);
  };

  return (
    <PortalLayout>
      <div className="min-h-screen bg-background">
        <PageHeader
          title={fullName}
          subtitle={profile?.admissionNumber || "No admission number"}
          backHref="/portal/students"
          backLabel="Students"
          actions={
            can("students.update") ? (
              <Button className="rounded-none" onClick={() => (isEditing ? setIsEditing(false) : startEdit())}>
                {isEditing ? "Cancel Edit" : "Edit Profile"}
              </Button>
            ) : undefined
          }
        />

        <div className="p-6 grid grid-cols-1 lg:grid-cols-[20rem_minmax(0,1fr)] gap-6">
          <div className="space-y-4">
            <Card className="rounded-none">
              <CardContent className="p-5 space-y-4">
                <div className={`h-16 w-16 grid place-items-center text-xl font-semibold ${avatarColorByName(fullName)}`}>
                  {initials || "S"}
                </div>
                <div>
                  <h2 className="font-serif text-xl text-foreground">{fullName}</h2>
                  <Badge variant="secondary" className="rounded-none mt-2">Student</Badge>
                  <Badge
                    variant="outline"
                    className={`rounded-none mt-2 ml-2 ${
                      profile?.isActive === false
                        ? "bg-secondary text-muted-foreground border-border"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {profile?.isActive === false ? "Inactive" : "Active"}
                  </Badge>
                </div>

                {isEditing ? (
                  <div className="space-y-2 border-t border-border pt-4">
                    <Label>Admission No.</Label>
                    <Input className="rounded-none" value={editForm.admissionNumber} onChange={(e) => setEditForm((p) => ({ ...p, admissionNumber: e.target.value }))} />
                    <Label>Class</Label>
                    <Select value={editForm.classId || "none"} onValueChange={(value) => setEditForm((p) => ({ ...p, classId: value === "none" ? "" : value }))}>
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
                    <Label>Roll Number</Label>
                    <Input className="rounded-none" value={editForm.rollNumber} onChange={(e) => setEditForm((p) => ({ ...p, rollNumber: e.target.value }))} />
                    <Label>Date of Birth</Label>
                    <Input type="date" className="rounded-none" value={editForm.dateOfBirth} onChange={(e) => setEditForm((p) => ({ ...p, dateOfBirth: e.target.value }))} />
                    <Label>Gender</Label>
                    <Select value={editForm.gender || "none"} onValueChange={(value) => setEditForm((p) => ({ ...p, gender: value === "none" ? "" : value }))}>
                      <SelectTrigger className="rounded-none"><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not set</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <Label>Blood Group</Label>
                    <Select value={editForm.bloodGroup || "none"} onValueChange={(value) => setEditForm((p) => ({ ...p, bloodGroup: value === "none" ? "" : value }))}>
                      <SelectTrigger className="rounded-none"><SelectValue placeholder="Select blood group" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Not set</SelectItem>
                        {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((group) => (
                          <SelectItem key={group} value={group}>{group}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Label>Address</Label>
                    <Textarea className="rounded-none" value={editForm.address} onChange={(e) => setEditForm((p) => ({ ...p, address: e.target.value }))} />
                    <Label>Academic Year</Label>
                    <Input className="rounded-none" value={editForm.academicYear} onChange={(e) => setEditForm((p) => ({ ...p, academicYear: e.target.value }))} />
                    <Label>Status</Label>
                    <Select value={editForm.isActive ? "active" : "inactive"} onValueChange={(value) => setEditForm((p) => ({ ...p, isActive: value === "active" }))}>
                      <SelectTrigger className="rounded-none"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="flex gap-2">
                      <Button className="rounded-none" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                        Save
                      </Button>
                      <Button variant="outline" className="rounded-none" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="border-t border-border pt-4 space-y-3 text-sm">
                    <p><UserRound className="inline h-4 w-4 mr-2 text-muted-foreground" />Admission No.: {profile?.admissionNumber || "—"}</p>
                    <p><GraduationCap className="inline h-4 w-4 mr-2 text-muted-foreground" />Class: {profile?.classId ? classMap.get(profile.classId) || "Unassigned" : "Unassigned"}</p>
                    <p>Roll Number: {profile?.rollNumber || "—"}</p>
                    <p>Academic Year: {profile?.academicYear || "—"}</p>
                    <p>Date of Birth: {profile?.dateOfBirth ? format(new Date(profile.dateOfBirth), "dd MMM yyyy") : "—"}</p>
                    <p>Gender: {profile?.gender || "—"}</p>
                    <p>Blood Group: {profile?.bloodGroup || "—"}</p>
                    <p className="whitespace-pre-wrap">Address: {profile?.address || "—"}</p>
                    <p><Phone className="inline h-4 w-4 mr-2 text-muted-foreground" />Username: {user?.username || "—"}</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {can("chat.initiate") && profile?.classId ? (
              <Link href={`/portal/messages/${studentUserId}/${profile.classId}`}>
                <Button variant="outline" className="rounded-none w-full justify-start">
                  Message Class Teacher
                </Button>
              </Link>
            ) : null}
          </div>

          <div>
            <Tabs defaultValue="parents" className="w-full">
              <TabsList className="rounded-none">
                <TabsTrigger value="parents">Parents / Guardians</TabsTrigger>
                <TabsTrigger value="marks">Marks</TabsTrigger>
                <TabsTrigger value="timetable">Timetable</TabsTrigger>
              </TabsList>

              <TabsContent value="parents" className="mt-4">
                <Card className="rounded-none">
                  <CardHeader>
                    <CardTitle className="font-serif font-normal text-xl">Linked Parents</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {(parentsQuery.data ?? []).length === 0 ? (
                      <p className="text-sm text-muted-foreground">No parents linked yet.</p>
                    ) : (
                      (parentsQuery.data ?? []).map((row) => (
                        <div key={row.link.id} className="border border-border p-3 flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {`${row.parentUser.firstName ?? ""} ${row.parentUser.lastName ?? ""}`.trim() || row.parentUser.username}
                            </p>
                            <p className="text-sm text-muted-foreground">@{row.parentUser.username}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="rounded-none">
                              {row.link.relationship}
                            </Badge>
                            {can("users.manage") ? (
                              <Button
                                variant="outline"
                                className="rounded-none"
                                onClick={() => {
                                  const ok = window.confirm("Remove this parent link?");
                                  if (ok) unlinkMutation.mutate(row.parentUser.id);
                                }}
                              >
                                Remove
                              </Button>
                            ) : null}
                          </div>
                        </div>
                      ))
                    )}

                    {can("users.manage") ? (
                      <div className="border-t border-border pt-4 space-y-2">
                        <p className="text-sm font-medium text-foreground">Link Parent</p>
                        <Input
                          className="rounded-none"
                          placeholder="Search parent username..."
                          value={parentSearch}
                          onChange={(e) => setParentSearch(e.target.value)}
                        />
                        <Select value={relationship} onValueChange={setRelationship}>
                          <SelectTrigger className="rounded-none">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="parent">parent</SelectItem>
                            <SelectItem value="guardian">guardian</SelectItem>
                            <SelectItem value="sibling">sibling</SelectItem>
                          </SelectContent>
                        </Select>
                        <div className="space-y-2">
                          {parentMatches.map((match) => (
                            <div key={match.id} className="border border-border p-2 flex items-center justify-between">
                              <span className="text-sm text-foreground">@{match.username}</span>
                              <Button
                                variant="outline"
                                className="rounded-none"
                                onClick={() => linkParentMutation.mutate(match.id)}
                                disabled={linkParentMutation.isPending}
                              >
                                <Link2 className="h-4 w-4" />
                                Link as Parent
                              </Button>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="marks" className="mt-4">
                <Card className="rounded-none">
                  <CardContent className="py-16 text-center">
                    <GraduationCap className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-foreground">Marks and exam results will appear here once exams are configured.</p>
                    <Link href="/portal/marks">
                      <Button variant="outline" className="rounded-none mt-4">
                        View full marks report →
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="timetable" className="mt-4">
                <Card className="rounded-none">
                  <CardContent className="py-16 text-center">
                    <Mail className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-foreground">Timetable will appear here once it is set up for this class.</p>
                    <Link href="/portal/timetable">
                      <Button variant="outline" className="rounded-none mt-4">
                        View Timetable
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
}
