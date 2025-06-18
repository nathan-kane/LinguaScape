
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, ListChecks, HelpCircle, ChevronRight, RefreshCw, Languages } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react"; 
import { useLearning } from "@/context/LearningContext";
import type { DailyWordItem } from '@/lib/types'; // DailyWordItem expects 'translation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateVocabulary,
  type GenerateVocabularyInput,
  type GenerateVocabularyResult,
} from '@/ai/flows/generate-vocabulary-flow';
import { translateText, type TranslateTextInput } from '@/ai/flows/translate-text-flow';
import { useToast } from "@/hooks/use-toast";

// Local type for words fetched from the modified flow
interface FetchedWordItem {
  wordBankId: string;
  wordInTargetLanguage: string;
  exampleSentenceInTargetLanguage: string;
  wordType: 'noun' | 'verb' | 'adjective' | 'phrase' | 'other';
  dataAiHint?: string;
  // For fallback/consistency with DailyWordItem structure if needed elsewhere
  imageUrl?: string;
  audioUrl?: string;
}

// Type for words in session, now includes fetched native translation
interface SessionDisplayWord extends FetchedWordItem {
  nativeTranslation?: string; // Translation to user's native language
  isLoadingTranslation?: boolean;
}


const FlashcardDisplay = ({ word, showBack, onFlip }: { word: SessionDisplayWord | null, showBack: boolean, onFlip: () => void }) => {
  if (!word) return null;

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto h-[280px] sm:h-[320px] rounded-xl shadow-xl perspective group cursor-pointer"
      onClick={onFlip}
    >
      <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${showBack ? 'rotate-y-180' : ''}`}>
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden bg-card border border-border rounded-xl flex flex-col items-center justify-center p-6 text-center">
          <h3 className="text-3xl sm:text-4xl font-bold text-foreground">{word.wordInTargetLanguage}</h3>
          <p className="text-sm text-muted-foreground mt-4">Click to reveal translation & example</p>
        </div>
        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden bg-accent text-accent-foreground border border-accent rounded-xl flex flex-col items-center justify-center p-6 text-center rotate-y-180 space-y-3">
          {word.isLoadingTranslation ? (
            <p>Loading translation...</p>
          ) : word.nativeTranslation ? (
            <h3 className="text-2xl sm:text-3xl font-semibold">{word.nativeTranslation}</h3>
          ) : (
            <p className="text-red-200">Translation not available</p>
          )}
          {word.exampleSentenceInTargetLanguage && <p className="text-sm sm:text-base mt-2 italic">Example: "{word.exampleSentenceInTargetLanguage}"</p>}
        </div>
      </div>
    </div>
  );
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const WORDS_PER_SESSION = 7;

export default function VocabularyPage() {
  const [showBack, setShowBack] = useState(false);
  const { selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences, authUser } = useLearning();
  const { toast } = useToast();
  
  const [sessionWords, setSessionWords] = useState<SessionDisplayWord[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [totalWordsInAIModePool, setTotalWordsInAIModePool] = useState(0); // Represents the larger pool AI could generate for this mode
  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(new Set());

  const loadNewSessionWords = useCallback(async () => {
    if (isLoadingPreferences || !selectedLanguage || !selectedMode || !nativeLanguage) {
      setIsLoadingSession(false);
      return;
    }
    setIsLoadingSession(true);
    setShowBack(false);
    setMasteredWordIds(new Set());
    setCurrentCardIndex(0);
    setSessionWords([]); // Clear previous session

    try {
      const input: GenerateVocabularyInput = {
        languageName: selectedLanguage.name,
        languageCode: selectedLanguage.code,
        modeName: selectedMode.name, 
        nativeLanguageName: nativeLanguage.name, // For context, though flow won't translate
        count: 15, // Fetch a pool from AI
      };
      
      const result = await generateVocabulary(input);

      if (!result || !result.vocabulary || result.vocabulary.length === 0) {
        throw new Error("AI flow did not return any vocabulary.");
      }
      
      // The flow now returns FetchedWordItem structure
      const fetchedItems: FetchedWordItem[] = result.vocabulary.map(v => ({
        wordBankId: v.wordBankId,
        wordInTargetLanguage: v.wordInTargetLanguage,
        exampleSentenceInTargetLanguage: v.exampleSentenceInTargetLanguage,
        wordType: v.wordType,
        dataAiHint: v.dataAiHint,
        imageUrl: "https://placehold.co/600x400.png", 
        audioUrl: "#", 
      }));
      
      const shuffledPool = shuffleArray(fetchedItems);
      const wordsForThisSession: SessionDisplayWord[] = shuffledPool.slice(0, WORDS_PER_SESSION).map(w => ({
        ...w,
        isLoadingTranslation: false, // Initialize
      }));
      
      setSessionWords(wordsForThisSession);
      setTotalWordsInAIModePool(shuffledPool.length);
      setCurrentCardIndex(0);

    } catch (error: any) {
      console.error("Error loading vocabulary session:", error);
      toast({title: "Session Load Error", description: `Failed to load vocabulary: ${error.message || 'Unknown error'}.`, variant: "destructive"});
      setSessionWords([]);
      setTotalWordsInAIModePool(0);
    } finally {
      setIsLoadingSession(false);
    }
  }, [selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences, toast]);

  useEffect(() => {
    if (!isLoadingPreferences) {
        loadNewSessionWords();
    }
  }, [loadNewSessionWords, isLoadingPreferences]);

  const fetchTranslationForCurrentCard = useCallback(async () => {
    if (!sessionWords[currentCardIndex] || sessionWords[currentCardIndex].nativeTranslation || sessionWords[currentCardIndex].isLoadingTranslation) {
      return; // Already translated, loading, or no word
    }

    const currentWordObject = sessionWords[currentCardIndex];
    setSessionWords(prev => prev.map((word, idx) => idx === currentCardIndex ? { ...word, isLoadingTranslation: true } : word));

    try {
      const translateInput: TranslateTextInput = {
        textToTranslate: currentWordObject.wordInTargetLanguage,
        sourceLanguageName: selectedLanguage.name,
        targetLanguageName: nativeLanguage.name,
      };
      const translationResult = await translateText(translateInput);
      setSessionWords(prev => prev.map((word, idx) => 
        idx === currentCardIndex 
          ? { ...word, nativeTranslation: translationResult.translatedText, isLoadingTranslation: false } 
          : word
      ));
    } catch (error) {
      console.error("Error translating word:", error);
      toast({ title: "Translation Error", description: "Could not translate word.", variant: "destructive" });
      setSessionWords(prev => prev.map((word, idx) => idx === currentCardIndex ? { ...word, nativeTranslation: "Error", isLoadingTranslation: false } : word));
    }
  }, [currentCardIndex, sessionWords, selectedLanguage.name, nativeLanguage.name, toast]);


  const handleCardClick = () => {
    if (sessionWords.length > 0) {
      setShowBack(prevShowBack => {
        const newShowBack = !prevShowBack;
        if (newShowBack && !sessionWords[currentCardIndex]?.nativeTranslation && !sessionWords[currentCardIndex]?.isLoadingTranslation) {
          fetchTranslationForCurrentCard();
        }
        return newShowBack;
      });
    }
  };

  const handleNextCard = useCallback((srsRating?: string) => {
    if (sessionWords.length === 0) return;

    const currentWord = sessionWords[currentCardIndex];
    if (currentWord && srsRating === 'easy') {
      setMasteredWordIds(prev => new Set(prev).add(currentWord.wordBankId));
    }
      
    const nextIndex = currentCardIndex + 1;
    if (nextIndex >= sessionWords.length) {
      toast({ title: "Session Complete!", description: "You've reviewed all words. Reloading for more or try a new session." });
      loadNewSessionWords(); 
    } else {
      setCurrentCardIndex(nextIndex);
      // Pre-fetch translation for the next card if not already fetched
      if (sessionWords[nextIndex] && !sessionWords[nextIndex].nativeTranslation && !sessionWords[nextIndex].isLoadingTranslation) {
        // This is tricky - fetchTranslationForCurrentCard uses currentCardIndex. Need to adapt or fetch directly.
        // For now, translation will fetch on flip.
      }
    }
    setShowBack(false); 
    
    if (srsRating && currentWord && authUser?.uid) {
      console.log(`Word "${currentWord.wordInTargetLanguage}" (ID: ${currentWord.wordBankId}) rated as: ${srsRating} by user ${authUser.uid}.`);
    }
  }, [sessionWords, currentCardIndex, loadNewSessionWords, authUser?.uid, toast]);

  const currentDisplayWord = sessionWords[currentCardIndex];

  const stats = [
    { label: "Words in Session" },
    { label: "Words in AI Pool" }, 
    { label: "Mastered This Session" },
  ];
  
  const getStatIcon = (label: string) => {
    if (label === "Words in Session") return <ListChecks className="text-primary" />;
    if (label === "Words in AI Pool") return <Languages className="text-primary" />;
    if (label === "Mastered This Session") return <Zap className="text-primary" />;
    return <HelpCircle className="text-primary" />;
  };

  if (isLoadingPreferences || isLoadingSession) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading vocabulary session...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
              Vocabulary Master
            </h1>
            <p className="text-lg text-muted-foreground">
              Strengthen your vocabulary in {selectedLanguage.name} ({selectedMode.name} mode).
              Native translation to {nativeLanguage.name} on demand.
            </p>
          </div>
          <Button onClick={loadNewSessionWords} className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingSession}>
            <RefreshCw className="mr-2 h-5 w-5" /> {isLoadingSession ? "Loading..." : "New Session Words"}
          </Button>
        </section>

        <section className="flex flex-col items-center gap-6 py-8">
          {sessionWords.length > 0 && currentDisplayWord ? (
            <>
              <FlashcardDisplay 
                word={currentDisplayWord} 
                showBack={showBack} 
                onFlip={handleCardClick}
              />
              
              {showBack && (
                <div className="text-center mt-4">
                  <h4 className="text-md font-semibold text-muted-foreground mb-2">How well did you remember the <span className="text-accent font-bold">{nativeLanguage.name}</span> translation?</h4>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('again')}>Again</Button>
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10 w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('hard')}>Hard</Button>
                    <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-500/10 w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('good')}>Good</Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('easy')}>Easy</Button>
                  </div>
                </div>
              )}

              <Button variant="link" onClick={() => handleNextCard()} className="mt-2 text-primary text-sm" disabled={isLoadingSession || currentDisplayWord?.isLoadingTranslation}>
                Skip to Next Card <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-4 max-w-md">
                Card {currentCardIndex + 1} of {sessionWords.length}.
                {!showBack && " Click the card to reveal."}
                {showBack && " Select how well you knew it, or click 'Skip'."}
              </p>
            </>
          ) : (
            <Card className="p-8 text-center bg-card w-full max-w-md">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Words Loaded</CardTitle>
              <CardDescription className="my-2">
                Could not load vocabulary for {selectedLanguage.name} ({selectedMode.name} mode).
              </CardDescription>
              <Button onClick={loadNewSessionWords} className="mt-4" disabled={isLoadingSession}>
                <RefreshCw className="mr-2 h-4 w-4" /> {isLoadingSession ? "Loading..." : "Try Reloading Words"}
              </Button>
            </Card>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => {
            let displayValue: string | number = 0;
            let subText = "";

            if (stat.label === "Words in Session") {
              displayValue = sessionWords.length;
              subText = sessionWords.length > 0 ? `Reviewing ${Math.min(currentCardIndex + 1, sessionWords.length)} / ${sessionWords.length}` : "No session active";
            } else if (stat.label === "Words in AI Pool") {
              displayValue = totalWordsInAIModePool;
              subText = "Potential words for this mode";
            } else if (stat.label === "Mastered This Session") {
              displayValue = masteredWordIds.size; 
              subText = "Marked 'Easy' this session";
            }

            return (
              <Card key={stat.label} className="shadow-lg bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  {getStatIcon(stat.label)}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayValue}</div>
                  <p className="text-xs text-muted-foreground">{subText}</p>
                </CardContent>
              </Card>
            );
          })}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg font-headline">Browse All Vocabulary</CardTitle>
                </div>
              <CardDescription>Explore all words, filter by status, or search. (Future)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full" disabled>
                <Link href="#">Go to Full Word List</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
             <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg font-headline">How SRS Works</CardTitle>
                </div>
              <CardDescription>Learn about spaced repetition. (Future)</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full" disabled>
                <Link href="#">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
      <style jsx global>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </AuthenticatedLayout>
  );
}
