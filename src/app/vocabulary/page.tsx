
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, ListChecks, HelpCircle, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; 
import { useState, useEffect, useCallback } from "react"; 
import { useLearning } from '@/context/LearningContext';
import type { DailyWordItem } from '@/lib/types';

// Placeholder for flashcard component
const FlashcardPlaceholder = ({ front, back, example, showBack }: { front: string, back: string, example?: string, showBack: boolean }) => (
  <div className="relative w-full max-w-3xl h-[250px] sm:h-[300px] rounded-xl shadow-xl perspective group cursor-pointer">
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
      { wordBankId: "es_v4", word: "Libro", translation: "Book", ...commonProps, exampleSentence: "Leo un libro interesante.", wordType: "noun", dataAiHint: "open book" },
      { wordBankId: "es_v5", word: "Ciudad", translation: "City", ...commonProps, exampleSentence: "Me gusta esta ciudad grande y hermosa.", wordType: "noun", dataAiHint: "city skyline" },
      { wordBankId: "es_v6", word: "Comida", translation: "Food", ...commonProps, exampleSentence: "La comida está deliciosa.", wordType: "noun", dataAiHint: "delicious food" },
      { wordBankId: "es_v7", word: "Viajar", translation: "To travel", ...commonProps, exampleSentence: "Me encanta viajar por el mundo.", wordType: "verb", dataAiHint: "travel globe" },
      { wordBankId: "es_v8", word: "Agua", translation: "Water", ...commonProps, exampleSentence: "Quisiera un vaso de agua fresca.", wordType: "noun", dataAiHint: "glass water" },
      { wordBankId: "es_v9", word: "Rojo", translation: "Red", ...commonProps, exampleSentence: "El coche es de un color rojo brillante.", wordType: "adjective", dataAiHint: "red color" },
      { wordBankId: "es_v10", word: "Gracias", translation: "Thank you", ...commonProps, exampleSentence: "Muchas gracias por su amable ayuda.", wordType: "phrase", dataAiHint: "thank you gesture" },
      { wordBankId: "es_v11", word: "Escuela", translation: "School", ...commonProps, exampleSentence: "Los niños van a la escuela primaria.", wordType: "noun", dataAiHint: "school building" },
      { wordBankId: "es_v12", word: "Música", translation: "Music", ...commonProps, exampleSentence: "Escucho música clásica todos los días.", wordType: "noun", dataAiHint: "music notes" },
      { wordBankId: "es_v13", word: "Casa", translation: "House", ...commonProps, exampleSentence: "Mi casa tiene un jardín bonito.", wordType: "noun", dataAiHint: "house garden" },
      { wordBankId: "es_v14", word: "Perro", translation: "Dog", ...commonProps, exampleSentence: "El perro ladra al cartero.", wordType: "noun", dataAiHint: "dog barking" },
      { wordBankId: "es_v15", word: "Gato", translation: "Cat", ...commonProps, exampleSentence: "El gato duerme en el sofá.", wordType: "noun", dataAiHint: "cat sleeping" },
    ];
  } else if (languageCode === 'fr') {
    baseWords = [
      { wordBankId: "fr_v1", word: "Ami/Amie", translation: "Friend", ...commonProps, exampleSentence: "Il est mon meilleur ami.", wordType: "noun", dataAiHint: "friends together" },
      { wordBankId: "fr_v2", word: "Content/Contente", translation: "Happy", ...commonProps, exampleSentence: "Je suis très content de te voir.", wordType: "adjective", dataAiHint: "joyful expression" },
      { wordBankId: "fr_v3", word: "Travailler", translation: "To work", ...commonProps, exampleSentence: "Je dois travailler dur pour réussir.", wordType: "verb", dataAiHint: "desk work" },
      { wordBankId: "fr_v4", word: "Livre", translation: "Book", ...commonProps, exampleSentence: "C'est un livre passionnant à lire.", wordType: "noun", dataAiHint: "stack books" },
      { wordBankId: "fr_v5", word: "Ville", translation: "City", ...commonProps, exampleSentence: "Paris est une ville magnifique.", wordType: "noun", dataAiHint: "paris city" },
      { wordBankId: "fr_v6", word: "Nourriture", translation: "Food", ...commonProps, exampleSentence: "J'aime la nourriture française authentique.", wordType: "noun", dataAiHint: "french food" },
      { wordBankId: "fr_v7", word: "Voyager", translation: "To travel", ...commonProps, exampleSentence: "Elle aime voyager et découvrir le monde.", wordType: "verb", dataAiHint: "suitcase travel" },
      { wordBankId: "fr_v8", word: "Eau", translation: "Water", ...commonProps, exampleSentence: "Un verre d'eau fraîche, s'il vous plaît.", wordType: "noun", dataAiHint: "bottle water" },
      { wordBankId: "fr_v9", word: "Rouge", translation: "Red", ...commonProps, exampleSentence: "La pomme est d'un beau rouge vif.", wordType: "adjective", dataAiHint: "red apple" },
      { wordBankId: "fr_v10", word: "Merci", translation: "Thank you", ...commonProps, exampleSentence: "Merci beaucoup pour votre gentillesse.", wordType: "phrase", dataAiHint: "merci card" },
      { wordBankId: "fr_v11", word: "École", translation: "School", ...commonProps, exampleSentence: "Les enfants sont à l'école maternelle.", wordType: "noun", dataAiHint: "school children" },
      { wordBankId: "fr_v12", word: "Musique", translation: "Music", ...commonProps, exampleSentence: "J'adore la musique classique et le jazz.", wordType: "noun", dataAiHint: "classical music" },
      { wordBankId: "fr_v13", word: "Maison", translation: "House", ...commonProps, exampleSentence: "J'habite dans une petite maison.", wordType: "noun", dataAiHint: "small house" },
      { wordBankId: "fr_v14", word: "Chien", translation: "Dog", ...commonProps, exampleSentence: "Mon chien aime jouer dans le parc.", wordType: "noun", dataAiHint: "dog park" },
      { wordBankId: "fr_v15", word: "Chat", translation: "Cat", ...commonProps, exampleSentence: "Le chat noir traverse la rue.", wordType: "noun", dataAiHint: "black cat" },
    ];
  } else if (languageCode === 'ua') {
     baseWords = [
      { wordBankId: "ua_v1", word: "Друг/Подруга", translation: "Friend", ...commonProps, exampleSentence: "Він мій найкращий і найнадійніший друг.", wordType: "noun", dataAiHint: "best friends" },
      { wordBankId: "ua_v2", word: "Щасливий/Щаслива", translation: "Happy", ...commonProps, exampleSentence: "Я дуже щаслива сьогодні ввечері.", wordType: "adjective", dataAiHint: "person happy" },
      { wordBankId: "ua_v3", word: "Працювати", translation: "To work", ...commonProps, exampleSentence: "Мені подобається працювати в команді.", wordType: "verb", dataAiHint: "office work" },
      { wordBankId: "ua_v4", word: "Книга", translation: "Book", ...commonProps, exampleSentence: "Ця книга дуже цікава та інформативна.", wordType: "noun", dataAiHint: "interesting book" },
      { wordBankId: "ua_v5", word: "Місто", translation: "City", ...commonProps, exampleSentence: "Київ - велике і старовинне місто.", wordType: "noun", dataAiHint: "kyiv city" },
      { wordBankId: "ua_v6", word: "Їжа", translation: "Food", ...commonProps, exampleSentence: "Українська їжа дуже смачна і ситна.", wordType: "noun", dataAiHint: "ukrainian food" },
      { wordBankId: "ua_v7", word: "Подорожувати", translation: "To travel", ...commonProps, exampleSentence: "Ми любимо подорожувати всією родиною.", wordType: "verb", dataAiHint: "map travel" },
      { wordBankId: "ua_v8", word: "Вода", translation: "Water", ...commonProps, exampleSentence: "Дайте мені пляшку чистої води, будь ласка.", wordType: "noun", dataAiHint: "water drop" },
      { wordBankId: "ua_v9", word: "Червоний", translation: "Red", ...commonProps, exampleSentence: "Прапор України червоний і чорний.", wordType: "adjective", dataAiHint: "red black" },
      { wordBankId: "ua_v10", word: "Дякую", translation: "Thank you", ...commonProps, exampleSentence: "Щиро дякую за вашу допомогу.", wordType: "phrase", dataAiHint: "thank you hands" },
      { wordBankId: "ua_v11", word: "Школа", translation: "School", ...commonProps, exampleSentence: "Моя школа велика і сучасна.", wordType: "noun", dataAiHint: "school facade" },
      { wordBankId: "ua_v12", word: "Музика", translation: "Music", ...commonProps, exampleSentence: "Яка твоя улюблена українська музика?", wordType: "noun", dataAiHint: "headphones music" },
      { wordBankId: "ua_v13", word: "Дім", translation: "House/Home", ...commonProps, exampleSentence: "Мій дім - моя фортеця.", wordType: "noun", dataAiHint: "cozy home" },
      { wordBankId: "ua_v14", word: "Собака", translation: "Dog", ...commonProps, exampleSentence: "Собака - вірний друг людини.", wordType: "noun", dataAiHint: "loyal dog" },
      { wordBankId: "ua_v15", word: "Кіт", translation: "Cat", ...commonProps, exampleSentence: "Мій кіт любить спати на сонці.", wordType: "noun", dataAiHint: "cat sunbathing" },
    ];
  } else { // Default (English or generic)
    baseWords = [
      { wordBankId: "en_v1", word: "Example", translation: "Ejemplo (Spanish)", ...commonProps, exampleSentence: "This is a very good example for everyone.", wordType: "noun", dataAiHint: "example sign" },
      { wordBankId: "en_v2", word: "Learn", translation: "Aprender (Spanish)", ...commonProps, exampleSentence: "I want to learn many new things.", wordType: "verb", dataAiHint: "student learning" },
      { wordBankId: "en_v3", word: "Quick", translation: "Rápido (Spanish)", ...commonProps, exampleSentence: "Be quick and efficient!", wordType: "adjective", dataAiHint: "running fast" },
      { wordBankId: "en_v4", word: "Vocabulary", translation: "Vocabulario (Spanish)", ...commonProps, exampleSentence: "Expand your vocabulary daily.", wordType: "noun", dataAiHint: "dictionary words" },
      { wordBankId: "en_v5", word: "Practice", translation: "Práctica (Spanish)", ...commonProps, exampleSentence: "Consistent practice makes perfect.", wordType: "verb", dataAiHint: "person practicing" },
      { wordBankId: "en_v6", word: "Hello", translation: "Hola (Spanish)", ...commonProps, exampleSentence: "Hello, how are you doing today?", wordType: "phrase", dataAiHint: "greeting wave" },
      { wordBankId: "en_v7", word: "Goodbye", translation: "Adiós (Spanish)", ...commonProps, exampleSentence: "It's time to say goodbye to them.", wordType: "phrase", dataAiHint: "waving goodbye" },
      { wordBankId: "en_v8", word: "House", translation: "Casa (Spanish)", ...commonProps, exampleSentence: "This is my beautiful house.", wordType: "noun", dataAiHint: "house illustration" },
      { wordBankId: "en_v9", word: "Cat", translation: "Gato (Spanish)", ...commonProps, exampleSentence: "The fluffy cat is sleeping soundly.", wordType: "noun", dataAiHint: "sleeping cat" },
      { wordBankId: "en_v10", word: "Dog", translation: "Perro (Spanish)", ...commonProps, exampleSentence: "The playful dog wags its tail.", wordType: "noun", dataAiHint: "playful dog" },
      { wordBankId: "en_v11", word: "Blue", translation: "Azul (Spanish)", ...commonProps, exampleSentence: "The deep blue sky is clear.", wordType: "adjective", dataAiHint: "blue sky" },
      { wordBankId: "en_v12", word: "Big", translation: "Grande (Spanish)", ...commonProps, exampleSentence: "It's a very big and gray elephant.", wordType: "adjective", dataAiHint: "big elephant" },
      { wordBankId: "en_v13", word: "Small", translation: "Pequeño (Spanish)", ...commonProps, exampleSentence: "This is a small but cozy room.", wordType: "adjective", dataAiHint: "small room" },
      { wordBankId: "en_v14", word: "Computer", translation: "Computadora (Spanish)", ...commonProps, exampleSentence: "My computer is very fast.", wordType: "noun", dataAiHint: "modern computer" },
      { wordBankId: "en_v15", word: "Coffee", translation: "Café (Spanish)", ...commonProps, exampleSentence: "I need a hot coffee in the morning.", wordType: "noun", dataAiHint: "coffee cup" },
    ];
  }
  
  if (modeId === 'travel') {
    return baseWords.map(word => {
        if (word.word === "Agua" && languageCode === 'es') return {...word, exampleSentence: "Necesito agua para el viaje largo.", dataAiHint: "travel water bottle"};
        if (word.word === "Eau" && languageCode === 'fr') return {...word, exampleSentence: "J'ai besoin d'eau pour le voyage en train.", dataAiHint: "travel water bottle"};
        if (word.word === "Вода" && languageCode === 'ua') return {...word, exampleSentence: "Мені потрібна вода для подорожі літаком.", dataAiHint: "travel water bottle"};
        if (word.word === "Viajar" && languageCode === 'es') return {...word, exampleSentence: "Quiero viajar a España este verano.", dataAiHint: "spain travel"};
        if (word.word === "Voyager" && languageCode === 'fr') return {...word, exampleSentence: "Nous allons voyager en France bientôt.", dataAiHint: "france travel"};
        if (word.word === "Подорожувати" && languageCode === 'ua') return {...word, exampleSentence: "Я мрію подорожувати по Карпатах.", dataAiHint: "carpathians travel"};
        // Example of adding a new word specifically for travel mode, if it wasn't in baseWords
        // if (languageCode === 'es' && !baseWords.find(bw => bw.word === "Hotel")) { 
        //    return [...baseWords, { wordBankId: "es_v_hotel_travel", word: "Hotel", translation: "Hotel", ...commonProps, exampleSentence: "Necesitamos reservar un hotel cerca del aeropuerto.", wordType: "noun", dataAiHint: "airport hotel" }];
        // }
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
  const [totalWordsInCurrentPool, setTotalWordsInCurrentPool] = useState(0);

  const loadNewSessionWords = useCallback(() => {
    if (!isLoadingPreferences && selectedLanguage && selectedMode) {
      setIsLoadingSession(true);
      setTimeout(() => { // Simulate async fetch for a better UX
        const allWordsForContext = getVocabularySessionWords(selectedLanguage.code, selectedMode.id);
        setTotalWordsInCurrentPool(allWordsForContext.length);
        const shuffledWords = shuffleArray(allWordsForContext);
        setSessionWords(shuffledWords.slice(0, WORDS_PER_SESSION));
        setCurrentCardIndex(0);
        setShowBack(false);
        setIsLoadingSession(false);
      }, 300); // Short delay
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
    if (sessionWords.length > 0) {
      const nextIndex = (currentCardIndex + 1);
      if (nextIndex >= sessionWords.length) {
        // Reached end of current X-word session, load a new set
        loadNewSessionWords(); 
      } else {
        setCurrentCardIndex(nextIndex);
      }
      setShowBack(false);
      // In a full SRS, srsRating would be used to update word progress and scheduling
      if (srsRating) {
        console.log(`Card rated as: ${srsRating}. Next review would be adjusted.`);
      } else {
        console.log('Card skipped.');
      }
    }
  }, [sessionWords.length, currentCardIndex, loadNewSessionWords]);

  const currentWord = sessionWords[currentCardIndex];

  const stats = [
    { label: "Words in Session", icon: <ListChecks className="text-primary" /> },
    { label: "New Words Potential", icon: <PlusCircle className="text-primary" /> }, 
    { label: "Words Mastered (Overall)", value: 150, icon: <Zap className="text-primary" /> }, // Placeholder value
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
              
              <p className="text-xs sm:text-sm text-muted-foreground text-center px-4 max-w-md">
                Card {currentCardIndex + 1} of {sessionWords.length}.
                {!showBack && " Click the card to reveal the translation."}
                {showBack && " Select how well you knew it, or click 'Skip to Next Card'."}
              </p>
            </>
          ) : (
            <Card className="p-8 text-center bg-card w-full max-w-md">
              <RefreshCw className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <CardTitle>No Words Loaded</CardTitle>
              <CardDescription className="my-2">
                Could not load vocabulary for {selectedLanguage.name} ({selectedMode.name} mode). This might be temporary.
              </CardDescription>
              <Button onClick={loadNewSessionWords} className="mt-4">
                <RefreshCw className="mr-2 h-4 w-4" /> Try Reloading Words
              </Button>
            </Card>
          )}
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => {
            let displayValue: string | number = stat.value || 0;
            if (stat.label === "Words in Session") {
              displayValue = sessionWords.length;
            } else if (stat.label === "New Words Potential") {
              displayValue = Math.max(0, totalWordsInCurrentPool - sessionWords.length);
            }

            return (
              <Card key={stat.label} className="shadow-lg bg-card">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                  {stat.icon}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{displayValue}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.label === "Words in Session" && sessionWords.length > 0 ? `Currently reviewing ${currentCardIndex + 1} / ${sessionWords.length}` : 
                     stat.label === "New Words Potential" ? "From current learning pool" :
                     stat.label === "Words Mastered (Overall)" ? "Across all languages (est.)" : " "}
                  </p>
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

