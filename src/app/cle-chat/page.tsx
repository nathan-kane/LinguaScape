
"use client";

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Bot, Languages, Loader2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useLearning } from '@/context/LearningContext';
import type { ChatMessage } from '@/lib/types';
import { getCleConversationResponse, CleConversationInput } from '@/ai/flows/cle-conversation-flow';
import { translateText, TranslateTextInput } from '@/ai/flows/translate-text-flow';
import { useToast } from '@/hooks/use-toast';

const getInitialAiGreeting = (languageName: string, scene: string, wordsCount: number): string => {
  const wordMessage = wordsCount > 0 ? "using your new words" : "about anything you like";
  switch (languageName.toLowerCase()) {
    case 'español':
      return `¡Hola! Bienvenido/a a ${scene}. ¿Sobre qué te gustaría hablar ${wordMessage}?`;
    case 'français':
      return `Bonjour ! Bienvenue à ${scene}. De quoi aimerais-tu parler ${wordMessage} ?`;
    case 'українська':
      return `Привіт! Ласкаво просимо до ${scene}. Про що б ти хотів/хотіла поговорити, ${wordMessage}?`;
    default: // English or other languages
      return `Hello! Welcome to the ${scene}. What would you like to talk about ${wordMessage}?`;
  }
};

function ChatContent() {
  const searchParams = useSearchParams();
  const { selectedLanguage, selectedMode, nativeLanguage } = useLearning();
  const { toast } = useToast();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [isLoadingAiResponse, setIsLoadingAiResponse] = useState(false);
  const [targetWords, setTargetWords] = useState<string[]>([]);
  const [currentScene, setCurrentScene] = useState("a local market"); 

  const [translations, setTranslations] = useState<Record<string, string>>({});
  const [activeTranslationId, setActiveTranslationId] = useState<string | null>(null);
  const [loadingTranslationId, setLoadingTranslationId] = useState<string | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wordsQueryParam = searchParams.get('words');
    let currentTargetWords: string[] = [];
    if (wordsQueryParam) {
      currentTargetWords = wordsQueryParam.split(',');
      setTargetWords(currentTargetWords);
    }
    
    const greetingText = getInitialAiGreeting(selectedLanguage.name, currentScene, currentTargetWords.length);
    setMessages([
      { id: Date.now().toString(), speaker: 'ai', text: greetingText, timestamp: Date.now() }
    ]);
  }, [searchParams, currentScene, selectedLanguage]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleRequestTranslation = async (messageId: string, textToTranslate: string, sourceLanguageName: string) => {
    if (translations[messageId]) {
      // Translation already exists, Popover will show it.
      return;
    }
    setLoadingTranslationId(messageId);
    try {
      const input: TranslateTextInput = {
        textToTranslate,
        sourceLanguageName,
        targetLanguageName: nativeLanguage.name,
      };
      const result = await translateText(input);
      setTranslations(prev => ({ ...prev, [messageId]: result.translatedText }));
    } catch (error) {
      console.error("Error translating text:", error);
      toast({
        title: "Translation Error",
        description: `Could not translate this message to ${nativeLanguage.name}.`,
        variant: "destructive",
      });
      setTranslations(prev => ({ ...prev, [messageId]: `Translation to ${nativeLanguage.name} failed.` }));
    } finally {
      setLoadingTranslationId(null);
    }
  };

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
        targetLanguage: selectedLanguage.name, 
        currentScene: currentScene,
        todaysWords: targetWords,
        userMessage: newUserMessage.text,
        chatHistory: chatHistoryForAI,
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
           <CardDescription className="text-xs">Click the <Languages className="inline h-3 w-3 text-muted-foreground"/> icon on AI messages for translation to {nativeLanguage.name}.</CardDescription>
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
                  {msg.speaker === 'ai' && (
                    <Popover onOpenChange={(open) => {
                      if (open) {
                        setActiveTranslationId(msg.id);
                        handleRequestTranslation(msg.id, msg.text, selectedLanguage.name);
                      } else {
                        setActiveTranslationId(null);
                      }
                    }}>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-7 w-7 p-1 shrink-0 ml-1 rounded-full hover:bg-primary/20">
                          <Languages className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                          <span className="sr-only">Translate</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto max-w-xs sm:max-w-sm md:max-w-md p-3" side="top" align="start">
                        {loadingTranslationId === msg.id && (
                          <div className="flex items-center justify-center py-2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary mr-2" />
                            <span className="text-sm text-muted-foreground">Translating to {nativeLanguage.name}...</span>
                          </div>
                        )}
                        {loadingTranslationId !== msg.id && translations[msg.id] && (
                           <p className="text-sm text-popover-foreground">{translations[msg.id]}</p>
                        )}
                         {loadingTranslationId !== msg.id && !translations[msg.id] && (
                           <p className="text-sm text-muted-foreground italic">Click to translate message.</p>
                        )}
                      </PopoverContent>
                    </Popover>
                  )}
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
            <Input
              type="text"
              placeholder="Type your message..."
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoadingAiResponse}
              className="flex-1 text-base"
            />
            <Button onClick={handleSendMessage} disabled={isLoadingAiResponse || !userInput.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Send className="h-5 w-5" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </CardFooter>
      </Card>
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
