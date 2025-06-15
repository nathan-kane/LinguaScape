
"use client";

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, CheckSquare, Edit2, BookOpen, ChevronRight, Zap, Lightbulb, MessageSquare } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useLearning } from '@/context/LearningContext';
import type { DailyWordItem } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

// Function to get placeholder words based on language and mode
const getPlaceholderDailyWords = (languageCode: string, modeId: string): DailyWordItem[] => {
  const commonProps = {
    imageUrl: "https://placehold.co/200x150.png",
    audioUrl: "#",
  };

  const applyTravelAdjustments = (items: DailyWordItem[], lang: 'es' | 'fr' | 'ua'): DailyWordItem[] => {
    if (modeId === 'travel') {
      return items.map(item => {
        if (lang === 'es') {
          if (item.word === "Agua") return { ...item, exampleSentence: "Quiero agua, por favor.", dataAiHint: "water travel" };
          if (item.word === "Manzana") return { ...item, exampleSentence: "¿Cuánto cuesta esta manzana?", dataAiHint: "apple market" };
        }
        if (lang === 'fr') {
          if (item.word === "Eau") return { ...item, exampleSentence: "Je voudrais de l'eau, s'il vous plaît.", dataAiHint: "water travel" };
          if (item.word === "Pomme") return { ...item, exampleSentence: "Combien coûte cette pomme?", dataAiHint: "apple market" };
        }
        if (lang === 'ua') {
          if (item.word === "Вода") return { ...item, exampleSentence: "Я хочу води, будь ласка.", dataAiHint: "water travel" };
          if (item.word === "Яблуко") return { ...item, exampleSentence: "Скільки коштує це яблуко?", dataAiHint: "apple market" };
        }
        return item;
      });
    }
    return items;
  };

  if (languageCode === 'es') {
    const spanishWords: DailyWordItem[] = [
      { wordBankId: "es1", word: "Manzana", translation: "Apple", ...commonProps, exampleSentence: "Yo como una manzana roja.", wordType: "noun", dataAiHint: "apple fruit" },
      { wordBankId: "es2", word: "Comer", translation: "To eat", ...commonProps, exampleSentence: "Me gusta comer frutas.", wordType: "verb", dataAiHint: "person eating" },
      { wordBankId: "es3", word: "Rojo/Roja", translation: "Red", ...commonProps, exampleSentence: "La manzana es roja.", wordType: "adjective", dataAiHint: "red color swatch" },
      { wordBankId: "es4", word: "Quiero", translation: "I want", ...commonProps, exampleSentence: "Quiero aprender español.", wordType: "phrase", dataAiHint: "person thinking" },
      { wordBankId: "es5", word: "Agua", translation: "Water", ...commonProps, exampleSentence: "Bebo agua todos los días.", wordType: "noun", dataAiHint: "glass water" },
    ];
    return applyTravelAdjustments(spanishWords, 'es');
  } else if (languageCode === 'fr') {
    const frenchWords: DailyWordItem[] = [
      { wordBankId: "fr1", word: "Pomme", translation: "Apple", ...commonProps, exampleSentence: "Je mange une pomme.", wordType: "noun", dataAiHint: "apple fruit" },
      { wordBankId: "fr2", word: "Manger", translation: "To eat", ...commonProps, exampleSentence: "J'aime manger des fruits.", wordType: "verb", dataAiHint: "person eating" },
      { wordBankId: "fr3", word: "Rouge", translation: "Red", ...commonProps, exampleSentence: "La pomme est rouge.", wordType: "adjective", dataAiHint: "red color swatch" },
      { wordBankId: "fr4", word: "Je veux", translation: "I want", ...commonProps, exampleSentence: "Je veux apprendre le français.", wordType: "phrase", dataAiHint: "person thinking" },
      { wordBankId: "fr5", word: "Eau", translation: "Water", ...commonProps, exampleSentence: "Je bois de l'eau.", wordType: "noun", dataAiHint: "glass water" },
    ];
    return applyTravelAdjustments(frenchWords, 'fr');
  } else if (languageCode === 'ua') {
    const ukrainianWords: DailyWordItem[] = [
      { wordBankId: "ua1", word: "Яблуко", translation: "Apple", ...commonProps, exampleSentence: "Я їм яблуко.", wordType: "noun", dataAiHint: "apple fruit" },
      { wordBankId: "ua2", word: "Їсти", translation: "To eat", ...commonProps, exampleSentence: "Я люблю їсти фрукти.", wordType: "verb", dataAiHint: "person eating" },
      { wordBankId: "ua3", word: "Червоний", translation: "Red", ...commonProps, exampleSentence: "Яблуко червоне.", wordType: "adjective", dataAiHint: "red color swatch" },
      { wordBankId: "ua4", word: "Я хочу", translation: "I want", ...commonProps, exampleSentence: "Я хочу вивчати українську.", wordType: "phrase", dataAiHint: "person thinking" },
      { wordBankId: "ua5", word: "Вода", translation: "Water", ...commonProps, exampleSentence: "Я п'ю воду.", wordType: "noun", dataAiHint: "glass water" },
    ];
    return applyTravelAdjustments(ukrainianWords, 'ua');
  }
  // Default to English or a generic set if no specific language match
  return [
    { wordBankId: "en1", word: "Apple", translation: "Manzana (Spanish)", ...commonProps, exampleSentence: "I eat an apple.", wordType: "noun", dataAiHint: "apple fruit" },
    { wordBankId: "en2", word: "To eat", translation: "Comer (Spanish)", ...commonProps, exampleSentence: "I like to eat fruits.", wordType: "verb", dataAiHint: "person eating" },
    { wordBankId: "en3", word: "Red", translation: "Rojo (Spanish)", ...commonProps, exampleSentence: "The apple is red.", wordType: "adjective", dataAiHint: "red color swatch" },
    { wordBankId: "en4", word: "I want", translation: "Quiero (Spanish)", ...commonProps, exampleSentence: "I want to learn.", wordType: "phrase", dataAiHint: "person thinking" },
    { wordBankId: "en5", word: "Water", translation: "Agua (Spanish)", ...commonProps, exampleSentence: "I drink water.", wordType: "noun", dataAiHint: "glass water" },
  ];
};


export default function DailySessionPage() {
  const { selectedLanguage, selectedMode, isLoadingPreferences } = useLearning();
  const [dailyWords, setDailyWords] = useState<DailyWordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [practiceStage, setPracticeStage] = useState<'introduction' | 'recognition' | 'story' | 'chat'>('introduction');
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);


  useEffect(() => {
    if (!isLoadingPreferences) { 
      setIsLoadingLesson(true);
      // Simulate fetching data based on selected language and mode
      setTimeout(() => {
        const relevantWords = getPlaceholderDailyWords(selectedLanguage.code, selectedMode.id);
        setDailyWords(relevantWords.slice(0, 5)); // Take 5 words for the lesson
        setCurrentWordIndex(0);
        setPracticeStage('introduction');
        setIsLoadingLesson(false);
      }, 500); 
    }
  }, [selectedLanguage, selectedMode, isLoadingPreferences]);

  const currentWord = dailyWords[currentWordIndex];

  const playAudio = (audioUrl?: string) => {
    if (audioUrl && audioUrl !== "#") {
      alert(`Simulating audio playback for: ${currentWord?.word}`);
    } else {
      alert("Audio playback is simulated for this word.");
    }
  };

  const handleNextWord = () => {
    if (currentWordIndex < dailyWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
    } else {
      setPracticeStage('recognition'); 
    }
  };
  
  const progressPercentage = dailyWords.length > 0 ? ((currentWordIndex + 1) / dailyWords.length) * 100 : 0;

  if (isLoadingPreferences || isLoadingLesson) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="ml-4 text-muted-foreground">Loading your lesson for {selectedLanguage.name} ({selectedMode.name} mode)...</p>
        </div>
      </AuthenticatedLayout>
    );
  }
  
  if (dailyWords.length === 0 && !isLoadingLesson) { 
     return (
      <AuthenticatedLayout>
        <Alert>
          <Lightbulb className="h-4 w-4" />
          <AlertTitle>No words for today!</AlertTitle>
          <AlertDescription>
            It seems there are no new words scheduled for you in {selectedLanguage.name} ({selectedMode.name} mode) right now. Check back later or adjust your learning settings.
            <Link href="/profile"><Button variant="link" className="p-0 h-auto ml-1">Go to Profile</Button></Link>
          </AlertDescription>
        </Alert>
      </AuthenticatedLayout>
    );
  }


  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Today's Lesson: {selectedLanguage.name}
          </h1>
          <p className="text-lg text-muted-foreground">
            Mode: {selectedMode.name} - Let's learn some new words!
          </p>
           {dailyWords.length > 0 && <Progress value={progressPercentage} className="mt-2 h-2" />}
        </section>

        {/* Introduction Stage */}
        {practiceStage === 'introduction' && currentWord && (
          <Card className="shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl">
                <span>New Word: <span className="text-primary">{currentWord.word}</span></span>
                <span className="text-sm font-normal text-muted-foreground">({currentWord.wordType})</span>
              </CardTitle>
              <CardDescription>Word {currentWordIndex + 1} of {dailyWords.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {currentWord.imageUrl && (
                  <Image
                    src={currentWord.imageUrl}
                    alt={`Image for ${currentWord.word}`}
                    width={200}
                    height={150}
                    className="rounded-lg object-cover border shadow-md"
                    data-ai-hint={currentWord.dataAiHint || `${currentWord.wordType} visual`}
                  />
                )}
                <div className="flex-1 space-y-3">
                  <p className="text-xl"><strong>Translation:</strong> {currentWord.translation}</p>
                  {currentWord.exampleSentence && (
                    <p className="text-lg italic text-muted-foreground">"{currentWord.exampleSentence}"</p>
                  )}
                   <Button onClick={() => playAudio(currentWord.audioUrl)} variant="outline" size="sm">
                    <Volume2 className="mr-2 h-5 w-5" /> Listen
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleNextWord} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {currentWordIndex < dailyWords.length - 1 ? "Next Word" : "Got It! Move to Practice"} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Recognition Practice Stage (Placeholder) */}
        {practiceStage === 'recognition' && (
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><CheckSquare className="h-6 w-6 text-primary"/>Recognition Practice</CardTitle>
              <CardDescription>Test your memory of today's words.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-center">
              <p className="text-muted-foreground">(Interactive matching exercises will appear here)</p>
              <p>E.g., Match "{dailyWords[0]?.word}" to its image, or listen and pick the correct word.</p>
              <div className="flex justify-center gap-4 mt-4">
                <Button variant="outline">Simulate Correct</Button>
                <Button variant="outline">Simulate Incorrect</Button>
              </div>
               <Button onClick={() => setPracticeStage('story')} className="mt-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                Continue to Mini-Story <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Mini-Story Context Stage (Placeholder) */}
        {practiceStage === 'story' && (
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary"/>Mini-Story Context</CardTitle>
              <CardDescription>See today's words in a short story.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed p-4 bg-secondary/30 rounded-md">
                (A short story using words like <strong>{dailyWords[0]?.word}</strong>, <strong>{dailyWords[1]?.word}</strong>, and <strong>{dailyWords[2]?.word}</strong> will appear here. It will incorporate previously learned vocabulary too!)
              </p>
              <p className="text-sm text-center text-muted-foreground">Read the story and try to understand the new words in context.</p>
              <Button onClick={() => setPracticeStage('chat')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                Practice with AI Tutor <MessageSquare className="ml-2 h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        )}
        
        {/* Link to AI Chat Stage */}
        {practiceStage === 'chat' && (
           <Card className="shadow-lg bg-card border-accent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-accent"><Zap className="h-6 w-6"/>AI Conversation Time!</CardTitle>
              <CardDescription>Ready to use your new words in a conversation?</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
                <p className="mb-6 text-muted-foreground">You've learned new words and seen them in context. Now, let's practice speaking with our AI tutor.</p>
                <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Link href={{ pathname: "/cle-chat", query: { words: dailyWords.map(w=>w.word).join(',') } }}>
                        Start AI Chat <MessageSquare className="ml-2 h-5 w-5" />
                    </Link>
                </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}

    