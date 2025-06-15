
import { config } from 'dotenv';
config();

import '@/ai/flows/pronunciation-feedback.ts';
import '@/ai/flows/cle-conversation-flow.ts'; // Added import for the new CLE flow
