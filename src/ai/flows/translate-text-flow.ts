
'use server';

/**
 * @fileOverview Provides AI-powered text translation.
 *
 * - translateText - A function that handles text translation.
 * - TranslateTextInput - The input type for the translateText function.
 * - TranslateTextOutput - The return type for the translateText function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const TranslateTextInputSchema = z.object({
  textToTranslate: z.string().describe("The text that needs to be translated."),
  sourceLanguageName: z.string().describe("The language of the textToTranslate (e.g., 'Spanish', 'French')."),
  targetLanguageName: z.string().describe("The language to translate the text into (e.g., 'English', 'Ukrainian')."),
});
export type TranslateTextInput = z.infer<typeof TranslateTextInputSchema>;

const TranslateTextOutputSchema = z.object({
  translatedText: z.string().describe("The translated text."),
});
export type TranslateTextOutput = z.infer<typeof TranslateTextOutputSchema>;

export async function translateText(input: TranslateTextInput): Promise<TranslateTextOutput> {
  return translateTextFlow(input);
}

const translateTextPrompt = ai.definePrompt({
  name: 'translateTextPrompt',
  input: { schema: TranslateTextInputSchema },
  output: { schema: TranslateTextOutputSchema },
  prompt: `Translate the following text from {{{sourceLanguageName}}} to {{{targetLanguageName}}}.

Text to translate:
"{{{textToTranslate}}}"

Return ONLY the translated text in the 'translatedText' field. Do not include any other explanations or conversational filler.
`,
});

const translateTextFlow = ai.defineFlow(
  {
    name: 'translateTextFlow',
    inputSchema: TranslateTextInputSchema,
    outputSchema: TranslateTextOutputSchema,
  },
  async (input) => {
    const { output } = await translateTextPrompt(input);
    
    if (!output || !output.translatedText) {
      console.warn("Translate Text Flow: Model output was null, undefined, or did not contain translatedText.");
      // Attempt to provide a basic error message if translation fails.
      // This could be more sophisticated, e.g., trying a different model or returning a specific error code.
      let errorMessage = "Translation failed.";
      if (input.targetLanguageName.toLowerCase() === 'english') {
        errorMessage = `Sorry, I could not translate that from ${input.sourceLanguageName} to ${input.targetLanguageName} right now.`;
      } else if (input.targetLanguageName.toLowerCase() === 'spanish') {
        errorMessage = `Lo siento, no pude traducir eso de ${input.sourceLanguageName} a ${input.targetLanguageName} ahora.`;
      }
      // Add more languages as needed for error messages.
      return { translatedText: errorMessage };
    }
    return output;
  }
);
