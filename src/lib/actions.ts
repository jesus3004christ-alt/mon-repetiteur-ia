"use server";

import { courseGenerationFlow } from "@/ai/flows/course-generation-flow";
import { presentationAssistanceFlow } from "@/ai/flows/presentation-assistance-flow";
import { z } from "zod";

// Action pour le générateur de cours
export async function generateCourseAction(input: { subject: string, chapter: string }) {
  // Validation simple pour la sécurité
  const schema = z.object({
    subject: z.string().min(1),
    chapter: z.string().min(3),
  });
  const validatedInput = schema.parse(input);
  return await courseGenerationFlow(validatedInput);
}

// Action pour l'aide aux exposés
export async function generatePresentationAction(input: { subject: string, topic: string }) {
  // Validation simple pour la sécurité
  const schema = z.object({
    subject: z.string().min(1),
    topic: z.string().min(5),
  });
  const validatedInput = schema.parse(input);
  return await presentationAssistanceFlow(validatedInput);
}
