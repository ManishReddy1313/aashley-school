import { useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { SchoolLogo } from "@/components/school-logo";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft, Eye, EyeOff, Loader2 } from "lucide-react";

export default function PortalLoginPage() {
  const { isLoading, isAuthenticated, login, isLoggingIn } = useAuth();
  const [, setLocation] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal/dashboard");
    }
  }, [isLoading, isAuthenticated, setLocation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login({
        username: formData.username,
        password: formData.password,
      });
    } catch (err: any) {
      const msg = err?.message || "";
      try {
        const parsed = JSON.parse(msg.replace(/^\d+:\s*/, ""));
        setError(parsed.message || "Something went wrong");
      } catch {
        setError(msg || "Something went wrong");
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:flex">
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar text-sidebar-foreground relative overflow-hidden">
        <div className="absolute -top-12 -left-12 h-52 w-52 border border-sidebar-accent/40" />
        <div className="absolute top-1/3 -right-16 h-48 w-48 bg-sidebar-accent/20" />
        <div className="absolute -bottom-10 left-1/3 h-40 w-40 border border-sidebar-accent/40" />

        <div className="relative z-10 w-full px-12 py-10 flex flex-col">
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <SchoolLogo variant="white" className="justify-center mb-6" />
              <h1 className="font-serif text-4xl text-sidebar-foreground">Aashley International School</h1>
              <p className="mt-3 text-sm text-sidebar-foreground/60">Nurturing Excellence · Building Futures</p>
            </div>
          </div>
          <p className="text-xs text-sidebar-foreground/30">© 2026 Aashley International School</p>
        </div>
      </div>

      <div className="w-full lg:w-1/2 min-h-screen bg-background">
        <div className="p-4 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" data-testid="button-back-home">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Website
            </Button>
          </Link>
          <ThemeToggle />
        </div>

        <div className="px-6 py-10 lg:py-0 min-h-[calc(100vh-64px)] flex items-center justify-center">
          <div className="w-full max-w-sm">
            <h2 className="font-serif text-3xl text-foreground">Welcome back</h2>
            <p className="text-sm text-muted-foreground mt-1 mb-8">Sign in to your school portal</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData((prev) => ({ ...prev, username: e.target.value }))}
                  required
                  className="rounded-none"
                  data-testid="input-username"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                    required
                    className="rounded-none pr-10"
                    data-testid="input-password"
                  />
                  <button
                    type="button"
                    className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground"
                    onClick={() => setShowPassword(!showPassword)}
                    data-testid="button-toggle-password"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <Button className="w-full rounded-none" type="submit" disabled={isLoggingIn} data-testid="button-submit">
                {isLoggingIn ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              {error ? (
                <p className="text-sm text-destructive" data-testid="text-error">
                  {error}
                </p>
              ) : null}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
