'use server';

/**
 * @fileOverview Generates interactive quizzes for students.
 *
 * - generateQuiz - A function that generates a quiz on a given topic.
 * - GenerateQuizInput - The input type for the generateQuiz function.
 * - GenerateQuizOutput - The return type for the generateQuiz function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const GenerateQuizInputSchema = z.object({
  subject: z.string().describe('The subject of the quiz.'),
  topic: z.string().describe('The specific topic within the subject for the quiz.'),
  questionCount: z.number().describe('The number of questions in the quiz.'),
  studentLevel: z
    .string()
    .describe(
      'The current academic level of the student (e.g., "Première G1").'
    ),
});
export type GenerateQuizInput = z.infer<typeof GenerateQuizInputSchema>;

const QuizQuestionSchema = z.object({
    question: z.string().describe("The quiz question."),
    options: z.array(z.string()).describe("A list of possible answers for the question."),
    correctAnswer: z.string().describe("The correct answer from the options."),
    explanation: z.string().describe("A brief explanation for the correct answer.")
});

const GenerateQuizOutputSchema = z.object({
  questions: z.array(QuizQuestionSchema).describe('The list of generated quiz questions.'),
});
export type GenerateQuizOutput = z.infer<typeof GenerateQuizOutputSchema>;
export type QuizQuestion = z.infer<typeof QuizQuestionSchema>;


export async function generateQuiz(
  input: GenerateQuizInput
): Promise<GenerateQuizOutput> {
  return generateQuizFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateQuizPrompt',
  input: {schema: GenerateQuizInputSchema},
  output: {schema: GenerateQuizOutputSchema},
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
  prompt: `You are an expert teacher specializing in secondary education in Côte d'Ivoire,
  particularly for students in the G1 series ({{studentLevel}}).

  Generate a quiz with {{questionCount}} multiple-choice questions for a student studying {{subject}}, specifically on the topic of "{{topic}}".
  The quiz should be relevant to the Ivorian context. Each question must have several options, one correct answer, and a brief explanation for why the answer is correct.
  Ensure the options are plausible and the correct answer is clearly identifiable within the provided options.
  Return the output as a structured JSON object.
  `,
});

const generateQuizFlow = ai.defineFlow(
  {
    name: 'generateQuizFlow',
    inputSchema: GenerateQuizInputSchema,
    outputSchema: GenerateQuizOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
     if (!output) {
      throw new Error('Failed to generate quiz. The AI model returned no output.');
    }
    return output;
  }
);
