import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/use-auth";
import { 
  GraduationCap, 
  LogIn,
  ArrowLeft,
  Shield
} from "lucide-react";

export default function PortalLoginPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      setLocation("/portal/dashboard");
    }
  }, [isLoading, isAuthenticated, setLocation]);

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
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <Link href="/">
          <Button variant="ghost" size="sm" data-testid="button-back-home">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Website
          </Button>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-10 w-10 text-primary-foreground" />
            </div>
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
                Access your personalized dashboard with exam schedules, 
                circulars, and important updates.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                size="lg"
                onClick={() => window.location.href = "/api/login"}
                data-testid="button-login"
              >
                <LogIn className="mr-2 h-5 w-5" />
                Login with Replit
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                <p>Secure authentication powered by Replit</p>
              </div>

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
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Need help? Contact the school office</p>
            <p>+91 98765 43210</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Aashley International School</p>
      </footer>
    </div>
  );
}
