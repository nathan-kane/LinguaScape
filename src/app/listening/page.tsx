"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Headphones, PlayCircle, PauseCircle, FileText, MessageCircleQuestion, ChevronRight } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useState, useRef, useEffect } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// Placeholder data
const listeningExercises = [
  {
    id: "1",
    title: "Ordering Coffee in Paris",
    audioUrl: "/audio/placeholder-coffee.mp3", // Placeholder, won't actually play
    language: "French",
    difficulty: "Beginner",
    transcript: "Bonjour, je voudrais un café, s'il vous plaît. \nOui, bien sûr. Un café noir ou au lait? \nNoir, s'il vous plaît. \nVoilà. Ça fait deux euros.",
    questions: [
      { id: "q1", text: "What did the customer order?", options: [{id: "a", text:"Tea"}, {id: "b", text:"Coffee"}, {id: "c", text:"Croissant"}], correctOptionId: "b" },
      { id: "q2", text: "How much did it cost?", options: [{id: "a", text:"One euro"}, {id: "b", text:"Two euros"}, {id: "c", text:"Three euros"}], correctOptionId: "b" },
    ]
  },
  // Add more exercises
];

export default function ListeningPage() {
  const [currentExercise, setCurrentExercise] = useState(listeningExercises[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        // audioRef.current.play(); // This would play if audio existed
        alert("Audio playback is simulated.");
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSubmitted(false);
  };

  const handleSubmitAnswers = () => {
    setSubmitted(true);
    // In a real app, calculate score etc.
  };
  
  const loadNextExercise = () => {
    // Cycle through exercises (placeholder logic)
    const currentIndex = listeningExercises.findIndex(ex => ex.id === currentExercise.id);
    const nextIndex = (currentIndex + 1) % listeningExercises.length;
    setCurrentExercise(listeningExercises[nextIndex]);
    setIsPlaying(false);
    setShowTranscript(false);
    setSelectedAnswers({});
    setSubmitted(false);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Contextual Listener
          </h1>
          <p className="text-lg text-muted-foreground">
            Improve your comprehension with real-life audio scenarios.
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
                    <CardDescription>Language: {currentExercise.language} | Difficulty: {currentExercise.difficulty}</CardDescription>
                </div>
                <Button onClick={loadNextExercise} variant="outline" className="mt-2 sm:mt-0">
                    Next Exercise <ChevronRight className="ml-1 h-5 w-5"/>
                </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-center p-6 bg-secondary rounded-lg">
              <audio ref={audioRef} src={currentExercise.audioUrl} hidden />
              <Button onClick={togglePlay} size="lg" className="text-lg px-8 py-6 bg-primary hover:bg-primary/90 text-primary-foreground">
                {isPlaying ? <PauseCircle className="mr-2 h-6 w-6" /> : <PlayCircle className="mr-2 h-6 w-6" />}
                {isPlaying ? "Pause Audio" : "Play Audio"}
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
                {submitted && (
                    <Alert variant={selectedAnswers[q.id] === q.correctOptionId ? "default" : "destructive"} className="mt-3 text-sm p-2">
                        {selectedAnswers[q.id] === q.correctOptionId ? "Correct!" : `Incorrect. The correct answer was "${q.options.find(o=>o.id === q.correctOptionId)?.text}".`}
                    </Alert>
                )}
              </div>
            ))}
          </CardContent>
          <CardFooter>
            <Button onClick={handleSubmitAnswers} disabled={Object.keys(selectedAnswers).length !== currentExercise.questions.length || submitted} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {submitted ? "Answers Submitted" : "Submit Answers"}
            </Button>
          </CardFooter>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}
