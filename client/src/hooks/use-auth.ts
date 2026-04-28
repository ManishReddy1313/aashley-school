import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

type AuthUser = {
  id: string;
  username: string;
  email: string | null;
  firstName: string | null;
  lastName: string | null;
  profileImageUrl: string | null;
  role: string;
  roleLabel?: string;
  effectivePermissions?: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

async function fetchUser(): Promise<AuthUser | null> {
  const response = await fetch("/api/auth/user", {
    credentials: "include",
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`${response.status}: ${response.statusText}`);
  }

  return response.json();
}

export function useAuth() {
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: fetchUser,
    retry: false,
    staleTime: 1000 * 60 * 5,
  });

  const loginMutation = useMutation({
    mutationFn: async (credentials: { username: string; password: string }) => {
      const res = await apiRequest("POST", "/api/auth/login", credentials);
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["/api/auth/user"], data);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", "/api/auth/logout");
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  const can = (permission: string) => !!user?.effectivePermissions?.includes(permission);
  const isPrincipal = user?.role === "principal";
  const isAdminStaff = user?.role === "admin_staff";
  const isAdmissionsOfficer = user?.role === "admissions_officer";
  const isClassTeacher = user?.role === "class_teacher";
  const isSubjectTeacher = user?.role === "subject_teacher";
  const isSuperAdmin = user?.role === "super_admin";
  const isAdmin = user?.role === "admin_staff" || user?.role === "principal" || user?.role === "super_admin";
  const isStaff = user?.role === "class_teacher" || user?.role === "subject_teacher";

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    isPrincipal,
    isAdminStaff,
    isAdmissionsOfficer,
    isClassTeacher,
    isSubjectTeacher,
    isSuperAdmin,
    isAdmin,
    isStaff,
    roleLabel: user?.roleLabel ?? "",
    can,
    login: loginMutation.mutateAsync,
    loginError: loginMutation.error,
    isLoggingIn: loginMutation.isPending,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
