
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Edit, Award, BarChart3, CalendarCheck2, Target, LanguagesIcon, User, Save } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";
import { getAuth, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import { app } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { useLearning } from '@/context/LearningContext';
import { SUPPORTED_LANGUAGES, LEARNING_MODES } from '@/lib/constants';

const achievementsPlaceholder = [
  { name: "Word Wizard", icon: "https://placehold.co/64x64.png", description: "Learned 100 words", date: "2024-07-15", dataAiHint: "wizard badge" },
  { name: "Streak Keeper", icon: "https://placehold.co/64x64.png", description: "7-day streak", date: "2024-07-20", dataAiHint: "flame badge" },
  { name: "Grammar Guru", icon: "https://placehold.co/64x64.png", description: "Completed 10 grammar drills", date: "2024-07-22", dataAiHint: "book badge" },
  { name: "Polyglot Starter", icon: "https://placehold.co/64x64.png", description: "Started learning a new language", date: "2024-07-10", dataAiHint: "globe badge" },
];

interface ProfileData {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL: string;
  joinDate: string;
  currentLanguageCode: string;
  currentModeId: string;
}

const initialProfileValues: ProfileData = {
  uid: '',
  displayName: '',
  username: '',
  email: '',
  photoURL: 'https://placehold.co/200x200.png',
  joinDate: '',
  currentLanguageCode: SUPPORTED_LANGUAGES[0].code,
  currentModeId: LEARNING_MODES[0].id,
};

// Placeholder stats - these would typically be managed dynamically
const placeholderStats = {
  wordsLearned: 250,
  lessonsCompleted: 42,
  currentStreak: 15,
  longestStreak: 28,
  points: 12500,
};


export default function ProfilePage() {
  const [authUser, setAuthUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<ProfileData>(initialProfileValues);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();
  const { selectedLanguage, selectedMode, setSelectedLanguage, setSelectedMode } = useLearning();

  const db = getFirestore(app);
  const auth = getAuth(app);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAuthUser(user);
        const userDocRef = doc(db, "users", user.uid);
        try {
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            const firestoreData = docSnap.data() as ProfileData;
            setProfile(firestoreData);
            // Optionally, sync context with fetched profile language/mode
            const fetchedLang = SUPPORTED_LANGUAGES.find(l => l.code === firestoreData.currentLanguageCode);
            const fetchedMode = LEARNING_MODES.find(m => m.id === firestoreData.currentModeId);
            if (fetchedLang) setSelectedLanguage(fetchedLang);
            if (fetchedMode) setSelectedMode(fetchedMode);

          } else {
            // Initialize profile for new user
            const initialData: ProfileData = {
              uid: user.uid,
              displayName: user.displayName || '',
              username: '', // Or generate from email
              email: user.email || '',
              photoURL: user.photoURL || 'https://placehold.co/200x200.png',
              joinDate: new Date().toISOString(),
              currentLanguageCode: selectedLanguage.code,
              currentModeId: selectedMode.id,
            };
            setProfile(initialData);
            // Save this initial profile to Firestore
            await setDoc(userDocRef, initialData);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
          toast({ title: "Error", description: "Could not load profile data.", variant: "destructive" });
           // Fallback to auth data + context if Firestore fails
            setProfile({
              uid: user.uid,
              displayName: user.displayName || '',
              username: user.email?.split('@')[0] || '',
              email: user.email || '',
              photoURL: user.photoURL || 'https://placehold.co/200x200.png',
              joinDate: user.metadata.creationTime || new Date().toISOString(),
              currentLanguageCode: selectedLanguage.code,
              currentModeId: selectedMode.id,
            });
        }
      } else {
        setAuthUser(null);
        setProfile(initialProfileValues); // Reset profile if user logs out
        // router.push('/login'); // Or handle unauthenticated state
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, [auth, db, toast, selectedLanguage.code, selectedMode.id, setSelectedLanguage, setSelectedMode]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSaveChanges = async () => {
    if (!authUser) {
      toast({ title: "Error", description: "You must be logged in to save changes.", variant: "destructive" });
      return;
    }
    setIsSaving(true);
    const userDocRef = doc(db, "users", authUser.uid);
    const dataToSave: ProfileData = {
      ...profile,
      joinDate: profile.joinDate || new Date().toISOString(), // Ensure joinDate is set
      currentLanguageCode: selectedLanguage.code, // Save current context language
      currentModeId: selectedMode.id, // Save current context mode
    };

    try {
      await setDoc(userDocRef, dataToSave, { merge: true });
      setProfile(dataToSave); // Update local state with potentially updated joinDate, language, mode
      toast({ title: "Success", description: "Profile updated successfully!" });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({ title: "Error", description: "Could not save profile changes.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  const displayLanguageName = SUPPORTED_LANGUAGES.find(l => l.code === profile.currentLanguageCode)?.name || profile.currentLanguageCode;
  const displayModeName = LEARNING_MODES.find(m => m.id === profile.currentModeId)?.name || profile.currentModeId;


  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="shadow-xl bg-card overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-primary to-accent" data-ai-hint="abstract banner">
             <Image src="https://placehold.co/1200x300.png" alt="Profile banner" layout="fill" objectFit="cover" />
          </div>
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={profile.photoURL || initialProfileValues.photoURL} alt={profile.displayName || "User"} data-ai-hint="user avatar" />
                <AvatarFallback>{profile.displayName?.charAt(0).toUpperCase() || "U"}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-headline font-bold text-foreground">{profile.displayName || "User Name"}</h1>
                <p className="text-muted-foreground">@{profile.username || "username"}</p>
                <p className="text-sm text-muted-foreground">Joined: {profile.joinDate ? new Date(profile.joinDate).toLocaleDateString() : 'N/A'}</p>
              </div>
              {/* Edit Profile button removed as per plan */}
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Details Card */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-6 w-6 text-primary" /> Edit Profile Details</CardTitle>
            <CardDescription>Update your display name, username, and avatar URL.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name</Label>
                <Input id="displayName" name="displayName" value={profile.displayName} onChange={handleInputChange} placeholder="Your display name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" value={profile.username} onChange={handleInputChange} placeholder="Your username" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="photoURL">Avatar URL</Label>
              <Input id="photoURL" name="photoURL" type="url" value={profile.photoURL} onChange={handleInputChange} placeholder="https://example.com/avatar.png" />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" type="email" value={profile.email} readOnly disabled className="bg-muted/50 cursor-not-allowed" />
                <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
            </div>
            <Button onClick={handleSaveChanges} disabled={isSaving} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              {isSaving ? "Saving..." : <><Save className="mr-2 h-4 w-4" /> Save Changes</>}
            </Button>
          </CardContent>
        </Card>

        {/* Learning Stats */}
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
              <CardHeader><CardTitle className="text-lg text-primary">Longest Streak</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{placeholderStats.longestStreak} days</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">XP Points</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{placeholderStats.points.toLocaleString()}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Current Focus</CardTitle></CardHeader>
              <CardContent>
                <p className="text-md font-semibold">{displayLanguageName}</p>
                <p className="text-sm text-muted-foreground">{displayModeName} Mode</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievements */}
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
        
        {/* Activity Feed (Placeholder) */}
        <section>
            <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Recent Activity</h2>
            <Card className="shadow-lg bg-card">
                <CardContent className="p-6 space-y-4">
                    {[
                        {icon: <LanguagesIcon className="h-5 w-5 text-green-500"/>, text: `Started learning ${displayLanguageName}`, time: "2 days ago"},
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

