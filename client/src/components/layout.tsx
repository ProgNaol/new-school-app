import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Book,
  FileText,
  MessageSquare,
  Settings,
  LogOut,
  Sun,
  Moon,
  School,
  BarChart,
  ClipboardList,
  Users,
} from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

export function Layout({ children }: { children: React.ReactNode }) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();

  const navigationItems = {
    [UserRole.STUDENT]: [
      { href: "/", icon: Book, label: "Dashboard" },
      { href: "/assignments", icon: FileText, label: "Assignments" },
      { href: "/quizzes", icon: ClipboardList, label: "Quizzes" },
      { href: "/chat", icon: MessageSquare, label: "Chat" },
      { href: "/grades", icon: BarChart, label: "Grades" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
    [UserRole.TEACHER]: [
      { href: "/", icon: Book, label: "Dashboard" },
      { href: "/assignments", icon: FileText, label: "Assignments" },
      { href: "/quizzes", icon: ClipboardList, label: "Quizzes" },
      { href: "/grades", icon: BarChart, label: "Grades" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
    [UserRole.ADMIN]: [
      { href: "/", icon: Book, label: "Dashboard" },
      { href: "/users", icon: Users, label: "Users" },
      { href: "/announcements", icon: MessageSquare, label: "Announcements" },
      { href: "/settings", icon: Settings, label: "Settings" },
    ],
  };

  if (!user) return null;

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <div className="w-64 border-r bg-card">
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <School className="h-6 w-6" />
            <span className="font-semibold">Bashwam Academy</span>
          </div>

          <nav className="space-y-1 flex-1">
            {navigationItems[user.role].map((item) => (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={location === item.href ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-2",
                    location === item.href && "bg-secondary"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="space-y-2 pt-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start gap-2"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
              {theme === "dark" ? "Light Mode" : "Dark Mode"}
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-start gap-2 text-destructive"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-8">
        {children}
      </div>
    </div>
  );
}
