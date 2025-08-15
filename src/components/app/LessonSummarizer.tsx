
"use client";

import React, { useState } from "react";
import { summarizeLessonAction } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, BookCheck, Download, ChevronDown, Loader2, Image as ImageIcon, Pencil, Video, Clapperboard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import type { SummarizeLessonOutput } from "@/ai/flows/lesson-summarization";
import { jsPDF } from "jspdf";
import { Document, Packer, Paragraph } from "docx";
import { saveAs } from "file-saver";
import { 
    DropdownMenu, 
    DropdownMenuContent, 
    DropdownMenuItem, 
    DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Image from "next/image";

interface ResultState {
    summary?: string;
    videoUrl?: string;
    title?: string;
    script?: string;
}

export function LessonSummarizer({ subjectName }: { subjectName: string }) {
  const [result, setResult] = useState<ResultState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();

  const isTutorialSubject = ["Initiation à l'IA", "Informatique"].includes(subjectName);

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

  const handleDownloadPdf = (content: string, filename: string) => {
    const doc = new jsPDF();
    const splitText = doc.splitTextToSize(content, 180);
    doc.text(splitText, 10, 10);
    doc.save(`${filename}.pdf`);
  };

  const handleDownloadWord = async (content: string, filename: string) => {
    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          new Paragraph({ text: content }),
        ],
      }],
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    formData.append('subject', subjectName);
    
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
        const lessonContent = formData.get("lessonContent") as string;
        const lessonImage = formData.get("lessonImage") as File;

        if (isTutorialSubject) {
            if (!lessonContent || lessonContent.trim().length < 5) {
                throw new Error("Votre demande est trop courte.");
            }
        } else { // Regular summary
             if (!lessonContent && (!lessonImage || lessonImage.size === 0)) {
                throw new Error("Veuillez coller du texte ou importer une image.");
            }
             if (lessonContent && lessonContent.trim().length < 20) {
                 throw new Error("Le contenu de la leçon est trop court.");
            }
        }

        const { data, error: actionError } = await summarizeLessonAction(formData);
        if (actionError) throw new Error(actionError);
        if (data) setResult(data);

    } catch (e: any) {
        const errorMsg = e.message || "Une erreur est survenue.";
        toast({ variant: "destructive", title: "Échec de la génération", description: errorMsg });
        setError(errorMsg);
    } finally {
        setIsLoading(false);
    }
  }

  const getCardTitle = () => {
    return isTutorialSubject ? "Générateur de tutoriels" : "Résumer une leçon";
  }

  const getCardDescription = () => {
    if (isTutorialSubject) {
        return `Demande un tutoriel sur un sujet d'${subjectName}.`;
    }
    return `Colle le contenu de ta leçon de ${subjectName} ou importe une image pour obtenir un résumé.`
  }

  const getPlaceholder = () => {
    if (subjectName === "Initiation à l'IA") {
        return "Ex: Qu'est-ce que l'IA générative ?";
    }
    if (subjectName === "Informatique") {
        return "Ex: Comment faire un tableau sur Word ?";
    }
    return "Colle ici le texte de ta leçon...";
  }

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>{getCardTitle()}</CardTitle>
          <CardDescription>
            {getCardDescription()}
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
                { isTutorialSubject ? (
                    <div className="space-y-4">
                        <Textarea
                            name={"lessonContent"}
                            placeholder={getPlaceholder()}
                            className="min-h-[200px]"
                            disabled={isLoading}
                        />
                    </div>
                ) : (
                    <Tabs defaultValue="text" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="text"><Pencil className="mr-2 h-4 w-4" />Texte</TabsTrigger>
                            <TabsTrigger value="image"><ImageIcon className="mr-2 h-4 w-4" />Image</TabsTrigger>
                        </TabsList>
                        <TabsContent value="text" className="pt-4">
                            <Textarea
                            name="lessonContent"
                            placeholder={getPlaceholder()}
                            className="min-h-[200px]"
                            disabled={isLoading}
                            />
                        </TabsContent>
                        <TabsContent value="image" className="pt-4">
                            <Input 
                                type="file" 
                                name="lessonImage" 
                                accept="image/*" 
                                onChange={handleImageChange}
                                disabled={isLoading}
                            />
                            {imagePreview && (
                                <div className="mt-4 p-2 border rounded-md">
                                    <Image src={imagePreview} alt="Aperçu de la leçon" width={400} height={300} className="w-full h-auto rounded-md" />
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                )}


                <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                    <>
                    <Loader2 className="mr-2 animate-spin" />
                    {isTutorialSubject ? "Génération du tutoriel..." : "Résumé en cours..."}
                    </>
                ) : (
                    isTutorialSubject ? "Générer le tutoriel" : "Obtenir le résumé"
                )}
                </Button>
            </form>
        </CardContent>
      </Card>
      
      <div>
        {isLoading && (
             <div className="h-full flex flex-col items-center justify-center rounded-lg border border-dashed p-8 text-center animate-pulse">
                <BookCheck className="h-12 w-12 text-muted-foreground" />
                <p className="mt-4 text-muted-foreground">L'intelligence artificielle prépare ton {isTutorialSubject ? 'tutoriel' : 'résumé'}...</p>
            </div>
        )}
        {!isLoading && error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Erreur</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {!isLoading && !error && result && (
             <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>
                        {`Ton ${isTutorialSubject ? 'tutoriel' : 'résumé'}`}
                    </CardTitle>
                    {result.summary && (
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Télécharger
                            <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onClick={() => handleDownloadPdf(result.summary!, `${isTutorialSubject ? 'tutoriel' : 'résumé'}_${subjectName}`)}>
                            Télécharger en PDF
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownloadWord(result.summary!, `${isTutorialSubject ? 'tutoriel' : 'résumé'}_${subjectName}`)}>
                            Télécharger en Word
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                    <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                        {result.summary}
                    </div>
                </CardContent>
            </Card>
        )}
        {!isLoading && !error && !result && (
            <Alert>
                {isTutorialSubject ? <Clapperboard className="h-4 w-4" /> : <BookCheck className="h-4 w-4" />}
                <AlertTitle>En attente de contenu</AlertTitle>
                <AlertDescription>
                    {isTutorialSubject 
                        ? "Le tutoriel que tu as demandé apparaîtra ici."
                        : "Le résumé de ta leçon apparaîtra ici une fois que tu l'auras soumis."
                    }
                </AlertDescription>
            </Alert>
        )}
      </div>
    </div>
  );
}
