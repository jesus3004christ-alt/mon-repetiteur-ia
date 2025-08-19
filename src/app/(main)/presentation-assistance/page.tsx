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
import { Skeleton } from '@/components/ui/skeleton';
import { generatePresentationAction } from '@/lib/actions'; 
import type { PresentationPlan } from '@/ai/flows/presentation-assistance-flow';


const formSchema = z.object({
  subject: z.string().min(1, "Veuillez sélectionner une matière."),
  topic: z.string().min(5, "Veuillez décrire le thème de votre exposé."),
});

export default function PresentationAssistancePage() {
  const [presentationPlan, setPresentationPlan] = useState<PresentationPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      subject: "",
      topic: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    setPresentationPlan(null);
    try {
      const result = await generatePresentationAction(values); 
      setPresentationPlan(result);
      toast({ title: 'Plan généré !', description: 'Votre proposition d\'exposé est prête.' });
    } catch (e: any) {
      const errorMsg = e.message || "Une erreur est survenue lors de la génération du plan.";
      toast({ variant: 'destructive', title: 'Erreur', description: errorMsg });
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Aide à la Préparation d'Exposé</CardTitle>
          <CardDescription>
            Indiquez la matière et le thème de votre exposé pour obtenir une proposition de plan, une problématique et des pistes de recherche.
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
                          <SelectValue placeholder="Sélectionnez la matière de l'exposé" />
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
                name="topic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Thème de l'exposé</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: L'impact de l'inflation sur les ménages en Côte d'Ivoire" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Génération en cours..." : "Obtenir de l'aide"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Analyse de votre sujet en cours...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-8 w-1/2 mt-2" />
            <Skeleton className="h-4 w-full" />
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

      {presentationPlan && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Proposition pour votre exposé</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Titre Suggéré</h3>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{presentationPlan.title}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Problématique</h3>
              <p className="text-muted-foreground bg-muted p-3 rounded-md">{presentationPlan.problematique}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Introduction</h3>
              <p className="text-muted-foreground">{presentationPlan.introduction}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Plan Détaillé</h3>
              <div className="space-y-4">
                {presentationPlan.plan.map((part, index) => (
                  <div key={index}>
                    <h4 className="font-semibold">{part.part}</h4>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                      {part.subparts.map((subpart, subIndex) => (
                        <li key={subIndex}>{subpart}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Conclusion</h3>
              <p className="text-muted-foreground">{presentationPlan.conclusion}</p>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Pistes de Recherche</h3>
              <p className="text-muted-foreground">{presentationPlan.sources}</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
