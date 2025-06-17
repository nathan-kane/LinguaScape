import { z } from 'zod';
;
// import { DailyWordItem } from '@/lib/types'; // Adjust this import to your actual DailyWordItem definition
import genkit from '@genkit-ai/flow';

const GenerateVocabularyRequestSchema = z.object({
  languageCode: z.string().describe('The code of the target language (e.g., "es", "fr", "ua").'),
  modeId: z.string().describe('The ID of the learning mode (e.g., "travel", "daily").'),
});

const VocabularyWordSchema = z.object({
  wordBankId: z.string().describe('A unique identifier for the word.'),
  word: z.string().describe('The vocabulary word in the target language.'),
  translation: z.string().describe('The translation of the word in English.'),
  exampleSentence: z.string().describe('An example sentence using the word in the target language.'),
  wordType: z.enum(['noun', 'verb', 'adjective', 'phrase', 'other']).describe('The type of the word.'),
  dataAiHint: z.string().describe('A short hint for generating an image related to the word/example.'),
});

const GenerateVocabularyResponseSchema = z.object({
  vocabulary: z.array(VocabularyWordSchema).describe('A list of generated vocabulary words.'),
});

export const generateVocabularyFlow = genkit.defineFlow(
  {
    name: 'generateVocabularyFlow',
    inputSchema: GenerateVocabularyRequestSchema,
    outputSchema: GenerateVocabularyResponseSchema,
  },
  async (input) => {
    try {
      const prompt = `Generate a diverse list of 7 vocabulary words for learning ${input.languageCode}, suitable for a "${input.modeId}" learning mode.
Each word should include:
- word: The word in ${input.languageCode}.
- translation: The English translation.
- exampleSentence: A sentence using the word in ${input.languageCode}.
- wordType: The grammatical type (noun, verb, adjective, phrase, or other).
- dataAiHint: A short phrase (1-3 words) describing a concept for generating an image related to the word or example.

Format the output as a JSON array of objects, strictly adhering to the following JSON schema:
${JSON.stringify(VocabularyWordSchema.shape, null, 2)}

Ensure the words are common and useful for a beginner/intermediate learner in the specified mode. Avoid repeating words in the list. Provide only the JSON array in your response, no extra text or formatting.
`;

      const response = await genkit.run(
 'generate-vocabulary-step',
        async () => {
          // Assume 'model' is a pre-configured model object accessible here
          const modelResponse = await model.generate({ // Use model.generate
            prompt: prompt,
            config: {
              output: { format: 'json' },
            },
          });
 return modelResponse.text();
        }
      );

      // The response is the raw text output from the step
      const rawOutput = response;
      const vocabulary = JSON.parse(rawOutput); // Parse the JSON string output

      // Validate the generated output against the schema
      const validatedVocabulary = GenerateVocabularyResponseSchema.parse({ vocabulary }).vocabulary;

      // Assign simple wordBankIds to each validated vocabulary item
      const vocabularyWithIds = validatedVocabulary.map((item, index) => ({ ...item, wordBankId: `${input.languageCode}_${input.modeId}_${index + 1}_${Date.now()}` })); // Simple unique ID

      return { vocabulary: vocabularyWithIds };
    } catch (error: any) { // Catch the error with an explicit type
      console.error('Error generating vocabulary:', error.message); // Log the error message
      throw new Error(`Failed to generate vocabulary words: ${error.message}`); // Throw a new error with the original message
    }
  }
);