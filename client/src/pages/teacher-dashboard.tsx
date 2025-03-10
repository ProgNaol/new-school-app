import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Assignment } from "@shared/schema";
import { insertAssignmentSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function TeacherDashboard() {
  const { data: assignments, isLoading } = useQuery<Assignment[]>({
    queryKey: ["/api/assignments"],
  });

  const form = useForm({
    resolver: zodResolver(insertAssignmentSchema),
    defaultValues: {
      title: "",
      description: "",
      dueDate: "",
    },
  });

  const createAssignment = useMutation({
    mutationFn: async (data: any) => {
      // Make sure the dueDate is in the correct format
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
        fileUrl: data.fileUrl || ""
      };
      
      const res = await apiRequest("POST", "/api/assignments", formattedData);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      form.reset();
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
        <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
        
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Assignments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {assignments?.map((assignment) => (
              <div key={assignment.id} className="p-4 border rounded-lg">
                <h3 className="font-semibold">{assignment.title}</h3>
                <p className="text-sm text-muted-foreground">{assignment.description}</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Due: {new Date(assignment.dueDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
