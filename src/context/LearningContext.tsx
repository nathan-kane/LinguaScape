"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { DEFAULT_LANGUAGE, DEFAULT_MODE } from '@/lib/constants'; // Assuming these exist
import { Language, LearningMode } from '@/lib/types'; // Assuming these exist

interface LearningContextType {
  selectedLanguage: Language;
  selectedMode: LearningMode;
  setSelectedLanguage: (language: Language) => void;
  setSelectedMode: (mode: LearningMode) => void;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

interface LearningProviderProps {
  children: ReactNode;
}

export const LearningProvider: React.FC<LearningProviderProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [selectedMode, setSelectedMode] = useState<LearningMode>(DEFAULT_MODE);

  return (
    <LearningContext.Provider value={{ selectedLanguage, selectedMode, setSelectedLanguage, setSelectedMode }}>
      {children}
    </LearningContext.Provider>
  );
};

export const useLearning = () => {
  const context = useContext(LearningContext);
  if (context === undefined) {
    throw new Error('useLearning must be used within a LearningProvider');
  }
  return context;
};