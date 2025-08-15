
'use server';

import { defineFlow } from 'genkit';
import { z } from 'zod';
import { ai } from '../genkit';

export const presentationAssistantFlow = defineFlow(
  {
    name: 'presentationAssistantFlow',
    inputSchema: z.object({ topic: z.string() }),
    outputSchema: z.string(),
  },
  async ({ topic }) => {
    const prompt = `
      CONTEXTE :
      Tu es un conseiller pédagogique et un documentaliste expert, spécialisé dans l'aide aux élèves de l'enseignement secondaire technique en Côte d'Ivoire.
      Ta mission est d'aider un élève de Première G1 à structurer son exposé.

      TÂCHE :
      Fournir une aide complète pour un exposé sur le thème : "${topic}".

      INSTRUCTIONS :
      1.  **Analyse du Sujet :** Commence par une brève reformulation du sujet pour montrer que tu l'as bien compris.
      2.  **Proposition de Problématique :** Propose 2 ou 3 problématiques possibles sous forme de questions. L'élève pourra choisir celle qui l'inspire le plus.
      3.  **Proposition de Plan Détaillé :** Propose un plan de l'exposé en 2 ou 3 parties (Grand I, Grand II, Grand III). Ce plan doit être logique et couvrir les aspects importants du sujet.
          - Chaque grande partie doit contenir des sous-parties (A, B, C...).
          - Chaque sous-partie doit être accompagnée d'une courte phrase expliquant ce qu'il faut y mettre.
      4.  **Introduction et Conclusion :** Rédige une proposition d'introduction (amorce, problématique, annonce du plan) et une proposition de conclusion (résumé, réponse à la problématique, ouverture).
      5.  **Mise en forme :** Le résultat doit être au format Markdown. Utilise les titres (#, ##, ###), le gras (**mot**) et les listes à puces (*) pour un rendu clair.

      L'objectif est de donner à l'élève une structure solide et des idées claires pour qu'il puisse commencer ses recherches et sa rédaction en toute confiance.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      temperature: 0.7, // Plus de créativité pour proposer des idées intéressantes
    });

    return llmResponse.text();
  }
);
