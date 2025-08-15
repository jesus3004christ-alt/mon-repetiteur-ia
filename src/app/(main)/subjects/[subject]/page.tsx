
import { subjects } from "@/lib/subjects";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LessonSummarizer } from "@/components/app/LessonSummarizer";
import { ProblemGenerator } from "@/components/app/ProblemGenerator";
import { InteractiveQA } from "@/components/app/InteractiveQA";
import { InteractiveQuiz } from "@/components/app/InteractiveQuiz";

export default function SubjectPage({ params }: { params: { subject: string } }) {
  const subject = subjects.find((s) => s.slug === params.subject);

  if (!subject) {
    notFound();
  }

  const Icon = subject.icon;

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8">
        <div className="flex items-center gap-4">
            <Icon className="w-10 h-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-foreground">{subject.name}</h1>
                <p className="text-muted-foreground">{subject.description}</p>
            </div>
        </div>
      </header>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList className="grid w-full grid-cols-4 md:w-[500px]">
          <TabsTrigger value="summary">Résumé</TabsTrigger>
          <TabsTrigger value="exercise">Exercice</TabsTrigger>
          <TabsTrigger value="qa">Questions</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        <TabsContent value="summary" className="mt-6">
          <LessonSummarizer subjectName={subject.name} />
        </TabsContent>
        <TabsContent value="exercise" className="mt-6">
          <ProblemGenerator subjectName={subject.name} />
        </TabsContent>
        <TabsContent value="qa" className="mt-6">
          <InteractiveQA subjectName={subject.name} />
        </TabsContent>
        <TabsContent value="quiz" className="mt-6">
          <InteractiveQuiz subjectName={subject.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export async function generateStaticParams() {
    return subjects.map((subject) => ({
        subject: subject.slug,
    }));
}
