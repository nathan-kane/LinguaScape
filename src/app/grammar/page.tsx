
"use client";

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, CheckSquare, XSquare, ChevronRight, BookText, Target, AlertCircle } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Input } from "@/components/ui/input"; // Added missing import
import { useLearning } from '@/context/LearningContext';
import { Separator } from '@/components/ui/separator';

// Placeholder data for grammar questions
// nativeLanguagePrompt: Instruction/context in English (simulating native language for the user).
// questionText: The actual question, primarily in the TARGET language.
// options: Multiple-choice options in the TARGET language.
// correctAnswers: For fill-in-the-blank, in the TARGET language.
// correctUsageExample: The correct sentence/phrase in the TARGET language.
// explanation: Explanation of the rule, in English (simulating native language for the user).

const grammarQuestionsData = {
  en: [
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
      correctUsageExample: "'An apple a day keeps the doctor away.'",
      explanation: "Use 'an' before words that start with a vowel sound (like 'apple'). 'A' is used before consonant sounds."
    },
    {
      id: "en2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Instruction: Fill in the blank with the past tense of 'go'.",
      questionText: "She ___ to the park yesterday.",
      correctAnswers: ["went"],
      correctUsageExample: "She went to the park yesterday.",
      explanation: "'Went' is the simple past tense of the verb 'to go'. We use it for completed actions in the past."
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
      correctUsageExample: "There are three books on the table.",
      explanation: "To make most English nouns plural, you add an '-s' at the end. 'Bookes' is not a correct plural form."
    },
    {
      id: "en4",
      type: "multiple-choice",
      nativeLanguagePrompt: "Instruction: Choose the correct form of 'to be'.",
      questionText: "They ___ happy to see us.",
      options: [
        { id: "a", text: "is" },
        { id: "b", text: "are" },
        { id: "c", text: "am" },
      ],
      correctOptionId: "b",
      correctUsageExample: "They are happy to see us.",
      explanation: "'Are' is the correct form of the verb 'to be' for the third person plural ('They')."
    },
    {
      id: "en5",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Instruction: Fill in the blank with the correct comparative adjective for 'good'.",
      questionText: "This book is ___ than the last one I read.",
      correctAnswers: ["better"],
      correctUsageExample: "This book is better than the last one I read.",
      explanation: "'Better' is the irregular comparative form of 'good'. We use it to compare two things."
    },
  ],
  es: [
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
      correctUsageExample: "Yo soy estudiante.",
      explanation: "In Spanish, 'soy' is the correct form of the verb 'ser' (to be) for the first person singular ('Yo' - I). Use 'soy' for permanent characteristics or professions."
    },
    {
      id: "es2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): They ate pizza last night. Fill in the blank with the correct Spanish verb form for 'to eat' (comer) in the past.",
      questionText: "Ellos ___ (comer) pizza anoche.",
      correctAnswers: ["comieron"],
      correctUsageExample: "Ellos comieron pizza anoche.",
      explanation: "'Comieron' is the past preterite tense of 'comer' for 'ellos/ellas/ustedes' (they/you all). It's used for completed actions in the past."
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
      correctUsageExample: "La casa es grande.",
      explanation: "In Spanish, adjectives must agree in gender and number with the noun they describe. 'Casa' is feminine singular, so 'grande' is the correct form. 'Grande' is an adjective that doesn't change for feminine/masculine singular."
    },
    {
      id: "es4",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): You (informal, singular) have a book. Choose the correct Spanish verb form.",
      questionText: "Tú ___ un libro.",
      options: [
        { id: "a", text: "tengo" },
        { id: "b", text: "tiene" },
        { id: "c", text: "tienes" },
      ],
      correctOptionId: "c",
      correctUsageExample: "Tú tienes un libro.",
      explanation: "'Tienes' is the correct form of the verb 'tener' (to have) for the second person informal singular ('Tú' - You)."
    },
    {
      id: "es5",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): We speak Spanish. Fill in the blank with the correct Spanish verb form.",
      questionText: "Nosotros ___ (hablar) español.",
      correctAnswers: ["hablamos"],
      correctUsageExample: "Nosotros hablamos español.",
      explanation: "'Hablamos' is the present tense form of 'hablar' (to speak) for 'nosotros/nosotras' (we)."
    },
  ],
  fr: [
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
      correctUsageExample: "Nous sommes contents.",
      explanation: "'Sommes' is the correct form of the verb 'être' (to be) for 'nous' (we) in French."
    },
    {
      id: "fr2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): She has a red car. Fill in the blank with the correct French possessive adjective for 'her' car.",
      questionText: "Elle a ___ voiture rouge.", // voiture is feminine
      correctAnswers: ["sa"],
      correctUsageExample: "Elle a sa voiture rouge.",
      explanation: "'Sa' is the correct feminine singular possessive adjective for 'elle' (she/her) when the noun ('voiture' - car) is feminine. 'Son' is for masculine nouns or feminine nouns starting with a vowel/h, and 'ses' is for plural."
    },
    {
      id: "fr3",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): They (masculine) go to the market. Choose the correct French verb form.",
      questionText: "Ils ___ au marché.",
      options: [
        { id: "a", text: "va" },
        { id: "b", text: "vont" },
        { id: "c", text: "allez" },
      ],
      correctOptionId: "b",
      correctUsageExample: "Ils vont au marché.",
      explanation: "'Vont' is the correct form of the verb 'aller' (to go) for 'ils' (they, masculine plural)."
    },
    {
      id: "fr4",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): I like apples. Fill in the blank with the correct French definite article.",
      questionText: "J'aime ___ pommes.",
      correctAnswers: ["les"],
      correctUsageExample: "J'aime les pommes.",
      explanation: "'Les' is the plural definite article (the) in French, used for both masculine and feminine plural nouns like 'pommes' (apples)."
    },
  ],
  ua: [
    {
      id: "ua1",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): This is my book. Choose the correct Ukrainian form for 'my' when 'book' (книга - knyha) is feminine.",
      questionText: "Це ___ книга.",
      options: [
        { id: "a", text: "мій" },   // masculine
        { id: "b", text: "моя" },   // feminine
        { id: "c", text: "моє" },   // neuter
      ],
      correctOptionId: "b",
      correctUsageExample: "Це моя книга.",
      explanation: "In Ukrainian, 'моя' (moya) is the possessive pronoun 'my' for feminine singular nouns like 'книга' (knyha - book). 'Мій' (miy) is for masculine, and 'моє' (moye) is for neuter."
    },
    {
      id: "ua2",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): I read an interesting book yesterday. Fill in the blank with the correct Ukrainian past tense verb form of 'to read' (читати).",
      questionText: "Я ___ (читати) цікаву книгу вчора.",
      correctAnswers: ["читав", "читала"], // Depending on gender of 'Я'
      correctUsageExample: "Я читав цікаву книгу вчора. (if 'I' is male) / Я читала цікаву книгу вчора. (if 'I' is female)",
      explanation: "The past tense of 'читати' (chytaty - to read) in Ukrainian depends on the gender of the subject 'Я' (I). It's 'читав' (chytav) for masculine and 'читала' (chytala) for feminine."
    },
    {
      id: "ua3",
      type: "multiple-choice",
      nativeLanguagePrompt: "Context (English): They see a cat. Choose the correct Ukrainian verb form for 'they see'.",
      questionText: "Вони ___ кота.",
      options: [
        { id: "a", text: "бачу" },    // I see
        { id: "b", text: "бачиш" },   // You (sg) see
        { id: "c", text: "бачать" },  // They see
      ],
      correctOptionId: "c",
      correctUsageExample: "Вони бачать кота.",
      explanation: "'Бачать' (bachat') is the correct present tense form of the verb 'бачити' (bachyty - to see) for 'вони' (vony - they)."
    },
    {
      id: "ua4",
      type: "fill-in-the-blank",
      nativeLanguagePrompt: "Context (English): This is a big city. Fill in the blank with the correct Ukrainian adjective for 'big' agreeing with 'city' (місто - neuter).",
      questionText: "Це ___ місто.",
      correctAnswers: ["велике"],
      correctUsageExample: "Це велике місто.",
      explanation: "'Велике' (velyke) is the neuter singular form of the adjective 'великий' (velykai - big), agreeing with the neuter noun 'місто' (misto - city)."
    }
  ],
  de: [], // Placeholder for German
  it: [], // Placeholder for Italian
  pt: [], // Placeholder for Portuguese
  ru: [], // Placeholder for Russian
  ja: [], // Placeholder for Japanese
  ko: [], // Placeholder for Korean
  zh: [], // Placeholder for Chinese
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
  correctUsageExample: string;
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
    const currentQuestions = (grammarQuestionsData[langCode] && grammarQuestionsData[langCode].length > 0)
                             ? grammarQuestionsData[langCode]
                             : grammarQuestionsData.en; // Fallback to English if no questions for the selected language
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
      setCurrentQuestionIndex(0); // Loop back for now
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
          <Alert variant="default" className="max-w-md">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle>Loading Questions</AlertTitle>
            <AlertDescription>
              Loading grammar questions for {selectedLanguage.name}. If this persists, there might be no questions for this language yet, or an error occurred.
            </AlertDescription>
          </Alert>
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
            Test your knowledge of {selectedLanguage.name} grammar. Prompts and explanations are in {nativeLanguage.name}.
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
                  Context ({nativeLanguage.name}): {currentQuestion.nativeLanguagePrompt}
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
              {!isCorrect && currentQuestion.correctUsageExample && (
                <div className="mb-2">
                  <p className="font-semibold">Correct usage in {selectedLanguage.name}:</p>
                  <p className="italic text-base">{currentQuestion.correctUsageExample}</p>
                </div>
              )}
              <div className="mt-1">
                <p className="font-semibold">Explanation in {nativeLanguage.name}:</p>
                <p>{currentQuestion.explanation}</p>
              </div>
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

