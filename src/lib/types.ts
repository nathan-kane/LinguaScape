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

// Vocabulary Card for SRS
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

// User Progress
export interface UserProgress {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  wordsLearnedCount: number;
  lessonsCompleted: Record<string, number>; // e.g., { vocabulary: 10, grammar: 5 }
  lastActiveDate?: Date;
  xpPoints?: number;
  selectedLanguage: Language;
  selectedMode: LearningMode;
  // Could also store specific progress per language/mode
}

// For pronunciation feedback
export interface PronunciationFeedback {
  overallScore: number; // e.g., 0-100
  wordScores: { word: string; score: number; phonemes?: { phoneme: string; score: number }[] }[];
  suggestions: string[]; // General suggestions
  specificGuidance?: { sound: string; tip: string }[]; // AI provided
}
