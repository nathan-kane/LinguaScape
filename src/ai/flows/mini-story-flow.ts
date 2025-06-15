
'use server';

/**
 * @fileOverview Generates a short, simple story using daily vocabulary words.
 *
 * - generateMiniStory - A function that handles the mini-story generation.
 * - MiniStoryInput - The input type for the generateMiniStory function.
 * - MiniStoryOutput - The return type for the generateMiniStory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const MiniStoryInputSchema = z.object({
  targetLanguage: z.string().describe("The language the story should be written in (e.g., 'Spanish', 'French')."),
  learningMode: z.string().describe("The theme or context for the story (e.g., 'Travel', 'Conversational')."),
  dailyWords: z.array(z.string()).describe("A list of vocabulary words that the AI should try to incorporate into the story."),
});
export type MiniStoryInput = z.infer<typeof MiniStoryInputSchema>;

const MiniStoryOutputSchema = z.object({
  storyText: z.string().describe("The generated short story in the target language."),
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
Do not add any titles, headings, or introductory phrases like "Here is a story:". Just provide the story text directly.
Output only the story text.
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
    
    if (!output || !output.storyText) {
      console.warn("Mini Story Flow: Model output was null, undefined, or did not contain storyText.");
      // Return a very generic placeholder story in the target language if possible,
      // or a fixed message if we can't even trust the target language input.
      // This is a very basic fallback.
      let fallbackStory = "I am sorry, I could not create a story right now. Let's try again later.";
      if (input.targetLanguage.toLowerCase() === 'spanish') {
        fallbackStory = "Lo siento, no pude crear una historia ahora. Intentemos más tarde.";
      } else if (input.targetLanguage.toLowerCase() === 'french') {
        fallbackStory = "Je suis désolé, je n'ai pas pu créer d'histoire pour le moment. Réessayons plus tard.";
      }
      return { storyText: fallbackStory };
    }
    return output;
  }
);
