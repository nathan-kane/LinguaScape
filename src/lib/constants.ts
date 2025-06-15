
import type { NavItem, Language, LearningMode } from './types';
import { Home, BookOpen, Mic, Edit3, Headphones, Settings, Languages, CalendarCheck, TrendingUp, Smile } from 'lucide-react';

export const APP_NAME = "LinguaScape";
export const APP_DESCRIPTION = "Master new languages with interactive tools and AI-powered feedback.";
export const APP_LOGO_ICON = Languages; // Default Lucide icon

// Firebase Config
export const FIREBASE_API_KEY = process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string;
export const FIREBASE_AUTH_DOMAIN = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string;
export const FIREBASE_PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string;
export const FIREBASE_STORAGE_BUCKET = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string;
export const FIREBASE_MESSAGING_SENDER_ID = process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string;
export const FIREBASE_APP_ID = process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string;
export const FIREBASE_MEASUREMENT_ID = process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string;

export const NAV_LINKS_MAIN: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: Home, matchStartsWith: true },
  { href: "/daily-session", label: "Daily Lesson", icon: CalendarCheck, matchStartsWith: true }, // New
  { href: "/vocabulary", label: "Vocabulary Master", icon: BookOpen, matchStartsWith: true },
  { href: "/pronunciation", label: "Pronunciation Ace", icon: Mic, matchStartsWith: true },
  { href: "/grammar", label: "Grammar Pro", icon: Edit3, matchStartsWith: true },
  { href: "/listening", label: "Contextual Listener", icon: Headphones, matchStartsWith: true },
  { href: "/progress-tracker", label: "My Progress", icon: TrendingUp, matchStartsWith: true }, // New
  // { href: "/cle-chat", label: "AI Chat Practice", icon: MessageSquare, matchStartsWith: true }, // Usually accessed via daily lesson
];

export const NAV_LINKS_USER: NavItem[] = [ // These appear in the user dropdown menu in AppHeader
  { href: "/profile", label: "Profile", icon: Smile, matchStartsWith: true }, // Changed from /settings
  { href: "/settings", label: "App Settings", icon: Settings, matchStartsWith: true },
  // { href: "/invite", label: "Invite Friends", icon: Users }, // Future feature
];

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" },
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "pt", name: "Português", flag: "🇵🇹" }, // Added Portuguese
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "ua", name: "Українська", flag: "🇺🇦" }, // Changed "uk" to "ua"
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文 (简体)", flag: "🇨🇳" }, // Simplified Chinese
];

export const LEARNING_MODES: LearningMode[] = [
  { id: "conversational", name: "Conversational", description: "Focus on everyday chat and interactions." },
  { id: "beginner_basics", name: "Beginner Basics", description: "Fundamental vocabulary and grammar for new learners." },
  { id: "travel", name: "Travel", description: "Essential phrases for travelling." },
  { id: "work_professional", name: "Work/Professional", description: "Communication for business and specific industries." },
  { id: "everyday_life", name: "Everyday Life", description: "General vocabulary for daily situations." },
  // { id: "academic", name: "Academic", description: "Language for study and research." },
];

export const DEFAULT_LANGUAGE: Language = SUPPORTED_LANGUAGES[0]; // English
export const DEFAULT_MODE: LearningMode = LEARNING_MODES[0]; // Conversational

