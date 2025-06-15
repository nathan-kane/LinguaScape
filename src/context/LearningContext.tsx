
"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { DEFAULT_LANGUAGE, DEFAULT_MODE, SUPPORTED_LANGUAGES, LEARNING_MODES } from '@/lib/constants';
import type { Language, LearningMode } from '@/lib/types';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import type { ProfileData } from '@/app/profile/page';

interface LearningContextType {
  selectedLanguage: Language; // Target language
  selectedMode: LearningMode;
  nativeLanguage: Language; // User's native language
  setLanguage: (language: Language) => Promise<void>; // Sets target language
  setMode: (mode: LearningMode) => Promise<void>;
  // setNativeLanguage: (language: Language) => Promise<void>; // Native language is usually set once
  isLoadingPreferences: boolean;
  authUser: FirebaseUser | null;
}

const LearningContext = createContext<LearningContextType | undefined>(undefined);

interface LearningProviderProps {
  children: ReactNode;
}

export const LearningProvider: React.FC<LearningProviderProps> = ({ children }) => {
  const [selectedLanguage, setSelectedLanguageState] = useState<Language>(DEFAULT_LANGUAGE);
  const [selectedMode, setSelectedModeState] = useState<LearningMode>(DEFAULT_MODE);
  const [nativeLanguage, setNativeLanguageState] = useState<Language>(DEFAULT_LANGUAGE); // Default to English
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(true);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setAuthUser(user);
      if (user) {
        setIsLoadingPreferences(true);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const data = docSnap.data() as ProfileData;
            const loadedTargetLang = SUPPORTED_LANGUAGES.find(l => l.code === data.targetLanguageCode) || DEFAULT_LANGUAGE;
            const loadedNativeLang = SUPPORTED_LANGUAGES.find(l => l.code === data.nativeLanguageCode) || DEFAULT_LANGUAGE; // Load native
            const loadedMode = LEARNING_MODES.find(m => m.id === data.currentLearningModeId) || DEFAULT_MODE;
            
            setSelectedLanguageState(loadedTargetLang);
            setNativeLanguageState(loadedNativeLang); // Set native language from profile
            setSelectedModeState(loadedMode);
          } else {
            // Profile doesn't exist or lacks these fields, use defaults.
            setSelectedLanguageState(DEFAULT_LANGUAGE);
            setNativeLanguageState(DEFAULT_LANGUAGE); // Default native if not found
            setSelectedModeState(DEFAULT_MODE);
          }
        } catch (error) {
          console.error("Error loading learning preferences:", error);
          setSelectedLanguageState(DEFAULT_LANGUAGE);
          setNativeLanguageState(DEFAULT_LANGUAGE);
          setSelectedModeState(DEFAULT_MODE);
        } finally {
          setIsLoadingPreferences(false);
        }
      } else {
        // User logged out, reset to defaults
        setSelectedLanguageState(DEFAULT_LANGUAGE);
        setNativeLanguageState(DEFAULT_LANGUAGE);
        setSelectedModeState(DEFAULT_MODE);
        setIsLoadingPreferences(false);
      }
    });
    return () => unsubscribe();
  }, [auth, db]);

  const setLanguage = async (language: Language) => { // Sets TARGET language
    setSelectedLanguageState(language);
    if (authUser) {
      const userDocRef = doc(db, "users", authUser.uid);
      try {
        await setDoc(userDocRef, { targetLanguageCode: language.code }, { merge: true });
      } catch (error) {
        console.error("Error saving target language:", error);
      }
    }
  };

  const setMode = async (mode: LearningMode) => {
    setSelectedModeState(mode);
    if (authUser) {
      const userDocRef = doc(db, "users", authUser.uid);
      try {
        await setDoc(userDocRef, { currentLearningModeId: mode.id }, { merge: true });
      } catch (error) {
        console.error("Error saving learning mode:", error);
      }
    }
  };
  
  // Native language is primarily set via profile page/onboarding, context mainly reads it.
  // If a direct setter is needed in future:
  // const setNativeLanguage = async (language: Language) => {
  //   setNativeLanguageState(language);
  //   if (authUser) {
  //     const userDocRef = doc(db, "users", authUser.uid);
  //     try {
  //       await setDoc(userDocRef, { nativeLanguageCode: language.code }, { merge: true });
  //     } catch (error) {
  //       console.error("Error saving native language:", error);
  //     }
  //   }
  // };


  return (
    <LearningContext.Provider value={{ 
      selectedLanguage, 
      selectedMode, 
      nativeLanguage, 
      setLanguage, 
      setMode, 
      // setNativeLanguage, // Expose if direct setting from context is needed
      isLoadingPreferences, 
      authUser 
    }}>
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
