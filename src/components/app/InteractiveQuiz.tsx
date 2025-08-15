
"use client";

import type { GenerateQuizOutput, QuizQuestion } from "@/ai/flows/quiz-generation-flow";
import React, { useState } from "react";
import { generateQuizAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, Lightbulb, Loader2, XCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";


function QuizView({ quiz, onReset }: { quiz: GenerateQuizOutput, onReset: () => void }) {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState<(string | null)[]>(Array(quiz.questions.length).fill(null));
    const [isFinished, setIsFinished] = useState(false);
  
    const currentQuestion = quiz.questions[currentQuestionIndex];
    const score = selectedAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length;

    const handleAnswerSelect = (answer: string) => {
        const newAnswers = [...selectedAnswers];
        newAnswers[currentQuestionIndex] = answer;
        setSelectedAnswers(newAnswers);
    };

    const handleNext = () => {
        if (currentQuestionIndex < quiz.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            setIsFinished(true);
        }
    };
    
    if (isFinished) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Quiz terminé !</CardTitle>
                    <CardDescription>Voici tes résultats.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="text-center space-y-2">
                        <p className="text-lg text-muted-foreground">Ton score</p>
                        <p className="text-5xl font-bold">{score} / {quiz.questions.length}</p>
                        <Progress value={(score / quiz.questions.length) * 100} className="w-1/2 mx-auto mt-2" />
                    </div>

                    <div className="space-y-4">
                        {quiz.questions.map((q, index) => {
                            const userAnswer = selectedAnswers[index];
                            const isCorrect = userAnswer === q.correctAnswer;
                            return (
                                <div key={index} className={cn("p-4 rounded-lg border", isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10")}>
                                    <h4 className="font-semibold flex items-center gap-2">
                                        {isCorrect ? <CheckCircle className="text-green-500"/> : <XCircle className="text-red-500" />}
                                        Question {index + 1}: {q.question}
                                    </h4>
                                    <p className="text-sm mt-2">Ta réponse : <span className={cn(isCorrect ? "text-green-700" : "text-red-700")}>{userAnswer ?? "Pas de réponse"}</span></p>
                                    {!isCorrect && <p className="text-sm">Bonne réponse : <span className="font-semibold">{q.correctAnswer}</span></p>}
                                    <p className="text-sm text-muted-foreground mt-2">{q.explanation}</p>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
                <CardFooter>
                    <Button onClick={onReset} className="w-full">
                        Recommencer un autre quiz
                    </Button>
                </CardFooter>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Quiz : Question {currentQuestionIndex + 1}/{quiz.questions.length}</CardTitle>
                <Progress value={((currentQuestionIndex + 1) / quiz.questions.length) * 100} className="mt-2" />
            </CardHeader>
            <CardContent>
                <p className="font-semibold text-lg mb-4">{currentQuestion.question}</p>
                <RadioGroup onValueChange={handleAnswerSelect} value={selectedAnswers[currentQuestionIndex] || ''}>
                    {currentQuestion.options.map((option, index) => (
                        <div key={index} className="flex items-center space-x-2">
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">{option}</Label>
                        </div>
                    ))}
                </RadioGroup>
            </CardContent>
            <CardFooter>
                <Button onClick={handleNext} disabled={selectedAnswers[currentQuestionIndex] === null} className="w-full">
                    {currentQuestionIndex < quiz.questions.length - 1 ? "Question suivante" : "Terminer le quiz"}
                </Button>
            </CardFooter>
        </Card>
    )
}


export function InteractiveQuiz({ subjectName }: { subjectName: string }) {
  const [quizResult, setQuizResult] = useState<GenerateQuizOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setQuizResult(null);

    const formData = new FormData(event.currentTarget);
    const result = await generateQuizAction(formData);

    if (result.error) {
      setError(result.error);
      toast({
        variant: "destructive",
        title: "Erreur de génération",
        description: result.error,
      });
    } else {
      setQuizResult(result.data ?? null);
    }
    setIsLoading(false);
  };
  
  const handleReset = () => {
    setQuizResult(null);
    setError(null);
    setIsLoading(false);
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        {!quizResult && (
            <Card>
                <CardHeader>
                    <CardTitle>Générateur de Quiz</CardTitle>
                    <CardDescription>
                    Teste tes connaissances en {subjectName} avec un quiz interactif.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input type="hidden" name="subject" value={subjectName} />
                        
                        <div className="space-y-2">
                            <Label htmlFor="topic">Thème du Quiz</Label>
                            <Input id="topic" name="topic" placeholder="Ex: Les amortissements" required disabled={isLoading}/>
                        </div>
                        
                        {error && (
                            <p className="text-sm font-medium text-destructive">{error}</p>
                        )}
                        <Button type="submit" className="w-full" disabled={isLoading}>
                        {isLoading ? <><Loader2 className="animate-spin" /> Démarrage...</> : "Démarrer le quiz"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        )}
         {quizResult && (
           <div className="text-center">
             <Button onClick={handleReset}>Générer un autre quiz</Button>
           </div>
         )}
      </div>
      
      <div className="md:col-span-2">
        {quizResult ? (
            <QuizView quiz={quizResult} onReset={handleReset} />
        ) : (
          <div className="h-full flex items-center justify-center">
             {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-pulse">
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    <p className="mt-4 text-muted-foreground">L'IA prépare ton quiz...</p>
                </div>
            ) : (
                <Alert className="max-w-md">
                    <Lightbulb className="h-4 w-4" />
                    <AlertTitle>Prêt(e) à tester tes connaissances ?</AlertTitle>
                    <AlertDescription>
                        Remplis les informations à gauche pour générer un nouveau quiz. Le quiz apparaîtra ici.
                    </AlertDescription>
                </Alert>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
