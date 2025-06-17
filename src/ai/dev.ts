
import { config } from 'dotenv';
config();

import '@/ai/flows/pronunciation-feedback.ts';
import '@/ai/flows/cle-conversation-flow.ts'; 
import '@/ai/flows/mini-story-flow.ts';
import '@/ai/flows/translate-text-flow.ts';
import '@/ai/flows/generate-listening-exercise-flow.ts'; // Added import for the new listening exercise flow
