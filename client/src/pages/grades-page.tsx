import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StudentGrade, insertGradeSchema, UserRole, Assignment } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

export default function GradesPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === UserRole.TEACHER;

  const { data: assignments } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const { data: grades, isLoading } = useQuery<StudentGrade[]>({
    queryKey: ["/api/student/grades"],
    enabled: user?.role === UserRole.STUDENT,
  });

  const form = useForm({
    resolver: zodResolver(insertGradeSchema),
    defaultValues: {
      studentId: undefined,
      assignmentId: undefined,
      grade: undefined,
      feedback: "",
    },
  });

  const submitGrade = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/grades", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/student/grades"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isTeacher) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Submit Grades</h1>
        
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={form.handleSubmit((data) => submitGrade.mutate(data))}>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="studentId">Student ID</Label>
                  <Input type="number" {...form.register("studentId", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="assignmentId">Assignment</Label>
                  <select
                    {...form.register("assignmentId", { valueAsNumber: true })}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">Select Assignment</option>
                    {assignments?.map((assignment) => (
                      <option key={assignment.id} value={assignment.id}>
                        {assignment.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="grade">Grade</Label>
                  <Input 
                    type="number" 
                    min={0} 
                    max={100}
                    {...form.register("grade", { valueAsNumber: true })} 
                  />
                </div>
                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea {...form.register("feedback")} />
                </div>
                <Button type="submit" disabled={submitGrade.isPending}>
                  {submitGrade.isPending ? "Submitting..." : "Submit Grade"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Grades</h1>
      
      <div className="grid grid-cols-1 gap-6">
        {grades?.map((grade) => (
          <Card key={grade.id}>
            <CardHeader>
              <CardTitle>
                {assignments?.find(a => a.id === grade.assignmentId)?.title || 'Assignment'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-2xl font-bold">{grade.grade}%</p>
                {grade.feedback && (
                  <p className="text-sm text-muted-foreground">
                    Feedback: {grade.feedback}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">
                  Submitted: {new Date(grade.submittedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
