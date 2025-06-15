
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Award, BarChart3, CalendarCheck2, Target, LanguagesIcon, User, Save, Settings as SettingsIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLearning } from '@/context/LearningContext';
import { SUPPORTED_LANGUAGES, LEARNING_MODES, DEFAULT_LANGUAGE, DEFAULT_MODE } from '@/lib/constants';
import { LanguageSelector } from '@/components/shared/LanguageSelector';
import { ModeSelector } from '@/components/shared/ModeSelector';
import type { Language, LearningMode } from '@/lib/types';

const achievementsPlaceholder = [
  { name: "Word Wizard", icon: "https://placehold.co/64x64.png", description: "Learned 100 words", date: "2024-07-15", dataAiHint: "wizard badge" },
  { name: "Streak Keeper", icon: "https://placehold.co/64x64.png", description: "7-day streak", date: "2024-07-20", dataAiHint: "flame badge" },
  { name: "Grammar Guru", icon: "https://placehold.co/64x64.png", description: "Completed 10 grammar drills", date: "2024-07-22", dataAiHint: "book badge" },
  { name: "Polyglot Starter", icon: "https://placehold.co/64x64.png", description: "Started learning a new language", date: "2024-07-10", dataAiHint: "globe badge" },
];

export interface ProfileData {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  joinDate: string; // ISO string
  nativeLanguageCode: string;
  targetLanguageCode: string;
  currentLearningModeId: string;
}

const initialProfileValues: ProfileData = {
  uid: '',
  displayName: '',
  username: '',
  email: '',
  photoURL: 'https://placehold.co/200x200.png',
  joinDate: new Date().toISOString(),
  nativeLanguageCode: DEFAULT_LANGUAGE.code,
  targetLanguageCode: SUPPORTED_LANGUAGES.find(l => l.code !== DEFAULT_LANGUAGE.code)?.code || DEFAULT_LANGUAGE.code,
  currentLearningModeId: DEFAULT_MODE.id,
};

const placeholderStats = {
  wordsLearned: 250,
  lessonsCompleted: 42,
  currentStreak: 15,
  longestStreak: 28,
  points: 12500,
};


export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData>(initialProfileValues);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true); // For profile page data loading
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  
  const { 
    selectedLanguage: contextTargetLanguage, 
    selectedMode: contextLearningMode, 
    setLanguage: setContextAndPersistLanguage, 
    setMode: setContextAndPersistMode,
    isLoadingPreferences: isLoadingContextPrefs,
    authUser
  } = useLearning();

  // Local state for UI elements, initialized from context or fetched data
  // These will be updated from Firestore initially, then user can change them.
  const [editableTargetLanguage, setEditableTargetLanguage] = useState<Language>(contextTargetLanguage);
  const [editableNativeLanguage, setEditableNativeLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [editableLearningMode, setEditableLearningMode] = useState<LearningMode>(contextLearningMode);

  const db = getFirestore(app);

  useEffect(() => {
    if (authUser) {
      setIsLoadingProfile(true);
      const userDocRef = doc(db, "users", authUser.uid);
      const fetchProfile = async () => {
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as ProfileData;
            setProfile(firestoreData);
            
            // Initialize editable states from fetched profile data
            setEditableTargetLanguage(SUPPORTED_LANGUAGES.find(l => l.code === firestoreData.targetLanguageCode) || contextTargetLanguage);
            setEditableNativeLanguage(SUPPORTED_LANGUAGES.find(l => l.code === firestoreData.nativeLanguageCode) || DEFAULT_LANGUAGE);
            setEditableLearningMode(LEARNING_MODES.find(m => m.id === firestoreData.currentLearningModeId) || contextLearningMode);
          } else {
            // Profile doesn't exist, initialize with authUser data and context/defaults
            const newProfile: ProfileData = {
              uid: authUser.uid,
              displayName: authUser.displayName || '',
              username: authUser.email?.split('@')[0] || `user_${authUser.uid.substring(0,5)}`,
              email: authUser.email || '',
              photoURL: authUser.photoURL || 'https://placehold.co/200x200.png',
              joinDate: authUser.metadata.creationTime || new Date().toISOString(),
              nativeLanguageCode: DEFAULT_LANGUAGE.code, // Default native
              targetLanguageCode: contextTargetLanguage.code, // From context
              currentLearningModeId: contextLearningMode.id,   // From context
            };
            if (newProfile.targetLanguageCode === newProfile.nativeLanguageCode) {
                const alternativeTarget = SUPPORTED_LANGUAGES.find(l => l.code !== newProfile.nativeLanguageCode) || SUPPORTED_LANGUAGES[0];
                newProfile.targetLanguageCode = alternativeTarget.code;
            }
            setProfile(newProfile);
            setEditableTargetLanguage(SUPPORTED_LANGUAGES.find(l => l.code === newProfile.targetLanguageCode) || contextTargetLanguage);
            setEditableNativeLanguage(SUPPORTED_LANGUAGES.find(l => l.code === newProfile.nativeLanguageCode) || DEFAULT_LANGUAGE);
            setEditableLearningMode(LEARNING_MODES.find(m => m.id === newProfile.currentLearningModeId) || contextLearningMode);
            // Save this initial profile silently or prompt user
            await setDoc(userDocRef, newProfile, { merge: true });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
          // Fallback to initial/context values if fetch fails
            setProfile(prev => ({
                ...prev,
                uid: authUser.uid,
                email: authUser.email || '',
                displayName: authUser.displayName || prev.displayName || '',
                photoURL: authUser.photoURL || prev.photoURL,
                joinDate: authUser.metadata.creationTime || prev.joinDate,
            }));
            setEditableTargetLanguage(contextTargetLanguage);
            setEditableLearningMode(contextLearningMode);
        } finally {
          setIsLoadingProfile(false);
        }
      };
      fetchProfile();
    } else if (!isLoadingContextPrefs) { // If context is done loading and there's no authUser
      setIsLoadingProfile(false); // Nothing to load for profile page
    }
  }, [authUser, db, toast, contextTargetLanguage, contextLearningMode, isLoadingContextPrefs]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveChanges = async () => {
    if (!authUser) {
      toast({ title: "Error", description: "You must be logged in to save changes.", variant: "destructive" });
      return;
    }
    if (editableNativeLanguage.code === editableTargetLanguage.code) {
      toast({ title: "Selection Error", description: "Native and target languages must be different.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const userDocRef = doc(db, "users", authUser.uid);
    
    const dataToSave: ProfileData = {
      ...profile, // Contains displayName, username, photoURL, email, uid from state
      joinDate: profile.joinDate || new Date().toISOString(), // Ensure joinDate
      nativeLanguageCode: editableNativeLanguage.code,
      // targetLanguageCode and currentLearningModeId will be persisted by context setters
      targetLanguageCode: editableTargetLanguage.code, 
      currentLearningModeId: editableLearningMode.id,
    };

    try {
      // Save the full profile data including native language and other text fields
      await setDoc(userDocRef, dataToSave, { merge: true });
      setProfile(dataToSave); // Update local profile state
      
      // Update learning context which also persists targetLanguage and mode
      await setContextAndPersistLanguage(editableTargetLanguage);
      await setContextAndPersistMode(editableLearningMode);
      
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Could not save profile changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  // Show loading indicator if either context preferences or profile page data is loading
  if (isLoadingContextPrefs || isLoadingProfile) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="ml-3 text-muted-foreground">Loading profile...</p>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (!authUser && !isLoadingContextPrefs && !isLoadingProfile) {
     return (
      <AuthenticatedLayout>
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">Please log in to view your profile.</p>
          <Button asChild className="mt-4">
            <Link href="/login">Log In</Link>
          </Button>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  const displayJoinDate = profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A';

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <Card className="shadow-xl bg-card overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-primary to-accent" data-ai-hint="abstract banner profile">
             <Image src="https://placehold.co/1200x300.png" alt="Profile banner" layout="fill" objectFit="cover" />
          </div>
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.photoURL || initialProfileValues.photoURL} alt={profile.displayName || "User"} data-ai-hint="user avatar placeholder" />
                <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-headline font-bold text-foreground">{profile.displayName || "User Name"}</h1>
                <p className="text-muted-foreground">@{profile.username || "username"}</p>
                <p className="text-sm text-muted-foreground">Joined: {displayJoinDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-6 w-6 text-primary" /> Edit Profile Details</CardTitle>
            <CardDescription>Update your display name, username, and avatar URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" name="displayName" value={profile.displayName} onChange={handleInputChange} placeholder="Your display name" disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={profile.username} onChange={handleInputChange} placeholder="Your username" disabled={isSaving}/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoURL">Avatar URL</Label>
              <Input id="photoURL" name="photoURL" type="url" value={profile.photoURL} onChange={handleInputChange} placeholder="https://example.com/avatar.png" disabled={isSaving}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile.email} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><SettingsIcon className="h-6 w-6 text-primary" /> Language & Learning Preferences</CardTitle>
            <CardDescription>Set your native and target languages, and preferred learning mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="nativeLanguage">Native Language</Label>
                <LanguageSelector selectedLanguage={editableNativeLanguage} onLanguageChange={setEditableNativeLanguage} className="w-full" disabled={isSaving}/>
              </div>
              <div className="space-y-2">
                <Label htmlFor="targetLanguage">Target Language</Label>
                <LanguageSelector selectedLanguage={editableTargetLanguage} onLanguageChange={setEditableTargetLanguage} className="w-full" disabled={isSaving}/>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="learningMode">Default Learning Mode</Label>
              <ModeSelector selectedMode={editableLearningMode} onModeChange={setEditableLearningMode} className="w-full" disabled={isSaving}/>
            </div>
             {editableNativeLanguage.code === editableTargetLanguage.code && (
                <p className="text-sm text-center text-destructive">Native and target languages must be different.</p>
            )}
          </CardContent>
        </Card>
        
        <div className="flex justify-end">
            <Button 
              onClick={handleSaveChanges} 
              disabled={isSaving || isLoadingProfile || isLoadingContextPrefs || editableNativeLanguage.code === editableTargetLanguage.code} 
              className="bg-primary hover:bg-primary/90 text-primary-foreground min-w-[150px]"
            >
              {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save All Changes</>}
            </Button>
        </div>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Learning Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Words Learned</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{placeholderStats.wordsLearned}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Lessons Completed</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{placeholderStats.lessonsCompleted}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Current Streak</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{placeholderStats.currentStreak} days</p></CardContent>
            </Card>
             <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Current Focus</CardTitle></CardHeader>
              <CardContent>
                <p className="text-md font-semibold">{contextTargetLanguage.name}</p>
                <p className="text-sm text-muted-foreground">{contextLearningMode.name} Mode</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievementsPlaceholder.map((ach, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow bg-card text-center">
                <CardContent className="p-4">
                  <Image 
                    src={ach.icon} 
                    alt={ach.name} 
                    width={64} 
                    height={64} 
                    className="mx-auto mb-3 rounded-full"
                    data-ai-hint={ach.dataAiHint}
                  />
                  <h3 className="text-md font-semibold text-foreground mb-1">{ach.name}</h3>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Earned: {ach.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
             <Button variant="link" className="text-primary">View All Achievements</Button>
          </div>
        </section>
        
        <section>
            <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Recent Activity</h2>
            <Card className="shadow-lg bg-card">
                <CardContent className="p-6 space-y-4">
                    {[
                        {icon: <LanguagesIcon className="h-5 w-5 text-green-500"/>, text: `Started learning ${contextTargetLanguage.name}`, time: "2 days ago"},
                        {icon: <Target className="h-5 w-5 text-blue-500"/>, text: "Completed 'Basic Greetings' vocabulary set", time: "1 day ago"},
                        {icon: <CalendarCheck2 className="h-5 w-5 text-purple-500"/>, text: `Achieved a ${placeholderStats.currentStreak}-day learning streak!`, time: "Today"},
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border-b last:border-b-0">
                            {activity.icon}
                            <span className="flex-1 text-sm text-foreground">{activity.text}</span>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                    ))}
                     <Button variant="link" className="mt-2 p-0 h-auto text-primary">View Full Activity Log</Button>
                </CardContent>
            </Card>
        </section>

      </div>
    </AuthenticatedLayout>
  );
}
