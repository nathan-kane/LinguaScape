
"use client";

import { useState } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Flame, BookOpen, Mic, Edit3, Headphones, Activity, Award, CalendarDays, Users, SlidersHorizontal, ChevronRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { ModeSelector } from "@/components/shared/ModeSelector";
import type { Language, LearningMode } from "@/lib/types";
import { SUPPORTED_LANGUAGES, LEARNING_MODES, DEFAULT_LANGUAGE, DEFAULT_MODE } from "@/lib/constants";

const quickLinks = [
  { title: "Vocabulary Practice", href: "/vocabulary", icon: BookOpen, description: "Review your flashcards." },
  { title: "Pronunciation Check", href: "/pronunciation", icon: Mic, description: "Practice speaking." },
  { title: "Grammar Drills", href: "/grammar", icon: Edit3, description: "Test your grammar." },
  { title: "Listening Exercise", href: "/listening", icon: Headphones, description: "Improve comprehension." },
];

export default function DashboardPage() {
  // Placeholder data
  const userName = "Alex";
  const currentStreak = 15;
  const wordsLearned = 250;
  const lessonsCompletedToday = 3;

  const [currentLanguage, setCurrentLanguage] = useState<Language>(DEFAULT_LANGUAGE);
  const [currentMode, setCurrentMode] = useState<LearningMode>(DEFAULT_MODE);

  const handleLanguageChange = (language: Language) => {
    setCurrentLanguage(language);
    // In a real app, you would likely save this preference
    console.log("Selected language:", language.name);
  };

  const handleModeChange = (mode: LearningMode) => {
    setCurrentMode(mode);
    // In a real app, you would likely save this preference
    console.log("Selected mode:", mode.name);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to continue your language journey? Let's learn something new today.
          </p>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Streak</CardTitle>
              <Flame className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentStreak} days</div>
              <p className="text-xs text-muted-foreground">Keep it up! Consistency is key.</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Words Learned</CardTitle>
              <BookOpen className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{wordsLearned} words</div>
              <p className="text-xs text-muted-foreground">Expanding your vocabulary daily.</p>
            </CardContent>
          </Card>
          <Card className="shadow-lg bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Lessons Today</CardTitle>
              <Activity className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lessonsCompletedToday} lessons</div>
              <p className="text-xs text-muted-foreground">Great progress for today!</p>
            </CardContent>
          </Card>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickLinks.map((link) => (
              <Card key={link.title} className="shadow-md hover:shadow-lg transition-shadow duration-300 bg-card">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <link.icon className="h-7 w-7 text-accent" />
                    <CardTitle className="text-lg font-headline">{link.title}</CardTitle>
                  </div>
                  <CardDescription>{link.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="outline" className="w-full border-primary text-primary hover:bg-primary/10 hover:text-primary">
                    <Link href={link.href}>Start Learning</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Learning Preferences</h2>
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-xl font-headline">
                <SlidersHorizontal className="h-6 w-6 text-primary"/>
                Adjust Your Focus
              </CardTitle>
              <CardDescription>Select the language and learning style you want to focus on.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="language-select-dashboard" className="text-sm font-medium">Target Language</Label>
                <LanguageSelector
                  selectedLanguage={currentLanguage}
                  onLanguageChange={handleLanguageChange}
                  className="w-full"
                  // id="language-select-dashboard" // The button inside will have its own aria-label
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mode-select-dashboard" className="text-sm font-medium">Learning Mode</Label>
                <ModeSelector
                  selectedMode={currentMode}
                  onModeChange={handleModeChange}
                  className="w-full"
                  // id="mode-select-dashboard" // The button inside will have its own aria-label
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-full sm:w-auto">
                Save Preferences
              </Button>
            </CardFooter>
          </Card>
        </section>
        
        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Your Learning Path</h2>
          <Card className="shadow-lg bg-card">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <Image 
                  src="https://placehold.co/600x400.png" 
                  alt="Learning Path Illustration" 
                  width={250} 
                  height={150} 
                  className="rounded-lg object-cover"
                  data-ai-hint="learning journey" 
                />
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-primary mb-2">Next Up: Mastering Past Tense</h3>
                  <p className="text-muted-foreground mb-4">
                    You're making great strides in {currentLanguage.name}. The next module focuses on past tense verbs to help you share your experiences.
                  </p>
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    Continue Learning Path
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><Award className="h-6 w-6 text-primary"/>Achievements</CardTitle>
                    <CardDescription>View your unlocked badges and milestones.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex space-x-3 overflow-x-auto pb-2">
                        {[...Array(5)].map((_, i) => (
                             <div key={i} className="flex flex-col items-center p-3 bg-secondary rounded-lg w-24 text-center" data-ai-hint="badge achievement">
                                <Image src={`https://placehold.co/80x80.png`} alt={`Badge ${i+1}`} width={48} height={48} className="rounded-full mb-1" />
                                <span className="text-xs font-medium text-secondary-foreground">Badge {i+1}</span>
                             </div>
                        ))}
                    </div>
                     <Button variant="link" className="mt-2 p-0 h-auto text-primary">View all achievements</Button>
                </CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl font-headline"><CalendarDays className="h-6 w-6 text-primary"/>Weekly Goals</CardTitle>
                    <CardDescription>Track your progress towards weekly learning targets.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Vocabulary Practice</span>
                                <span>3/5 sessions</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{width: "60%"}}></div>
                            </div>
                        </div>
                         <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span>Grammar Drills</span>
                                <span>10/20 exercises</span>
                            </div>
                            <div className="w-full bg-secondary rounded-full h-2.5">
                                <div className="bg-primary h-2.5 rounded-full" style={{width: "50%"}}></div>
                            </div>
                        </div>
                    </div>
                    <Button variant="link" className="mt-3 p-0 h-auto text-primary">Set new goals</Button>
                </CardContent>
            </Card>
        </section>
        
      </div>
    </AuthenticatedLayout>
  );
}

    