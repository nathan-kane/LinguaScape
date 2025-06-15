
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, ListChecks, HelpCircle, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react"; 
import { useLearning } from '@/context/LearningContext';
import type { DailyWordItem } from '@/lib/types'; // Reusing this type for simplicity

// Placeholder for flashcard component
const FlashcardPlaceholder = ({ front, back, example, showBack }: { front: string, back: string, example?: string, showBack: boolean }) => (
  <div className="relative w-[600px] h-[300px] rounded-xl shadow-xl perspective group cursor-pointer">
    <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${showBack ? 'rotate-y-180' : ''}`}>
      {/* Front of card */}
      <div className="absolute w-full h-full backface-hidden bg-card border border-border rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-3xl font-bold text-foreground">{front}</h3>
        <p className="text-sm text-muted-foreground mt-4">Click to reveal</p>
      </div>
      {/* Back of card */}
      <div className="absolute w-full h-full backface-hidden bg-accent text-accent-foreground border border-accent rounded-xl flex flex-col items-center justify-center p-6 text-center rotate-y-180">
        <h3 className="text-2xl font-semibold">{back}</h3>
        {example && <p className="text-sm mt-2 italic">Example: "{example}"</p>}
      </div>
    </div>
  </div>
);

// Function to get placeholder words (similar to daily-session, but could be a larger set for vocab)
const getVocabularySessionWords = (languageCode: string, modeId: string): DailyWordItem[] => {
  // This would typically fetch from a user's word list or a larger bank
  // For now, using a simplified version of getPlaceholderDailyWords
  const commonProps = { imageUrl: "https://placehold.co/200x150.png", audioUrl: "#" };
  
  if (languageCode === 'es') {
    return [
      { wordBankId: "es_v1", word: "Amigo/Amiga", translation: "Friend", ...commonProps, exampleSentence: "Ella es mi amiga.", wordType: "noun", dataAiHint: "friends talking" },
      { wordBankId: "es_v2", word: "Feliz", translation: "Happy", ...commonProps, exampleSentence: "Estoy feliz hoy.", wordType: "adjective", dataAiHint: "smiling face" },
      { wordBankId: "es_v3", word: "Trabajar", translation: "To work", ...commonProps, exampleSentence: "Necesito trabajar mañana.", wordType: "verb", dataAiHint: "person working" },
      { wordBankId: "es_v4", word: "Libro", translation: "Book", ...commonProps, exampleSentence: "Leo un libro.", wordType: "noun", dataAiHint: "open book" },
      { wordBankId: "es_v5", word: "Ciudad", translation: "City", ...commonProps, exampleSentence: "Me gusta esta ciudad.", wordType: "noun", dataAiHint: "city skyline" },
    ];
  } else if (languageCode === 'fr') {
    return [
      { wordBankId: "fr_v1", word: "Ami/Amie", translation: "Friend", ...commonProps, exampleSentence: "Il est mon ami.", wordType: "noun", dataAiHint: "friends together" },
      { wordBankId: "fr_v2", word: "Content/Contente", translation: "Happy", ...commonProps, exampleSentence: "Je suis content.", wordType: "adjective", dataAiHint: "joyful expression" },
      { wordBankId: "fr_v3", word: "Travailler", translation: "To work", ...commonProps, exampleSentence: "Je dois travailler.", wordType: "verb", dataAiHint: "desk work" },
      { wordBankId: "fr_v4", word: "Livre", translation: "Book", ...commonProps, exampleSentence: "C'est un bon livre.", wordType: "noun", dataAiHint: "stack books" },
      { wordBankId: "fr_v5", word: "Ville", translation: "City", ...commonProps, exampleSentence: "Paris est une grande ville.", wordType: "noun", dataAiHint: "paris city" },
    ];
  } else if (languageCode === 'ua') {
     return [
      { wordBankId: "ua_v1", word: "Друг/Подруга", translation: "Friend", ...commonProps, exampleSentence: "Він мій найкращий друг.", wordType: "noun", dataAiHint: "best friends" },
      { wordBankId: "ua_v2", word: "Щасливий/Щаслива", translation: "Happy", ...commonProps, exampleSentence: "Я дуже щаслива.", wordType: "adjective", dataAiHint: "person happy" },
      { wordBankId: "ua_v3", word: "Працювати", translation: "To work", ...commonProps, exampleSentence: "Мені подобається працювати тут.", wordType: "verb", dataAiHint: "office work" },
      { wordBankId: "ua_v4", word: "Книга", translation: "Book", ...commonProps, exampleSentence: "Ця книга дуже цікава.", wordType: "noun", dataAiHint: "interesting book" },
      { wordBankId: "ua_v5", word: "Місто", translation: "City", ...commonProps, exampleSentence: "Київ - велике місто.", wordType: "noun", dataAiHint: "kyiv city" },
    ];
  }
  // Default (English or generic)
  return [
    { wordBankId: "en_v1", word: "Example", translation: "Ejemplo (Spanish)", ...commonProps, exampleSentence: "This is an example.", wordType: "noun", dataAiHint: "example sign" },
    { wordBankId: "en_v2", word: "Learn", translation: "Aprender (Spanish)", ...commonProps, exampleSentence: "I want to learn.", wordType: "verb", dataAiHint: "student learning" },
    { wordBankId: "en_v3", word: "Quick", translation: "Rápido (Spanish)", ...commonProps, exampleSentence: "Be quick!", wordType: "adjective", dataAiHint: "running fast" },
    { wordBankId: "en_v4", word: "Vocabulary", translation: "Vocabulario (Spanish)", ...commonProps, exampleSentence: "Expand your vocabulary.", wordType: "noun", dataAiHint: "dictionary words" },
    { wordBankId: "en_v5", word: "Practice", translation: "Práctica (Spanish)", ...commonProps, exampleSentence: "Practice makes perfect.", wordType: "verb", dataAiHint: "person practicing" },
  ];
};


export default function VocabularyPage() {
  const [showBack, setShowBack] = useState(false);
  const { selectedLanguage, selectedMode, isLoadingPreferences } = useLearning();
  
  const [sessionWords, setSessionWords] = useState<DailyWordItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  useEffect(() => {
    if (!isLoadingPreferences) {
      setIsLoadingSession(true);
      // Simulate fetching/preparing words
      setTimeout(() => {
        const words = getVocabularySessionWords(selectedLanguage.code, selectedMode.id);
        setSessionWords(words);
        setCurrentCardIndex(0);
        setShowBack(false);
        setIsLoadingSession(false);
      }, 300); // Short delay to simulate loading
    }
  }, [selectedLanguage, selectedMode, isLoadingPreferences]);

  const handleCardClick = () => {
    setShowBack(!showBack);
  };

  const handleNextCard = useCallback((srsRating?: string) => {
    // In a real SRS, srsRating would update word stats. For now, just move to next.
    if (sessionWords.length > 0) {
      setCurrentCardIndex((prevIndex) => (prevIndex + 1) % sessionWords.length);
      setShowBack(false);
    }
  }, [sessionWords.length]);

  const currentWord = sessionWords[currentCardIndex];

  const stats = [
    { label: "Words to Review", value: sessionWords.length, icon: <ListChecks className="text-primary" /> },
    { label: "New Words Today", value: 5, icon: <PlusCircle className="text-primary" /> }, // Placeholder
    { label: "Words Mastered", value: 150, icon: <Zap className="text-primary" /> }, // Placeholder
  ];

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
              Strengthen your vocabulary in {selectedLanguage.name} ({selectedMode.name} mode) with our Spaced Repetition System.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Words (Future)
          </Button>
        </section>

        {/* Main Flashcard Review Area */}
        <section className="flex flex-col items-center gap-8 py-8">
          {sessionWords.length > 0 && currentWord ? (
            <>
              <div onClick={handleCardClick}> 
                <FlashcardPlaceholder 
                  front={currentWord.word} 
                  back={currentWord.translation} 
                  example={currentWord.exampleSentence}
                  showBack={showBack} 
                />
              </div>
              {showBack && (
                <div className="text-center mt-4">
                  <p className="text-md font-semibold text-muted-foreground">How well did you remember this?</p>
                  <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mt-2">
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 w-24 sm:w-28" onClick={() => handleNextCard('again')}>Again</Button>
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10 w-24 sm:w-28" onClick={() => handleNextCard('hard')}>Hard</Button>
                    <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-500/10 w-24 sm:w-28" onClick={() => handleNextCard('good')}>Good</Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-24 sm:w-28" onClick={() => handleNextCard('easy')}>Easy</Button>
                  </div>
                </div>
              )}
               <Button variant="link" onClick={() => handleNextCard()} className="mt-2 text-primary">
                  Skip to Next Card <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              <p className="text-sm text-muted-foreground">
                Card {currentCardIndex + 1} of {sessionWords.length}.
                {!showBack && " Click card to reveal."}
                {showBack && " Select how well you knew it or skip."}
              </p>
            </>
          ) : (
            <Card className="p-8 text-center bg-card">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No words loaded</CardTitle>
              <CardDescription>There are no vocabulary words for the current selection, or the session is still loading.</CardDescription>
              <Button onClick={() => {
                  setIsLoadingSession(true);
                   setTimeout(() => {
                    const words = getVocabularySessionWords(selectedLanguage.code, selectedMode.id);
                    setSessionWords(words);
                    setCurrentCardIndex(0);
                    setShowBack(false);
                    setIsLoadingSession(false);
                  }, 300);
              }} className="mt-4">Try Reloading Words</Button>
            </Card>
          )}
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => (
            <Card key={stat.label} className="shadow-lg bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.label === "Words to Review" ? sessionWords.length : stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Additional Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg font-headline">Browse Vocabulary</CardTitle>
                </div>
              <CardDescription>Explore all words, filter by status, or search specific terms.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/vocabulary/browse">Go to Word List (Future)</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
             <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg font-headline">How SRS Works</CardTitle>
                </div>
              <CardDescription>Learn about the science behind spaced repetition for effective learning.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/help/srs">Learn More (Future)</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

      </div>
      <style jsx global>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </AuthenticatedLayout>
  );
}

