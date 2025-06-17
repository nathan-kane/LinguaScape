
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, ListChecks, HelpCircle, ChevronRight, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useState, useEffect, useCallback } from "react"; 
import { useLearning } from "@/context/LearningContext";
import type { DailyWordItem } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  generateVocabulary,
  type GenerateVocabularyInput,
  type GenerateVocabularyResult,
} from '@/ai/flows/generate-vocabulary-flow';
import { useToast } from "@/hooks/use-toast";


const FlashcardPlaceholder = ({ front, back, example, showBack }: { front: string, back: string, example?: string, showBack: boolean }) => (
  <div className="relative w-full max-w-6xl mx-auto h-[250px] sm:h-[300px] rounded-xl shadow-xl perspective group cursor-pointer">
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

// Fallback placeholder data generator
const getVocabularySessionWordsFallback = (languageCode: string, modeId: string, nativeLanguageName: string): DailyWordItem[] => {
  const commonProps = { imageUrl: "https://placehold.co/200x150.png", audioUrl: "#" };
  let baseWords: Omit<DailyWordItem, 'translation'> & { translations: Record<string, string>, _simulatedMastery?: boolean }[] = [];
  
  // Using English as the key for translations for simplicity in placeholder
  if (languageCode === 'es') {
    baseWords = [
      { wordBankId: "es_v1", word: "Amigo/Amiga", translations: { en: "Friend"}, exampleSentence: "Ella es mi amiga.", wordType: "noun", dataAiHint: "friends talking", ...commonProps, _simulatedMastery: true },
      { wordBankId: "es_v2", word: "Feliz", translations: { en: "Happy"}, exampleSentence: "Estoy feliz hoy.", wordType: "adjective", dataAiHint: "smiling face", ...commonProps, _simulatedMastery: true },
      { wordBankId: "es_v3", word: "Trabajar", translations: { en: "To work"}, exampleSentence: "Necesito trabajar mañana.", wordType: "verb", dataAiHint: "person working", ...commonProps, _simulatedMastery: true },
      { wordBankId: "es_v4", word: "Libro", translations: { en: "Book" }, exampleSentence: "Leo un libro interesante.", wordType: "noun", dataAiHint: "open book", ...commonProps },
      { wordBankId: "es_v5", word: "Ciudad", translations: { en: "City" }, exampleSentence: "Me gusta esta ciudad grande y hermosa.", wordType: "noun", dataAiHint: "city skyline", ...commonProps },
      { wordBankId: "es_v6", word: "Comida", translations: { en: "Food" }, exampleSentence: "La comida está deliciosa.", wordType: "noun", dataAiHint: "delicious food", ...commonProps },
      { wordBankId: "es_v7", word: "Viajar", translations: { en: "To travel" }, exampleSentence: "Me encanta viajar por el mundo.", wordType: "verb", dataAiHint: "travel globe", ...commonProps },
      { wordBankId: "es_v8", word: "Agua", translations: { en: "Water" }, exampleSentence: "Quisiera un vaso de agua fresca.", wordType: "noun", dataAiHint: "glass water", ...commonProps },
      { wordBankId: "es_v9", word: "Rojo", translations: { en: "Red" }, exampleSentence: "El coche es de un color rojo brillante.", wordType: "adjective", dataAiHint: "red color", ...commonProps },
      { wordBankId: "es_v10", word: "Gracias", translations: { en: "Thank you" }, exampleSentence: "Muchas gracias por su amable ayuda.", wordType: "phrase", dataAiHint: "thank you gesture", ...commonProps },
      { wordBankId: "es_v11", word: "Escuela", translations: { en: "School" }, exampleSentence: "Los niños van a la escuela primaria.", wordType: "noun", dataAiHint: "school building", ...commonProps },
      { wordBankId: "es_v12", word: "Música", translations: { en: "Music" }, exampleSentence: "Escucho música clásica todos los días.", wordType: "noun", dataAiHint: "music notes", ...commonProps },
      { wordBankId: "es_v13", word: "Casa", translations: { en: "House" }, exampleSentence: "Mi casa tiene un jardín bonito.", wordType: "noun", dataAiHint: "house garden", ...commonProps },
      { wordBankId: "es_v14", word: "Perro", translations: { en: "Dog" }, exampleSentence: "El perro ladra al cartero.", wordType: "noun", dataAiHint: "dog barking", ...commonProps },
      { wordBankId: "es_v15", word: "Gato", translations: { en: "Cat" }, exampleSentence: "El gato duerme en el sofá.", wordType: "noun", dataAiHint: "cat sleeping", ...commonProps },
    ];
  } else if (languageCode === 'fr') {
    baseWords = [
      { wordBankId: "fr_v1", word: "Ami/Amie", translations: { en: "Friend"}, exampleSentence: "Il est mon meilleur ami.", wordType: "noun", dataAiHint: "friends together", ...commonProps, _simulatedMastery: true },
      { wordBankId: "fr_v2", word: "Content/Contente", translations: { en: "Happy"}, exampleSentence: "Je suis très content de te voir.", wordType: "adjective", dataAiHint: "joyful expression", ...commonProps, _simulatedMastery: true },
      { wordBankId: "fr_v3", word: "Travailler", translations: { en: "To work"}, exampleSentence: "Je dois travailler dur pour réussir.", wordType: "verb", dataAiHint: "desk work", ...commonProps, _simulatedMastery: true },
      { wordBankId: "fr_v4", word: "Livre", translations: { en: "Book"}, exampleSentence: "C'est un livre passionnant à lire.", wordType: "noun", dataAiHint: "stack books", ...commonProps },
      { wordBankId: "fr_v5", word: "Ville", translations: { en: "City"}, exampleSentence: "Paris est une ville magnifique.", wordType: "noun", dataAiHint: "paris city", ...commonProps },
      { wordBankId: "fr_v6", word: "Nourriture", translations: { en: "Food"}, exampleSentence: "J'aime la nourriture française authentique.", wordType: "noun", dataAiHint: "french food", ...commonProps },
      { wordBankId: "fr_v7", word: "Voyager", translations: { en: "To travel"}, exampleSentence: "Elle aime voyager et découvrir le monde.", wordType: "verb", dataAiHint: "suitcase travel", ...commonProps },
      { wordBankId: "fr_v8", word: "Eau", translations: { en: "Water"}, exampleSentence: "Un verre d'eau fraîche, s'il vous plaît.", wordType: "noun", dataAiHint: "bottle water", ...commonProps },
      { wordBankId: "fr_v9", word: "Rouge", translations: { en: "Red"}, exampleSentence: "La pomme est d'un beau rouge vif.", wordType: "adjective", dataAiHint: "red apple", ...commonProps },
      { wordBankId: "fr_v10", word: "Merci", translations: { en: "Thank you"}, exampleSentence: "Merci beaucoup pour votre gentillesse.", wordType: "phrase", dataAiHint: "merci card", ...commonProps },
      { wordBankId: "fr_v11", word: "École", translations: { en: "School"}, exampleSentence: "Les enfants sont à l'école maternelle.", wordType: "noun", dataAiHint: "school children", ...commonProps },
      { wordBankId: "fr_v12", word: "Musique", translations: { en: "Music"}, exampleSentence: "J'adore la musique classique et le jazz.", wordType: "noun", dataAiHint: "classical music", ...commonProps },
      { wordBankId: "fr_v13", word: "Maison", translations: { en: "House"}, exampleSentence: "J'habite dans une petite maison.", wordType: "noun", dataAiHint: "small house", ...commonProps },
      { wordBankId: "fr_v14", word: "Chien", translations: { en: "Dog"}, exampleSentence: "Mon chien aime jouer dans le parc.", wordType: "noun", dataAiHint: "dog park", ...commonProps },
      { wordBankId: "fr_v15", word: "Chat", translations: { en: "Cat"}, exampleSentence: "Le chat noir traverse la rue.", wordType: "noun", dataAiHint: "black cat", ...commonProps },
    ];
  } else if (languageCode === 'ua') {
     baseWords = [
      { wordBankId: "ua_v1", word: "Друг/Подруга", translations: { en: "Friend"}, exampleSentence: "Він мій найкращий і найнадійніший друг.", wordType: "noun", dataAiHint: "best friends", ...commonProps, _simulatedMastery: true },
      { wordBankId: "ua_v2", word: "Щасливий/Щаслива", translations: { en: "Happy"}, exampleSentence: "Я дуже щаслива сьогодні ввечері.", wordType: "adjective", dataAiHint: "person happy", ...commonProps, _simulatedMastery: true },
      { wordBankId: "ua_v3", word: "Працювати", translations: { en: "To work"}, exampleSentence: "Мені подобається працювати в команді.", wordType: "verb", dataAiHint: "office work", ...commonProps },
      { wordBankId: "ua_v4", word: "Книга", translations: { en: "Book"}, exampleSentence: "Ця книга дуже цікава та інформативна.", wordType: "noun", dataAiHint: "interesting book", ...commonProps },
      { wordBankId: "ua_v5", word: "Місто", translations: { en: "City"}, exampleSentence: "Київ - велике і старовинне місто.", wordType: "noun", dataAiHint: "kyiv city", ...commonProps },
      { wordBankId: "ua_v6", word: "Їжа", translations: { en: "Food"}, exampleSentence: "Українська їжа дуже смачна і ситна.", wordType: "noun", dataAiHint: "ukrainian food", ...commonProps },
      { wordBankId: "ua_v7", word: "Подорожувати", translations: { en: "To travel"}, exampleSentence: "Ми любимо подорожувати всією родиною.", wordType: "verb", dataAiHint: "map travel", ...commonProps },
      { wordBankId: "ua_v8", word: "Вода", translations: { en: "Water"}, exampleSentence: "Дайте мені пляшку чистої води, будь ласка.", wordType: "noun", dataAiHint: "water drop", ...commonProps },
      { wordBankId: "ua_v9", word: "Червоний", translations: { en: "Red"}, exampleSentence: "Прапор України червоний і чорний.", wordType: "adjective", dataAiHint: "red black", ...commonProps },
      { wordBankId: "ua_v10", word: "Дякую", translations: { en: "Thank you"}, exampleSentence: "Щиро дякую за вашу допомогу.", wordType: "phrase", dataAiHint: "thank you hands", ...commonProps },
      { wordBankId: "ua_v11", word: "Школа", translations: { en: "School"}, exampleSentence: "Моя школа велика і сучасна.", wordType: "noun", dataAiHint: "school facade", ...commonProps },
      { wordBankId: "ua_v12", word: "Музика", translations: { en: "Music"}, exampleSentence: "Яка твоя улюблена українська музика?", wordType: "noun", dataAiHint: "headphones music", ...commonProps },
      { wordBankId: "ua_v13", word: "Дім", translations: { en: "House/Home"}, exampleSentence: "Мій дім - моя фортеця.", wordType: "noun", dataAiHint: "cozy home", ...commonProps },
      { wordBankId: "ua_v14", word: "Собака", translations: { en: "Dog"}, exampleSentence: "Собака - вірний друг людини.", wordType: "noun", dataAiHint: "loyal dog", ...commonProps },
      { wordBankId: "ua_v15", word: "Кіт", translations: { en: "Cat"}, exampleSentence: "Мій кіт любить спати на сонці.", wordType: "noun", dataAiHint: "cat sunbathing", ...commonProps },
    ];
  } else { // Default (English or generic)
    baseWords = [
      { wordBankId: "en_v1", word: "Example", translations: { en: "Example (for non-English native)"}, exampleSentence: "This is a very good example for everyone.", wordType: "noun", dataAiHint: "example sign", ...commonProps, _simulatedMastery: true },
      { wordBankId: "en_v2", word: "Learn", translations: { en: "Learn (for non-English native)"}, exampleSentence: "I want to learn many new things.", wordType: "verb", dataAiHint: "student learning", ...commonProps, _simulatedMastery: true },
      { wordBankId: "en_v3", word: "Quick", translations: { en: "Quick (for non-English native)"}, exampleSentence: "Be quick and efficient!", wordType: "adjective", dataAiHint: "running fast", ...commonProps },
      { wordBankId: "en_v4", word: "Vocabulary", translations: { en: "Vocabulary (for non-English native)"}, exampleSentence: "Expand your vocabulary daily.", wordType: "noun", dataAiHint: "dictionary words", ...commonProps },
      { wordBankId: "en_v5", word: "Practice", translations: { en: "Practice (for non-English native)"}, exampleSentence: "Consistent practice makes perfect.", wordType: "verb", dataAiHint: "person practicing", ...commonProps },
      { wordBankId: "en_v6", word: "Hello", translations: { en: "Hello (for non-English native)"}, exampleSentence: "Hello, how are you doing today?", wordType: "phrase", dataAiHint: "greeting wave", ...commonProps },
      { wordBankId: "en_v7", word: "Goodbye", translations: { en: "Goodbye (for non-English native)"}, exampleSentence: "It's time to say goodbye to them.", wordType: "phrase", dataAiHint: "waving goodbye", ...commonProps },
      { wordBankId: "en_v8", word: "House", translations: { en: "House (for non-English native)"}, exampleSentence: "This is my beautiful house.", wordType: "noun", dataAiHint: "house illustration", ...commonProps },
      { wordBankId: "en_v9", word: "Cat", translations: { en: "Cat (for non-English native)"}, exampleSentence: "The fluffy cat is sleeping soundly.", wordType: "noun", dataAiHint: "sleeping cat", ...commonProps },
      { wordBankId: "en_v10", word: "Dog", translations: { en: "Dog (for non-English native)"}, exampleSentence: "The playful dog wags its tail.", wordType: "noun", dataAiHint: "playful dog", ...commonProps },
      { wordBankId: "en_v11", word: "Blue", translations: { en: "Blue (for non-English native)"}, exampleSentence: "The deep blue sky is clear.", wordType: "adjective", dataAiHint: "blue sky", ...commonProps },
      { wordBankId: "en_v12", word: "Big", translations: { en: "Big (for non-English native)"}, exampleSentence: "It's a very big and gray elephant.", wordType: "adjective", dataAiHint: "big elephant", ...commonProps },
      { wordBankId: "en_v13", word: "Small", translations: { en: "Small (for non-English native)"}, exampleSentence: "This is a small but cozy room.", wordType: "adjective", dataAiHint: "small room", ...commonProps },
      { wordBankId: "en_v14", word: "Computer", translations: { en: "Computer (for non-English native)"}, exampleSentence: "My computer is very fast.", wordType: "noun", dataAiHint: "modern computer", ...commonProps },
      { wordBankId: "en_v15", word: "Coffee", translations: { en: "Coffee (for non-English native)"}, exampleSentence: "I need a hot coffee in the morning.", wordType: "noun", dataAiHint: "coffee cup", ...commonProps },
    ];
  }

  const nativeLangCodeShort = nativeLanguageName.toLowerCase().substring(0,2);
  const processedWords = baseWords.map(bw => ({
    ...bw,
    translation: bw.translations[nativeLangCodeShort] || bw.translations['en'] || "Translation not found"
  }));
  
  if (modeId === 'travel') {
    return processedWords.map(word => {
        if (word.word === "Agua" && languageCode === 'es') return {...word, exampleSentence: "Necesito agua para el viaje largo.", dataAiHint: "travel water bottle"};
        if (word.word === "Eau" && languageCode === 'fr') return {...word, exampleSentence: "J'ai besoin d'eau pour le voyage en train.", dataAiHint: "travel water bottle"};
        if (word.word === "Вода" && languageCode === 'ua') return {...word, exampleSentence: "Мені потрібна вода для подорожі літаком.", dataAiHint: "travel water bottle"};
        if (word.word === "Viajar" && languageCode === 'es') return {...word, exampleSentence: "Quiero viajar a España este verano.", dataAiHint: "spain travel"};
        if (word.word === "Voyager" && languageCode === 'fr') return {...word, exampleSentence: "Nous allons voyager en France bientôt.", dataAiHint: "france travel"};
        if (word.word === "Подорожувати" && languageCode === 'ua') return {...word, exampleSentence: "Я мрію подорожувати по Карпатах.", dataAiHint: "carpathians travel"};
        return word;
    });
  }
  return processedWords;
};


const WORDS_PER_SESSION = 7;

export default function VocabularyPage() {
  const [showBack, setShowBack] = useState(false);
  const { selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences, authUser } = useLearning();
  const { toast } = useToast();
  
  const [sessionWords, setSessionWords] = useState<DailyWordItem[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState<number>(0);
  const [isLoadingSession, setIsLoadingSession] = useState(true);
  const [totalWordsInCurrentPool, setTotalWordsInCurrentPool] = useState(0);
  const [masteredWordIds, setMasteredWordIds] = useState<Set<string>>(new Set());


  const loadNewSessionWords = useCallback(async () => {
    if (isLoadingPreferences || !selectedLanguage || !selectedMode || !nativeLanguage) {
      console.log("Skipping loadNewSessionWords because preferences are loading or not set.");
      setIsLoadingSession(false); // Ensure loading state is cleared if we skip
      return;
    }
    setIsLoadingSession(true);
    setShowBack(false);
    setMasteredWordIds(new Set()); // Reset session mastery on new load

    try {
      const input: GenerateVocabularyInput = {
        languageName: selectedLanguage.name,
        languageCode: selectedLanguage.code,
        modeName: selectedMode.name, 
        nativeLanguageName: nativeLanguage.name,
        count: 15, // Fetch a larger pool from AI
      };
      
      const result: GenerateVocabularyResult = await generateVocabulary(input);

      if (!result || !result.vocabulary || result.vocabulary.length === 0) {
        console.warn("AI flow did not return any vocabulary or returned empty. Using fallback.");
        toast({title: "AI Vocabulary Unavailable", description: "Using placeholder words for this session.", variant: "default"});
        const placeholderWords = getVocabularySessionWordsFallback(selectedLanguage.code, selectedMode.id, nativeLanguage.name);
        setSessionWords(shuffleArray(placeholderWords).slice(0, WORDS_PER_SESSION));
        setTotalWordsInCurrentPool(placeholderWords.length);
        setCurrentCardIndex(0);
        setIsLoadingSession(false);
        return;
      }

      const generatedWordItems: DailyWordItem[] = result.vocabulary.map(v => ({
        wordBankId: v.wordBankId,
        word: v.word,
        translation: v.translation, 
        exampleSentence: v.exampleSentence,
        wordType: v.wordType,
        dataAiHint: v.dataAiHint,
        imageUrl: "https://placehold.co/600x400.png", // Placeholder, adjust as needed
        audioUrl: "#", 
      }));
      
      const shuffledPool = shuffleArray(generatedWordItems);
      setSessionWords(shuffledPool.slice(0, WORDS_PER_SESSION));
      setTotalWordsInCurrentPool(shuffledPool.length); 
      setCurrentCardIndex(0);

    } catch (error: any) {
      console.error("Error loading vocabulary session:", error);
      toast({title: "Session Load Error", description: `Failed to load vocabulary: ${error.message || 'Unknown error'}. Using placeholder words.`, variant: "destructive"});
      const placeholderWords = getVocabularySessionWordsFallback(selectedLanguage.code, selectedMode.id, nativeLanguage.name);
      setSessionWords(shuffleArray(placeholderWords).slice(0, WORDS_PER_SESSION));
      setTotalWordsInCurrentPool(placeholderWords.length);
      setCurrentCardIndex(0);
    } finally {
      setIsLoadingSession(false);
    }
  }, [selectedLanguage, selectedMode, nativeLanguage, isLoadingPreferences, authUser?.uid, toast]);


  useEffect(() => {
    if (!isLoadingPreferences) { // Only load if preferences are ready
        loadNewSessionWords();
    }
  }, [loadNewSessionWords, isLoadingPreferences]); // Add isLoadingPreferences here

  const handleCardClick = () => {
    if (sessionWords.length > 0) {
      setShowBack(!showBack);
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
      // For now, just loop back to the start of the current session or show a message.
      // A more advanced version would fetch new words or go to a summary.
      toast({ title: "Session Complete!", description: "You've reviewed all words in this session. Reloading a new set." });
      loadNewSessionWords(); 
    } else {
      setCurrentCardIndex(nextIndex);
    }
    setShowBack(false); 
    
    // Placeholder for actual SRS update logic to a backend
    if (srsRating && currentWord && authUser?.uid) {
      console.log(`Word "${currentWord.word}" (ID: ${currentWord.wordBankId}) rated as: ${srsRating} by user ${authUser.uid}.`);
      // Example: await updateUserWordProgressInFirestore(authUser.uid, currentWord.wordBankId, srsRating);
    }
  }, [sessionWords, currentCardIndex, loadNewSessionWords, authUser?.uid, toast]);

  const currentWord = sessionWords[currentCardIndex];

  const stats = [
    { label: "Words in Session" },
    { label: "New Words Potential" }, 
    { label: "Words Mastered (Session)" },
  ];
  
  const getStatIcon = (label: string) => {
    if (label === "Words in Session") return <ListChecks className="text-primary" />;
    if (label === "New Words Potential") return <PlusCircle className="text-primary" />;
    if (label === "Words Mastered (Session)") return <Zap className="text-primary" />;
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
            </p>
          </div>
          <Button onClick={loadNewSessionWords} className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <RefreshCw className="mr-2 h-5 w-5" /> New Session Words
          </Button>
        </section>

        <section className="flex flex-col items-center gap-6 py-8">
          {sessionWords.length > 0 && currentWord ? (
            <>
              <div className="w-full" onClick={handleCardClick}>
                <FlashcardPlaceholder 
                  front={currentWord.word} 
                  back={currentWord.translation} 
                  example={currentWord.exampleSentence}
                  showBack={showBack} 
                />
              </div>
              
              {showBack && (
                <div className="text-center mt-4">
                  <h4 className="text-md font-semibold text-muted-foreground mb-2">How well did you remember this?</h4>
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
            let displayValue: string | number = 0;
            let subText = "";

            if (stat.label === "Words in Session") {
              displayValue = sessionWords.length;
              subText = sessionWords.length > 0 ? `Currently reviewing ${Math.min(currentCardIndex + 1, sessionWords.length)} / ${sessionWords.length}` : "No session active";
            } else if (stat.label === "New Words Potential") {
              displayValue = Math.max(0, totalWordsInCurrentPool - sessionWords.length);
              subText = "From current learning pool";
            } else if (stat.label === "Words Mastered (Session)") {
              displayValue = masteredWordIds.size; 
              subText = "Words marked 'Easy' in this session";
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

