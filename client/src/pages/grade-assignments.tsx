
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
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Grade Assignments</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assignments?.map((assignment) => (
          <Card key={assignment.id} className="h-full">
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
              <p className="text-sm text-gray-500">
                Due: {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="line-clamp-3">{assignment.description}</p>
              <Button 
                onClick={() => {
                  setSelectedAssignment(assignment);
                  setDialogOpen(true);
                }}
              >
                Grade this Assignment
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Grade Assignment: {selectedAssignment?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="student">Select Student</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {students?.filter(s => s.role === UserRole.STUDENT).map((student) => (
                    <SelectItem key={student.id} value={String(student.id)}>
                      {student.name} (ID: {student.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="grade">Grade (0-100)</Label>
              <Input 
                id="grade" 
                type="number" 
                min="0" 
                max="100"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback (Optional)</Label>
              <Textarea 
                id="feedback" 
                placeholder="Provide feedback to the student"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            
            <div className="flex justify-end">
              <Button 
                disabled={!selectedStudent || submitGrade.isPending}
                onClick={() => {
                  if (selectedAssignment && selectedStudent) {
                    submitGrade.mutate({
                      studentId: parseInt(selectedStudent),
                      assignmentId: selectedAssignment.id,
                      grade: parseInt(grade),
                      feedback,
                    });
                  }
                }}
              >
                {submitGrade.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Grade
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
