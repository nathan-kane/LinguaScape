
'use server';

/**
 * @fileOverview Generates a short, simple story using daily vocabulary words and provides its translation.
 *
 * - generateMiniStory - A function that handles the mini-story generation and translation.
 * - MiniStoryInput - The input type for the generateMiniStory function.
 * - MiniStoryOutput - The return type for the generateMiniStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MiniStoryInputSchema = z.object({
  targetLanguage: z.string().describe("The language the story should be written in (e.g., 'Spanish', 'French')."),
  nativeLanguageName: z.string().describe("The user's native language for translation (e.g., 'English', 'German')."),
  learningMode: z.string().describe("The theme or context for the story (e.g., 'Travel', 'Conversational')."),
  dailyWords: z.array(z.string()).describe("A list of vocabulary words that the AI should try to incorporate into the story."),
});
export type MiniStoryInput = z.infer<typeof MiniStoryInputSchema>;

const MiniStoryOutputSchema = z.object({
  storyText: z.string().describe("The generated short story in the target language."),
  translatedStoryText: z.string().describe("The translation of the story into the user's native language."),
});
export type MiniStoryOutput = z.infer<typeof MiniStoryOutputSchema>;

export async function generateMiniStory(input: MiniStoryInput): Promise<MiniStoryOutput> {
  return miniStoryFlow(input);
}

const miniStoryPrompt = ai.definePrompt({
  name: 'miniStoryPrompt',
  input: { schema: MiniStoryInputSchema },
  output: { schema: MiniStoryOutputSchema },
  prompt: `You are a creative storyteller for the LinguaScape language learning app.
Your task is to write a very short and simple story in {{{targetLanguage}}} suitable for a beginner learner.
The story should be related to the theme: {{{learningMode}}}.
The story should be approximately 3-5 sentences long.

Please try to naturally incorporate some of the following words from today's lesson:
{{#if dailyWords}}
{{#each dailyWords}}
- {{{this}}}
{{/each}}
{{else}}
(No specific words provided, focus on a simple story for the theme.)
{{/if}}

The story MUST be ONLY in {{{targetLanguage}}}. Keep sentences short and grammar very basic.
Do not add any titles, headings, or introductory phrases like "Here is a story:". Just provide the story text directly in the 'storyText' field.

After generating the story in {{{targetLanguage}}}, you MUST also provide a translation of that story into {{{nativeLanguageName}}}. Place this translation in the 'translatedStoryText' field.

Output only the JSON object containing 'storyText' and 'translatedStoryText'.
`,
});

const miniStoryFlow = ai.defineFlow(
  {
    name: 'miniStoryFlow',
    inputSchema: MiniStoryInputSchema,
    outputSchema: MiniStoryOutputSchema,
  },
  async (input) => {
    const { output } = await miniStoryPrompt(input);
    
    if (!output || !output.storyText || output.translatedStoryText === undefined) { // Check for translatedStoryText too
      console.warn("Mini Story Flow: Model output was null, undefined, or did not contain storyText or translatedStoryText.");
      
      let fallbackStory = "I am sorry, I could not create a story right now. Let's try again later.";
      let fallbackTranslation = "Apologies, translation is currently unavailable.";

      if (input.targetLanguage.toLowerCase() === 'spanish') {
        fallbackStory = "Lo siento, no pude crear una historia ahora. Intentemos más tarde.";
      } else if (input.targetLanguage.toLowerCase() === 'french') {
        fallbackStory = "Je suis désolé, je n'ai pas pu créer d'histoire pour le moment. Réessayons plus tard.";
      }
      
      if (input.nativeLanguageName.toLowerCase() === 'spanish') {
        fallbackTranslation = "Disculpas, la traducción no está disponible actualmente.";
      } else if (input.nativeLanguageName.toLowerCase() === 'french') {
        fallbackTranslation = "Désolé, la traduction est actuellement indisponible.";
      }


      return { storyText: output?.storyText || fallbackStory, translatedStoryText: output?.translatedStoryText || fallbackTranslation };
    }
    return output;
  }
);
