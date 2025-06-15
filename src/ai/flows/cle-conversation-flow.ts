
'use server';

/**
 * @fileOverview Provides AI-powered conversation practice for the Child-Like Learning Engine (CLE).
 *
 * - getCleConversationResponse - A function that handles the AI conversation.
 * - CleConversationInput - The input type for the getCleConversationResponse function.
 * - CleConversationOutput - The return type for the getCleConversationResponse function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const ChatMessageSchema = z.object({
  speaker: z.enum(['user', 'ai']),
  text: z.string(),
});

const CleConversationInputSchema = z.object({
  // userId: z.string().optional().describe("The ID of the user, if available for personalization."),
  targetLanguage: z.string().describe("The language the user is trying to learn and speak in (e.g., 'Spanish', 'French')."),
  currentScene: z.string().describe("The current conversational context or scene (e.g., 'at a picnic', 'ordering food')."),
  todaysWords: z.array(z.string()).describe("A list of target vocabulary words for today's session that the AI should try to incorporate naturally."),
  userMessage: z.string().describe("The latest message from the user."),
  chatHistory: z.array(ChatMessageSchema).optional().describe("The history of the conversation so far, to provide context."),
});
export type CleConversationInput = z.infer<typeof CleConversationInputSchema>;

const CleConversationOutputSchema = z.object({
  aiResponseText: z.string().describe("The AI tutor's response to the user."),
  // suggestedReplies?: z.array(z.string()).optional().describe("Optional sentence starters or word suggestions for the user."),
});
export type CleConversationOutput = z.infer<typeof CleConversationOutputSchema>;

export async function getCleConversationResponse(input: CleConversationInput): Promise<CleConversationOutput> {
  return cleConversationFlow(input);
}

const clePrompt = ai.definePrompt({
  name: 'cleConversationPrompt',
  input: { schema: CleConversationInputSchema },
  output: { schema: CleConversationOutputSchema },
  prompt: `You are a friendly and patient AI language tutor for the LinguaScape app. Your role is to help a beginner learn {{{targetLanguage}}} by mimicking how a child learns their first language.

Current Conversation Scene: {{{currentScene}}}

Today's target words/phrases to practice (try to use some of these naturally if they fit the context):
{{#if todaysWords}}
{{#each todaysWords}}
- {{{this}}}
{{/each}}
{{else}}
(No specific target words for today, focus on general conversation related to the scene.)
{{/if}}

Your primary goals are:
1.  Keep sentences VERY SIMPLE and short, suitable for an absolute beginner. Use basic grammar.
2.  Be encouraging and positive. Praise effort.
3.  If the user makes a small mistake in {{{targetLanguage}}}, gently correct it by rephrasing or offering the correct form within your response, then continue the conversation. Don't be overly critical.
4.  Ask simple, open-ended questions related to the scene to encourage the user to speak.
5.  Repeat target words and simple phrases naturally.
6.  If the user's message is unclear or very short, you can ask a clarifying question or try to expand on what they might mean, using simple {{{targetLanguage}}}.
7.  Respond ONLY in {{{targetLanguage}}}. Do NOT use English or any other language unless {{{targetLanguage}}} itself is English.

Conversation History (if any):
{{#if chatHistory}}
{{#each chatHistory}}
{{this.speaker}}: {{this.text}}
{{/each}}
{{/if}}

User's latest message: {{{userMessage}}}

Your response (in {{{targetLanguage}}}, simple sentences):
`,
});

const cleConversationFlow = ai.defineFlow(
  {
    name: 'cleConversationFlow',
    inputSchema: CleConversationInputSchema,
    outputSchema: CleConversationOutputSchema,
  },
  async (input) => {
    // Potentially, add logic here to fetch user preferences or more context if needed.
    // For example, if the AI needs to know the user's native language for more tailored feedback (though the prompt currently doesn't ask for this).
    
    const { output } = await clePrompt(input);
    
    if (!output) {
        // Handle cases where the model might return no structured output
        // This can happen if the response doesn't match the schema perfectly.
        // For now, we'll try to construct a minimal valid output or throw.
        // A more robust solution might involve asking the model to retry or parsing raw text.
        console.warn("CLE Conversation Flow: Model output was null or undefined. Attempting to use raw text if available.");
        // const rawText = (await clePrompt.generate({input, outputFormat: "text"})).text(); // Hypothetical way to get raw text
        // if (rawText) return { aiResponseText: rawText };
        
        // Fallback if output is truly empty or schema fails
        return { aiResponseText: "I'm sorry, I had a little trouble understanding that. Could you try saying it differently?" };
    }
    return output;
  }
);
