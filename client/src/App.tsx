import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import { ThemeProvider } from "@/hooks/use-theme";
import { Layout } from "@/components/layout";
import { ProtectedRoute } from "./lib/protected-route";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import StudentDashboard from "@/pages/student-dashboard";
import TeacherDashboard from "@/pages/teacher-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import SettingsPage from "@/pages/settings-page";
import UsersPage from "@/pages/users-page";
import AssignmentsPage from "@/pages/assignments-page";
import QuizzesPage from "@/pages/quizzes-page";
import GradesPage from "@/pages/grades-page";
import GradeAssignmentsPage from "@/pages/grade-assignments-page";
import ChatPage from "@/pages/chat-page";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";
import PostAssignmentPage from "@/pages/post-assignment-page";
import CreateQuizPage from "@/pages/create-quiz-page";
import PostAnnouncementPage from "@/pages/post-announcement-page";

function DashboardRouter() {
  const { user } = useAuth();

  switch (user?.role) {
    case UserRole.STUDENT:
      return <StudentDashboard />;
    case UserRole.TEACHER:
      return <TeacherDashboard />;
    case UserRole.ADMIN:
      return <AdminDashboard />;
    default:
      return <NotFound />;
  }
}

function Router() {
  const { user } = useAuth();

  if (!user) {
    return (
      <Switch>
        <Route path="/auth" component={AuthPage} />
        <Route>
          <AuthPage />
        </Route>
      </Switch>
    );
  }

  return (
    <Layout>
      <Switch>
        <ProtectedRoute path="/" component={DashboardRouter} />
        <ProtectedRoute path="/settings" component={SettingsPage} />
        <ProtectedRoute path="/assignments" component={AssignmentsPage} />
        <ProtectedRoute path="/quizzes" component={QuizzesPage} />
        <ProtectedRoute path="/grades" component={GradesPage} />
        {user.role === UserRole.TEACHER && (
          <>
            <ProtectedRoute path="/grade-assignments" component={GradeAssignmentsPage} />
            <ProtectedRoute path="/post-assignment" component={PostAssignmentPage} />
            <ProtectedRoute path="/create-quiz" component={CreateQuizPage} />
            <ProtectedRoute path="/post-announcement" component={PostAnnouncementPage} />
          </>
        )}
        <ProtectedRoute path="/chat" component={ChatPage} />
        {user.role === UserRole.ADMIN && (
          <ProtectedRoute path="/users" component={UsersPage} />
        )}
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;