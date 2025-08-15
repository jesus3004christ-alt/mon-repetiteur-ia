
'use server';

/**
 * @fileOverview Solves an exercise from an image.
 *
 * - solveImageExercise - A function that solves an exercise from an image.
 * - SolveImageExerciseInput - The input type for the solveImageExercise function.
 * - SolveImageExerciseOutput - The return type for the solveImageExercise function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const SolveImageExerciseInputSchema = z.object({
  subject: z.string().describe('The subject of the exercise.'),
  studentLevel: z
    .string()
    .describe(
      'The current academic level of the student (e.g., "Première G1").'
    ),
  exerciseImage: z.string().describe("A photo of the exercise, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."),
});

const SolveImageExerciseOutputSchema = z.object({
  problem: z.string().describe('The generated practice problem.'),
  solution: z.string().describe('The step-by-step solution to the problem.'),
  keyConcepts: z.array(z.string()).describe("A list of key concepts or lesson parts the student needs to know to solve the problem.")
});


export type SolveImageExerciseInput = z.infer<typeof SolveImageExerciseInputSchema>;
export type SolveImageExerciseOutput = z.infer<typeof SolveImageExerciseOutputSchema>;


export async function solveImageExercise(
  input: SolveImageExerciseInput
): Promise<SolveImageExerciseOutput> {
  return solveImageExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveImageExercisePrompt',
  input: {schema: SolveImageExerciseInputSchema},
  output: {schema: SolveImageExerciseOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  config: {
    safetySettings: [
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
       {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
       {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  },
  prompt: `Vous êtes un excellent professeur spécialisé dans l'enseignement secondaire en Côte d'Ivoire,
  particulièrement pour les élèves de la série G1 ({{studentLevel}}).

  Analysez l'image de l'exercice fournie.
  1.  Identifiez et retranscrivez l'énoncé complet du problème. C'est le champ "problem".
  2.  Identifiez les concepts clés que l'élève doit maîtriser. Pour chaque concept, fournissez une brève explication détaillée, une formule si applicable, ou un exemple simple pour rafraîchir la mémoire de l'élève. Listez ces rappels dans le champ "keyConcepts".
  3.  Fournissez une solution détaillée et pédagogique, étape par étape, au problème dans le champ "solution".

  Si l'exercice contient un graphique, une courbe ou une représentation visuelle, votre analyse doit inclure :
  - Une interprétation détaillée du graphique : décrivez les axes (nom, unités), l'allure générale de la courbe (croissance, décroissance), et identifiez les points remarquables (intersections, sommets, etc.).
  - L'explication des liens entre le graphique et les questions posées dans l'exercice.
  - Des instructions claires pour la construction ou la modification du graphique si l'exercice le demande, en expliquant comment placer les points et tracer la courbe.
  
  Le problème est pour un élève de {{studentLevel}} étudiant la matière {{subject}}.
  La solution doit être pertinente pour le contexte ivoirien.

  Image de l'exercice:
  {{media url=exerciseImage}}
  
  IMPORTANT: La totalité de la réponse, y compris le problème et la solution, DOIT être en français.`,
});

const solveImageExerciseFlow = ai.defineFlow(
  {
    name: 'solveImageExerciseFlow',
    inputSchema: SolveImageExerciseInputSchema,
    outputSchema: SolveImageExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate problem. The AI model returned no output.');
    }
    return output;
  }
);
