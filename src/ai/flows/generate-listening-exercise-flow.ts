
'use server';
/**
 * @fileOverview Generates a listening exercise (title, transcript, questions) in a target language.
 *
 * - generateListeningExercise - A function that handles listening exercise generation.
 * - GenerateListeningExerciseInput - The input type for the function.
 * - GenerateListeningExerciseOutput - The return type for the function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ListeningExerciseQuestionOptionSchema = z.object({
  id: z.string().describe("A unique ID for the option (e.g., 'a', 'b', 'c')."),
  text: z.string().describe("The option text, in the target language."),
});

const ListeningExerciseQuestionSchema = z.object({
  id: z.string().describe("A unique ID for the question (e.g., 'q1', 'q2')."),
  text: z.string().describe("The question text, in the target language."),
  options: z.array(ListeningExerciseQuestionOptionSchema).min(2).max(4).describe("Multiple choice options for the question."),
  correctOptionId: z.string().describe("The ID of the correct option."),
});

const GenerateListeningExerciseInputSchema = z.object({
  targetLanguageName: z.string().describe("The full name of the target language (e.g., 'Spanish', 'French'). All generated content should be in this language."),
  targetLanguageCode: z.string().describe("The BCP 47 code of the target language (e.g., 'es-ES', 'fr-FR') for TTS hint, though actual content generation is based on name."),
  nativeLanguageName: z.string().describe("The user's native language, for context if the AI needs it, but output is in target language."),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).default('beginner').describe("The difficulty level of the exercise."),
});
export type GenerateListeningExerciseInput = z.infer<typeof GenerateListeningExerciseInputSchema>;

const GenerateListeningExerciseOutputSchema = z.object({
  title: z.string().describe("A short, engaging title for the listening exercise, in the target language."),
  transcript: z.string().describe("The full transcript of a short dialogue or monologue (approx 2-4 sentences), in the target language. This will be used for Text-to-Speech."),
  questions: z.array(ListeningExerciseQuestionSchema).min(1).max(3).describe("A list of 1 to 3 comprehension questions based on the transcript."),
  languageName: z.string().describe("The target language name in which the content is generated (echoed from input)."),
  difficulty: z.string().describe("The difficulty level of the exercise (echoed from input)."),
});
export type GenerateListeningExerciseOutput = z.infer<typeof GenerateListeningExerciseOutputSchema>;

export async function generateListeningExercise(input: GenerateListeningExerciseInput): Promise<GenerateListeningExerciseOutput> {
  return generateListeningExerciseFlow(input);
}

const listeningExercisePrompt = ai.definePrompt({
  name: 'generateListeningExercisePrompt',
  input: { schema: GenerateListeningExerciseInputSchema },
  output: { schema: GenerateListeningExerciseOutputSchema },
  prompt: `You are an expert language tutor creating engaging listening exercises.
Generate a complete listening exercise for a {{{difficulty}}} level learner of {{{targetLanguageName}}}.
The user's native language is {{{nativeLanguageName}}}.

The entire exercise (title, transcript, questions, and options) MUST be in {{{targetLanguageName}}}. Do NOT use {{{nativeLanguageName}}} or English for these parts.

Provide the following:
1.  'title': A short, catchy title for the exercise in {{{targetLanguageName}}}.
2.  'transcript': A brief dialogue or monologue (2-4 sentences) in {{{targetLanguageName}}}. This should be natural-sounding and appropriate for the {{{difficulty}}} level.
3.  'questions': An array of 1 to 3 multiple-choice comprehension questions based on the transcript. Each question must be in {{{targetLanguageName}}} and have:
    *   'id': A unique string ID (e.g., "q1").
    *   'text': The question text in {{{targetLanguageName}}}.
    *   'options': An array of 2 to 4 options, each with 'id' (e.g., "a", "b") and 'text' (in {{{targetLanguageName}}}).
    *   'correctOptionId': The 'id' of the correct option.
4.  'languageName': Echo back the '{{{targetLanguageName}}}'.
5.  'difficulty': Echo back the '{{{difficulty}}}' level.

Ensure the content is culturally appropriate and common for speakers of {{{targetLanguageName}}}.
The vocabulary and grammar should match the {{{difficulty}}} level. For 'beginner', use very simple sentences and common words.

Return ONLY the JSON object matching the output schema. Do not include any introductory text, explanations, or markdown formatting.
`,
});

const generateListeningExerciseFlow = ai.defineFlow(
  {
    name: 'generateListeningExerciseFlow',
    inputSchema: GenerateListeningExerciseInputSchema,
    outputSchema: GenerateListeningExerciseOutputSchema,
  },
  async (input) => {
    const { output } = await listeningExercisePrompt(input);
    if (!output) {
      console.error('Listening exercise generation failed or returned empty data from LLM.');
      // Construct a valid fallback output according to the schema
      return {
        title: `Error Generating Exercise in ${input.targetLanguageName}`,
        transcript: `I am sorry, I could not create a listening exercise in ${input.targetLanguageName} at this moment. Please try again.`,
        questions: [
          {
            id: 'q_error',
            text: 'Error',
            options: [{ id: 'a', text: 'OK' }],
            correctOptionId: 'a',
          },
        ],
        languageName: input.targetLanguageName,
        difficulty: input.difficulty,
      };
    }
    return output;
  }
);
