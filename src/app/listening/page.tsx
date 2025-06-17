
"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, PlayCircle, PauseCircle, FileText, MessageCircleQuestion, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useEffect, useCallback, useRef } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useLearning } from "@/context/LearningContext";
import { mapToBCP47 } from "@/lib/tts-utils";
import { generateListeningExercise, type GenerateListeningExerciseInput, type GenerateListeningExerciseOutput } from "@/ai/flows/generate-listening-exercise-flow";

export default function ListeningPage() {
  const { selectedLanguage, nativeLanguage, isLoadingPreferences } = useLearning();
  const { toast } = useToast();

  const [currentExercise, setCurrentExercise] = useState<GenerateListeningExerciseOutput | null>(null);
  const [isLoadingContent, setIsLoadingContent] = useState(true);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [errorLoadingContent, setErrorLoadingContent] = useState<string | null>(null);

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadNewExercise = useCallback(async () => {
    if (isLoadingPreferences || !selectedLanguage || !nativeLanguage) return;

    setIsLoadingContent(true);
    setCurrentExercise(null);
    setSelectedAnswers({});
    setSubmitted(false);
    setShowTranscript(false);
    setErrorLoadingContent(null);
    speechSynthesis.cancel(); // Stop any ongoing speech

    try {
      const input: GenerateListeningExerciseInput = {
        targetLanguageName: selectedLanguage.name,
        targetLanguageCode: mapToBCP47(selectedLanguage.code), // For TTS lang hint
        nativeLanguageName: nativeLanguage.name,
        difficulty: "beginner", // Or make this selectable later
      };
      const exercise = await generateListeningExercise(input);
      setCurrentExercise(exercise);
    } catch (error: any) {
      console.error("Error generating listening exercise:", error);
      setErrorLoadingContent(error.message || "Failed to load a new listening exercise.");
      toast({
        title: "Content Generation Error",
        description: error.message || "Could not generate a new listening exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingContent(false);
    }
  }, [selectedLanguage, nativeLanguage, isLoadingPreferences, toast]);

  useEffect(() => {
    if (!isLoadingPreferences) {
      loadNewExercise();
    }
    // Cleanup function to cancel speech synthesis when component unmounts or dependencies change
    return () => {
      if (speechSynthesis.speaking) {
        speechSynthesis.cancel();
      }
    };
  }, [loadNewExercise, isLoadingPreferences]);


  const togglePlay = () => {
    if (!currentExercise || !currentExercise.transcript) {
      toast({ title: "No content", description: "No transcript available to play.", variant: "destructive" });
      return;
    }

    if (isSpeaking) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(currentExercise.transcript);
      utterance.lang = mapToBCP47(selectedLanguage.code);
      
      utterance.onstart = () => {
        setIsSpeaking(true);
        console.log("TTS started for lang:", utterance.lang);
      };
      utterance.onend = () => {
        setIsSpeaking(false);
        console.log("TTS ended.");
      };
      utterance.onerror = (event) => {
        console.error("SpeechSynthesisUtterance.onerror", event);
        setIsSpeaking(false);
        toast({
          title: "Audio Playback Error",
          description: `Could not play audio: ${event.error}. Ensure your browser supports TTS for ${selectedLanguage.name}.`,
          variant: "destructive",
        });
      };
      utteranceRef.current = utterance;
      speechSynthesis.speak(utterance);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSubmitted(false); 
  };

  const handleSubmitAnswers = () => {
    if (!currentExercise) return;
    // Check if all questions are answered
    const allAnswered = currentExercise.questions.every(q => selectedAnswers[q.id]);
    if (!allAnswered) {
      toast({
        title: "Missing Answers",
        description: "Please answer all questions before submitting.",
        variant: "destructive"
      });
      return;
    }
    setSubmitted(true);
  };
  
  if (isLoadingPreferences || isLoadingContent) {
    return (
      <AuthenticatedLayout>
        <div className="flex flex-col justify-center items-center h-64 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-lg text-muted-foreground">Generating your listening exercise in {selectedLanguage.name}...</p>
          <p className="text-sm text-muted-foreground">This may take a moment.</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (errorLoadingContent && !currentExercise) {
    return (
      <AuthenticatedLayout>
        <Alert variant="destructive" className="max-w-lg mx-auto">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Failed to Load Exercise</AlertTitle>
          <AlertDescription>
            <p>{errorLoadingContent}</p>
            <Button onClick={loadNewExercise} variant="outline" size="sm" className="mt-3">
              Try Again
            </Button>
          </AlertDescription>
        </Alert>
      </AuthenticatedLayout>
    );
  }

  if (!currentExercise) {
    return (
      <AuthenticatedLayout>
        <div className="text-center py-10">
          <p className="text-lg text-muted-foreground">No listening exercise loaded. Try refreshing.</p>
          <Button onClick={loadNewExercise} className="mt-4">Load Exercise</Button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Contextual Listener
          </h1>
          <p className="text-lg text-muted-foreground">
            Improve your {currentExercise.languageName} comprehension with AI-generated scenarios.
          </p>
        </section>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <div>
                    <CardTitle className="flex items-center gap-2 text-2xl">
                        <Headphones className="h-7 w-7 text-primary" />
                        {currentExercise.title}
                    </CardTitle>
                    <CardDescription>Language: {currentExercise.languageName} | Difficulty: {currentExercise.difficulty}</CardDescription>
                </div>
                <Button onClick={loadNewExercise} variant="outline" className="mt-2 sm:mt-0" disabled={isLoadingContent || isSpeaking}>
                    Next Exercise <ChevronRight className="ml-1 h-5 w-5"/>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-secondary rounded-lg">
              <Button onClick={togglePlay} size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isLoadingContent}>
                {isSpeaking ? <PauseCircle className="mr-2 h-6 w-6" /> : <PlayCircle className="mr-2 h-6 w-6" />}
                {isSpeaking ? "Pause Audio" : "Play Audio"}
              </Button>
            </div>

            <Button onClick={() => setShowTranscript(!showTranscript)} variant="outline" className="w-full sm:w-auto">
              <FileText className="mr-2 h-5 w-5" />
              {showTranscript ? "Hide Transcript" : "Show Transcript"}
            </Button>

            {showTranscript && (
              <ScrollArea className="h-40 p-4 border rounded-md bg-secondary/30">
                <pre className="whitespace-pre-wrap text-sm font-code text-foreground leading-relaxed">
                  {currentExercise.transcript}
                </pre>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {currentExercise.questions && currentExercise.questions.length > 0 && (
          <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageCircleQuestion className="h-6 w-6 text-accent" />
                Comprehension Questions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {currentExercise.questions.map((q, index) => (
                <div key={q.id} className="p-4 border rounded-lg bg-background">
                  <p className="font-semibold mb-3 text-foreground">{index + 1}. {q.text}</p>
                  <RadioGroup 
                      value={selectedAnswers[q.id] || ""}
                      onValueChange={(value) => handleAnswerChange(q.id, value)}
                      disabled={submitted} 
                      className="space-y-2"
                  >
                    {q.options.map(opt => (
                      <div key={opt.id} className="flex items-center space-x-2 p-2 rounded hover:bg-secondary/50 transition-colors">
                        <RadioGroupItem value={opt.id} id={`${q.id}-${opt.id}`} />
                        <Label htmlFor={`${q.id}-${opt.id}`} className="cursor-pointer flex-1">{opt.text}</Label>
                      </div>
                    ))}
                  </RadioGroup>
                  {submitted && selectedAnswers[q.id] && ( 
                      <Alert variant={selectedAnswers[q.id] === q.correctOptionId ? "default" : "destructive"} className="mt-3 text-sm p-2">
                          {selectedAnswers[q.id] === q.correctOptionId ? "Correct!" : `Incorrect. The correct answer was "${q.options.find(o=>o.id === q.correctOptionId)?.text}".`}
                      </Alert>
                  )}
                  {submitted && !selectedAnswers[q.id] && ( 
                      <Alert variant="destructive" className="mt-3 text-sm p-2">
                          Please select an answer for this question.
                      </Alert>
                  )}
                </div>
              ))}
            </CardContent>
            <CardFooter>
              <Button onClick={handleSubmitAnswers} disabled={Object.keys(selectedAnswers).length !== currentExercise.questions.length || submitted} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                Submit Answers
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
