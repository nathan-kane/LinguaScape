import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Zap, Target, MessageSquareHeart } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/shared/Logo";
import { APP_NAME, APP_DESCRIPTION, LEARNING_MODES, SUPPORTED_LANGUAGES } from "@/lib/constants";

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: "Vocabulary Master",
    description: "Retain vocabulary with our Spaced Repetition System (SRS), optimizing long-term memory.",
  },
  {
    icon: <CheckCircle className="h-8 w-8 text-primary" />,
    title: "Pronunciation Ace",
    description: "Get AI-powered feedback on your pronunciation for difficult sounds.",
  },
  {
    icon: <Target className="h-8 w-8 text-primary" />,
    title: "Grammar Pro",
    description: "Sharpen your grammar with targeted drills and clear explanations.",
  },
  {
    icon: <MessageSquareHeart className="h-8 w-8 text-primary" />,
    title: "Contextual Listener",
    description: "Improve comprehension with audio clips from native speakers and transcripts.",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/30">
      <header className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto flex justify-between items-center">
          <Logo iconSize={32} textSize="text-3xl" />
          <nav className="space-x-4">
            <Button variant="ghost" asChild>
              <Link href="#features">Features</Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="#languages">Languages</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-20 md:py-32 text-center bg-cover bg-center" style={{ backgroundImage: "url('https://placehold.co/1920x1080.png')" }} data-ai-hint="language learning abstract">
          <div className="container mx-auto px-4 relative z-10 bg-black/30 backdrop-blur-sm p-10 rounded-xl max-w-3xl">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-primary-foreground mb-6">
              Unlock Your Language Potential with <span className="text-accent">{APP_NAME}</span>
            </h1>
            <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 max-w-2xl mx-auto">
              {APP_DESCRIPTION} Dive into interactive lessons, master vocabulary, perfect your pronunciation, and track your progress seamlessly.
            </p>
            <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6" asChild>
              <Link href="/dashboard">Start Learning Today</Link>
            </Button>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-foreground">
              Why Choose <span className="text-primary">{APP_NAME}</span>?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-4 w-fit mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-headline text-foreground">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        {/* Languages Section */}
        <section id="languages" className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-foreground">
              Explore a World of Languages
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {SUPPORTED_LANGUAGES.slice(0, 8).map(lang => ( // Show a subset for brevity
                <div key={lang.code} className="flex items-center gap-2 p-3 px-4 bg-card rounded-lg shadow-md">
                  <span className="text-2xl">{lang.flag}</span>
                  <span className="font-medium text-foreground">{lang.name}</span>
                </div>
              ))}
            </div>
            <p className="text-center mt-6 text-muted-foreground">...and many more coming soon!</p>
          </div>
        </section>

        {/* Learning Modes Section */}
        <section id="modes" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-foreground">
              Tailor Your Learning Experience
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {LEARNING_MODES.slice(0,4).map((mode) => (
                <Card key={mode.id} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card">
                  <CardHeader>
                    <CardTitle className="text-xl font-headline text-primary">{mode.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{mode.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>


        {/* Call to Action Section */}
        <section className="py-20 md:py-32 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-6">
              Ready to Begin Your Language Journey?
            </h2>
            <p className="text-lg md:text-xl mb-10 max-w-xl mx-auto">
              Join thousands of learners and start speaking a new language with confidence.
            </p>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-accent-foreground" asChild>
              <Link href="/dashboard">Sign Up for Free</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 text-center border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <Logo iconSize={24} textSize="text-lg" className="justify-center mb-4" />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
