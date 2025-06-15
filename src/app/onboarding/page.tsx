
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { ModeSelector } from '@/components/shared/ModeSelector';
import { SUPPORTED_LANGUAGES, LEARNING_MODES, DEFAULT_LANGUAGE, DEFAULT_MODE, APP_NAME } from '@/lib/constants';
import type { Language, LearningMode } from '@/lib/types';
import { useLearning } from '@/context/LearningContext';
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ProfileData } from '@/app/profile/page'; // Assuming ProfileData is exported

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { setSelectedLanguage: setContextTargetLanguage, setSelectedMode: setContextLearningMode } = useLearning();

  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  const [nativeLanguage, setNativeLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(lang => lang.code !== DEFAULT_LANGUAGE.code) || SUPPORTED_LANGUAGES[0]
  );
  const [learningMode, setLearningMode] = useState<LearningMode>(DEFAULT_MODE);
  const [isSaving, setIsSaving] = useState(false);

  const auth = getAuth(app);
  const db = getFirestore(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
      } else {
        router.push('/login'); // Redirect if not authenticated
      }
      setIsLoadingAuth(false);
    });
    return () => unsubscribe();
  }, [auth, router]);

  // Ensure target language is different from native language
  useEffect(() => {
    if (nativeLanguage.code === targetLanguage.code) {
      const newTarget = SUPPORTED_LANGUAGES.find(lang => lang.code !== nativeLanguage.code) || SUPPORTED_LANGUAGES[0];
      setTargetLanguage(newTarget);
    }
  }, [nativeLanguage, targetLanguage.code]);


  const handleSavePreferences = async () => {
    if (!authUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (nativeLanguage.code === targetLanguage.code) {
      toast({ title: "Selection Error", description: "Native and target languages must be different.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const userDocRef = doc(db, "users", authUser.uid);

    const preferencesToSave: Partial<ProfileData> = {
      nativeLanguageCode: nativeLanguage.code,
      targetLanguageCode: targetLanguage.code,
      currentLearningModeId: learningMode.id,
      // Ensure other essential fields like uid, email, displayName, joinDate are preserved or set if new
      uid: authUser.uid,
      email: authUser.email || '',
      displayName: authUser.displayName || authUser.email?.split('@')[0] || `User ${authUser.uid.substring(0,5)}`,
      photoURL: authUser.photoURL || 'https://placehold.co/200x200.png',
      joinDate: authUser.metadata.creationTime || new Date().toISOString(), // Set joinDate if not already present
    };

    try {
      await setDoc(userDocRef, preferencesToSave, { merge: true }); // Merge to not overwrite existing profile fields
      
      // Update context
      setContextTargetLanguage(targetLanguage);
      setContextLearningMode(learningMode);

      toast({ title: "Preferences Saved!", description: "Welcome! Let's start your learning journey." });
      router.push('/daily-session'); // Navigate to the daily session page
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Save Error", description: "Could not save your preferences. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-background to-secondary/20">
      <Card className="w-full max-w-lg shadow-xl bg-card">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline text-foreground">Welcome to {APP_NAME}!</CardTitle>
          <CardDescription className="pt-2 text-muted-foreground">
            Let's set up your learning preferences to get started.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-3">
            <Label htmlFor="nativeLanguage" className="text-lg font-medium text-foreground">I speak...</Label>
            <LanguageSelector
              selectedLanguage={nativeLanguage}
              onLanguageChange={setNativeLanguage}
              className="w-full text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="targetLanguage" className="text-lg font-medium text-foreground">I want to learn...</Label>
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onLanguageChange={setTargetLanguage}
              className="w-full text-base"
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="learningMode" className="text-lg font-medium text-foreground">My learning focus is...</Label>
            <ModeSelector
              selectedMode={learningMode}
              onModeChange={setLearningMode}
              className="w-full text-base"
            />
             {learningMode.description && <p className="text-sm text-muted-foreground pt-1">{learningMode.description}</p>}
          </div>

          <Button 
            onClick={handleSavePreferences} 
            disabled={isSaving || nativeLanguage.code === targetLanguage.code}
            className="w-full text-lg py-6 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isSaving ? 'Saving...' : "Let's Go! Start Learning"}
          </Button>
          {nativeLanguage.code === targetLanguage.code && (
            <p className="text-sm text-center text-destructive">Please select different native and target languages.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
