
"use client";

import React, { useState } from "react";
import { solveAnyExerciseAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Lightbulb, Loader2, Download, ListChecks, ChevronDown, ImageIcon, Pencil, WandSparkles } from "lucide-react";
import type { SolveAnyExerciseOutput } from "@/ai/flows/solve-any-exercise-flow";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph, HeadingLevel } from "docx";
import { saveAs } from "file-saver";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { subjects } from "@/lib/subjects";

export default function SolveExercisePage() {
  const [result, setResult] = useState<SolveAnyExerciseOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('text');
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData(event.currentTarget);
    formData.append('inputType', activeTab);

    try {
        if (activeTab === 'image') {
            const imageFile = formData.get('exerciseImage') as File;
            if (!imageFile || imageFile.size === 0) {
                throw new Error('Veuillez sélectionner une image.');
            }
        } else {
            const textContent = formData.get('exerciseText') as string;
            if (!textContent || textContent.trim().length < 10) {
                throw new Error("Le texte de l'exercice est trop court.");
            }
        }

        const { data, error: actionError } = await solveAnyExerciseAction(formData);

        if (actionError) {
          throw new Error(actionError);
        }
        setResult(data || null);

    } catch (e: any) {
        const errorMsg = e.message || "Une erreur est survenue.";
        toast({ variant: 'destructive', title: 'Erreur', description: errorMsg });
        setError(errorMsg);
    } finally {
        setIsLoading(false);
    }
  };


  const handleDownloadPdf = (problem: SolveAnyExerciseOutput, filename: string) => {
    const doc = new jsPDF();
    doc.text("Énoncé du problème", 10, 10);
    const problemText = doc.splitTextToSize(problem.problem, 180);
    doc.text(problemText, 10, 20);

    let yPos = doc.getTextDimensions(problemText).h + 30;

    if (problem.keyConcepts && problem.keyConcepts.length > 0) {
        doc.text("Rappels (concepts à maîtriser):", 10, yPos);
        yPos += 10;
        problem.keyConcepts.forEach(concept => {
            const conceptText = doc.splitTextToSize(`- ${concept}`, 170);
            doc.text(conceptText, 15, yPos);
            yPos += doc.getTextDimensions(conceptText).h + 2;
        });
    }

    yPos += 5;
    doc.text("Solution:", 10, yPos);
    yPos += 10;
    const solutionText = doc.splitTextToSize(problem.solution, 180);
    doc.text(solutionText, 10, yPos);
    
    doc.save(`${filename}.pdf`);
  };

  const handleDownloadWord = async (problem: SolveAnyExerciseOutput, filename: string) => {
    const children = [
        new Paragraph({ text: "Énoncé du problème", heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: problem.problem }),
        new Paragraph({ text: "" }),
    ];

    if (problem.keyConcepts && problem.keyConcepts.length > 0) {
        children.push(new Paragraph({ text: "Rappels (concepts à maîtriser):", heading: HeadingLevel.HEADING_2 }));
        problem.keyConcepts.forEach(concept => {
            children.push(new Paragraph({ text: concept, bullet: { level: 0 } }));
        });
        children.push(new Paragraph({ text: "" }));
    }

    children.push(new Paragraph({ text: "Solution:", heading: HeadingLevel.HEADING_1 }));
    children.push(new Paragraph({ text: problem.solution }));

    const doc = new Document({
      sections: [{
        properties: {},
        children: children,
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  };

  return (
    <div className="p-4 md:p-8">
        <header className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Résoudre un exercice</h1>
            <p className="text-muted-foreground">Obtiens une solution détaillée pour n'importe quel exercice.</p>
        </header>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <Card className="h-fit">
              <CardHeader>
                <CardTitle>Soumettre un exercice</CardTitle>
                <CardDescription>
                  Saisis le texte ou importe une image de ton exercice.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <input type="hidden" name="studentLevel" value="Première G1" />
                  
                    <div className="space-y-2">
                        <Label htmlFor="subject">Matière</Label>
                        <Select name="subject" required disabled={isLoading}>
                            <SelectTrigger id="subject">
                                <SelectValue placeholder="Choisir la matière" />
                            </SelectTrigger>
                            <SelectContent>
                                {subjects.map(s => <SelectItem key={s.slug} value={s.name}>{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                  
                    <Tabs defaultValue="text" className="w-full" onValueChange={setActiveTab}>
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text"><Pencil className="mr-2 h-4 w-4" />Texte</TabsTrigger>
                            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" />Image</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="pt-4 space-y-4">
                            <Label htmlFor="exerciseText">Énoncé de l'exercice</Label>
                            <Textarea 
                                id="exerciseText"
                                name="exerciseText"
                                placeholder="Colle ou écris l'énoncé de ton exercice ici..." 
                                className="min-h-[150px]"
                                disabled={isLoading || activeTab !== 'text'}
                            />
                        </TabsContent>
                        <TabsContent value="image" className="pt-4 space-y-4">
                            <Label htmlFor="exerciseImage">Image de l'exercice</Label>
                            <Input 
                                id="exerciseImage"
                                type="file" 
                                name="exerciseImage" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                disabled={isLoading || activeTab !== 'image'}
                            />
                            {imagePreview && (
                                <div className="mt-4 p-2 border rounded-md">
                                    <Image src={imagePreview} alt="Aperçu de l'exercice" width={400} height={300} className="w-full h-auto rounded-md" />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>

                  {error && (
                    <p className="text-sm font-medium text-destructive">{error}</p>
                  )}

                  <Button type="submit" disabled={isLoading} className="w-full">
                    {isLoading ? <><Loader2 className="animate-spin" /> Résolution en cours...</> : "Obtenir la solution"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            {isLoading ? (
                <div className="h-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-pulse">
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    <p className="mt-4 text-muted-foreground">L'IA analyse ton exercice et prépare la solution...</p>
                </div>
            ) : result ? (
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Solution de l'exercice</CardTitle>
                      <CardDescription>Voici la correction détaillée de ton exercice.</CardDescription>
                    </div>
                    {(
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                              <Download className="h-4 w-4 mr-2" />
                              Télécharger
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(result, `solution_exercice`)}>
                              Télécharger en PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadWord(result, `solution_exercice`)}>
                              Télécharger en Word
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Énoncé du problème</h3>
                        <div className="p-4 bg-muted rounded-md text-base whitespace-pre-wrap">{result.problem}</div>
                    </div>

                    {result.keyConcepts && result.keyConcepts.length > 0 && (
                        <Alert>
                            <ListChecks className="h-4 w-4" />
                            <AlertTitle>Rappels de cours</AlertTitle>
                            <AlertDescription>
                                Pour résoudre cet exercice, assure-toi de maîtriser les concepts suivants :
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    {result.keyConcepts.map((concept, index) => (
                                        <li key={index}>{concept}</li>
                                    ))}
                                </ul>
                            </AlertDescription>
                        </Alert>
                    )}
                    
                  <Accordion type="single" collapsible className="w-full" defaultValue="solution">
                    <AccordionItem value="solution">
                      <AccordionTrigger className="text-lg font-semibold">Voir la solution étape par étape</AccordionTrigger>
                      <AccordionContent className="pt-2 text-base prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                        {result.solution}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            ) : (
              <div className="h-full flex items-center justify-center">
                    <Alert className="max-w-md">
                        <WandSparkles className="h-4 w-4" />
                        <AlertTitle>Prêt(e) pour la correction ?</AlertTitle>
                        <AlertDescription>
                            Remplis les informations à gauche pour soumettre ton exercice. La solution détaillée apparaîtra ici.
                        </AlertDescription>
                    </Alert>
              </div>
            )}
          </div>
        </div>
    </div>
  );
}
