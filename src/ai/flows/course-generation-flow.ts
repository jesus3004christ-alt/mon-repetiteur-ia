import { z } from 'zod';
import { ai } from '../genkit';
import { Flow } from 'genkit'; // Changement ici: Flow avec F majuscule

// Schéma de la réponse attendue de l'IA
const CourseSchema = z.object({
  title: z.string().describe('Le titre principal du cours (ex: "Introduction à la Comptabilité Générale")'),
  introduction: z.string().describe("Une brève introduction qui présente le chapitre et ses objectifs pédagogiques."),
  sections: z.array(
    z.object({
      title: z.string().describe("Le titre de la section (ex: 'Le Bilan Comptable')."),
      content: z.string().describe("Le contenu détaillé de la section, expliqué de manière simple et pédagogique avec des exemples concrets."),
      subsections: z.array(
        z.object({
          title: z.string().describe("Le titre de la sous-section."),
          content: z.string().describe("Le contenu détaillé de la sous-section."),
        })
      ).optional().describe("Les sous-sections, si nécessaire pour diviser une section complexe."),
    })
  ).describe("La liste des sections qui structurent le cours."),
  summary: z.string().describe("Un résumé ou une conclusion qui récapitule les points clés du chapitre."),
  quiz: z.array(
    z.object({
      question: z.string().describe("Une question à choix multiples pour tester la compréhension."),
      options: z.array(z.string()).describe("Une liste de 4 options de réponse possibles."),
      correctAnswer: z.string().describe("La réponse correcte parmi les options."),
    })
  ).describe("Un mini-quiz de 3 à 5 questions pour l'auto-évaluation de l'élève."),
});


export const courseGenerationFlow = Flow( // Utilisation de Flow avec F majuscule
  {
    name: 'courseGenerationFlow',
    inputSchema: z.object({
      subject: z.string(),
      chapter: z.string(),
    }),
    outputSchema: z.string(), // Le cours sera généré en format Markdown
  },
  async ({ subject, chapter }) => {
    const prompt = `
      CONTEXTE :
      Tu es un excellent professeur spécialisé dans l'enseignement technique et professionnel en Côte d'Ivoire.
      Ta mission est de créer un cours complet et facile à comprendre pour un élève de Première G1.
      Le cours doit être bien structuré, détaillé, et utiliser des exemples simples et pertinents pour le contexte ivoirien.

      TÂCHE :
      Génère un cours complet sur le chapitre "${chapter}" pour la matière "${subject}".

      FORMAT DE SORTIE ATTENDU :
      Le cours doit être généré au format Markdown et suivre rigoureusement la structure suivante :

      # TITRE DU COURS

      ## Introduction
      [Présente brièvement le chapitre, son importance et ce que l'élève va apprendre.]

      ## Section 1 : Titre de la section
      [Contenu détaillé, explications claires, exemples...]

      ### Sous-section 1.1 (si nécessaire)
      [Contenu de la sous-section...]

      ## Section 2 : Titre de la section
      [Contenu détaillé, explications claires, exemples...]

      ... (autant de sections que nécessaire) ...

      ## Résumé / Points Clés
      [Récapitule les informations les plus importantes du cours en quelques points.]

      ## Mini-Quiz pour tester tes connaissances
      [Propose 3 à 5 questions à choix multiples avec la bonne réponse indiquée clairement pour que l'élève puisse s'auto-évaluer.]
      Exemple:
      1.  Quelle est la définition du bilan ?
          a) Un état financier des charges et produits
          b) Une photographie du patrimoine de l'entreprise à une date donnée
          c) Un document qui liste les salaires
          d) Le journal des opérations quotidiennes
          **Réponse : b)**

      Assure-toi que le contenu est pédagogique, simplifié mais précis.
    `;

    const llmResponse = await ai.generate({
      prompt: prompt,
      model: 'gemini-1.5-flash',
      output: {
        format: 'text', // Demande une sortie en texte brut (Markdown)
      },
    });

    return llmResponse.text();
  }
);
