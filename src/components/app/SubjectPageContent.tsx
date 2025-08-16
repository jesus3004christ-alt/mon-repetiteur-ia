"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonSummarizer } from "@/components/app/LessonSummarizer";
import { ProblemGenerator } from "@/components/app/ProblemGenerator";
import { InteractiveQA } from "@/components/app/InteractiveQA";
import { InteractiveQuiz } from "@/components/app/InteractiveQuiz";

interface SubjectPageContentProps {
  subjectName: string;
}

export function SubjectPageContent({ subjectName }: SubjectPageContentProps) {
  return (
    <Tabs defaultValue="summary" className="w-full">
      <TabsList className="grid w-full grid-cols-4 md:w-[500px]">
        <TabsTrigger value="summary">Résumé</TabsTrigger>
        <TabsTrigger value="exercise">Exercice</TabsTrigger>
        <TabsTrigger value="qa">Questions</TabsTrigger>
        <TabsTrigger value="quiz">Quiz</TabsTrigger>
      </TabsList>
      <TabsContent value="summary" className="mt-6">
        <LessonSummarizer subjectName={subjectName} />
      </TabsContent>
      <TabsContent value="exercise" className="mt-6">
        <ProblemGenerator subjectName={subjectName} />
      </TabsContent>
      <TabsContent value="qa" className="mt-6">
        <InteractiveQA subjectName={subjectName} />
      </TabsContent>
      <TabsContent value="quiz" className="mt-6">
        <InteractiveQuiz subjectName={subjectName} />
      </TabsContent>
    </Tabs>
  );
}
