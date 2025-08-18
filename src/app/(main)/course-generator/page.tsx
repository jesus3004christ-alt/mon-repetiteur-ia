"use client";

import { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from '@/hooks/use-toast';
import { subjects } from '@/lib/subjects';
import { generateCourseAction } from '@/lib/actions';
import ReactMarkdown from 'react-markdown';
import { Skeleton } from '@/components/ui/skeleton';
import jsPDF from 'jspdf';

const formSchema = z.object({
  subject: z.string().min(1, "Veuillez sélectionner une matière."),
  chapter: z.string().min(3, "Veuillez décrire le chapitre que vous souhaitez générer."),
});

export default function CourseGeneratorPage() {
  const [generatedCourse, setGeneratedCourse] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      chapter: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setGeneratedCourse("");
    try {
      const courseMarkdown = await generateCourseAction(values); 
      setGeneratedCourse(courseMarkdown);
      toast({ title: 'Cours généré !', description: 'Votre cours est prêt.' });
    } catch (e: any) {
      const errorMsg = e.message || "Une erreur est survenue lors de la génération du cours.";
      toast({ variant: 'destructive', title: 'Erreur', description: errorMsg });
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!generatedCourse) return;
    const doc = new jsPDF();
    
    const textContent = generatedCourse
        .replace(/#/g, '')
        .replace(/\*/g, '')
        .replace(/>/g, '');

    const lines = doc.splitTextToSize(textContent, 180);
    doc.text(lines, 10, 10);
    doc.save(`cours_${form.getValues('subject')}_${form.getValues('chapter')}.pdf`);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de Cours</CardTitle>
          <CardDescription>
            Choisissez une matière et un chapitre pour générer un cours complet, simplifié et détaillé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Matière</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une matière" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {subjects.map((subject) => (
                          <SelectItem key={subject.slug} value={subject.name}>
                            {subject.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="chapter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chapitre / Thème du cours</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Les amortissements comptables" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Génération en cours..." : "Générer le cours"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Votre cours est en cours de préparation...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-1/2" />
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
        </Card>
      )}

      {generatedCourse && !isLoading && (
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Votre cours</CardTitle>
            <Button onClick={handleDownloadPdf} variant="outline">Télécharger en PDF</Button>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown>{generatedCourse}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
