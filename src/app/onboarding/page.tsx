
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
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import type { ProfileData } from '@/app/profile/page';

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  // useLearning now provides authUser, setLanguage and setMode which persist
  const { authUser: contextAuthUser, setLanguage: setContextTargetLanguage, setMode: setContextLearningMode } = useLearning();

  const [isLoadingAuth, setIsLoadingAuth] = useState(true); // For initial auth check

  const [nativeLanguage, setNativeLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [targetLanguage, setTargetLanguage] = useState<Language>(
    SUPPORTED_LANGUAGES.find(lang => lang.code !== DEFAULT_LANGUAGE.code) || SUPPORTED_LANGUAGES[0]
  );
  const [learningMode, setLearningMode] = useState<LearningMode>(DEFAULT_MODE);
  const [isSaving, setIsSaving] = useState(false);

  const auth = getAuth(app); // Still need auth for direct use if contextAuthUser is not yet populated
  const db = getFirestore(app);

  useEffect(() => {
    // This effect primarily checks if the user should be on this page
    // Context's onAuthStateChanged will handle authUser state for persistence
    if (contextAuthUser === null && !isLoadingAuth) { // If context determined no user and auth check done
        router.push('/login');
    } else if (contextAuthUser !== null) {
        setIsLoadingAuth(false); // User is available via context
    }
    // Fallback if context is slower to update authUser, direct check:
    const unsubscribe = onAuthStateChanged(auth, (user) => {
        if (!user) {
            router.push('/login');
        }
        setIsLoadingAuth(false); // Direct auth check complete
    });
    return () => unsubscribe();

  }, [auth, router, contextAuthUser, isLoadingAuth]);

  useEffect(() => {
    if (nativeLanguage.code === targetLanguage.code) {
      const newTarget = SUPPORTED_LANGUAGES.find(lang => lang.code !== nativeLanguage.code) || SUPPORTED_LANGUAGES[0];
      setTargetLanguage(newTarget);
    }
  }, [nativeLanguage, targetLanguage.code]);


  const handleSavePreferences = async () => {
    const currentUser = contextAuthUser || auth.currentUser; // Prefer context's authUser
    if (!currentUser) {
      toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
      return;
    }
    if (nativeLanguage.code === targetLanguage.code) {
      toast({ title: "Selection Error", description: "Native and target languages must be different.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const userDocRef = doc(db, "users", currentUser.uid);

    const preferencesToSave: Partial<ProfileData> = {
      nativeLanguageCode: nativeLanguage.code,
      targetLanguageCode: targetLanguage.code, // This will be persisted by setContextTargetLanguage
      currentLearningModeId: learningMode.id, // This will be persisted by setContextLearningMode
      // Ensure other essential fields are preserved or set if new
      uid: currentUser.uid,
      email: currentUser.email || '',
      displayName: currentUser.displayName || currentUser.email?.split('@')[0] || `User ${currentUser.uid.substring(0,5)}`,
      photoURL: currentUser.photoURL || 'https://placehold.co/200x200.png',
      joinDate: currentUser.metadata.creationTime || new Date().toISOString(),
    };

    try {
      // Save the full profile data including native language
      await setDoc(userDocRef, preferencesToSave, { merge: true }); 
      
      // Update context for target language and mode (this also saves them)
      await setContextTargetLanguage(targetLanguage);
      await setContextLearningMode(learningMode);

      toast({ title: "Preferences Saved!", description: "Welcome! Let's start your learning journey." });
      router.push('/daily-session');
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast({ title: "Save Error", description: "Could not save your preferences. Please try again.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoadingAuth && contextAuthUser === null) { // Show loading only if context hasn't confirmed user yet
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
              disabled={isSaving}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="targetLanguage" className="text-lg font-medium text-foreground">I want to learn...</Label>
            <LanguageSelector
              selectedLanguage={targetLanguage}
              onLanguageChange={setTargetLanguage}
              className="w-full text-base"
              disabled={isSaving}
            />
          </div>

          <div className="space-y-3">
            <Label htmlFor="learningMode" className="text-lg font-medium text-foreground">My learning focus is...</Label>
            <ModeSelector
              selectedMode={learningMode}
              onModeChange={setLearningMode}
              className="w-full text-base"
              disabled={isSaving}
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
