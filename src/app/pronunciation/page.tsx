"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, Play, CheckCircle, AlertTriangle, Volume2, Info, ThumbsUp, ThumbsDown } from "lucide-react";
import { useState, useEffect } from 'react';
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { getPronunciationFeedback, PronunciationFeedbackInput, PronunciationFeedbackOutput } from "@/ai/flows/pronunciation-feedback";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

const phrasesToPractice = [
  { id: "1", text: "The quick brown fox jumps over the lazy dog.", language: "English" },
  { id: "2", text: "El perro de San Roque no tiene rabo.", language: "Spanish" },
  { id: "3", text: "Bonjour, comment ça va aujourd'hui ?", language: "French" },
];

export default function PronunciationPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [feedback, setFeedback] = useState<PronunciationFeedbackOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhrase, setCurrentPhrase] = useState(phrasesToPractice[0]);
  const [spokenText, setSpokenText] = useState("");
  const { toast } = useToast();

  // Effect to simulate recording
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setTimeout(() => {
        setIsRecording(false);
        // Simulate creating an audio blob
        setAudioBlob(new Blob(["simulated audio data"], { type: 'audio/webm' }));
        // Simulate speech-to-text
        const slightlyAlteredText = currentPhrase.text.replace(/o/gi, 'a').substring(0, Math.max(10, currentPhrase.text.length - 5));
        setSpokenText(slightlyAlteredText); 
        toast({ title: "Recording finished", description: "Mock audio captured."});
      }, 3000); // Simulate 3 seconds recording
    }
    return () => clearTimeout(timer);
  }, [isRecording, currentPhrase.text, toast]);

  const handleRecord = () => {
    if (isRecording) {
      setIsRecording(false); // Stop recording
    } else {
      setIsRecording(true);
      setAudioBlob(null);
      setFeedback(null);
      setSpokenText("");
      toast({ title: "Recording started...", description: `Practice saying: "${currentPhrase.text}"` });
    }
  };
  
  const handleGetFeedback = async () => {
    if (!spokenText || !currentPhrase) {
      toast({
        title: "Error",
        description: "Please record your pronunciation first or ensure text is available.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);
    setFeedback(null);
    try {
      const input: PronunciationFeedbackInput = {
        spokenText: spokenText,
        targetText: currentPhrase.text,
        language: currentPhrase.language,
      };
      const result = await getPronunciationFeedback(input);
      setFeedback(result);
    } catch (error) {
      console.error("Error getting feedback:", error);
      toast({
        title: "Feedback Error",
        description: "Could not retrieve pronunciation feedback. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const selectNextPhrase = () => {
    const currentIndex = phrasesToPractice.findIndex(p => p.id === currentPhrase.id);
    const nextIndex = (currentIndex + 1) % phrasesToPractice.length;
    setCurrentPhrase(phrasesToPractice[nextIndex]);
    setFeedback(null);
    setAudioBlob(null);
    setSpokenText("");
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Pronunciation Ace
          </h1>
          <p className="text-lg text-muted-foreground">
            Practice speaking and get instant AI-powered feedback.
          </p>
        </section>

        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="h-6 w-6 text-primary" />
              Practice this phrase:
            </CardTitle>
            <Button variant="link" className="p-0 h-auto text-sm" onClick={selectNextPhrase}>
                Try another phrase
            </Button>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-foreground mb-6 p-4 bg-secondary rounded-md">
              {currentPhrase.text}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <Button 
                onClick={handleRecord} 
                disabled={isLoading}
                className={cn(
                  "w-full sm:w-auto text-lg px-8 py-6 transition-all duration-300 ease-in-out",
                  isRecording ? "bg-destructive hover:bg-destructive/90" : "bg-primary hover:bg-primary/90",
                  "text-primary-foreground"
                )}
              >
                <Mic className="mr-2 h-6 w-6" />
                {isRecording ? "Stop Recording" : "Start Recording"}
              </Button>
              {isRecording && (
                <div className="w-full sm:w-1/2">
                  <Progress value={undefined} className="h-3 animate-pulse" />
                  <p className="text-sm text-muted-foreground text-center mt-1">Recording...</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {spokenText && !feedback && !isLoading && (
          <Card className="shadow-md bg-card">
            <CardHeader>
              <CardTitle>Your Attempt</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea value={spokenText} readOnly className="mb-4 bg-secondary/50" rows={3}/>
              <Button onClick={handleGetFeedback} disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? "Getting Feedback..." : "Get AI Feedback"}
              </Button>
            </CardContent>
          </Card>
        )}
        
        {isLoading && (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Analyzing your pronunciation...</p>
            </div>
        )}

        {feedback && (
          <Card className="shadow-lg bg-card border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl text-primary">
                <CheckCircle className="h-7 w-7" /> Feedback Results
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert variant="default" className="bg-secondary/50">
                <ThumbsUp className="h-5 w-5 text-green-600" />
                <AlertTitle className="font-semibold text-lg">Overall Feedback</AlertTitle>
                <AlertDescription className="text-base">
                  {feedback.overallFeedback}
                </AlertDescription>
              </Alert>

              {feedback.specificGuidance && feedback.specificGuidance.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">Specific Guidance:</h3>
                  <div className="space-y-4">
                    {feedback.specificGuidance.map((item, index) => (
                      <Alert key={index} variant="default" className="border-accent">
                        <Info className="h-5 w-5 text-accent" />
                        <AlertTitle className="font-semibold text-accent">{item.sound}</AlertTitle>
                        <AlertDescription>{item.tip}</AlertDescription>
                      </Alert>
                    ))}
                  </div>
                </div>
              )}
               {!feedback.specificGuidance || feedback.specificGuidance.length === 0 && (
                 <p className="text-muted-foreground">No specific sounds needed major correction. Great job!</p>
               )}
            </CardContent>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
}
