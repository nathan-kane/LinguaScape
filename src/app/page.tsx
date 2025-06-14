
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/shared/Logo";
import { APP_NAME, APP_DESCRIPTION } from "@/lib/constants";
import { Brain, MicVocal, BookText, Headphones, Flame, Sparkles, CheckCircle, BookOpen, Edit3, Mic } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import React from "react";

const keyFeatures = [
  {
    icon: <Brain className="h-10 w-10 text-primary mb-4" />,
    title: "Smart Vocabulary Retention",
    description: "Our robust Spaced Repetition System (SRS), similar to Anki's powerful method, optimizes your vocabulary and phrase retention. It presents 'cards' at increasingly longer intervals, ensuring new words move from short-term to long-term memory with minimal effort.",
    benefit: "Remember more, forget less, and build a strong vocabulary foundation effortlessly.",
    imagePlaceholder: { src: "https://placehold.co/400x300.png", hint: "app screenshot vocabulary" }
  },
  {
    icon: <MicVocal className="h-10 w-10 text-primary mb-4" />,
    title: "Confident Pronunciation Coaching",
    description: "Receive specific, AI-powered pronunciation feedback, akin to Pimsleur's AI Voice Coach and Babbel's speech recognition tools. Get guidance on challenging sounds, helping you refine your accent and speak confidently, like a native.",
    benefit: "Speak clearly and confidently, knowing your pronunciation is accurate.",
    imagePlaceholder: { src: "https://placehold.co/400x300.png", hint: "app screenshot pronunciation" }
  },
  {
    icon: <BookText className="h-10 w-10 text-primary mb-4" />,
    title: "Clear Grammar Understanding",
    description: "Engage in interactive grammar drills that target common difficulties like the case system or correct verb forms. Our exercises provide clear explanations for why an answer is wrong and how sentences should be structured, helping you move beyond memorized knowledge to structure original thoughts.",
    benefit: "Master grammar rules intuitively and construct sentences with ease.",
    imagePlaceholder: { src: "https://placehold.co/400x300.png", hint: "app screenshot grammar" }
  },
  {
    icon: <Headphones className="h-10 w-10 text-primary mb-4" />,
    title: "Real-World Listening Immersion",
    description: "Develop your comprehension with contextual audio clips featuring native speakers at a natural conversational pace. Focus on understanding total sentence meaning, including colloquialisms and slang, with synchronized transcripts for active listening and review.",
    benefit: "Understand native speakers naturally, in real-life conversations.",
    imagePlaceholder: { src: "https://placehold.co/400x300.png", hint: "app screenshot listening" }
  },
  {
    icon: <Flame className="h-10 w-10 text-primary mb-4" />,
    title: "Motivating Progress & Gamification",
    description: "Stay engaged and consistent with basic gamified elements and clear progress tracking. Track your 'words learned' and 'daily streak', mitigating the feeling of a 'plateau' and helping you make oneself study regularly to achieve your goals.",
    benefit: "Stay motivated and see your progress, making learning a rewarding habit.",
    imagePlaceholder: { src: "https://placehold.co/400x300.png", hint: "app screenshot progress" }
  },
  {
    icon: <Sparkles className="h-10 w-10 text-primary mb-4" />,
    title: "Curated, Relevant Content",
    description: "Focus on what matters most with a highly practical and relevant core vocabulary dataset for everyday communication. Our content directly addresses criticisms of 'irrelevant vocabulary' in other apps, supporting your goal to speak and structure original thoughts effectively.",
    benefit: "Learn practical language you can use immediately in real conversations.",
    imagePlaceholder: { src: "https://placehold.co/400x300.png", hint: "app screenshot content" }
  },
];

const testimonials = [
  {
    quote: "I've tried so many apps, but LinguaScape is the first one where I actually feel like I'm making progress. The pronunciation feedback is a game-changer!",
    name: "Maria S.",
    role: "Spanish Learner",
    avatarHint: "woman smiling"
  },
  {
    quote: "Finally, an app that helps me remember vocabulary! The SRS system is fantastic, and I love tracking my streaks.",
    name: "John B.",
    role: "French Learner",
    avatarHint: "man glasses"
  },
  {
    quote: "Understanding native speakers used to be my biggest challenge. The listening exercises on LinguaScape have made a huge difference.",
    name: "Aisha K.",
    role: "English Learner",
    avatarHint: "woman headscarf"
  },
];

const howItWorksSteps = [
  { number: "1", title: "Learn", description: "Engage with smart lessons and curated content." , icon: <BookOpen className="h-8 w-8 text-primary" />},
  { number: "2", title: "Practice", description: "Reinforce your knowledge with interactive exercises." , icon: <Edit3 className="h-8 w-8 text-primary" />},
  { number: "3", title: "Speak", description: "Gain confidence with pronunciation coaching and real-world scenarios." , icon: <Mic className="h-8 w-8 text-primary" />},
];

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background to-secondary/10 font-body">
      <header className="sticky top-0 z-50 py-4 px-4 sm:px-6 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto flex justify-between items-center">
          <Logo iconSize={32} textSize="text-3xl" />
          <nav className="space-x-2 sm:space-x-4">
            <Button variant="ghost" asChild>
              <Link href="#features">Features</Link>
            </Button>
            {/* <Button variant="ghost" asChild>
              <Link href="#languages">Languages</Link>
            </Button> */}
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 sm:px-6">
              <Link href="/dashboard">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 text-center" >
          <Image 
            src="https://placehold.co/1920x1080.png" 
            alt="Language learning abstract background" 
            fill={true}
            style={{objectFit: 'cover'}}
            className="opacity-30"
            data-ai-hint="language learning abstract"
            priority
          />
          <div className="container mx-auto px-4 relative z-10">
            <div className="bg-background/70 dark:bg-background/50 backdrop-blur-md p-8 sm:p-10 rounded-xl max-w-3xl mx-auto shadow-xl">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-bold text-foreground mb-6">
                Unlock True Fluency: Master Any Language with <span className="text-primary">Confidence</span> and <span className="text-accent">Ease</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Our intelligent system and real-world approach transform common language learning struggles into confident, natural conversations.
              </p>
              <Button size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground text-lg px-8 py-6 shadow-lg hover:shadow-xl transition-shadow" asChild>
                <Link href="/dashboard">Start Your Free Journey Today!</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Problem & Solution Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-headline font-bold text-foreground mb-6">
                Tired of Forgetting Words and Fearing Mistakes?
              </h2>
              <p className="text-lg text-muted-foreground mb-4">
                Many language learners struggle with retaining vocabulary, perfecting pronunciation without feeling judged, understanding fast native speech, or simply staying motivated. It's easy to hit a plateau and feel like you're not making real progress.
              </p>
              <p className="text-lg text-foreground font-semibold mb-8">
                <span className="text-primary">{APP_NAME}</span> is designed to turn these frustrations into fuel for your fluency. We tackle these challenges head-on.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-10 items-center">
              <div className="space-y-6">
                  <h3 className="text-2xl font-headline font-semibold text-primary">Your Path to Confident Communication</h3>
                  <p className="text-muted-foreground text-md">
                      At <span className="font-semibold text-foreground">{APP_NAME}</span>, we believe learning a language should be effective and enjoyable. Our app provides:
                  </p>
                  <ul className="space-y-3">
                      {[
                          { text: "Intelligent tools to lock vocabulary into your long-term memory."},
                          { text: "Safe, AI-powered practice for fearless pronunciation."},
                          { text: "Clear guidance to help you understand and use grammar naturally."},
                          { text: "Engaging exercises to tune your ear to native speakers."},
                          { text: "Motivation boosts to keep you consistent and celebrate your wins."}
                      ].map(item => (
                          <li key={item.text} className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-accent mr-3 mt-1 shrink-0"/>
                              <span className="text-muted-foreground">{item.text}</span>
                          </li>
                      ))}
                  </ul>
              </div>
              <div>
                  <Image 
                      src="https://placehold.co/600x400.png" 
                      alt="Illustrative image showing diverse people communicating"
                      width={600}
                      height={400}
                      className="rounded-lg shadow-xl"
                      data-ai-hint="diverse people communication"
                  />
              </div>
            </div>
          </div>
        </section>

        {/* Key Features Showcase Section */}
        <section id="features" className="py-16 md:py-24 bg-secondary/20">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-16 text-foreground">
              Everything You Need to Speak with Confidence
            </h2>
            <div className="space-y-16">
              {keyFeatures.map((feature, index) => (
                <div key={feature.title} className={`flex flex-col md:flex-row items-center gap-8 md:gap-12 ${index % 2 !== 0 ? 'md:flex-row-reverse' : ''}`}>
                  <div className="md:w-1/2">
                    <div className="p-3 bg-primary/10 rounded-full w-fit mb-4">
                        {feature.icon}
                    </div>
                    <h3 className="text-2xl md:text-3xl font-headline font-semibold text-foreground mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground mb-3">{feature.description}</p>
                    <p className="text-primary font-semibold">{feature.benefit}</p>
                  </div>
                  <div className="md:w-1/2">
                    <Image 
                      src={feature.imagePlaceholder.src}
                      alt={`${feature.title} - App Screenshot`} 
                      width={500} 
                      height={350} 
                      className="rounded-lg shadow-xl mx-auto"
                      data-ai-hint={feature.imagePlaceholder.hint}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* "Why Choose Us" / Testimonials Section */}
        <section className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-headline font-bold text-center mb-12 text-foreground">
              Hear It From Our Learners
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial) => (
                <Card key={testimonial.name} className="shadow-lg hover:shadow-xl transition-shadow duration-300 bg-card flex flex-col">
                  <CardContent className="p-6 flex-grow">
                    <p className="text-muted-foreground italic mb-6">"{testimonial.quote}"</p>
                  </CardContent>
                  <CardFooter className="p-6 border-t border-border">
                    <div className="flex items-center">
                      <Image 
                        src={`https://placehold.co/64x64.png`} 
                        alt={testimonial.name} 
                        width={48}
                        height={48}
                        className="rounded-full mr-4"
                        data-ai-hint={testimonial.avatarHint}
                      />
                      <div>
                        <p className="font-semibold text-foreground">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works / Secondary Call to Action Section */}
        <section className="py-16 md:py-24 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-headline font-bold mb-10">
              Ready to Speak Confidently? It's Easy to Start!
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {howItWorksSteps.map((step) => (
                    <div key={step.number} className="flex flex-col items-center p-6 bg-primary/20 rounded-lg">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-accent text-accent-foreground mb-4 text-2xl font-bold">
                           {step.icon ? React.cloneElement(step.icon, {className:"h-8 w-8 text-accent-foreground"}) : step.number }
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                        <p className="text-primary-foreground/80">{step.description}</p>
                    </div>
                ))}
            </div>
            <Button size="lg" variant="secondary" className="text-lg px-8 py-6 bg-accent hover:bg-accent/90 text-accent-foreground shadow-lg hover:shadow-xl transition-shadow" asChild>
              <Link href="/dashboard">Start Your Free Trial Today!</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <Logo iconSize={28} textSize="text-2xl" />
            <nav className="flex flex-wrap justify-center md:justify-end gap-x-6 gap-y-2">
              <Link href="/about" className="text-sm text-muted-foreground hover:text-primary">About Us</Link>
              <Link href="/faq" className="text-sm text-muted-foreground hover:text-primary">Help/FAQ</Link>
              <Link href="/mobile" className="text-sm text-muted-foreground hover:text-primary">Mobile Apps</Link>
              <Link href="/privacy" className="text-sm text-muted-foreground hover:text-primary">Privacy Policy</Link>
              <Link href="/terms" className="text-sm text-muted-foreground hover:text-primary">Terms of Use</Link>
            </nav>
          </div>
          <p className="text-sm text-muted-foreground text-center mt-6">
            &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved. {APP_DESCRIPTION}
          </p>
        </div>
      </footer>
    </div>
  );
}
