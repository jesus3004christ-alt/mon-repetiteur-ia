
'use server';

/**
 * @fileOverview Solves an exercise from an image or text for any subject.
 *
 * - solveAnyExercise - A function that solves an exercise.
 * - SolveAnyExerciseInput - The input type for the solveAnyExercise function.
 * - SolveAnyExerciseOutput - The return type for the solveAnyExercise function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const SolveAnyExerciseInputSchema = z.object({
  subject: z.string().describe('The subject of the exercise.'),
  studentLevel: z
    .string()
    .describe(
      'The current academic level of the student (e.g., "Première G1").'
    ),
  exerciseImage: z.string().optional().describe("A photo of the exercise, as a data URI."),
  exerciseText: z.string().optional().describe("The text content of the exercise."),
});

const SolveAnyExerciseOutputSchema = z.object({
  problem: z.string().describe('The full transcribed problem statement from the input.'),
  solution: z.string().describe('The detailed, step-by-step solution to the problem.'),
  keyConcepts: z.array(z.string()).describe("A list of key concepts, formulas, or lesson parts the student needs to master to solve the problem, each with a brief explanation.")
});


export type SolveAnyExerciseInput = z.infer<typeof SolveAnyExerciseInputSchema>;
export type SolveAnyExerciseOutput = z.infer<typeof SolveAnyExerciseOutputSchema>;


export async function solveAnyExercise(
  input: SolveAnyExerciseInput
): Promise<SolveAnyExerciseOutput> {
  return solveAnyExerciseFlow(input);
}

const prompt = ai.definePrompt({
  name: 'solveAnyExercisePrompt',
  input: {schema: SolveAnyExerciseInputSchema},
  output: {schema: SolveAnyExerciseOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_ONLY_HIGH' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_ONLY_HIGH' },
    ],
  },
  prompt: `Vous êtes un excellent professeur spécialisé dans l'enseignement secondaire en Côte d'Ivoire,
  particulièrement pour les élèves de la série G1 ({{studentLevel}}). Votre matière d'expertise est : {{subject}}.

  Analysez l'exercice fourni (soit par texte, soit par image).
  1.  Identifiez et retranscrivez l'énoncé complet et exact du problème dans le champ "problem". Si l'entrée est une image, extrayez le texte de l'image. Si l'entrée est du texte, retranscrivez-le tel quel.
  2.  Identifiez les concepts clés, les formules ou les parties de leçon que l'élève doit absolument maîtriser pour résoudre cet exercice. Pour chaque concept, fournissez une brève explication claire et pédagogique pour rafraîchir la mémoire de l'élève. Listez ces rappels dans le champ "keyConcepts".
  3.  Fournissez une solution détaillée, claire, et pédagogique, étape par étape, au problème dans le champ "solution". La solution doit être facile à suivre pour un élève de {{studentLevel}}.

  Si l'exercice contient un graphique, une courbe ou une représentation visuelle (dans le cas d'une image), votre analyse doit inclure :
  - Une interprétation détaillée du graphique : décrivez les axes (nom, unités), l'allure générale, et identifiez les points remarquables.
  - L'explication des liens entre le graphique et les questions posées.
  
  La totalité de la réponse, y compris l'énoncé, les concepts et la solution, DOIT être en français et adaptée au contexte éducatif ivoirien.

  {{#if exerciseImage}}
  Image de l'exercice :
  {{media url=exerciseImage}}
  {{/if}}

  {{#if exerciseText}}
  Texte de l'exercice :
  {{{exerciseText}}}
  {{/if}}
  
  IMPORTANT: Ne laissez aucun champ vide. Fournissez une réponse complète pour "problem", "solution", et "keyConcepts".`,
});

const solveAnyExerciseFlow = ai.defineFlow(
  {
    name: 'solveAnyExerciseFlow',
    inputSchema: SolveAnyExerciseInputSchema,
    outputSchema: SolveAnyExerciseOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate problem. The AI model returned no output.');
    }
    return output;
  }
);
