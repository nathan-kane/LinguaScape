"use client";

import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, BookOpen, PlusCircle, ListChecks, HelpCircle } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react"; // Import useState

// Placeholder for flashcard component
const FlashcardPlaceholder = ({ front, back, showBack }: { front: string, back: string, showBack: boolean }) => (
  <div className="relative w-full max-w-md h-64 rounded-xl shadow-xl perspective group cursor-pointer">
    <div className={`relative w-full h-full preserve-3d transition-transform duration-700 ${showBack ? 'rotate-y-180' : ''}`}>
      {/* Front of card */}
      <div className="absolute w-full h-full backface-hidden bg-card border border-border rounded-xl flex flex-col items-center justify-center p-6">
        <h3 className="text-3xl font-bold text-center text-foreground">{front}</h3>
        <p className="text-sm text-muted-foreground mt-4">Click to reveal</p>
      </div>
      {/* Back of card */}
      <div className="absolute w-full h-full backface-hidden bg-accent text-accent-foreground border border-accent rounded-xl flex flex-col items-center justify-center p-6 rotate-y-180">
        <h3 className="text-2xl font-semibold text-center">{back}</h3>
        <p className="text-sm mt-2">Example: "La casa es bonita."</p>
      </div>
    </div>
  </div>
);


export default function VocabularyPage() {
  const [showBack, setShowBack] = useState(false); // Manage flip state

  const handleCardClick = () => {
    setShowBack(!showBack);
  };

  const stats = [
    { label: "Words to Review", value: 25, icon: <ListChecks className="text-primary" /> },
    { label: "New Words Today", value: 5, icon: <PlusCircle className="text-primary" /> },
    { label: "Words Mastered", value: 150, icon: <Zap className="text-primary" /> },
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        <section className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
              Vocabulary Master
            </h1>
            <p className="text-lg text-muted-foreground">
              Strengthen your vocabulary with our Spaced Repetition System.
            </p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <PlusCircle className="mr-2 h-5 w-5" /> Add New Words
          </Button>
        </section>

        {/* Main Flashcard Review Area */}
        <section className="flex flex-col items-center gap-8 py-8">
          <div onClick={handleCardClick}> {/* Add click handler to toggle */}
            <FlashcardPlaceholder front="Hola" back="Hello" showBack={showBack} />
          </div>
          <div className="flex gap-4 mt-4">
            <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive/10 w-28">Again</Button>
            <Button variant="outline" className="border-yellow-500 text-yellow-600 hover:bg-yellow-500/10 w-28">Hard</Button>
            <Button variant="outline" className="border-green-500 text-green-600 hover:bg-green-500/10 w-28">Good</Button>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground w-28">Easy</Button>
          </div>
          <p className="text-sm text-muted-foreground">
            Based on your recall, words will be shown at increasing intervals.
          </p>
        </section>

        {/* Stats Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map(stat => (
            <Card key={stat.label} className="shadow-lg bg-card">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          ))}
        </section>

        {/* Additional Actions */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
            <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                    <BookOpen className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg font-headline">Browse Vocabulary</CardTitle>
                </div>
              <CardDescription>Explore all words, filter by status, or search specific terms.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/vocabulary/browse">Go to Word List</Link>
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-md hover:shadow-lg transition-shadow bg-card">
             <CardHeader>
                <div className="flex items-center gap-3 mb-1">
                    <HelpCircle className="h-6 w-6 text-accent" />
                    <CardTitle className="text-lg font-headline">How SRS Works</CardTitle>
                </div>
              <CardDescription>Learn about the science behind spaced repetition for effective learning.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href="/help/srs">Learn More</Link>
              </Button>
            </CardContent>
          </Card>
        </section>

      </div>
      <style jsx global>{`
        .perspective { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .rotate-y-180 { transform: rotateY(180deg); }
        .backface-hidden { backface-visibility: hidden; }
      `}</style>
    </AuthenticatedLayout>
  );
}
