import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { UserRole } from "@shared/schema";

export default function PostAssignmentPage() {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    console.log("Current user:", user);
  }, [user]);

  const createAssignment = useMutation({
    mutationFn: async (data: any) => {
      console.log("Creating assignment with data:", data);
      const formattedData = {
        ...data,
        dueDate: new Date(data.dueDate).toISOString(),
      };
      
      try {
        const res = await apiRequest("POST", "/api/assignments", formattedData);
        console.log("Assignment API response:", res);
        if (!res.ok) {
          const errorData = await res.json();
          console.error("Assignment API error:", errorData);
          throw new Error(errorData.error || "Failed to create assignment");
        }
        return res.json();
      } catch (error) {
        console.error("Assignment creation network error:", error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/assignments"] });
      toast({
        title: "Success",
        description: "Assignment has been posted",
      });
      // Reset form
      setTitle("");
      setDescription("");
      setDueDate("");
    },
    onError: (error: any) => {
      console.error("Assignment creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post assignment",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !dueDate) {
      toast({
        title: "Error",
        description: "Please fill out all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      createAssignment.mutate({ title, description, dueDate });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Post Assignment</h1>
      <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl">
        <div>
          <label htmlFor="title" className="block mb-2 font-medium">Title</label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>
        <div>
          <label htmlFor="description" className="block mb-2 font-medium">Description</label>
          <Textarea 
            id="description" 
            value={description} 
            onChange={(e) => setDescription(e.target.value)} 
            required 
            rows={5}
          />
        </div>
        <div>
          <label htmlFor="dueDate" className="block mb-2 font-medium">Due Date</label>
          <Input 
            id="dueDate" 
            type="datetime-local" 
            value={dueDate} 
            onChange={(e) => setDueDate(e.target.value)} 
            required 
          />
        </div>
        <Button 
          type="submit" 
          className="mt-4" 
          disabled={createAssignment.isPending}
        >
          {createAssignment.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            "Post Assignment"
          )}
        </Button>
      </form>
    </div>
  );
} 