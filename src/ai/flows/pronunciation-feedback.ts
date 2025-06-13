'use server';

/**
 * @fileOverview Provides AI-powered feedback on user pronunciation, including specific guidance on difficult sounds.
 *
 * - getPronunciationFeedback - A function that handles the pronunciation feedback process.
 * - PronunciationFeedbackInput - The input type for the getPronunciationFeedback function.
 * - PronunciationFeedbackOutput - The return type for the getPronunciationFeedback function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PronunciationFeedbackInputSchema = z.object({
  spokenText: z.string().describe('The text spoken by the user.'),
  targetText: z.string().describe('The correct text that the user is trying to pronounce.'),
  language: z.string().describe('The language of the text.'),
});
export type PronunciationFeedbackInput = z.infer<typeof PronunciationFeedbackInputSchema>;

const PronunciationFeedbackOutputSchema = z.object({
  overallFeedback: z.string().describe('Overall feedback on the user pronunciation.'),
  specificGuidance: z
    .array(
      z.object({
        sound: z.string().describe('The specific sound that needs improvement.'),
        tip: z.string().describe('A tip on how to pronounce the sound correctly.'),
      })
    )
    .describe('Specific guidance on difficult sounds.'),
});
export type PronunciationFeedbackOutput = z.infer<typeof PronunciationFeedbackOutputSchema>;

export async function getPronunciationFeedback(input: PronunciationFeedbackInput): Promise<PronunciationFeedbackOutput> {
  return pronunciationFeedbackFlow(input);
}

const pronunciationFeedbackPrompt = ai.definePrompt({
  name: 'pronunciationFeedbackPrompt',
  input: {schema: PronunciationFeedbackInputSchema},
  output: {schema: PronunciationFeedbackOutputSchema},
  prompt: `You are an AI pronunciation coach, providing feedback to language learners.

  Analyze the user's spoken text compared to the target text, and provide:

  1.  Overall feedback on their pronunciation.
  2.  Specific guidance on difficult sounds, including tips on how to pronounce them correctly.

  Spoken Text: {{{spokenText}}}
  Target Text: {{{targetText}}}
  Language: {{{language}}}

  Format the specific guidance as a JSON array of objects, each with a 'sound' and 'tip' field.
  `,
});

const pronunciationFeedbackFlow = ai.defineFlow(
  {
    name: 'pronunciationFeedbackFlow',
    inputSchema: PronunciationFeedbackInputSchema,
    outputSchema: PronunciationFeedbackOutputSchema,
  },
  async input => {
    const {output} = await pronunciationFeedbackPrompt(input);
    return output!;
  }
);
