import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Quiz, insertQuizSchema, UserRole } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from 'react';
import { useAuth } from "@/hooks/use-auth";

export default function QuizzesPage() {
  const { user } = useAuth();
  const isTeacher = user?.role === UserRole.TEACHER;

  const { data: quizzes, isLoading } = useQuery({
    queryKey: ["/api/quizzes"],
    queryFn: () => apiRequest("GET", "/api/quizzes").then(res => res.json())
  });

  const form = useForm({
    resolver: zodResolver(insertQuizSchema),
    defaultValues: {
      title: "",
      description: "",
      questions: [""],
      answers: [""],
      timeLimit: 30,
    },
  });

  const [open, setOpen] = useState(false);
  const [questions, setQuestions] = useState([""]);
  const [answers, setAnswers] = useState([""]);

  const addQuestion = () => {
    setQuestions([...questions, ""]);
    setAnswers([...answers, ""]);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    const newAnswers = [...answers];
    newQuestions.splice(index, 1);
    newAnswers.splice(index, 1);
    setQuestions(newQuestions);
    setAnswers(newAnswers);
  };

  const updateQuestion = (index: number, value: string) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    setQuestions(newQuestions);
  };

  const updateAnswer = (index: number, value: string) => {
    const newAnswers = [...answers];
    newAnswers[index] = value;
    setAnswers(newAnswers);
  };

  const createQuiz = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/quizzes", { ...data, questions, answers });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/quizzes"] });
      setOpen(false);
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
        <h1 className="text-3xl font-bold">Quizzes</h1>
        {isTeacher && (
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Quiz
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Quiz</DialogTitle>
              </DialogHeader>
              <form
                onSubmit={form.handleSubmit((data) => {
                  createQuiz.mutate(data);
                  setOpen(false);
                })}
                className="space-y-4"
              >
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      placeholder="Quiz Title"
                      {...form.register("title")}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Quiz Description"
                      {...form.register("description")}
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="timeLimit">Time Limit (minutes)</Label>
                    <Input
                      id="timeLimit"
                      type="number"
                      min="1"
                      {...form.register("timeLimit", { valueAsNumber: true })}
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex justify-between items-center">
                      <Label>Questions & Answers</Label>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm"
                        onClick={addQuestion}
                      >
                        Add Question
                      </Button>
                    </div>

                    {questions.map((question, index) => (
                      <div key={index} className="space-y-2 border p-4 rounded-md">
                        <div className="flex items-center justify-between">
                          <Label htmlFor={`question-${index}`}>Question {index + 1}</Label>
                          {questions.length > 1 && (
                            <Button 
                              type="button" 
                              variant="destructive" 
                              size="sm"
                              onClick={() => removeQuestion(index)}
                            >
                              Remove
                            </Button>
                          )}
                        </div>

                        <Input
                          id={`question-${index}`}
                          value={question}
                          onChange={(e) => updateQuestion(index, e.target.value)}
                          placeholder="Enter question"
                        />

                        <Label htmlFor={`answer-${index}`}>Answer</Label>
                        <Input
                          id={`answer-${index}`}
                          value={answers[index]}
                          onChange={(e) => updateAnswer(index, e.target.value)}
                          placeholder="Enter answer"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button type="submit" disabled={createQuiz.isPending}>
                    {createQuiz.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Create Quiz
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6">
        {quizzes?.map((quiz) => (
          <Card key={quiz.id}>
            <CardHeader>
              <CardTitle>{quiz.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{quiz.description}</p>
              <div className="flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Time Limit: {quiz.timeLimit} minutes
                </p>
                <p className="text-sm text-muted-foreground">
                  Questions: {quiz.questions.length}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}