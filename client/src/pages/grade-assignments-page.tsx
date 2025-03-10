import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { Assignment, User, UserRole } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function GradeAssignmentsPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === UserRole.TEACHER;
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [grade, setGrade] = useState<string>("100");
  const [feedback, setFeedback] = useState<string>("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: assignments, isLoading: isLoadingAssignments } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ["/api/users/students"],
    enabled: isTeacher,
  });

  const submitGrade = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/grades", data);
      return res.json();
    },
    onSuccess: () => {
      setDialogOpen(false);
      setGrade("100");
      setFeedback("");
      setSelectedStudent("");
    },
  });

  if (isLoadingAssignments || isLoadingStudents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isTeacher) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold">Access Denied</h1>
        <p className="mt-4">Only teachers can access this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Grade Assignments</h1>
      <p>Select an assignment to grade</p>
    </div>
  );
} 