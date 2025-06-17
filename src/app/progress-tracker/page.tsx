
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Zap, Target, BookOpen, Repeat, CalendarDays, TrendingUp, AlertCircle } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLearning } from '@/context/LearningContext';
import Image from 'next/image';
import { 
  generateVocabulary, 
  type GenerateVocabularyInput,
  type GenerateVocabularyResult 
} from '@/ai/flows/generate-vocabulary-flow';
import type { DailyWordItem } from '@/lib/types'; // Re-using DailyWordItem from types
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


interface ProgressWordItem extends DailyWordItem {
  fluency: number;
  nextReview: string;
  status: 'learning' | 'review' | 'mastered';
}

const SIMULATED_STREAK = 12; // Placeholder for streak

export default function ProgressTrackerPage() {
  const { selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences } = useLearning();
  const { toast } = useToast();

  const [progressWords, setProgressWords] = useState<ProgressWordItem[]>([]);
  const [overallProgress, setOverallProgress] = useState(0);
  const [totalWordsInPool, setTotalWordsInPool] = useState(0);
  const [wordsToReviewToday, setWordsToReviewToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);

  const fetchAndSimulateProgress = useCallback(async () => {
    if (isLoadingPreferences || !selectedLanguage || !selectedMode || !nativeLanguage) {
      return;
    }
    setIsLoading(true);
    setErrorLoading(null);
    setProgressWords([]);

    try {
      const input: GenerateVocabularyInput = {
        languageName: selectedLanguage.name,
        languageCode: selectedLanguage.code,
        modeName: selectedMode.name,
        nativeLanguageName: nativeLanguage.name,
        count: 15, // Fetch a reasonable pool size
      };
      
      const result: GenerateVocabularyResult = await generateVocabulary(input);

      if (!result || !result.vocabulary || result.vocabulary.length === 0) {
        throw new Error("No vocabulary data returned from AI.");
      }

      const fetchedWords: DailyWordItem[] = result.vocabulary.map(v => ({
        wordBankId: v.wordBankId,
        word: v.word,
        translation: v.translation,
        exampleSentence: v.exampleSentence,
        wordType: v.wordType,
        dataAiHint: v.dataAiHint,
        // imageUrl and audioUrl would typically come from a DB or more complex flow
        imageUrl: "https://placehold.co/200x150.png", 
        audioUrl: "#",
      }));
      
      let totalFluency = 0;
      let reviewTodayCount = 0;

      const simulatedProgress: ProgressWordItem[] = fetchedWords.map(word => {
        const fluency = Math.floor(Math.random() * 71) + 30; // Random fluency 30-100
        totalFluency += fluency;
        let status: ProgressWordItem['status'];
        let nextReview: string;

        if (fluency < 60) {
          status = 'learning';
          nextReview = Math.random() < 0.5 ? "Today" : "Tomorrow";
        } else if (fluency < 90) {
          status = 'review';
          nextReview = Math.random() < 0.3 ? "Today" : `In ${Math.floor(Math.random() * 3) + 2} days`;
        } else {
          status = 'mastered';
          nextReview = `In ${Math.floor(Math.random() * 7) + 7} days`;
        }
        if (nextReview === "Today") {
          reviewTodayCount++;
        }
        return { ...word, fluency, status, nextReview };
      });

      setProgressWords(simulatedProgress);
      setTotalWordsInPool(simulatedProgress.length);
      setOverallProgress(simulatedProgress.length > 0 ? Math.round(totalFluency / simulatedProgress.length) : 0);
      setWordsToReviewToday(reviewTodayCount);

    } catch (err: any) {
      console.error("Error fetching/simulating progress:", err);
      setErrorLoading(err.message || "Failed to load progress data. Please try refreshing.");
      toast({
        title: "Load Error",
        description: err.message || "Could not load progress data. Displaying limited info.",
        variant: "destructive",
      });
      // Reset states on error
      setProgressWords([]);
      setTotalWordsInPool(0);
      setOverallProgress(0);
      setWordsToReviewToday(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences, toast]);

  useEffect(() => {
    if (!isLoadingPreferences) {
      fetchAndSimulateProgress();
    }
  }, [fetchAndSimulateProgress, isLoadingPreferences]);

  if (isLoading || isLoadingPreferences) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="ml-4 text-muted-foreground">Loading your progress for {selectedLanguage.name} ({selectedMode.name})...</p>
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

        {errorLoading && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Progress</AlertTitle>
              <AlertDescription>{errorLoading} You can try <Button variant="link" className="p-0 h-auto" onClick={fetchAndSimulateProgress}>reloading the data</Button>.</AlertDescription>
            </Alert>
        )}

        <Card className="shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-7 w-7 text-primary"/>Overall Progress (Simulated)</CardTitle>
            <CardDescription>Your estimated fluency and key metrics for the current language & mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-lg font-medium text-foreground">Estimated Fluency</span>
                <span className="text-lg font-bold text-primary">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-4" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-secondary rounded-lg">
                <Zap className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{totalWordsInPool}</p>
                <p className="text-sm text-muted-foreground">Words in Current Pool</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <CalendarDays className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{SIMULATED_STREAK} days</p>
                <p className="text-sm text-muted-foreground">Current Streak (Placeholder)</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <Repeat className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{wordsToReviewToday}</p>
                <p className="text-sm text-muted-foreground">Words to Review Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary"/>Word Fluency Details (Simulated)</CardTitle>
            <CardDescription>Track your mastery of individual words and phrases from the current pool.</CardDescription>
          </CardHeader>
          <CardContent>
            {progressWords.length > 0 ? (
              <div className="space-y-4">
                {progressWords.map(word => (
                  <Card key={word.wordBankId} className="p-4 bg-background border hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground">{word.word}</h4>
                        <p className={cn(
                          "text-sm font-medium",
                          word.status === 'mastered' ? 'text-green-600' : 
                          word.status === 'review' ? 'text-yellow-600' : 'text-blue-600'
                        )}>
                          Status: {word.status.charAt(0).toUpperCase() + word.status.slice(1)}
                        </p>
                      </div>
                      <div className="w-full sm:w-1/3">
                        <div className="flex justify-between text-xs mb-1">
                          <span>Fluency</span>
                          <span>{word.fluency}%</span>
                        </div>
                        <Progress value={word.fluency} className="h-2" 
                          indicatorClassName={cn(
                             word.fluency < 40 ? 'bg-red-500' :
                             word.fluency < 70 ? 'bg-yellow-500' :
                             'bg-green-500'
                          )}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground mt-2 sm:mt-0 sm:text-right min-w-[100px]">
                        Next review: {word.nextReview}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                {isLoading ? "Loading words..." : "No word progress to display for this selection. Try starting a vocabulary session."}
              </p>
            )}
          </CardContent>
           {progressWords.length > 0 && (
            <CardFooter>
                <Button variant="outline" onClick={fetchAndSimulateProgress} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4"/> Refresh Simulated Data
                </Button>
            </CardFooter>
           )}
        </Card>
        
        <Card className="shadow-md bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Learning Activity</CardTitle>
                <CardDescription>Visualize your learning patterns over time (Feature Coming Soon).</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Image src="https://placehold.co/600x300.png" alt="Placeholder chart for learning activity" width={600} height={300} className="rounded-lg mx-auto opacity-50 shadow-md" data-ai-hint="graph chart data"/>
                <p className="text-muted-foreground mt-4">Detailed charts and activity logs will be available in a future update.</p>
            </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}

// Small helper for Progress component indicator color, if needed directly (alternative to cn in-place)
// const getFluencyColorClass = (fluency: number): string => {
//   if (fluency < 40) return 'bg-red-500';
//   if (fluency < 70) return 'bg-yellow-500';
//   return 'bg-green-500';
// };
// Inside Progress: indicatorClassName={getFluencyColorClass(word.fluency)}

