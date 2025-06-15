
"use client";

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Zap, Target, BookOpen, Repeat, CalendarDays, TrendingUp } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLearning } from '@/context/LearningContext';
// import type { UserWordProgress } from '@/lib/types'; // Future use

// Placeholder data - replace with actual fetched data
const placeholderOverallProgress = 65; // Percentage
const placeholderWordsTracked = [
  { id: "1", word: "Manzana", fluency: 80, nextReview: "Tomorrow", status: "learning" },
  { id: "2", word: "Comer", fluency: 95, nextReview: "In 3 days", status: "review" },
  { id: "3", word: "Rojo", fluency: 50, nextReview: "Today", status: "learning" },
  { id: "4", word: "Agua", fluency: 100, nextReview: "In 1 week", status: "mastered" },
  { id: "5", word: "Hola", fluency: 100, nextReview: "In 2 weeks", status: "mastered" },
];
const placeholderStats = {
  totalWordsLearned: 150,
  currentStreak: 12,
  wordsToReviewToday: 3,
};

export default function ProgressTrackerPage() {
  const { selectedLanguage, selectedMode } = useLearning();
  // const [wordProgress, setWordProgress] = useState<UserWordProgress[]>([]); // For future
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching progress data
    setIsLoading(true);
    setTimeout(() => {
      // In a real app, fetch UserWordProgress for selectedLanguage and selectedMode
      // setWordProgress(fetchedData);
      setIsLoading(false);
    }, 1000);
  }, [selectedLanguage, selectedMode]);

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="ml-4 text-muted-foreground">Loading your progress...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Your Learning Progress
          </h1>
          <p className="text-lg text-muted-foreground">
            Track your journey in {selectedLanguage.name} ({selectedMode.name} mode).
          </p>
        </section>

        <Card className="shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-7 w-7 text-primary"/>Overall Progress</CardTitle>
            <CardDescription>Your estimated fluency and key metrics.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-lg font-medium text-foreground">Estimated Fluency</span>
                <span className="text-lg font-bold text-primary">{placeholderOverallProgress}%</span>
              </div>
              <Progress value={placeholderOverallProgress} className="h-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-secondary rounded-lg">
                <Zap className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{placeholderStats.totalWordsLearned}</p>
                <p className="text-sm text-muted-foreground">Total Words Learned</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <CalendarDays className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{placeholderStats.currentStreak} days</p>
                <p className="text-sm text-muted-foreground">Current Streak</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <Repeat className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{placeholderStats.wordsToReviewToday}</p>
                <p className="text-sm text-muted-foreground">Words to Review Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary"/>Word Fluency Details</CardTitle>
            <CardDescription>Track your mastery of individual words and phrases.</CardDescription>
          </CardHeader>
          <CardContent>
            {placeholderWordsTracked.length > 0 ? (
              <div className="space-y-4">
                {placeholderWordsTracked.map(word => (
                  <Card key={word.id} className="p-4 bg-background border hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground">{word.word}</h4>
                        <p className={`text-sm font-medium ${
                          word.status === 'mastered' ? 'text-green-600' : 
                          word.status === 'review' ? 'text-yellow-600' : 'text-blue-600'
                        }`}>
                          Status: {word.status.charAt(0).toUpperCase() + word.status.slice(1)}
                        </p>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Fluency</span>
                          <span>{word.fluency}%</span>
                        </div>
                        <Progress value={word.fluency} className="h-2" />
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 sm:mt-0 sm:text-right">
                        Next review: {word.nextReview}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">No word progress tracked yet. Start a lesson!</p>
            )}
          </CardContent>
          <CardFooter>
            <Button variant="outline">View All Word History (Future)</Button>
          </CardFooter>
        </Card>
        
        {/* Placeholder for Activity History / Charts */}
        <Card className="shadow-md bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Learning Activity</CardTitle>
                <CardDescription>Visualize your learning patterns over time.</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="text-muted-foreground py-8">(Charts and activity logs will appear here)</p>
                <Image src="https://placehold.co/600x300.png" alt="Placeholder chart" width={600} height={300} className="rounded-lg mx-auto opacity-50" data-ai-hint="graph chart data"/>
            </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}
