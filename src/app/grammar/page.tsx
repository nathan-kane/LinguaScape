
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
import { Input } from "@/components/ui/input"; // Added Input import
import { useLearning } from '@/context/LearningContext'; // For language context

// Placeholder data for grammar questions - could be expanded or fetched
const grammarQuestionsData = {
  en: [
    {
      id: "en1",
      type: "multiple-choice",
      questionText: "Which sentence uses the correct article: '___ apple a day keeps the doctor away.'?",
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
      questionText: "She ___ (to go) to the park yesterday.",
      correctAnswers: ["went"],
      explanation: "'Went' is the simple past tense of 'to go'."
    },
    {
      id: "en3",
      type: "multiple-choice",
      questionText: "Identify the correct plural form: 'There are three ___ on the table.'",
      options: [
        { id: "a", text: "book" },
        { id: "b", text: "bookes" },
        { id: "c", text: "books" },
      ],
      correctOptionId: "c",
      explanation: "The standard plural form of 'book' is 'books'."
    },
  ],
  es: [
    {
      id: "es1",
      type: "multiple-choice",
      questionText: "¿Cuál es la forma correcta del verbo 'ser'?: 'Yo ___ estudiante.'",
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
      questionText: "Ellos ___ (comer) pizza anoche.",
      correctAnswers: ["comieron"],
      explanation: "'Comieron' es la forma correcta del pretérito indefinido para 'ellos'."
    },
  ],
  // Add more languages and questions as needed
};

type Question = typeof grammarQuestionsData.en[0];


export default function GrammarPage() {
  const { selectedLanguage } = useLearning();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>(""); // For multiple choice
  const [fillBlankAnswer, setFillBlankAnswer] = useState<string>(""); // For fill-in-the-blank
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  useEffect(() => {
    // Load questions based on selected language
    const langCode = selectedLanguage.code as keyof typeof grammarQuestionsData;
    const currentQuestions = grammarQuestionsData[langCode] || grammarQuestionsData.en; // Fallback to English
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
    if (currentQuestion.type === "multiple-choice") {
      setIsCorrect(selectedAnswer === currentQuestion.correctOptionId);
    } else if (currentQuestion.type === "fill-in-the-blank" && currentQuestion.correctAnswers) {
      setIsCorrect(currentQuestion.correctAnswers.includes(fillBlankAnswer.trim().toLowerCase()));
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prevIndex => prevIndex + 1);
    } else {
      // End of questions, maybe show a summary or reset
      alert("You've completed all grammar questions for this set!");
      setCurrentQuestionIndex(0); // Loop back for now
    }
    setShowFeedback(false);
    setSelectedAnswer("");
    setFillBlankAnswer("");
    setIsCorrect(false);
  };
  
  const progressPercentage = questions.length > 0 ? ((currentQuestionIndex + (showFeedback ? 1:0) ) / questions.length) * 100 : 0;

  if (questions.length === 0 || !currentQuestion) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading grammar questions for {selectedLanguage.name}...</p>
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
            Sharpen your grammar skills with interactive drills and explanations.
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
                placeholder="Type your answer here"
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
                <CardDescription>Review specific grammar rules and concepts.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {["Present Tense", "Past Tense", "Articles", "Prepositions", "Sentence Structure"].map(topic => (
                        <li key={topic}>
                            <Button variant="link" className="p-0 h-auto text-primary hover:text-accent">
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
