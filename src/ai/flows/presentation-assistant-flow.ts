'use server';

import { Flow as flow } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';

const PresentationPlanSchema = z.object({
  title: z.string().describe("Le titre suggéré pour l'exposé."),
  introduction: z.string().describe("Un paragraphe d'introduction qui présente le sujet et la problématique."),
  problematique: z.string().describe("La problématique centrale de l'exposé, formulée sous forme de question."),
  plan: z.array(
    z.object({
      part: z.string().describe("Le titre de la grande partie (ex: 'I. Contexte et Définitions')."),
      subparts: z.array(z.string()).describe("Les sous-parties ou idées à développer dans cette partie."),
    })
  ).describe("Le plan détaillé de l'exposé en 2 ou 3 grandes parties."),
  conclusion: z.string().describe("Un paragraphe de conclusion qui récapitule les points clés et ouvre sur une nouvelle question."),
  sources: z.string().describe("Quelques pistes ou types de sources où l'élève peut chercher des informations (ex: 'Manuels scolaires d'économie', 'Articles de presse spécialisée', 'Sites institutionnels')."),
});

export const presentationAssistanceFlow = flow(
  {
    name: 'presentationAssistanceFlow',
    inputSchema: z.object({
      topic: z.string(),
      subject: z.string(),
    }),
    outputSchema: PresentationPlanSchema,
  },
  async ({ topic, subject }) => {
    const prompt = `
      CONTEXTE :
      Tu es un assistant pédagogique expert, aidant un élève de Première G1 (enseignement technique) en Côte d'Ivoire à préparer un exposé.
      Ton aide doit être structurée, claire et l'encourager à réfléchir.

      TÂCHE :
      Prépare une proposition complète pour un exposé sur le thème "${topic}" dans la matière "${subject}".

      INSTRUCTIONS :
      1.  Propose un titre accrocheur pour l'exposé.
      2.  Rédige une problématique claire sous forme de question.
      3.  Rédige une courte introduction qui amène la problématique.
      4.  Construis un plan détaillé et logique en 2 ou 3 grandes parties (I, II, ...), chacune contenant des sous-parties (A, B, ...).
      5.  Rédige une conclusion qui répond à la problématique et propose une ouverture.
      6.  Suggère quelques pistes de recherche ou types de sources fiables pour l'élève.

      Le résultat doit être structuré et directement utilisable par l'élève pour commencer son travail.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'gemini-1.5-flash',
      output: {
        schema: PresentationPlanSchema,
      },
    });

    return llmResponse.output()!;
  }
);
