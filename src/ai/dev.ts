
import { config } from 'dotenv';
config();

import '@/ai/flows/pronunciation-feedback.ts';
import '@/ai/flows/cle-conversation-flow.ts'; 
import '@/ai/flows/mini-story-flow.ts';
import '@/ai/flows/translate-text-flow.ts'; // Added import for the new translation flow

