import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Trash2 } from "lucide-react";

export default function CreateQuizPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState("30");
  const [questions, setQuestions] = useState([{ 
    question: "", 
    answers: ["", "", "", ""], 
    correctAnswer: 0 
  }]);
  const { toast } = useToast();

  const createQuiz = useMutation({
    mutationFn: async (data: any) => {
      const payload = {
        ...data,
        timeLimit: parseInt(data.timeLimit),
        questions: data.questions.map((q: any) => ({
          ...q,
          correctAnswer: parseInt(q.correctAnswer.toString())
        }))
      };
      console.log("Sending quiz data:", payload);
      const res = await apiRequest("POST", "/api/quizzes", payload);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      toast({
        title: "Success",
        description: "Quiz has been created",
      });
      // Reset form
      setTitle("");
      setDescription("");
      setTimeLimit("30");
      setQuestions([{ question: "", answers: ["", "", "", ""], correctAnswer: 0 }]);
    },
    onError: (error: any) => {
      console.error("Quiz creation error:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to create quiz",
        variant: "destructive",
      });
    }
  });

  const addQuestion = () => {
    setQuestions([...questions, { question: "", answers: ["", "", "", ""], correctAnswer: 0 }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const updateQuestion = (index: number, field: string, value: string | number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = { 
      ...updatedQuestions[index], 
      [field]: value 
    };
    setQuestions(updatedQuestions);
  };

  const updateAnswer = (qIndex: number, aIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[qIndex].answers[aIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !timeLimit) {
      toast({
        title: "Error",
        description: "Please fill out title, description, and time limit",
        variant: "destructive",
      });
      return;
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question) {
        toast({
          title: "Error",
          description: `Question ${i+1} is missing a prompt`,
          variant: "destructive",
        });
        return;
      }
      
      for (let j = 0; j < q.answers.length; j++) {
        if (!q.answers[j]) {
          toast({
            title: "Error",
            description: `Answer ${j+1} for question ${i+1} is empty`,
            variant: "destructive",
          });
          return;
        }
      }
    }
    
    try {
      createQuiz.mutate({ title, description, timeLimit, questions });
    } catch (error) {
      console.error("Form submission error:", error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Create Quiz</h1>
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <div className="space-y-4">
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
            />
          </div>
          <div>
            <label htmlFor="timeLimit" className="block mb-2 font-medium">Time Limit (minutes)</label>
            <Input 
              id="timeLimit" 
              type="number" 
              min="1"
              value={timeLimit} 
              onChange={(e) => setTimeLimit(e.target.value)} 
              required 
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Questions</h2>
          {questions.map((q, qIndex) => (
            <div key={qIndex} className="border p-4 rounded-md bg-card">
              <div className="flex justify-between mb-4">
                <h3 className="font-medium">Question {qIndex + 1}</h3>
                {questions.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm"
                    onClick={() => removeQuestion(qIndex)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="mb-4">
                <label className="block mb-2">Question Prompt</label>
                <Input 
                  value={q.question} 
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)} 
                  required 
                />
              </div>
              <div className="space-y-3 mb-4">
                <label className="block font-medium">Answer Options</label>
                {q.answers.map((answer, aIndex) => (
                  <div key={aIndex} className="flex items-center gap-2">
                    <div className="flex-1">
                      <Input 
                        value={answer} 
                        onChange={(e) => updateAnswer(qIndex, aIndex, e.target.value)} 
                        placeholder={`Option ${aIndex + 1}`}
                        required 
                      />
                    </div>
                    <div className="flex items-center gap-1 ml-2">
                      <input 
                        type="radio" 
                        id={`correct-${qIndex}-${aIndex}`}
                        name={`correct-${qIndex}`} 
                        checked={q.correctAnswer === aIndex} 
                        onChange={() => updateQuestion(qIndex, "correctAnswer", aIndex)} 
                      />
                      <label htmlFor={`correct-${qIndex}-${aIndex}`}>Correct</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          <Button 
            type="button" 
            onClick={addQuestion} 
            variant="outline"
          >
            Add Question
          </Button>
        </div>
        
        <Button 
          type="submit" 
          className="mt-4" 
          disabled={createQuiz.isPending}
        >
          {createQuiz.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...
            </>
          ) : (
            "Create Quiz"
          )}
        </Button>
      </form>
    </div>
  );
} 