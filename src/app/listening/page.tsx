
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
import { useToast } from "@/hooks/use-toast"; // Added import for useToast

// Placeholder data
const listeningExercises = [
  {
    id: "1",
    title: "Ordering Coffee in Paris",
    audioUrl: "/audio/placeholder-coffee.mp3", // Placeholder, won't actually play unless file exists in /public/audio
    language: "French",
    difficulty: "Beginner",
    transcript: "Bonjour, je voudrais un café, s'il vous plaît. \nOui, bien sûr. Un café noir ou au lait? \nNoir, s'il vous plaît. \nVoilà. Ça fait deux euros.",
    questions: [
      { id: "q1", text: "What did the customer order?", options: [{id: "a", text:"Tea"}, {id: "b", text:"Coffee"}, {id: "c", text:"Croissant"}], correctOptionId: "b" },
      { id: "q2", text: "How much did it cost?", options: [{id: "a", text:"One euro"}, {id: "b", text:"Two euros"}, {id: "c", text:"Three euros"}], correctOptionId: "b" },
    ]
  },
  {
    id: "2",
    title: "Asking for Directions in Madrid",
    audioUrl: "/audio/placeholder-directions.mp3",
    language: "Spanish",
    difficulty: "Beginner",
    transcript: "Perdona, ¿cómo llego al Museo del Prado? \nSiga todo recto y luego gire a la derecha en la segunda calle. \nMuchas gracias. \nDe nada.",
    questions: [
      { id: "q1", text: "What is the person looking for?", options: [{id: "a", text:"A restaurant"}, {id: "b", text:"The Prado Museum"}, {id: "c", text:"A train station"}], correctOptionId: "b" },
      { id: "q2", text: "What is the second instruction?", options: [{id: "a", text:"Turn left"}, {id: "b", text:"Go straight"}, {id: "c", text:"Turn right"}], correctOptionId: "c" },
    ]
  }
];

export default function ListeningPage() {
  const [currentExercise, setCurrentExercise] = useState(listeningExercises[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscript, setShowTranscript] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast(); // Initialized useToast

  useEffect(() => {
    const audioElement = audioRef.current;
    if (audioElement) {
      const handleAudioEnd = () => {
        console.log("Audio ended.");
        setIsPlaying(false);
      };
      audioElement.addEventListener('ended', handleAudioEnd);
      return () => {
        audioElement.removeEventListener('ended', handleAudioEnd);
        if (!audioElement.paused) {
          audioElement.pause();
        }
      };
    }
  }, [currentExercise.audioUrl]); // Re-bind if audio element might change due to key change

  const togglePlay = () => {
    const audioElement = audioRef.current;
    if (!audioElement) {
      console.error("Audio element is not available.");
      toast({
        title: "Audio Error",
        description: "Audio player element not found. Cannot play audio.",
        variant: "destructive",
      });
      setIsPlaying(false); // Ensure state consistency
      return;
    }

    if (isPlaying) {
      audioElement.pause();
      setIsPlaying(false);
      console.log("Audio paused.");
    } else {
      console.log("Attempting to play audio:", audioElement.src);
      audioElement.currentTime = 0; // Ensure playback from the start
      const playPromise = audioElement.play();
      
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
            console.log("Audio playback started.");
          })
          .catch((error) => {
            console.error("Audio playback error:", error);
            let description = "Could not play audio. Please ensure the audio file exists at: " + currentExercise.audioUrl;
            if (error.name === 'NotAllowedError') {
                 description = "Audio playback was not allowed by the browser. Please ensure you've interacted with the page.";
            } else if (error.name === 'NotSupportedError') {
                 description = "The audio format might not be supported or the audio source is invalid/missing: " + currentExercise.audioUrl;
            } else if (error.message) {
                description = `Could not play audio: ${error.message}. Path: ${currentExercise.audioUrl}`;
            }
            toast({
              title: "Audio Playback Failed",
              description: description,
              variant: "destructive",
            });
            setIsPlaying(false);
          });
      } else {
        // This case is highly unlikely with modern browsers.
        console.warn("audioRef.current.play() did not return a Promise.");
        toast({
          title: "Audio Warning",
          description: "Audio playback might be unreliable (play() did not return a promise).",
          variant: "default",
        });
        try {
            audioElement.play(); // Attempt synchronous play
            setIsPlaying(true); // Optimistic update
        } catch (e: any) {
            console.error("Fallback play attempt failed:", e);
            toast({
              title: "Audio Playback Failed",
              description: `Fallback audio play attempt failed: ${e.message}`,
              variant: "destructive",
            });
            setIsPlaying(false);
        }
      }
    }
  };

  const handleAnswerChange = (questionId: string, optionId: string) => {
    setSelectedAnswers(prev => ({ ...prev, [questionId]: optionId }));
    setSubmitted(false); 
  };

  const handleSubmitAnswers = () => {
    setSubmitted(true);
  };
  
  const loadNextExercise = () => {
    const currentIndex = listeningExercises.findIndex(ex => ex.id === currentExercise.id);
    const nextIndex = (currentIndex + 1) % listeningExercises.length;
    setCurrentExercise(listeningExercises[nextIndex]);
    setIsPlaying(false);
    setShowTranscript(false);
    setSelectedAnswers({});
    setSubmitted(false);
    if (audioRef.current) {
        audioRef.current.pause(); 
        audioRef.current.currentTime = 0; 
    }
  };
  
  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.load(); 
        console.log("Audio loaded for new exercise:", currentExercise.audioUrl);
    }
  }, [currentExercise.audioUrl]);


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
              {/* Key change: Adding key={currentExercise.audioUrl} ensures React re-creates the audio element 
                  when the src changes, which helps with reliable ref updates and event listeners. */}
              <audio ref={audioRef} src={currentExercise.audioUrl} key={currentExercise.audioUrl} hidden />
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
                    disabled={false} 
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
            <Button onClick={handleSubmitAnswers} disabled={Object.keys(selectedAnswers).length !== currentExercise.questions.length} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              {submitted ? "Re-Submit Answers" : "Submit Answers"}
            </Button>
          </CardFooter>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}

