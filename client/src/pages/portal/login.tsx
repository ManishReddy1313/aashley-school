import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { 
  GraduationCap, 
  LogIn,
  ArrowLeft,
  Shield,
  Eye,
  EyeOff
} from "lucide-react";

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
        <div className="animate-pulse text-center">
          <GraduationCap className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex flex-col">
      <header className="p-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Website
          </Button>
        </Link>
        <ThemeToggle />
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img
              src="/aashley_logo.png"
              alt="Aashley International School"
              className="h-20 w-auto object-contain mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold">Aashley International School</h1>
            <p className="text-muted-foreground">Portal Login</p>
          </div>

          <Card>
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Secure Login
              </CardTitle>
              <CardDescription>
                Access your personalized dashboard with exam schedules, circulars, and important updates.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {error && (
                  <div className="p-3 rounded-lg bg-destructive/10 text-destructive text-sm" data-testid="text-error">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    value={formData.username}
                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                    required
                    data-testid="input-username"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      required
                      className="pr-10"
                      data-testid="input-password"
                    />
                    <button
                      type="button"
                      className="absolute right-0 top-0 h-full w-10 flex items-center justify-center text-muted-foreground hover:text-foreground outline-none focus:outline-none"
                      onClick={() => setShowPassword(!showPassword)}
                      data-testid="button-toggle-password"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button 
                  className="w-full" 
                  size="lg"
                  type="submit"
                  disabled={isLoggingIn}
                  data-testid="button-submit"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  {isLoggingIn ? "Logging in..." : "Login"}
                </Button>

                <div className="border-t pt-4">
                  <div className="text-sm text-center space-y-2">
                    <p className="font-medium">Portal Access For:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Badge variant="secondary">Students</Badge>
                      <Badge variant="secondary">Parents</Badge>
                      <Badge variant="secondary">Teachers</Badge>
                      <Badge variant="secondary">Admin</Badge>
                    </div>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need help? Contact the school office</p>
            <p>+91 94803 30967</p>
          </div>
        </div>
      </main>

      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Aashley International School</p>
      </footer>
    </div>
  );
}
