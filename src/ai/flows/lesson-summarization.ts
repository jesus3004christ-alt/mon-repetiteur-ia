
'use server';

/**
 * @fileOverview Provides lesson summaries across various subjects for Première G1 students.
 *
 * - summarizeLesson - A function to summarize lesson content from text or an image.
 * - SummarizeLessonInput - The input type for the summarizeLesson function.
 * - SummarizeLessonOutput - The return type for the summarizeLesson function.
 */

import {ai} from '@/ai/genkit';
import {googleAI} from '@genkit-ai/googleai';
import {z} from 'genkit';

const SummarizeLessonInputSchema = z.object({
  subject: z.string().optional().describe("The subject of the lesson"),
  lessonContent: z.string().optional().describe('The content of the lesson to be summarized.'),
  lessonImage: z.string().optional().describe('An image of the lesson content as a data URI.'),
});
export type SummarizeLessonInput = z.infer<typeof SummarizeLessonInputSchema>;

const SummarizeLessonOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the lesson content.'),
});
export type SummarizeLessonOutput = z.infer<typeof SummarizeLessonOutputSchema>;

export async function summarizeLesson(input: SummarizeLessonInput): Promise<SummarizeLessonOutput> {
  return summarizeLessonFlow(input);
}


const tutorialPrompt = ai.definePrompt({
  name: 'generateTutorialPrompt',
  input: {schema: SummarizeLessonInputSchema},
  output: {schema: SummarizeLessonOutputSchema},
  model: googleAI.model('gemini-1.5-flash-latest'),
  prompt: `You are a world-class technology educator creating a tutorial for high school students in Côte d'Ivoire.
    The user wants a tutorial on the following topic for the subject "{{subject}}": "{{lessonContent}}".
    Generate a clear, structured, and pedagogical tutorial on this topic.
    - Start with a simple introduction explaining what the tutorial will cover and why it's useful.
    - Use clear headings for each major section.
    - Provide step-by-step instructions where applicable.
    - Use bullet points for key information, tips, or shortcuts.
    - Provide simple, relatable examples, ideally linked to the Ivorian context. If it's for computer science, provide clear code snippets or formula examples if relevant.
    - Conclude with a brief summary of the key takeaways and perhaps a small challenge or "next steps" for the student.
    The entire tutorial must be in French.
    Return the tutorial in the "summary" field.
  `,
});

const summaryPrompt = ai.definePrompt({
  name: 'summarizeLessonPrompt',
  input: {schema: SummarizeLessonInputSchema},
  output: {schema: SummarizeLessonOutputSchema},
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
  prompt: `You are an expert teacher specializing in secondary education in Côte d'Ivoire.
    Your role is to provide a detailed and structured summary of the following lesson content.
    {{#if lessonImage}}
    First, perform OCR on the provided image to extract the text. Then, summarize the extracted text.
    {{/if}}
    The summary must be comprehensive, highlighting all the important points, definitions, formulas, and key examples from the lesson.
    Structure the summary with clear titles and bullet points to make it easy to understand and use for revision.
    The summary should be in clear and pedagogical French.
    Return only the summary text, without any introductory phrases, in the "summary" field.

    {{#if lessonContent}}
    Lesson Content:
    {{{lessonContent}}}
    {{/if}}

    {{#if lessonImage}}
    Lesson Image:
    {{media url=lessonImage}}
    {{/if}}
  `,
});

const summarizeLessonFlow = ai.defineFlow(
  {
    name: 'summarizeLessonFlow',
    inputSchema: SummarizeLessonInputSchema,
    outputSchema: SummarizeLessonOutputSchema,
  },
  async (input) => {
    const isTutorialSubject = ["Initiation à l'IA", "Informatique"].includes(input.subject!);
    const activePrompt = isTutorialSubject ? tutorialPrompt : summaryPrompt;

    let finalInput = { ...input };
    if (!isTutorialSubject && finalInput.lessonContent) {
        // Truncate the lesson content to the first 500 words to improve performance for summaries.
        const truncatedContent = finalInput.lessonContent.split(' ').slice(0, 500).join(' ');
        finalInput.lessonContent = truncatedContent;
    }
    
    const {output} = await activePrompt(finalInput);

    if (!output) {
      throw new Error('Failed to generate summary. The AI model returned no output.');
    }
    return output;
  }
);
