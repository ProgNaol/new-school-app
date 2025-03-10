import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Assignment, insertAssignmentSchema, UserRole } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, FileUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";

export default function AssignmentsPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === UserRole.TEACHER;

  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const form = useForm({
    resolver: zodResolver(insertAssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
      fileUrl: "",
    },
  });

  const createAssignment = useMutation({
    mutationFn: async (data: any) => {
      const formData = new FormData();
      Object.keys(data).forEach(key => {
        if (key === 'file' && data[key][0]) {
          formData.append('file', data[key][0]);
        } else {
          formData.append(key, data[key]);
        }
      });

      const res = await apiRequest("POST", "/api/assignments", formData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assignments</h1>
        
        {isTeacher && (
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Assignment
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Assignment</DialogTitle>
              </DialogHeader>
              <form onSubmit={form.handleSubmit((data) => createAssignment.mutate(data))}>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title</Label>
                    <Input {...form.register("title")} />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...form.register("description")} />
                  </div>
                  <div>
                    <Label htmlFor="file">Attachment</Label>
                    <Input 
                      type="file" 
                      className="cursor-pointer"
                      {...form.register("file")} 
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Due Date</Label>
                    <Input type="datetime-local" {...form.register("dueDate")} />
                  </div>
                  <Button type="submit" disabled={createAssignment.isPending}>
                    {createAssignment.isPending ? "Creating..." : "Create Assignment"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {assignments?.map((assignment) => (
          <Card key={assignment.id}>
            <CardHeader>
              <CardTitle>{assignment.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{assignment.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
                {assignment.fileUrl && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={assignment.fileUrl} target="_blank" rel="noopener noreferrer">
                      <FileUp className="h-4 w-4 mr-2" />
                      Download Attachment
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
