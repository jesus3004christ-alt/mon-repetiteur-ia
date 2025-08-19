"use server";

import { courseGenerationFlow } from "@/ai/flows/course-generation-flow";
import { presentationAssistanceFlow, PresentationPlan } from "@/ai/flows/presentation-assistance-flow";
import { generatePracticeProblem, GeneratePracticeProblemOutput } from "@/ai/flows/practice-problem-generation";
import { solveImageExercise, SolveImageExerciseOutput } from "@/ai/flows/image-exercise-flow";
import { generateQuiz, GenerateQuizOutput } from "@/ai/flows/quiz-generation-flow";
import { summarizeLesson, SummarizeLessonOutput } from "@/ai/flows/lesson-summarization";
import { answerQuestion, AnswerQuestionOutput } from "@/ai/flows/interactive-qa-flow";
import { solveAnyExercise, SolveAnyExerciseOutput } from "@/ai/flows/solve-any-exercise-flow";


import { z } from "zod";

async function safeRun<T>(fn: () => Promise<T>): Promise<{ data: T | null; error: string | null; }> {
    try {
        const data = await fn();
        return { data, error: null };
    } catch (e: any) {
        console.error("Action Error:", e);
        const errorMessage = e.message || "An unexpected error occurred.";
        return { data: null, error: errorMessage };
    }
}

const toBase64 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
};

const fileToDataURI = async (file: File) => {
    const base64 = await toBase64(file);
    return `data:${file.type};base64,${base64}`;
}


// Action pour le générateur de cours
export async function generateCourseAction(input: { subject: string, chapter: string }) {
  const schema = z.object({
    subject: z.string().min(1),
    chapter: z.string().min(3),
  });
  const validatedInput = schema.parse(input);
  return await courseGenerationFlow(validatedInput);
}

// Action pour l'aide aux exposés
export async function generatePresentationAction(input: { subject: string, topic: string }): Promise<PresentationPlan> {
  const schema = z.object({
    subject: z.string().min(1),
    topic: z.string().min(5),
  });
  const validatedInput = schema.parse(input);
  return await presentationAssistanceFlow(validatedInput);
}

// Action pour la génération d'exercices
export async function generateProblemAction(formData: FormData) {
    return safeRun<GeneratePracticeProblemOutput>(async () => {
        const input = {
            subject: formData.get('subject') as string,
            topic: formData.get('topic') as string,
            difficulty: formData.get('difficulty') as 'easy' | 'medium' | 'hard',
            studentLevel: formData.get('studentLevel') as string,
        };
        const schema = z.object({
            subject: z.string().min(1),
            topic: z.string().min(3),
            difficulty: z.enum(['easy', 'medium', 'hard']),
            studentLevel: z.string().min(1),
        });
        const validatedInput = schema.parse(input);
        return await generatePracticeProblem(validatedInput);
    });
}

// Action pour la résolution d'exercices par image
export async function solveImageExerciseAction(formData: FormData) {
    return safeRun<SolveImageExerciseOutput>(async () => {
        const imageFile = formData.get('exerciseImage') as File;
        const exerciseImage = await fileToDataURI(imageFile);

        const input = {
            subject: formData.get('subject') as string,
            studentLevel: formData.get('studentLevel') as string,
            exerciseImage: exerciseImage
        };

        const schema = z.object({
            subject: z.string().min(1),
            studentLevel: z.string().min(1),
            exerciseImage: z.string().startsWith('data:image'),
        });

        const validatedInput = schema.parse(input);
        return await solveImageExercise(validatedInput);
    });
}

export async function solveAnyExerciseAction(formData: FormData) {
    return safeRun<SolveAnyExerciseOutput>(async () => {

        const inputType = formData.get('inputType');
        const input = {
            subject: formData.get('subject') as string,
            studentLevel: formData.get('studentLevel') as string,
            exerciseImage: '',
            exerciseText: '',
        }

        if (inputType === 'image') {
            const imageFile = formData.get('exerciseImage') as File;
            input.exerciseImage = await fileToDataURI(imageFile);
        } else {
            input.exerciseText = formData.get('exerciseText') as string;
        }

        const schema = z.object({
            subject: z.string().min(1, "La matière est requise."),
            studentLevel: z.string().min(1, "Le niveau de l'élève est requis."),
            exerciseImage: z.string().optional(),
            exerciseText: z.string().optional(),
        }).refine(data => data.exerciseImage || data.exerciseText, {
            message: "L'image ou le texte de l'exercice doit être fourni.",
            path: ["exerciseText"]
        });

        const validatedInput = schema.parse(input);
        return await solveAnyExercise(validatedInput);
    });
}


// Action pour la génération de quiz
export async function generateQuizAction(formData: FormData) {
    return safeRun<GenerateQuizOutput>(async () => {
        const input = {
            subject: formData.get('subject') as string,
            topic: formData.get('topic') as string,
            questionCount: 5, // Hardcoded for now
            studentLevel: "Première G1", // Hardcoded
        };
         const schema = z.object({
            subject: z.string().min(1),
            topic: z.string().min(3),
            questionCount: z.number().int().positive(),
            studentLevel: z.string().min(1),
        });
        const validatedInput = schema.parse(input);
        return await generateQuiz(validatedInput);
    });
}

// Action pour le résumé de leçon
export async function summarizeLessonAction(formData: FormData) {
    return safeRun<SummarizeLessonOutput>(async () => {
        const imageFile = formData.get('lessonImage') as File | null;
        let lessonImage: string | undefined = undefined;
        if (imageFile && imageFile.size > 0) {
            lessonImage = await fileToDataURI(imageFile);
        }

        const input = {
            subject: formData.get('subject') as string,
            lessonContent: formData.get('lessonContent') as string | undefined,
            lessonImage,
        };

        const schema = z.object({
            subject: z.string().optional(),
            lessonContent: z.string().optional(),
            lessonImage: z.string().optional(),
        }).refine(data => data.lessonContent || data.lessonImage, {
            message: "Le contenu ou l'image de la leçon doit être fourni.",
            path: ["lessonContent"]
        });

        const validatedInput = schema.parse(input);
        return await summarizeLesson(validatedInput);
    });
}


// Action pour la Q&R interactive
export async function askQuestionAction(formData: FormData) {
    return safeRun<AnswerQuestionOutput>(async () => {
        const input = {
            subject: formData.get('subject') as string,
            question: formData.get('question') as string,
        };
        const schema = z.object({
            subject: z.string().min(1),
            question: z.string().min(5),
        });
        const validatedInput = schema.parse(input);
        return await answerQuestion(validatedInput);
    });
}
