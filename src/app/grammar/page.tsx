import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit3, CheckSquare, XSquare, ChevronRight, ChevronLeft, BookText } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Placeholder data for grammar questions
const grammarQuestions = [
  {
    id: "1",
    type: "multiple-choice",
    questionText: "Which sentence is grammatically correct?",
    options: [
      { id: "a", text: "He go to the store." },
      { id: "b", text: "He goes to the store." },
      { id: "c", text: "He going to the store." },
    ],
    correctOptionId: "b",
    explanation: "'Goes' is the correct third-person singular present tense form of the verb 'to go'."
  },
  {
    id: "2",
    type: "fill-in-the-blank",
    questionText: "She ___ (to be) very happy yesterday.",
    correctAnswers: ["was"],
    explanation: "'Was' is the past tense form of 'to be' for a singular subject like 'she'."
  },
];

// This would typically be managed with useState
let currentQuestionIndex = 0;
let selectedAnswer = ""; // For multiple choice
let fillBlankAnswer = ""; // For fill-in-the-blank
let showFeedback = false;
let isCorrect = false;

export default function GrammarPage() {
  const currentQuestion = grammarQuestions[currentQuestionIndex];

  const handleSubmitAnswer = () => {
    // Logic to check answer and show feedback
    showFeedback = true;
    if (currentQuestion.type === "multiple-choice") {
      isCorrect = selectedAnswer === currentQuestion.correctOptionId;
    } else {
      // Simplified check for fill-in-the-blank
      isCorrect = fillBlankAnswer.toLowerCase() === currentQuestion.correctAnswers?.[0].toLowerCase();
    }
    // In a real app, update state here
  };

  const handleNextQuestion = () => {
    currentQuestionIndex = (currentQuestionIndex + 1) % grammarQuestions.length;
    showFeedback = false;
    selectedAnswer = "";
    fillBlankAnswer = "";
    // In a real app, update state here
  };
  
  const progressPercentage = ((currentQuestionIndex + 1) / grammarQuestions.length) * 100;


  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Grammar Pro
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
                <span className="text-sm text-muted-foreground">Question {currentQuestionIndex + 1} of {grammarQuestions.length}</span>
            </div>
             <Progress value={progressPercentage} className="w-full mt-2 h-2" />
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-xl font-semibold text-foreground min-h-[60px]">
              {currentQuestion.questionText}
            </p>

            {currentQuestion.type === "multiple-choice" && currentQuestion.options && (
              <RadioGroup 
                defaultValue={selectedAnswer} 
                onValueChange={(value) => selectedAnswer = value}
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
              <input
                type="text"
                defaultValue={fillBlankAnswer}
                onChange={(e) => fillBlankAnswer = e.target.value}
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
                    Next Question <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
            )}
          </CardFooter>
        </Card>

        {showFeedback && (
          <Alert variant={isCorrect ? "default" : "destructive"} className={isCorrect ? "border-green-500 bg-green-500/10" : "border-red-500 bg-red-500/10"}>
            {isCorrect ? <CheckSquare className="h-5 w-5 text-green-600" /> : <XSquare className="h-5 w-5 text-red-600" />}
            <AlertTitle className={isCorrect ? "text-green-700" : "text-red-700"}>
              {isCorrect ? "Correct!" : "Incorrect"}
            </AlertTitle>
            <AlertDescription className={isCorrect ? "text-green-600" : "text-red-600"}>
              {currentQuestion.explanation}
            </AlertDescription>
          </Alert>
        )}
        
        <Card className="shadow-md bg-card">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl font-headline"><BookText className="h-6 w-6 text-primary"/>Grammar Topics</CardTitle>
                <CardDescription>Review specific grammar rules and concepts.</CardDescription>
            </CardHeader>
            <CardContent>
                <ul className="space-y-2">
                    {["Present Tense", "Past Tense", "Articles", "Prepositions", "Sentence Structure"].map(topic => (
                        <li key={topic}>
                            <Button variant="link" className="p-0 h-auto text-primary hover:text-accent">
                                {topic}
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
