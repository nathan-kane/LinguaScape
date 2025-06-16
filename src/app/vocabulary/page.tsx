
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, ListChecks, HelpCircle, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // Keep if DailyWordItem has imageUrl
import { useState, useEffect, useCallback } from "react"; 
import { useLearning } from '@/context/LearningContext';
import type { DailyWordItem } from '@/lib/types';

// Placeholder for flashcard component
const FlashcardPlaceholder = ({ front, back, example, showBack }: { front: string, back: string, example?: string, showBack: boolean }) => (
  <div className="relative w-full max-w-xl h-[250px] sm:h-[300px] rounded-xl shadow-xl perspective group cursor-pointer">
    <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${showBack ? 'rotate-y-180' : ''}`}>
      {/* Front of card */}
      <div className="absolute w-full h-full backface-hidden bg-card border border-border rounded-xl flex flex-col items-center justify-center p-6 text-center">
        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{front}</h3>
        <p className="text-sm text-muted-foreground mt-4">Click to reveal translation</p>
      </div>
      {/* Back of card */}
      <div className="absolute w-full h-full backface-hidden bg-accent text-accent-foreground border border-accent rounded-xl flex flex-col items-center justify-center p-6 text-center rotate-y-180">
        <h3 className="text-xl sm:text-2xl font-semibold">{back}</h3>
        {example && <p className="text-xs sm:text-sm mt-2 italic">Example: "{example}"</p>}
      </div>
    </div>
  </div>
);

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

const getVocabularySessionWords = (languageCode: string, modeId: string): DailyWordItem[] => {
  const commonProps = { imageUrl: "https://placehold.co/200x150.png", audioUrl: "#" };
  let baseWords: DailyWordItem[] = [];

  if (languageCode === 'es') {
    baseWords = [
      { wordBankId: "es_v1", word: "Amigo/Amiga", translation: "Friend", ...commonProps, exampleSentence: "Ella es mi amiga.", wordType: "noun", dataAiHint: "friends talking" },
      { wordBankId: "es_v2", word: "Feliz", translation: "Happy", ...commonProps, exampleSentence: "Estoy feliz hoy.", wordType: "adjective", dataAiHint: "smiling face" },
      { wordBankId: "es_v3", word: "Trabajar", translation: "To work", ...commonProps, exampleSentence: "Necesito trabajar mañana.", wordType: "verb", dataAiHint: "person working" },
      { wordBankId: "es_v4", word: "Libro", translation: "Book", ...commonProps, exampleSentence: "Leo un libro.", wordType: "noun", dataAiHint: "open book" },
      { wordBankId: "es_v5", word: "Ciudad", translation: "City", ...commonProps, exampleSentence: "Me gusta esta ciudad.", wordType: "noun", dataAiHint: "city skyline" },
      { wordBankId: "es_v6", word: "Comida", translation: "Food", ...commonProps, exampleSentence: "La comida está deliciosa.", wordType: "noun", dataAiHint: "delicious food" },
      { wordBankId: "es_v7", word: "Viajar", translation: "To travel", ...commonProps, exampleSentence: "Me encanta viajar.", wordType: "verb", dataAiHint: "travel globe" },
      { wordBankId: "es_v8", word: "Agua", translation: "Water", ...commonProps, exampleSentence: "Quisiera un vaso de agua.", wordType: "noun", dataAiHint: "glass water" },
      { wordBankId: "es_v9", word: "Rojo", translation: "Red", ...commonProps, exampleSentence: "El coche es rojo.", wordType: "adjective", dataAiHint: "red color" },
      { wordBankId: "es_v10", word: "Gracias", translation: "Thank you", ...commonProps, exampleSentence: "Muchas gracias por su ayuda.", wordType: "phrase", dataAiHint: "thank you gesture" },
      { wordBankId: "es_v11", word: "Escuela", translation: "School", ...commonProps, exampleSentence: "Los niños van a la escuela.", wordType: "noun", dataAiHint: "school building" },
      { wordBankId: "es_v12", word: "Música", translation: "Music", ...commonProps, exampleSentence: "Escucho música todos los días.", wordType: "noun", dataAiHint: "music notes" },
    ];
  } else if (languageCode === 'fr') {
    baseWords = [
      { wordBankId: "fr_v1", word: "Ami/Amie", translation: "Friend", ...commonProps, exampleSentence: "Il est mon ami.", wordType: "noun", dataAiHint: "friends together" },
      { wordBankId: "fr_v2", word: "Content/Contente", translation: "Happy", ...commonProps, exampleSentence: "Je suis content.", wordType: "adjective", dataAiHint: "joyful expression" },
      { wordBankId: "fr_v3", word: "Travailler", translation: "To work", ...commonProps, exampleSentence: "Je dois travailler.", wordType: "verb", dataAiHint: "desk work" },
      { wordBankId: "fr_v4", word: "Livre", translation: "Book", ...commonProps, exampleSentence: "C'est un bon livre.", wordType: "noun", dataAiHint: "stack books" },
      { wordBankId: "fr_v5", word: "Ville", translation: "City", ...commonProps, exampleSentence: "Paris est une grande ville.", wordType: "noun", dataAiHint: "paris city" },
      { wordBankId: "fr_v6", word: "Nourriture", translation: "Food", ...commonProps, exampleSentence: "J'aime la nourriture française.", wordType: "noun", dataAiHint: "french food" },
      { wordBankId: "fr_v7", word: "Voyager", translation: "To travel", ...commonProps, exampleSentence: "Elle aime voyager.", wordType: "verb", dataAiHint: "suitcase travel" },
      { wordBankId: "fr_v8", word: "Eau", translation: "Water", ...commonProps, exampleSentence: "Un verre d'eau, s'il vous plaît.", wordType: "noun", dataAiHint: "bottle water" },
      { wordBankId: "fr_v9", word: "Rouge", translation: "Red", ...commonProps, exampleSentence: "La pomme est rouge.", wordType: "adjective", dataAiHint: "red apple" },
      { wordBankId: "fr_v10", word: "Merci", translation: "Thank you", ...commonProps, exampleSentence: "Merci beaucoup.", wordType: "phrase", dataAiHint: "merci card" },
      { wordBankId: "fr_v11", word: "École", translation: "School", ...commonProps, exampleSentence: "Les enfants sont à l'école.", wordType: "noun", dataAiHint: "school children" },
      { wordBankId: "fr_v12", word: "Musique", translation: "Music", ...commonProps, exampleSentence: "J'adore la musique classique.", wordType: "noun", dataAiHint: "classical music" },
    ];
  } else if (languageCode === 'ua') {
     baseWords = [
      { wordBankId: "ua_v1", word: "Друг/Подруга", translation: "Friend", ...commonProps, exampleSentence: "Він мій найкращий друг.", wordType: "noun", dataAiHint: "best friends" },
      { wordBankId: "ua_v2", word: "Щасливий/Щаслива", translation: "Happy", ...commonProps, exampleSentence: "Я дуже щаслива.", wordType: "adjective", dataAiHint: "person happy" },
      { wordBankId: "ua_v3", word: "Працювати", translation: "To work", ...commonProps, exampleSentence: "Мені подобається працювати тут.", wordType: "verb", dataAiHint: "office work" },
      { wordBankId: "ua_v4", word: "Книга", translation: "Book", ...commonProps, exampleSentence: "Ця книга дуже цікава.", wordType: "noun", dataAiHint: "interesting book" },
      { wordBankId: "ua_v5", word: "Місто", translation: "City", ...commonProps, exampleSentence: "Київ - велике місто.", wordType: "noun", dataAiHint: "kyiv city" },
      { wordBankId: "ua_v6", word: "Їжа", translation: "Food", ...commonProps, exampleSentence: "Українська їжа смачна.", wordType: "noun", dataAiHint: "ukrainian food" },
      { wordBankId: "ua_v7", word: "Подорожувати", translation: "To travel", ...commonProps, exampleSentence: "Ми любимо подорожувати.", wordType: "verb", dataAiHint: "map travel" },
      { wordBankId: "ua_v8", word: "Вода", translation: "Water", ...commonProps, exampleSentence: "Дайте мені води, будь ласка.", wordType: "noun", dataAiHint: "water drop" },
      { wordBankId: "ua_v9", word: "Червоний", translation: "Red", ...commonProps, exampleSentence: "Прапор червоний і чорний.", wordType: "adjective", dataAiHint: "red black" },
      { wordBankId: "ua_v10", word: "Дякую", translation: "Thank you", ...commonProps, exampleSentence: "Щиро дякую за допомогу.", wordType: "phrase", dataAiHint: "thank you hands" },
      { wordBankId: "ua_v11", word: "Школа", translation: "School", ...commonProps, exampleSentence: "Моя школа велика.", wordType: "noun", dataAiHint: "school facade" },
      { wordBankId: "ua_v12", word: "Музика", translation: "Music", ...commonProps, exampleSentence: "Яка твоя улюблена музика?", wordType: "noun", dataAiHint: "headphones music" },
    ];
  } else { // Default (English or generic)
    baseWords = [
      { wordBankId: "en_v1", word: "Example", translation: "Ejemplo (Spanish)", ...commonProps, exampleSentence: "This is an example.", wordType: "noun", dataAiHint: "example sign" },
      { wordBankId: "en_v2", word: "Learn", translation: "Aprender (Spanish)", ...commonProps, exampleSentence: "I want to learn.", wordType: "verb", dataAiHint: "student learning" },
      { wordBankId: "en_v3", word: "Quick", translation: "Rápido (Spanish)", ...commonProps, exampleSentence: "Be quick!", wordType: "adjective", dataAiHint: "running fast" },
      { wordBankId: "en_v4", word: "Vocabulary", translation: "Vocabulario (Spanish)", ...commonProps, exampleSentence: "Expand your vocabulary.", wordType: "noun", dataAiHint: "dictionary words" },
      { wordBankId: "en_v5", word: "Practice", translation: "Práctica (Spanish)", ...commonProps, exampleSentence: "Practice makes perfect.", wordType: "verb", dataAiHint: "person practicing" },
      { wordBankId: "en_v6", word: "Hello", translation: "Hola (Spanish)", ...commonProps, exampleSentence: "Hello, how are you?", wordType: "phrase", dataAiHint: "greeting wave" },
      { wordBankId: "en_v7", word: "Goodbye", translation: "Adiós (Spanish)", ...commonProps, exampleSentence: "It's time to say goodbye.", wordType: "phrase", dataAiHint: "waving goodbye" },
      { wordBankId: "en_v8", word: "House", translation: "Casa (Spanish)", ...commonProps, exampleSentence: "This is my house.", wordType: "noun", dataAiHint: "house illustration" },
      { wordBankId: "en_v9", word: "Cat", translation: "Gato (Spanish)", ...commonProps, exampleSentence: "The cat is sleeping.", wordType: "noun", dataAiHint: "sleeping cat" },
      { wordBankId: "en_v10", word: "Dog", translation: "Perro (Spanish)", ...commonProps, exampleSentence: "The dog is playful.", wordType: "noun", dataAiHint: "playful dog" },
      { wordBankId: "en_v11", word: "Blue", translation: "Azul (Spanish)", ...commonProps, exampleSentence: "The sky is blue.", wordType: "adjective", dataAiHint: "blue sky" },
      { wordBankId: "en_v12", word: "Big", translation: "Grande (Spanish)", ...commonProps, exampleSentence: "It's a big elephant.", wordType: "adjective", dataAiHint: "big elephant" },
    ];
  }
  // Apply mode adjustments if any (simplified for now)
  if (modeId === 'travel') {
    // Example: if a word is 'Agua' (Water) and mode is travel, change example
    return baseWords.map(word => {
        if (word.word === "Agua" && languageCode === 'es') return {...word, exampleSentence: "Necesito agua para el viaje.", dataAiHint: "travel water bottle"};
        if (word.word === "Eau" && languageCode === 'fr') return {...word, exampleSentence: "J'ai besoin d'eau pour le voyage.", dataAiHint: "travel water bottle"};
        if (word.word === "Вода" && languageCode === 'ua') return {...word, exampleSentence: "Мені потрібна вода для подорожі.", dataAiHint: "travel water bottle"};
        // Add more travel-specific adjustments for other words/languages
        return word;
    });
  }
  return baseWords;
};

const WORDS_PER_SESSION = 7;

export default function VocabularyPage() {
  const [showBack, setShowBack] = useState(false);
  const { selectedLanguage, selectedMode, isLoadingPreferences } = useLearning();
  
  const [sessionWords, setSessionWords] = useState<DailyWordItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const loadNewSessionWords = useCallback(() => {
    if (!isLoadingPreferences) {
      setIsLoadingSession(true);
      // Simulate fetching/preparing words
      setTimeout(() => {
        const allWordsForContext = getVocabularySessionWords(selectedLanguage.code, selectedMode.id);
        const shuffledWords = shuffleArray(allWordsForContext);
        setSessionWords(shuffledWords.slice(0, WORDS_PER_SESSION));
        setCurrentCardIndex(0);
        setShowBack(false);
        setIsLoadingSession(false);
      }, 300);
    }
  }, [selectedLanguage, selectedMode, isLoadingPreferences]);

  useEffect(() => {
    loadNewSessionWords();
  }, [loadNewSessionWords]);

  const handleCardClick = () => {
    if (sessionWords.length > 0) {
      setShowBack(!showBack);
    }
  };

  const handleNextCard = useCallback((srsRating?: string) => {
    // In a real SRS, srsRating would update word stats. For now, just move to next.
    if (sessionWords.length > 0) {
      const nextIndex = (currentCardIndex + 1);
      if (nextIndex >= sessionWords.length) {
        // Optionally, reload new set of words or indicate session end
        // For now, let's reload a new set:
        loadNewSessionWords(); 
      } else {
        setCurrentCardIndex(nextIndex);
      }
      setShowBack(false);
    }
  }, [sessionWords.length, currentCardIndex, loadNewSessionWords]);

  const currentWord = sessionWords[currentCardIndex];

  const stats = [
    { label: "Words in Session", value: sessionWords.length, icon: <ListChecks className="text-primary" /> },
    { label: "New Words Potential", value: 5, icon: <PlusCircle className="text-primary" /> }, // Placeholder
    { label: "Words Mastered (Overall)", value: 150, icon: <Zap className="text-primary" /> }, // Placeholder
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
              Strengthen your vocabulary in {selectedLanguage.name} ({selectedMode.name} mode).
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Words (Future)
          </Button>
        </section>

        <section className="flex flex-col items-center gap-6 py-8">
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
                  <p className="text-md font-semibold text-muted-foreground mb-2">How well did you remember this?</p>
                  <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                    <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('again')}>Again</Button>
                    <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10 w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('hard')}>Hard</Button>
                    <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-500/10 w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('good')}>Good</Button>
                    <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-20 sm:w-24 text-xs sm:text-sm" onClick={() => handleNextCard('easy')}>Easy</Button>
                  </div>
                </div>
              )}

              <Button variant="link" onClick={() => handleNextCard()} className="mt-2 text-primary text-sm">
                Skip to Next Card <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
              
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-4">
                Card {currentCardIndex + 1} of {sessionWords.length}.
                {!showBack && " Click the card to reveal the translation."}
                {showBack && " Select how well you knew it, or skip."}
              </p>
            </>
          ) : (
            <Card className="p-8 text-center bg-card w-full max-w-md">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Words Loaded</CardTitle>
              <CardDescription className="my-2">
                Could not load vocabulary for {selectedLanguage.name} ({selectedMode.name} mode).
              </CardDescription>
              <Button onClick={loadNewSessionWords} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Reloading Words
              </Button>
            </Card>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => (
            <Card key={stat.label} className="shadow-lg bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.label === "Words in Session" && sessionWords.length > 0 ? sessionWords.length : (stat.label === "Words in Session" ? WORDS_PER_SESSION : stat.value) }</div>
                 <p className="text-xs text-muted-foreground">
                  {stat.label === "Words in Session" && sessionWords.length > 0 ? `Currently reviewing ${currentCardIndex + 1} / ${sessionWords.length}` : " "}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

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
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
      `}</style>
    </AuthenticatedLayout>
  );
}
