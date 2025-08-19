'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { subjects } from '@/lib/subjects';
import ReactMarkdown from 'react-markdown';
import { courseGenerationFlow } from '@/ai/flows/course-generation-flow';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { Clipboard, Printer } from 'lucide-react';

export default function CourseGeneratorPage() {
  const [subject, setSubject] = useState('');
  const [chapter, setChapter] = useState('');
  const [generatedCourse, setGeneratedCourse] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerateCourse = async () => {
    if (!subject || !chapter) {
      toast({ title: 'Erreur', description: 'Veuillez sélectionner une matière et entrer un chapitre.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    setGeneratedCourse('');
    try {
      const course = await courseGenerationFlow({ subject, chapter });
      setGeneratedCourse(course);
    } catch (error) {
      console.error(error);
      toast({ title: 'Erreur', description: 'Une erreur est survenue lors de la génération du cours.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(generatedCourse);
    toast({ title: 'Copié !', description: 'Le cours a été copié dans le presse-papiers.' });
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write('<style>body{font-family: sans-serif;}</style>');
    printWindow?.document.write(generatedCourse.replace(/\\n/g, '<br>'));
    printWindow?.document.close();
    printWindow?.print();
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Générateur de Cours</CardTitle>
          <CardDescription>Sélectionnez une matière et un chapitre pour générer un cours détaillé et simplifié.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Matière</Label>
              <Select onValueChange={setSubject} value={subject}>
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une matière" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.slug} value={s.name}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="chapter">Chapitre</Label>
              <input
                id="chapter"
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Ex: Le bilan comptable"
                className="input w-full"
              />
            </div>
          </div>
          <Button onClick={handleGenerateCourse} disabled={isLoading}>
            {isLoading ? 'Génération en cours...' : 'Générer le cours'}
          </Button>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Cours en cours de génération...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-4 w-full" />
          </CardContent>
        </Card>
      )}

      {generatedCourse && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Cours Généré</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleCopy} title="Copier le texte">
                <Clipboard className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={handlePrint} title="Imprimer le cours">
                <Printer className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="prose dark:prose-invert max-w-none">
              <ReactMarkdown>
                {generatedCourse}
              </ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
