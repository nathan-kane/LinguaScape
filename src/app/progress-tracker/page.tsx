
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, Zap, Target, BookOpen, Repeat, CalendarDays, TrendingUp, AlertCircle, RefreshCw } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLearning } from '@/context/LearningContext';
import Image from 'next/image';
import { 
  generateVocabulary, 
  type GenerateVocabularyInput,
  type GenerateVocabularyResult 
} from '@/ai/flows/generate-vocabulary-flow';
import type { DailyWordItem } from '@/lib/types'; 
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';


interface ProgressWordItem extends DailyWordItem {
  fluency: number;
  nextReview: string;
  status: 'learning' | 'review' | 'mastered' | 'new';
}

const INITIAL_FLUENCY_PERCENTAGE = 5;
const SIMULATED_STREAK = 0; // Will be fetched from Firestore on Dashboard, placeholder here for consistency if needed

export default function ProgressTrackerPage() {
  const { selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences } = useLearning();
  const { toast } = useToast();

  const [progressWords, setProgressWords] = useState<ProgressWordItem[]>([]);
  const [averagePoolFluency, setAveragePoolFluency] = useState(INITIAL_FLUENCY_PERCENTAGE);
  const [totalWordsInPool, setTotalWordsInPool] = useState(0);
  const [wordsToReviewToday, setWordsToReviewToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorLoading, setErrorLoading] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(SIMULATED_STREAK); // Placeholder, ideally from context/Firestore

  const fetchAndInitializePool = useCallback(async () => {
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
        count: 20, // Fetch a decent size pool to display
      };
      
      const result: GenerateVocabularyResult = await generateVocabulary(input);

      if (!result || !result.vocabulary || result.vocabulary.length === 0) {
        throw new Error("No vocabulary data returned from AI for the current selection.");
      }

      const fetchedWords: DailyWordItem[] = result.vocabulary.map(v => ({
        wordBankId: v.wordBankId,
        word: v.word,
        translation: v.translation,
        exampleSentence: v.exampleSentence,
        wordType: v.wordType,
        dataAiHint: v.dataAiHint,
        imageUrl: "https://placehold.co/200x150.png", 
        audioUrl: "#",
      }));
      
      const initializedWords: ProgressWordItem[] = fetchedWords.map(word => ({
        ...word,
        fluency: INITIAL_FLUENCY_PERCENTAGE,
        status: 'learning',
        nextReview: "Today",
      }));

      setProgressWords(initializedWords);
      setTotalWordsInPool(initializedWords.length);
      setAveragePoolFluency(initializedWords.length > 0 ? INITIAL_FLUENCY_PERCENTAGE : 0);
      setWordsToReviewToday(initializedWords.length); // All new words are due today

    } catch (err: any) {
      console.error("Error fetching/initializing word pool:", err);
      setErrorLoading(err.message || "Failed to load vocabulary pool. Please try refreshing.");
      toast({
        title: "Load Error",
        description: err.message || "Could not load vocabulary pool for progress tracking.",
        variant: "destructive",
      });
      setProgressWords([]);
      setTotalWordsInPool(0);
      setAveragePoolFluency(0);
      setWordsToReviewToday(0);
    } finally {
      setIsLoading(false);
    }
  }, [selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences, toast]);

  useEffect(() => {
    if (!isLoadingPreferences) {
      fetchAndInitializePool();
      // In a real app, currentStreak would be fetched from user data (e.g., Firestore via context)
      // For now, it remains a placeholder on this specific page. The dashboard attempts to fetch it.
    }
  }, [fetchAndInitializePool, isLoadingPreferences]);

  if (isLoading || isLoadingPreferences) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
           <p className="ml-4 text-muted-foreground">Loading vocabulary pool for {selectedLanguage.name} ({selectedMode.name})...</p>
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
            Overview for {selectedLanguage.name} ({selectedMode.name} mode).
          </p>
        </section>

        {errorLoading && !isLoading && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error Loading Vocabulary Pool</AlertTitle>
              <AlertDescription>{errorLoading} You can try <Button variant="link" className="p-0 h-auto" onClick={fetchAndInitializePool}>reloading the data</Button>.</AlertDescription>
            </Alert>
        )}

        <Card className="shadow-xl bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="h-7 w-7 text-primary"/>Current Pool Focus</CardTitle>
            <CardDescription>Initial status of the vocabulary pool for your selected language & mode.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-lg font-medium text-foreground">Initial Pool Fluency</span>
                <span className="text-lg font-bold text-primary">{averagePoolFluency}%</span>
              </div>
              <Progress value={averagePoolFluency} className="h-4" />
              <p className="text-xs text-muted-foreground mt-1">Represents the starting point for words in this pool.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-secondary rounded-lg">
                <BookOpen className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{totalWordsInPool}</p>
                <p className="text-sm text-muted-foreground">Words in Current Pool</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <CalendarDays className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{currentStreak}</p>
                <p className="text-sm text-muted-foreground">Current Streak (App Overall)</p>
              </div>
              <div className="p-4 bg-secondary rounded-lg">
                <Repeat className="h-8 w-8 mx-auto text-accent mb-2"/>
                <p className="text-2xl font-bold">{wordsToReviewToday}</p>
                <p className="text-sm text-muted-foreground">Words to Learn/Review Today</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Target className="h-6 w-6 text-primary"/>Words in Current Pool</CardTitle>
            <CardDescription>Vocabulary items fetched for your current learning context.</CardDescription>
          </CardHeader>
          <CardContent>
            {progressWords.length > 0 ? (
              <div className="space-y-4">
                {progressWords.map(word => (
                  <Card key={word.wordBankId} className="p-4 bg-background border hover:shadow-md transition-shadow">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-foreground">{word.word} <span className="text-sm text-muted-foreground">({word.translation})</span></h4>
                        <p className={cn(
                          "text-sm font-medium",
                           "text-blue-600" // All start as 'learning'
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
                             word.fluency < 40 ? 'bg-red-500' : // Will be low initially
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
                {isLoading ? "Loading words..." : "No words to display for this selection. Try starting a vocabulary session or reloading."}
              </p>
            )}
          </CardContent>
           {progressWords.length > 0 && (
            <CardFooter>
                <Button variant="outline" onClick={fetchAndInitializePool} disabled={isLoading}>
                    <RefreshCw className="mr-2 h-4 w-4"/> Reload Word Pool
                </Button>
            </CardFooter>
           )}
        </Card>
        
        <Card className="shadow-md bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart3 className="h-6 w-6 text-primary"/>Learning Activity Graph</CardTitle>
                <CardDescription>Visualize your learning patterns over time (Feature Coming Soon).</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <Image src="https://placehold.co/600x300.png" alt="Placeholder chart for learning activity" width={600} height={300} className="rounded-lg mx-auto opacity-50 shadow-md" data-ai-hint="graph chart data"/>
                <p className="text-muted-foreground mt-4">Detailed charts and historical activity logs require further backend integration.</p>
            </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}
