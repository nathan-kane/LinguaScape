
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  disabled?: boolean;
  external?: boolean;
  matchStartsWith?: boolean; // For active link matching
}

export interface Language {
  code: string;
  name: string;
  flag?: string; // Emoji or URL
}

export interface LearningMode {
  id: string;
  name: string;
  description?: string;
}

// Vocabulary Card for SRS (Existing - might be partially superseded or augmented by UserWordProgress)
export interface VocabCard {
  id: string;
  front: string; // Word/phrase in target language
  back: string; // Translation/definition in user's language
  exampleSentence?: string;
  audioUrl?: string;
  imageUrl?: string;
  language: string; // Language code
  mode: string; // Learning mode ID
  lastReviewed?: Date;
  nextReviewDate: Date;
  interval: number; // in days
  easeFactor: number; // Anki-like ease factor
  repetitions: number; // Number of times reviewed successfully
  lapses: number; // Number of times forgotten
  status: 'new' | 'learning' | 'graduated';
}

// Pronunciation Exercise
export interface PronunciationExercise {
  id: string;
  targetText: string;
  language: string; // Language code
  difficulty?: 'easy' | 'medium' | 'hard';
  audioUrl?: string; // Optional: example pronunciation by native speaker
}

// Grammar Drill Question
export type GrammarQuestionType = 'multiple-choice' | 'fill-in-the-blank';

export interface GrammarQuestionOption {
  id: string;
  text: string;
}

export interface GrammarQuestion {
  id: string;
  questionText: string; // Can include placeholders like "___" for fill-in-the-blank
  type: GrammarQuestionType;
  options?: GrammarQuestionOption[]; // For multiple-choice
  correctOptionId?: string; // For multiple-choice
  correctAnswers?: string[]; // For fill-in-the-blank (array in case of multiple blanks)
  explanation: string;
  language: string; // Language code
}

// Listening Exercise
export interface ListeningExercise {
  id: string;
  title: string;
  audioUrl: string;
  transcript: string; // Full transcript
  language: string; // Language code
  difficulty?: 'easy' | 'medium' | 'hard';
  questions: ListeningComprehensionQuestion[];
}

export interface ListeningComprehensionQuestion {
  id: string;
  questionText: string;
  options: { id: string; text: string }[];
  correctOptionId: string;
}

// User Progress (Existing - might be refined or partially replaced)
export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  wordsLearnedCount: number;
  lessonsCompleted: Record<string, number>; // e.g., { vocabulary: 10, grammar: 5 }
  lastActiveDate?: Date;
  xpPoints?: number;
  selectedLanguage: Language; // This reflects current session choice, not necessarily saved pref
  selectedMode: LearningMode; // This reflects current session choice, not necessarily saved pref
}

// For pronunciation feedback
export interface PronunciationFeedback {
  overallScore: number; // e.g., 0-100
  wordScores: { word: string; score: number; phonemes?: { phoneme: string; score: number }[] }[];
  suggestions: string[]; // General suggestions
  specificGuidance?: { sound: string; tip: string }[]; // AI provided
}


// --- NEW TYPES FOR CHILD-LIKE LEARNING ENGINE (CLE) ---

// Represents an entry in the comprehensive word bank
export interface WordBankEntry {
  id: string; // Unique ID for the word entry
  languageCode: string; // e.g., "es", "fr"
  modeId: string; // e.g., "conversational", "travel" - for context
  word: string; // The word in the target language
  translationToNative: string; // Translation to the user's native language
  nativeLanguageCode: string; // The language of translationToNative, e.g., "en"
  wordType: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
  frequencyRank?: number; // Optional: for sorting by commonality
  imageUrl?: string; // URL for an image/emoji representing the word
  audioUrl?: string; // URL for native pronunciation audio
  exampleSentence?: string; // A simple sentence using the word
  tags?: string[]; // Optional: for further categorization (e.g., "food", "colors")
}

// Represents a user's progress and SRS data for a specific word from the WordBank
export interface UserWordProgress {
  id?: string; // Auto-generated ID for this progress entry
  userId: string;
  wordBankId: string; // Foreign key to WordBankEntry.id
  languageCode: string; // Denormalized: target language of the word
  status: 'new' | 'learning' | 'review' | 'mastered'; // SRS status
  fluency: number; // Calculated proficiency (0-100)
  lastReviewedAt: number; // Timestamp (milliseconds since epoch)
  nextReviewAt: number; // Timestamp (milliseconds since epoch) for next SRS review
  currentIntervalDays: number; // SRS: current interval in days
  easeFactor: number; // SRS: ease factor
  repetitions: number; // SRS: consecutive successful reviews
  lapses: number; // SRS: times forgotten after becoming 'learning' or 'review'
  totalTimesSeen: number;
  totalCorrect: number;
  totalIncorrect: number;
  firstLearnedAt?: number; // Timestamp when the word was first encountered/passed 'new'
}

// Simplified structure for displaying a word in a daily lesson OR general vocabulary context
export interface DailyWordItem {
  wordBankId: string;
  word: string; // This will be the word in the TARGET language
  translation?: string; // Translation to NATIVE language - now optional, fetched on demand
  imageUrl?: string;
  audioUrl?: string;
  exampleSentence?: string; // Example sentence in TARGET language
  wordType: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
  dataAiHint?: string; 
}

// Represents a word with user progress for display in the vocabulary session
export interface SessionWordItem extends DailyWordItem {
  // Include relevant progress properties from UserWordProgress
  status: 'new' | 'learning' | 'review' | 'mastered'; 
  fluency: number; 
  lastReviewedAt: number; 
  nextReviewAt: number; 
  currentIntervalDays: number; 
  easeFactor: number; 
  repetitions: number; 
  lapses: number; 
  totalTimesSeen: number;
  totalCorrect: number;
  totalIncorrect: number;
  firstLearnedAt?: number; 
}
// Represents a chat message in the AI conversation
export interface ChatMessage {
  id: string;
  speaker: 'user' | 'ai';
  text: string;
  timestamp: number; // Timestamp (milliseconds since epoch)
  wordSuggestions?: string[]; // Optional suggestions for the user's next reply
}

// Represents an entire conversation transcript
export interface ConversationTranscript {
  id?: string; // Auto-generated ID
  userId: string;
  dailyLessonId?: string; // Optional: link to a specific daily lesson
  sceneContext?: string; // e.g., "At a picnic"
  targetLanguageCode: string;
  modeId: string;
  startedAt: number; // Timestamp
  endedAt?: number; // Timestamp
  messages: ChatMessage[]; // Array of chat messages
  targetWordsUsed?: string[]; // Words that were the focus of this conversation
}

// Represents a user's daily lesson assignment
export interface UserDailyLesson {
  id?: string; // Auto-generated ID
  userId: string;
  lessonDate: string; // YYYY-MM-DD format
  languageCode: string;
  modeId: string;
  wordBankIds: string[]; // List of WordBankEntry IDs for this lesson
  status: 'pending' | 'in-progress' | 'completed';
  completedAt?: number; // Timestamp
}
