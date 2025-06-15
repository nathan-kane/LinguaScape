
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Bot, Zap, AlertCircle, Mic } from "lucide-react";
import { useLearning } from '@/context/LearningContext';
import type { ChatMessage } from '@/lib/types';
import { getCleConversationResponse, CleConversationInput } from '@/ai/flows/cle-conversation-flow';
import { useToast } from '@/hooks/use-toast';

// Helper component to access searchParams within Suspense boundary
function ChatContent() {
  const searchParams = useSearchParams();
  const { selectedLanguage, selectedMode } = useLearning();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState("at a local market"); // Example scene

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wordsQueryParam = searchParams.get('words');
    if (wordsQueryParam) {
      setTargetWords(wordsQueryParam.split(','));
    }
    // Initial greeting from AI
    setMessages([
      { id: Date.now().toString(), speaker: 'ai', text: `¡Hola! Welcome to the ${currentScene}. What would you like to talk about using your new words?`, timestamp: Date.now() }
    ]);
  }, [searchParams, currentScene]);

  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!userInput.trim()) return;

    const newUserMessage: ChatMessage = {
      id: Date.now().toString(),
      speaker: 'user',
      text: userInput,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, newUserMessage]);
    setUserInput("");
    setIsLoadingAiResponse(true);

    try {
      const chatHistoryForAI = messages.map(m => ({ speaker: m.speaker, text: m.text }));
      
      const input: CleConversationInput = {
        targetLanguage: selectedLanguage.name, // Or selectedLanguage.code, adjust flow accordingly
        currentScene: currentScene,
        todaysWords: targetWords,
        userMessage: newUserMessage.text,
        chatHistory: chatHistoryForAI,
        // userId: authUser.uid - if needed by flow for personalization
      };

      const aiResponse = await getCleConversationResponse(input);

      if (aiResponse && aiResponse.aiResponseText) {
        const newAiMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          speaker: 'ai',
          text: aiResponse.aiResponseText,
          timestamp: Date.now(),
        };
        setMessages(prev => [...prev, newAiMessage]);
      } else {
        throw new Error("AI did not return a valid response.");
      }

    } catch (error) {
      console.error("Error getting AI response:", error);
      toast({
        title: "AI Error",
        description: "Sorry, I couldn't get a response from the AI tutor. Please try again.",
        variant: "destructive",
      });
      const errorAiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        speaker: 'ai',
        text: "I'm having a little trouble connecting right now. Let's try that again in a moment!",
        timestamp: Date.now(),
      };
      setMessages(prev => [...prev, errorAiMessage]);
    } finally {
      setIsLoadingAiResponse(false);
    }
  };
  
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !isLoadingAiResponse) {
      handleSendMessage();
    }
  };


  return (
    <div className="space-y-8">
      <section>
        <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
          AI Conversation Practice
        </h1>
        <p className="text-lg text-muted-foreground">
          Chat with our AI tutor in {selectedLanguage.name} ({selectedMode.name} mode).
        </p>
        <p className="text-sm text-accent">Scene: {currentScene}</p>
      </section>

      <Card className="shadow-xl bg-card h-[600px] flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-primary" /> Chat with LinguaBot
          </CardTitle>
          {targetWords.length > 0 && (
            <CardDescription>Try to use these words: <span className="font-semibold text-accent">{targetWords.join(', ')}</span></CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${
                    msg.speaker === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {msg.speaker === 'ai' && <Bot className="h-8 w-8 text-primary shrink-0 mb-1" />}
                  <div
                    className={`max-w-[70%] p-3 rounded-xl shadow ${
                      msg.speaker === 'user'
                        ? 'bg-primary text-primary-foreground rounded-br-none'
                        : 'bg-secondary text-secondary-foreground rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                  </div>
                  {msg.speaker === 'user' && <User className="h-8 w-8 text-muted-foreground shrink-0 mb-1" />}
                </div>
              ))}
              {isLoadingAiResponse && (
                 <div className="flex items-end gap-2 justify-start">
                    <Bot className="h-8 w-8 text-primary shrink-0 mb-1" />
                    <div className="max-w-[70%] p-3 rounded-xl shadow bg-secondary text-secondary-foreground rounded-bl-none">
                        <p className="text-sm italic">LinguaBot is typing...</p>
                    </div>
                 </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
        <CardFooter className="border-t p-4">
          <div className="flex w-full items-center gap-2">
            {/* Placeholder for word bank/scaffolding button */}
            {/* <Button variant="outline" size="icon" className="shrink-0">
              <Zap className="h-5 w-5" /> 
            </Button> */}
            <Input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoadingAiResponse}
              className="flex-1 text-base"
            />
            {/* <Button variant="outline" size="icon" className="shrink-0" disabled={isLoadingAiResponse}>
              <Mic className="h-5 w-5" />
            </Button> */}
            <Button onClick={handleSendMessage} disabled={isLoadingAiResponse || !userInput.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Placeholder for sentence scaffolding / word bank */}
      {/* <Card className="shadow-md bg-card">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Zap className="h-5 w-5 text-accent"/>Need help?</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Word suggestions or sentence starters will appear here.</p>
        </CardContent>
      </Card> */}
    </div>
  );
}


export default function CleChatPage() {
  return (
    <AuthenticatedLayout>
      <Suspense fallback={<div className="flex justify-center items-center h-64">Loading chat...</div>}>
        <ChatContent />
      </Suspense>
    </AuthenticatedLayout>
  );
}
