import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@shared/schema";

export default function PostAnnouncementPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [targetRole, setTargetRole] = useState<string | null>(null);
  const { toast } = useToast();

  const createAnnouncement = useMutation({
    mutationFn: async (data: any) => {
      console.log("Sending announcement data:", data);
      const res = await apiRequest("POST", "/api/announcements", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      toast({
        title: "Success",
        description: "Announcement has been posted",
      });
      // Reset form
      setTitle("");
      setContent("");
      setTargetRole(null);
    },
    onError: (error: any) => {
      console.error("Announcement creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to post announcement",
        variant: "destructive",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !content) {
      toast({
        title: "Error",
        description: "Please fill out the title and content",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const payload = { title, content, targetRole };
      console.log("Submitting announcement:", payload);
      createAnnouncement.mutate(payload);
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Post Announcement</h1>
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
          <label htmlFor="content" className="block mb-2 font-medium">Content</label>
          <Textarea 
            id="content" 
            value={content} 
            onChange={(e) => setContent(e.target.value)} 
            required 
            rows={5}
          />
        </div>
        <div>
          <label htmlFor="targetRole" className="block mb-2 font-medium">Target Audience (Optional)</label>
          <Select 
            value={targetRole || ""} 
            onValueChange={(value) => setTargetRole(value === "" ? null : value)}
          >
            <SelectTrigger id="targetRole">
              <SelectValue placeholder="Everyone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Everyone</SelectItem>
              <SelectItem value={UserRole.STUDENT}>Students Only</SelectItem>
              <SelectItem value={UserRole.TEACHER}>Teachers Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button 
          type="submit" 
          className="mt-4" 
          disabled={createAnnouncement.isPending}
        >
          {createAnnouncement.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Posting...
            </>
          ) : (
            "Post Announcement"
          )}
        </Button>
      </form>
    </div>
  );
} 