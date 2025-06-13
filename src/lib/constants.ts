import type { NavItem, Language, LearningMode } from './types';
import { Home, BookOpen, Mic, Edit3, Headphones, BarChart3, Settings, Users, LogOut, Languages } from 'lucide-react';

export const APP_NAME = "LinguaScape";
export const APP_DESCRIPTION = "Master new languages with interactive tools and AI-powered feedback.";
export const APP_LOGO_ICON = Languages;

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
