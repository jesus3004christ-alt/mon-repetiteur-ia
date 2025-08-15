
'use server';

/**
 * @fileOverview Practice problem generation for students, tailored to their lesson and level of understanding.
 *
 * - generatePracticeProblem - A function that generates practice problems.
 * - GeneratePracticeProblemInput - The input type for the generatePracticeProblem function.
 * - GeneratePracticeProblemOutput - The return type for the generatePracticeProblem function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GeneratePracticeProblemInputSchema = z.object({
  subject: z.string().describe('The subject for which to generate a practice problem.'),
  topic: z.string().describe('The specific topic within the subject for the practice problem.'),
  difficulty: z
    .enum(['easy', 'medium', 'hard'])
    .describe('The difficulty level of the practice problem.'),
  studentLevel: z
    .string()
    .describe(
      'The current academic level of the student (e.g., "Première G1").' // Ensure this matches the user story
    ),
});

export type GeneratePracticeProblemInput = z.infer<typeof GeneratePracticeProblemInputSchema>;

const GeneratePracticeProblemOutputSchema = z.object({
  problem: z.string().describe('The generated practice problem.'),
  solution: z.string().describe('The step-by-step solution to the problem.'),
  keyConcepts: z.array(z.string()).describe("A list of key concepts or lesson parts the student needs to know to solve the problem.")
});

export type GeneratePracticeProblemOutput = z.infer<typeof GeneratePracticeProblemOutputSchema>;

export async function generatePracticeProblem(
  input: GeneratePracticeProblemInput
): Promise<GeneratePracticeProblemOutput> {
  return generatePracticeProblemFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generatePracticeProblemPrompt',
  input: {schema: GeneratePracticeProblemInputSchema},
  output: {schema: GeneratePracticeProblemOutputSchema},
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
  particulièrement pour les élèves de la série G1 (Première G1).

  Générez un problème pratique pour un élève de {{studentLevel}} étudiant la matière {{subject}}, spécifiquement sur le thème de {{topic}}.
  Le problème doit être d'un niveau de difficulté {{difficulty}} et pertinent pour le contexte ivoirien.

  Avant de donner la solution, identifiez les concepts clés que l'élève doit maîtriser. Pour chaque concept, fournissez une brève explication détaillée, une formule si applicable, ou un exemple simple pour rafraîchir la mémoire de l'élève. Listez ces rappels dans le champ "keyConcepts".

  Fournissez ensuite une solution détaillée, étape par étape, au problème dans le champ "solution".
  
  IMPORTANT: La totalité de la réponse, y compris le problème et la solution, DOIT être en français.`,
});

const generatePracticeProblemFlow = ai.defineFlow(
  {
    name: 'generatePracticeProblemFlow',
    inputSchema: GeneratePracticeProblemInputSchema,
    outputSchema: GeneratePracticeProblemOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error('Failed to generate problem. The AI model returned no output.');
    }
    return output;
  }
);
