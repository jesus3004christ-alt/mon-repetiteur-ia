
'use server';

import { generatePracticeProblem } from '@/ai/flows/practice-problem-generation';
import type { GeneratePracticeProblemOutput } from '@/ai/flows/practice-problem-generation';
import { summarizeLesson } from '@/ai/flows/lesson-summarization';
import { answerQuestion } from '@/ai/flows/interactive-qa-flow';
import type { AnswerQuestionOutput } from '@/ai/flows/interactive-qa-flow';
import { generateQuiz } from '@/ai/flows/quiz-generation-flow';
import type { GenerateQuizOutput } from '@/ai/flows/quiz-generation-flow';
import { solveImageExercise } from '@/ai/flows/image-exercise-flow';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import type { SummarizeLessonOutput } from '@/ai/flows/lesson-summarization';
import { solveAnyExercise } from '@/ai/flows/solve-any-exercise-flow';
import type { SolveAnyExerciseOutput } from '@/ai/flows/solve-any-exercise-flow';

interface ActionState<T> {
  data?: T;
  error?: string;
}

const problemSchema = z.object({
  subject: z.string(),
  topic: z.string().min(3, "The exercise topic is too short."),
  difficulty: z.enum(['easy', 'medium', 'hard']),
  studentLevel: z.string(),
});

export async function generateProblemAction(formData: FormData): Promise<ActionState<GeneratePracticeProblemOutput>> {
  const validatedFields = problemSchema.safeParse(Object.fromEntries(formData.entries()));

  if (!validatedFields.success) {
    return {
      error: validatedFields.error.flatten().fieldErrors.topic?.[0] || 'Please provide a valid topic.',
    };
  }
  
  try {
    const result = await generatePracticeProblem(validatedFields.data);
    revalidatePath('/subjects/[subject]', 'page');
    return { data: result };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to generate problem: ${errorMessage}`};
  }
}

const fileToDataURI = async (file: File) => {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return `data:${file.type};base64,${buffer.toString('base64')}`;
}

export async function summarizeLessonAction(formData: FormData): Promise<ActionState<SummarizeLessonOutput>> {
    const rawData = Object.fromEntries(formData.entries());

    try {
        const inputData: any = { subject: rawData.subject };
        if (rawData.lessonImage && (rawData.lessonImage as File).size > 0) {
            const imageFile = rawData.lessonImage as File;
            inputData.lessonImage = await fileToDataURI(imageFile);
        } else {
            inputData.lessonContent = rawData.lessonContent;
        }

        const result = await summarizeLesson(inputData);
        revalidatePath('/subjects/[subject]', 'page');
        return { data: result };

    } catch (error) {
        console.error('Summarization Action Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Summarization failed: ${errorMessage}` };
    }
}

const qaSchema = z.object({
    subject: z.string(),
    question: z.string().min(5, "Your question is too short."),
});

export async function askQuestionAction(formData: FormData): Promise<{data: AnswerQuestionOutput | null, error?: string}> {
    const validatedFields = qaSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { data: null, error: validatedFields.error.flatten().fieldErrors.question?.[0] || 'Invalid question.' };
    }

    try {
        const result = await answerQuestion(validatedFields.data);
        return { data: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { data: null, error: `Could not get an answer: ${errorMessage}` };
    }
}

const quizSchema = z.object({
    subject: z.string(),
    topic: z.string().min(3, "The topic is too short."),
});

export async function generateQuizAction(formData: FormData): Promise<ActionState<GenerateQuizOutput>> {
    const validatedFields = quizSchema.safeParse(Object.fromEntries(formData.entries()));

    if (!validatedFields.success) {
        return { error: validatedFields.error.flatten().fieldErrors.topic?.[0] || 'Invalid fields.' };
    }

    try {
        const result = await generateQuiz({
            ...validatedFields.data,
            questionCount: 5, // Generate 5 questions by default
            studentLevel: 'Première G1',
        });
        revalidatePath('/subjects/[subject]', 'page');
        return { data: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to generate quiz: ${errorMessage}` };
    }
}

const imageExerciseSchema = z.object({
    subject: z.string(),
    exerciseImage: z.instanceof(File),
    studentLevel: z.string(),
});

export async function solveImageExerciseAction(formData: FormData): Promise<ActionState<GeneratePracticeProblemOutput>> {
    const rawData = Object.fromEntries(formData.entries());
    const validatedFields = imageExerciseSchema.safeParse(rawData);

     if (!validatedFields.success) {
        return { error: 'Please provide a valid image.' };
    }

    const { exerciseImage, subject, studentLevel } = validatedFields.data;

    try {
        const imageDataUri = await fileToDataURI(exerciseImage);
        const result = await solveImageExercise({
            subject,
            studentLevel,
            exerciseImage: imageDataUri,
        });
        revalidatePath('/subjects/[subject]', 'page');
        return { data: result };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
        return { error: `Failed to solve exercise: ${errorMessage}`};
    }
}

export async function solveAnyExerciseAction(formData: FormData): Promise<ActionState<SolveAnyExerciseOutput>> {
  const rawData = Object.fromEntries(formData.entries());
  
  const schema = z.object({
    subject: z.string().nonempty("Please select a subject."),
    studentLevel: z.string(),
    inputType: z.enum(['text', 'image']),
    exerciseText: z.string().optional(),
    exerciseImage: z.instanceof(File).optional(),
  });

  const validatedFields = schema.safeParse(rawData);

  if (!validatedFields.success) {
    return { error: "Invalid data. " + validatedFields.error.flatten().fieldErrors.subject?.[0] };
  }
  
  const { inputType, subject, studentLevel, exerciseImage, exerciseText } = validatedFields.data;

  try {
    const input: any = { subject, studentLevel };
    if (inputType === 'image' && exerciseImage) {
      input.exerciseImage = await fileToDataURI(exerciseImage);
    } else if (inputType === 'text' && exerciseText) {
      input.exerciseText = exerciseText;
    } else {
        return { error: "Please provide the exercise text or image." };
    }

    const result = await solveAnyExercise(input);
    revalidatePath('/solve-exercise', 'page');
    return { data: result };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred.';
    return { error: `Failed to solve exercise: ${errorMessage}` };
  }
}
