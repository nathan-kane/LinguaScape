import type { NavItem, Language, LearningMode } from './types';
import { Home, BookOpen, Mic, Edit3, Headphones, BarChart3, Settings, Users, LogOut, Languages } from 'lucide-react';

export const APP_NAME = "LinguaScape";
export const APP_DESCRIPTION = "Master new languages with interactive tools and AI-powered feedback.";
export const APP_LOGO_ICON = Languages;

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
  { href: "/vocabulary", label: "Vocabulary Master", icon: BookOpen, matchStartsWith: true },
  { href: "/pronunciation", label: "Pronunciation Ace", icon: Mic, matchStartsWith: true },
  { href: "/grammar", label: "Grammar Pro", icon: Edit3, matchStartsWith: true },
  { href: "/listening", label: "Contextual Listener", icon: Headphones, matchStartsWith: true },
];

export const NAV_LINKS_USER: NavItem[] = [
  { href: "/settings", label: "Settings", icon: Settings, matchStartsWith: true },
  // { href: "/invite", label: "Invite Friends", icon: Users }, // Future feature
  // { href: "/auth/logout", label: "Logout", icon: LogOut }, // Auth related, handle separately
];

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧" }, // Changed US to GB for broader English
  { code: "es", name: "Español", flag: "🇪🇸" },
  { code: "fr", name: "Français", flag: "🇫🇷" },
  { code: "de", name: "Deutsch", flag: "🇩🇪" },
  { code: "it", name: "Italiano", flag: "🇮🇹" },
  { code: "ru", name: "Русский", flag: "🇷🇺" },
  { code: "uk", name: "Українська", flag: "🇺🇦" },
  { code: "ja", name: "日本語", flag: "🇯🇵" },
  { code: "ko", name: "한국어", flag: "🇰🇷" },
  { code: "zh", name: "中文", flag: "🇨🇳" },
];

export const LEARNING_MODES: LearningMode[] = [
  { id: "conversational", name: "Conversational", description: "Focus on everyday chat and interactions." },
  { id: "everyday", name: "Everyday Life", description: "General vocabulary and phrases for daily life." },
  { id: "work", name: "Professional", description: "Communication and industry-specific terms for work." },
  { id: "travel", name: "Travel", description: "Essential phrases for travelling." },
  { id: "academic", name: "Academic", description: "Language for study and research." },
  // { id: "love", name: "Love Language", description: "Expressing affection and romantic phrases." }, // Can be added later
];

export const DEFAULT_LANGUAGE: Language = SUPPORTED_LANGUAGES[0]; // English
export const DEFAULT_MODE: LearningMode = LEARNING_MODES[0]; // Conversational
