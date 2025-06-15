
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DEFAULT_LANGUAGE, DEFAULT_MODE, SUPPORTED_LANGUAGES, LEARNING_MODES } from '@/lib/constants';
import type { Language, LearningMode } from '@/lib/types';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { ProfileData } from '@/app/profile/page';

interface LearningContextType {
  selectedLanguage: Language;
  selectedMode: LearningMode;
  setLanguage: (language: Language) => Promise<void>;
  setMode: (mode: LearningMode) => Promise<void>;
  isLoadingPreferences: boolean;
  authUser: FirebaseUser | null; // Expose authUser for other components if needed
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

interface LearningProviderProps {
  children: ReactNode;
}

export const LearningProvider: React.FC<LearningProviderProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [selectedMode, setSelectedModeState] = useState<LearningMode>(DEFAULT_MODE);
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user); // Set authUser for the context
      if (user) {
        setIsLoadingPreferences(true);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as ProfileData;
            const loadedLang = SUPPORTED_LANGUAGES.find(l => l.code === data.targetLanguageCode) || DEFAULT_LANGUAGE;
            const loadedMode = LEARNING_MODES.find(m => m.id === data.currentLearningModeId) || DEFAULT_MODE;
            setSelectedLanguageState(loadedLang);
            setSelectedModeState(loadedMode);
          } else {
            // User profile might not exist or lacks these fields, use defaults.
            // Onboarding/Profile page should create/update these.
            setSelectedLanguageState(DEFAULT_LANGUAGE);
            setSelectedModeState(DEFAULT_MODE);
            // Optionally save defaults if profile exists but fields are missing
            // await setDoc(userDocRef, { targetLanguageCode: DEFAULT_LANGUAGE.code, currentLearningModeId: DEFAULT_MODE.id }, { merge: true });
          }
        } catch (error) {
          console.error("Error loading learning preferences:", error);
          setSelectedLanguageState(DEFAULT_LANGUAGE);
          setSelectedModeState(DEFAULT_MODE);
        } finally {
          setIsLoadingPreferences(false);
        }
      } else {
        // User logged out, reset to defaults
        setSelectedLanguageState(DEFAULT_LANGUAGE);
        setSelectedModeState(DEFAULT_MODE);
        setIsLoadingPreferences(false);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const setLanguage = async (language: Language) => {
    setSelectedLanguageState(language);
    if (authUser) { // Use context's authUser
      const userDocRef = doc(db, "users", authUser.uid);
      try {
        await setDoc(userDocRef, { targetLanguageCode: language.code }, { merge: true });
      } catch (error) {
        console.error("Error saving target language:", error);
        // Potentially show a toast to the user
      }
    }
  };

  const setMode = async (mode: LearningMode) => {
    setSelectedModeState(mode);
    if (authUser) { // Use context's authUser
      const userDocRef = doc(db, "users", authUser.uid);
      try {
        await setDoc(userDocRef, { currentLearningModeId: mode.id }, { merge: true });
      } catch (error) {
        console.error("Error saving learning mode:", error);
        // Potentially show a toast to the user
      }
    }
  };

  return (
    <LearningContext.Provider value={{ selectedLanguage, selectedMode, setLanguage, setMode, isLoadingPreferences, authUser }}>
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
