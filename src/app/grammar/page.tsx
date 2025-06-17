
"use client";

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, CheckSquare, XSquare, ChevronRight, BookText } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { useLearning } from '@/context/LearningContext';

// Placeholder data for grammar questions
// Native language prompts are in English for this placeholder data.
const grammarQuestionsData = {
  en: [ // Assuming English is the target language, native prompt might be for context or specific instruction
    {
      id: "en1",
      type: "multiple-choice",
      nativeLanguagePrompt: "Instruction: Choose the correct article.",
      questionText: "'___ apple a day keeps the doctor away.' What is the missing word?",
      options: [
        { id: "a", text: "A" },
        { id: "b", text: "An" },
        { id: "c", text: "The" },
      ],
      correctOptionId: "b",
      explanation: "'An' is used before words starting with a vowel sound, like 'apple'."
    },
    {
      id: "en2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Instruction: Fill in the blank with the past tense of 'go'.",
      questionText: "She ___ to the park yesterday.",
      correctAnswers: ["went"],
      explanation: "'Went' is the simple past tense of 'to go'."
    },
    {
      id: "en3",
      type: "multiple-choice",
      nativeLanguagePrompt: "Instruction: Identify the correct plural form of 'book'.",
      questionText: "There are three ___ on the table.",
      options: [
        { id: "a", text: "book" },
        { id: "b", text: "bookes" },
        { id: "c", text: "books" },
      ],
      correctOptionId: "c",
      explanation: "The standard plural form of 'book' is 'books'."
    },
  ],
  es: [ // Spanish as target language
    {
      id: "es1",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): I am a student. Choose the correct Spanish form for 'I am'.",
      questionText: "Yo ___ estudiante.",
      options: [
        { id: "a", text: "soy" },
        { id: "b", text: "eres" },
        { id: "c", text: "es" },
      ],
      correctOptionId: "a",
      explanation: "'Soy' es la forma correcta de 'ser' para la primera persona del singular (Yo)."
    },
    {
      id: "es2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): They ate pizza last night. Fill in the blank with the correct Spanish verb form.",
      questionText: "Ellos ___ (comer) pizza anoche.",
      correctAnswers: ["comieron"],
      explanation: "'Comieron' es la forma correcta del pretérito indefinido para 'ellos'."
    },
    {
      id: "es3",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): The house is big. Choose the correct adjective agreement in Spanish.",
      questionText: "La casa es ___.",
      options: [
        { id: "a", text: "grande" },
        { id: "b", text: "grandes" },
        { id: "c", text: "grando" },
      ],
      correctOptionId: "a",
      explanation: "El adjetivo 'grande' concuerda en género y número con 'casa' (femenino singular)."
    },
  ],
  fr: [ // French as target language
    {
      id: "fr1",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): We are happy. Choose the correct French form for 'we are'.",
      questionText: "Nous ___ contents.",
      options: [
        { id: "a", text: "sont" },
        { id: "b", text: "sommes" },
        { id: "c", text: "êtes" },
      ],
      correctOptionId: "b",
      explanation: "'Sommes' est la forme correcte de 'être' pour la première personne du pluriel (Nous)."
    },
    {
      id: "fr2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): She has a red car. Fill in the blank with the correct French possessive adjective.",
      questionText: "Elle a ___ voiture rouge.", // Assuming voiture is known to be feminine
      correctAnswers: ["sa"],
      explanation: "'Sa' est l'adjectif possessif correct pour un nom féminin singulier ('voiture') possédé par 'elle'."
    },
  ],
  ua: [ // Ukrainian as target language
    {
      id: "ua1",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): This is my book. Choose the correct Ukrainian form for 'my'.",
      questionText: "Це ___ книга.", // книга (knyha) is feminine
      options: [
        { id: "a", text: "мій" },   // masculine
        { id: "b", text: "моя" },   // feminine
        { id: "c", text: "моє" },   // neuter
      ],
      correctOptionId: "b",
      explanation: "'Моя' (moya) - це правильна присвійна форма для іменника жіночого роду 'книга'."
    },
    {
      id: "ua2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): I read an interesting book. Fill in the blank with the correct Ukrainian verb form.",
      questionText: "Я ___ (читати) цікаву книгу вчора.",
      correctAnswers: ["читав", "читала"], // Depending on gender of 'Я'
      explanation: "Минулий час дієслова 'читати': 'читав' (cholovichyy rid) abo 'читала' (zhinochyy rid)."
    },
  ],
  de: [], // Add German questions if desired
  it: [], // Add Italian questions if desired
  pt: [], // Add Portuguese questions if desired
  ru: [], // Add Russian questions if desired
  ja: [], // Add Japanese questions if desired
  ko: [], // Add Korean questions if desired
  zh: [], // Add Chinese questions if desired
};

type QuestionOption = { id: string; text: string };
interface Question {
  id: string;
  type: "multiple-choice" | "fill-in-the-blank";
  nativeLanguagePrompt: string;
  questionText: string;
  options?: QuestionOption[];
  correctOptionId?: string;
  correctAnswers?: string[];
  explanation: string;
}


export default function GrammarPage() {
  const { selectedLanguage, nativeLanguage } = useLearning();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    const langCode = selectedLanguage.code as keyof typeof grammarQuestionsData;
    // Fallback to English questions if specific language questions are not available or empty
    const currentQuestions = (grammarQuestionsData[langCode] && grammarQuestionsData[langCode].length > 0)
                             ? grammarQuestionsData[langCode]
                             : grammarQuestionsData.en;
    setQuestions(currentQuestions);
    setCurrentQuestionIndex(0);
    setSelectedAnswer("");
    setFillBlankAnswer("");
    setShowFeedback(false);
    setIsCorrect(false);
  }, [selectedLanguage]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    if (!currentQuestion) return;
    setShowFeedback(true);
    if (currentQuestion.type === "multiple-choice" && currentQuestion.correctOptionId) {
      setIsCorrect(selectedAnswer === currentQuestion.correctOptionId);
    } else if (currentQuestion.type === "fill-in-the-blank" && currentQuestion.correctAnswers) {
      const userAnswer = fillBlankAnswer.trim().toLowerCase();
      const correctAnswersLower = currentQuestion.correctAnswers.map(ans => ans.toLowerCase());
      setIsCorrect(correctAnswersLower.includes(userAnswer));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      alert("You've completed all grammar questions for this set! Reloading for practice.");
      setCurrentQuestionIndex(0); 
    }
    setShowFeedback(false);
    setSelectedAnswer("");
    setFillBlankAnswer("");
    setIsCorrect(false);
  };
  
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + (showFeedback ? 1 : 0)) / questions.length) * 100 : 0;

  if (questions.length === 0 || !currentQuestion) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading grammar questions for {selectedLanguage.name}... If this persists, there might be no questions for this language yet.</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Grammar Pro <span className="text-base align-middle text-muted-foreground">({selectedLanguage.name})</span>
          </h1>
          <p className="text-lg text-muted-foreground">
            Test your knowledge of {selectedLanguage.name} grammar. Native language: {nativeLanguage.name}.
          </p>
        </section>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                <Edit3 className="h-6 w-6 text-primary" />
                Grammar Drill: {currentQuestion.type === "multiple-choice" ? "Multiple Choice" : "Fill in the Blank"}
                </CardTitle>
                <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {questions.length}</span>
            </div>
             <Progress value={progressPercentage} className="w-full mt-2 h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {currentQuestion.nativeLanguagePrompt && (
              <div className="p-3 bg-secondary rounded-md">
                <p className="text-sm text-secondary-foreground italic">
                  {nativeLanguage.name} Prompt: {currentQuestion.nativeLanguagePrompt}
                </p>
              </div>
            )}
            <p className="text-xl font-semibold text-foreground min-h-[60px]">
              {currentQuestion.questionText}
            </p>

            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <RadioGroup 
                value={selectedAnswer} 
                onValueChange={setSelectedAnswer}
                disabled={showFeedback}
                className="space-y-3"
              >
                {currentQuestion.options.map(option => (
                  <div key={option.id} className="flex items-center space-x-3 p-3 border rounded-md hover:bg-secondary/50 transition-colors data-[state=checked]:bg-primary/10 data-[state=checked]:border-primary">
                    <RadioGroupItem value={option.id} id={`option-${option.id}`} />
                    <Label htmlFor={`option-${option.id}`} className="text-base flex-1 cursor-pointer">{option.text}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {currentQuestion.type === "fill-in-the-blank" && (
              <Input
                type="text"
                value={fillBlankAnswer}
                onChange={(e) => setFillBlankAnswer(e.target.value)}
                disabled={showFeedback}
                placeholder={`Type your answer in ${selectedLanguage.name}`}
                className="w-full p-3 border rounded-md focus:ring-primary focus:border-primary text-base"
              />
            )}
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4 border-t pt-6">
            <Button 
              onClick={handleSubmitAnswer} 
              disabled={showFeedback || (!selectedAnswer && currentQuestion.type === 'multiple-choice') || (!fillBlankAnswer && currentQuestion.type === 'fill-in-the-blank')}
              className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              Check Answer
            </Button>
            {showFeedback && (
                 <Button onClick={handleNextQuestion} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                    {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Restart Questions"}
                    <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            )}
          </CardFooter>
        </Card>

        {showFeedback && (
          <Alert variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
            {isCorrect ? <CheckSquare className="h-5 w-5 text-green-600" /> : <XSquare className="h-5 w-5 text-red-600" />}
            <AlertTitle className={isCorrect ? "text-green-700" : "text-red-700"}>
              {isCorrect ? "Correct!" : "Not quite..."}
            </AlertTitle>
            <AlertDescription className={isCorrect ? "text-green-600" : "text-red-600"}>
              {currentQuestion.explanation}
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-md bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline"><BookText className="h-6 w-6 text-primary"/>Grammar Topics for {selectedLanguage.name}</CardTitle>
                <CardDescription>Review specific grammar rules and concepts (feature coming soon).</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {/* This could be dynamically generated based on target language in a real app */}
                    {["Verb Conjugation (Present Tense)", "Noun Genders & Articles", "Adjective Agreement", "Basic Sentence Structure", "Prepositions of Place"].map(topic => (
                        <li key={topic}>
                            <Button variant="link" className="p-0 h-auto text-primary hover:text-accent" disabled>
                                {topic} (Coming Soon)
                            </Button>
                        </li>
                    ))}
                </ul>
            </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}

