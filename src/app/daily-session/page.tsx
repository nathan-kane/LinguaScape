
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Volume2, CheckSquare, BookOpen, ChevronRight, Zap, Lightbulb, MessageSquare, ChevronLeft, AlertCircle, CheckCircle, Brain } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useLearning } from '@/context/LearningContext';
import type { DailyWordItem } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from '@/lib/utils';
import { generateMiniStory, MiniStoryInput } from '@/ai/flows/mini-story-flow';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';


// Function to get placeholder words based on language and mode
const getPlaceholderDailyWords = (languageCode: string, modeId: string): DailyWordItem[] => {
  const commonProps = {
    imageUrl: "https://placehold.co/200x150.png",
    audioUrl: "#", // Simulated audio
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
  // Default English words if no match
    const englishWords: DailyWordItem[] = [
    { wordBankId: "en1", word: "Apple", translation: "Manzana (Spanish)", ...commonProps, exampleSentence: "I eat an apple.", wordType: "noun", dataAiHint: "apple fruit" },
    { wordBankId: "en2", word: "To eat", translation: "Comer (Spanish)", ...commonProps, exampleSentence: "I like to eat fruits.", wordType: "verb", dataAiHint: "person eating" },
    { wordBankId: "en3", word: "Red", translation: "Rojo (Spanish)", ...commonProps, exampleSentence: "The apple is red.", wordType: "adjective", dataAiHint: "red color swatch" },
    { wordBankId: "en4", word: "I want", translation: "Quiero (Spanish)", ...commonProps, exampleSentence: "I want to learn.", wordType: "phrase", dataAiHint: "person thinking" },
    { wordBankId: "en5", word: "Water", translation: "Agua (Spanish)", ...commonProps, exampleSentence: "I drink water.", wordType: "noun", dataAiHint: "glass water" },
  ];
  return applyTravelAdjustments(englishWords, selectedLanguage.code as 'es' | 'fr' | 'ua'); // Apply travel to default if applicable
};

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

export default function DailySessionPage() {
  const { selectedLanguage, selectedMode, isLoadingPreferences } = useLearning();
  const { toast } = useToast();
  const [dailyWords, setDailyWords] = useState<DailyWordItem[]>([]);
  const [isLoadingLesson, setIsLoadingLesson] = useState(true);

  // Introduction Stage
  const [currentIntroWordIndex, setCurrentIntroWordIndex] = useState(0);
  
  // Recognition Stage
  const [currentRecognitionIndex, setCurrentRecognitionIndex] = useState(0);
  const [recognitionQuestion, setRecognitionQuestion] = useState<{ word: string; translation: string; options: string[] } | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [recognitionFeedback, setRecognitionFeedback] = useState<{ message: string; correct: boolean } | null>(null);
  
  // Story Stage
  const [miniStoryText, setMiniStoryText] = useState<string | null>(null);
  const [isLoadingStory, setIsLoadingStory] = useState<boolean>(false);
  
  const [practiceStage, setPracticeStage] = useState<'introduction' | 'recognition' | 'story' | 'chat'>('introduction');

  useEffect(() => {
    if (!isLoadingPreferences && selectedLanguage && selectedMode) { 
      setIsLoadingLesson(true);
      setTimeout(() => { // Simulate async fetch
        const relevantWords = getPlaceholderDailyWords(selectedLanguage.code, selectedMode.id);
        setDailyWords(relevantWords.slice(0, 5)); 
        setCurrentIntroWordIndex(0);
        setPracticeStage('introduction');
        // Reset other stage-specific states
        setRecognitionQuestion(null);
        setSelectedOption(null);
        setRecognitionFeedback(null);
        setCurrentRecognitionIndex(0);
        setMiniStoryText(null);
        setIsLoadingStory(false);
        setIsLoadingLesson(false);
      }, 500); 
    }
  }, [selectedLanguage, selectedMode, isLoadingPreferences]);

  const currentIntroWord = dailyWords[currentIntroWordIndex];
  const introProgressPercentage = dailyWords.length > 0 ? ((currentIntroWordIndex + 1) / dailyWords.length) * 100 : 0;

  const playAudio = (audioUrl?: string) => {
    alert(audioUrl && audioUrl !== "#" ? `Simulating audio: ${currentIntroWord?.word}` : "Audio simulated.");
  };

  const handleNextIntroWord = () => {
    if (currentIntroWordIndex < dailyWords.length - 1) {
      setCurrentIntroWordIndex(prev => prev + 1);
    } else {
      setPracticeStage('recognition'); 
      setupRecognitionQuestion(0);
    }
  };

  const handlePreviousIntroWord = () => {
    if (currentIntroWordIndex > 0) {
      setCurrentIntroWordIndex(prev => prev - 1);
    }
  };

  const setupRecognitionQuestion = useCallback((index: number) => {
    if (index >= dailyWords.length || dailyWords.length === 0) {
      // This case should ideally be handled by handleNextRecognitionItem logic
      // to transition to story stage. If it's reached, it's likely an error or empty dailyWords.
      setPracticeStage('story'); 
      fetchMiniStory(); // Attempt to fetch story if words are empty but moving to story stage
      return;
    }
    const wordItem = dailyWords[index];
    const correctAnswer = wordItem.translation;
    
    let distractors = dailyWords
      .filter((_, i) => i !== index)
      .map(dw => dw.translation);
    
    const neededDistractors = 2;
    const genericDistractors = ["Other Option 1", "Another Choice", "Different Answer", "Not this one"];
    let currentDistractorIdx = 0;
    while (distractors.length < neededDistractors && currentDistractorIdx < genericDistractors.length) {
        const distractorCandidate = genericDistractors[currentDistractorIdx];
        if (!distractors.includes(distractorCandidate) && correctAnswer !== distractorCandidate) {
            distractors.push(distractorCandidate);
        }
        currentDistractorIdx++;
    }
    // Ensure we have enough distractors, even if they are repeated generic ones (less ideal but handles small dailyWords list)
    while(distractors.length < neededDistractors) {
        distractors.push(`Placeholder ${distractors.length + 1}`);
    }
    
    distractors = shuffleArray(distractors).slice(0, neededDistractors);
    const options = shuffleArray([correctAnswer, ...distractors]);
    
    setRecognitionQuestion({ word: wordItem.word, translation: correctAnswer, options });
    setSelectedOption(null);
    setRecognitionFeedback(null);
    setCurrentRecognitionIndex(index);
  }, [dailyWords]); // Removed fetchMiniStory from here, it will be called on transition

  const handleOptionSelect = (option: string) => {
    if (recognitionFeedback) return;
    setSelectedOption(option);
  };

  const handleCheckRecognitionAnswer = () => {
    if (!recognitionQuestion || !selectedOption) return;
    const correct = selectedOption === recognitionQuestion.translation;
    setRecognitionFeedback({ 
      message: correct ? "Correct!" : `Not quite. The correct translation for "${recognitionQuestion.word}" is "${recognitionQuestion.translation}".`, 
      correct 
    });
  };

  const handleNextRecognitionItem = () => {
    if (currentRecognitionIndex < dailyWords.length - 1) {
      setupRecognitionQuestion(currentRecognitionIndex + 1);
    } else {
      setPracticeStage('story');
      fetchMiniStory(); // Fetch story when transitioning to story stage
    }
  };
  
  const fetchMiniStory = async () => {
    if (dailyWords.length === 0) {
        setMiniStoryText("No words available to create a story. Try starting a new lesson!");
        setIsLoadingStory(false);
        return;
    }
    setIsLoadingStory(true);
    setMiniStoryText(null);
    try {
      const input: MiniStoryInput = {
        targetLanguage: selectedLanguage.name, // Use name for AI prompt clarity
        learningMode: selectedMode.name, // Use name for AI prompt clarity
        dailyWords: dailyWords.map(w => w.word),
      };
      const result = await generateMiniStory(input);
      setMiniStoryText(result.storyText);
    } catch (error) {
      console.error("Error generating mini story:", error);
      toast({
        title: "Story Generation Failed",
        description: "Could not create a mini-story. Using a default message.",
        variant: "destructive",
      });
      setMiniStoryText(`Apologies, I couldn't create a story with ${selectedLanguage.name} words for the ${selectedMode.name} mode right now. Please try to use your new words in the chat!`);
    } finally {
      setIsLoadingStory(false);
    }
  };


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
        <Alert variant="default" className="border-primary bg-primary/10">
          <Lightbulb className="h-5 w-5 text-primary" />
          <AlertTitle className="text-primary">No words for today!</AlertTitle>
          <AlertDescription className="text-primary/80">
            It seems there are no new words for you in {selectedLanguage.name} ({selectedMode.name} mode).
            Why not <Link href="/vocabulary"><Button variant="link" className="p-0 h-auto ml-1 text-primary hover:underline">review your vocabulary</Button></Link> or 
            <Link href="/profile"><Button variant="link" className="p-0 h-auto ml-1 text-primary hover:underline">check your profile settings?</Button></Link>
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
           {practiceStage === 'introduction' && dailyWords.length > 0 && <Progress value={introProgressPercentage} className="mt-2 h-2" />}
           {practiceStage === 'recognition' && dailyWords.length > 0 && <Progress value={( (currentRecognitionIndex + (recognitionFeedback ? 1:0) ) / dailyWords.length) * 100} className="mt-2 h-2" />}
           {practiceStage === 'story' && <Progress value={100} className="mt-2 h-2" />}
        </section>

        {/* Introduction Stage */}
        {practiceStage === 'introduction' && currentIntroWord && (
          <Card className="shadow-xl bg-card">
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-2xl">
                <span>New Word: <span className="text-primary">{currentIntroWord.word}</span></span>
                <span className="text-sm font-normal text-muted-foreground">({currentIntroWord.wordType})</span>
              </CardTitle>
              <CardDescription>Word {currentIntroWordIndex + 1} of {dailyWords.length}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                {currentIntroWord.imageUrl && (
                  <Image
                    src={currentIntroWord.imageUrl}
                    alt={`Image for ${currentIntroWord.word}`}
                    width={200}
                    height={150}
                    className="rounded-lg object-cover border shadow-md"
                    data-ai-hint={currentIntroWord.dataAiHint || `${currentIntroWord.wordType} visual`}
                  />
                )}
                <div className="flex-1 space-y-3">
                  <p className="text-xl"><strong>Translation:</strong> {currentIntroWord.translation}</p>
                  {currentIntroWord.exampleSentence && (
                    <p className="text-lg italic text-muted-foreground">"{currentIntroWord.exampleSentence}"</p>
                  )}
                   <Button onClick={() => playAudio(currentIntroWord.audioUrl)} variant="outline" size="sm">
                    <Volume2 className="mr-2 h-5 w-5" /> Listen
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={handlePreviousIntroWord} variant="outline" disabled={currentIntroWordIndex === 0}>
                <ChevronLeft className="mr-2 h-5 w-5" /> Back
              </Button>
              <Button onClick={handleNextIntroWord} className="bg-primary hover:bg-primary/90 text-primary-foreground">
                {currentIntroWordIndex < dailyWords.length - 1 ? "Next Word" : "Got It! Move to Practice"} <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </CardFooter>
          </Card>
        )}

        {/* Recognition Practice Stage */}
        {practiceStage === 'recognition' && recognitionQuestion && (
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Brain className="h-6 w-6 text-primary"/>Recognition Practice</CardTitle>
              <CardDescription>Question {currentRecognitionIndex + 1} of {dailyWords.length}: Match the word to its translation.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-2xl font-semibold text-center text-primary py-4">
                {recognitionQuestion.word}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {recognitionQuestion.options.map((option, idx) => (
                  <Button
                    key={idx}
                    variant={selectedOption === option ? "default" : "outline"}
                    className={cn(
                      "w-full text-base py-6 h-auto justify-center",
                      selectedOption === option && "ring-2 ring-primary-foreground ring-offset-2",
                      recognitionFeedback && option === recognitionQuestion.translation && "bg-green-500/20 border-green-500 hover:bg-green-500/30 text-green-700",
                      recognitionFeedback && selectedOption === option && option !== recognitionQuestion.translation && "bg-red-500/20 border-red-500 hover:bg-red-500/30 text-red-700"
                    )}
                    onClick={() => handleOptionSelect(option)}
                    disabled={!!recognitionFeedback}
                  >
                    {option}
                  </Button>
                ))}
              </div>
              {recognitionFeedback && (
                <Alert variant={recognitionFeedback.correct ? "default" : "destructive"} className={recognitionFeedback.correct ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
                  {recognitionFeedback.correct ? <CheckCircle className="h-5 w-5 text-green-600" /> : <AlertCircle className="h-5 w-5 text-red-600" />}
                  <AlertTitle className={recognitionFeedback.correct ? "text-green-700" : "text-red-700"}>
                    {recognitionFeedback.correct ? "Correct!" : "Incorrect"}
                  </AlertTitle>
                  <AlertDescription className={recognitionFeedback.correct ? "text-green-600" : "text-red-600"}>
                    {recognitionFeedback.message}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
            <CardFooter>
              {!recognitionFeedback ? (
                <Button onClick={handleCheckRecognitionAnswer} disabled={!selectedOption} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                  Check Answer
                </Button>
              ) : (
                <Button onClick={handleNextRecognitionItem} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                  {currentRecognitionIndex < dailyWords.length - 1 ? "Next Question" : "Continue to Mini-Story"}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </CardFooter>
          </Card>
        )}

        {/* Mini-Story Context Stage */}
        {practiceStage === 'story' && (
          <Card className="shadow-lg bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><BookOpen className="h-6 w-6 text-primary"/>Mini-Story Context</CardTitle>
              <CardDescription>See today's words in a short story, in {selectedLanguage.name}.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 min-h-[200px] flex flex-col justify-center">
              {isLoadingStory && (
                <div className="flex flex-col items-center justify-center text-muted-foreground">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
                  <p>Generating your mini-story...</p>
                </div>
              )}
              {!isLoadingStory && miniStoryText && (
                <ScrollArea className="h-48 p-4 bg-secondary/30 rounded-md border">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">{miniStoryText}</p>
                </ScrollArea>
              )}
              {!isLoadingStory && !miniStoryText && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Story Unavailable</AlertTitle>
                    <AlertDescription>
                      We couldn't generate a story right now. You can proceed to chat practice.
                    </AlertDescription>
                  </Alert>
              )}
            </CardContent>
            <CardFooter>
              <Button onClick={() => setPracticeStage('chat')} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingStory}>
                {isLoadingStory ? "Loading Story..." : <>Practice with AI Tutor <MessageSquare className="ml-2 h-5 w-5" /></>}
              </Button>
            </CardFooter>
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
