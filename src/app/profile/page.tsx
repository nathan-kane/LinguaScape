import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Award, BarChart3, CalendarCheck2, Target, LanguagesIcon } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Progress } from "@/components/ui/progress";

const achievements = [
  { name: "Word Wizard", icon: "https://placehold.co/64x64.png", description: "Learned 100 words", date: "2024-07-15", dataAiHint: "wizard badge" },
  { name: "Streak Keeper", icon: "https://placehold.co/64x64.png", description: "7-day streak", date: "2024-07-20", dataAiHint: "flame badge" },
  { name: "Grammar Guru", icon: "https://placehold.co/64x64.png", description: "Completed 10 grammar drills", date: "2024-07-22", dataAiHint: "book badge" },
  { name: "Polyglot Starter", icon: "https://placehold.co/64x64.png", description: "Started learning a new language", date: "2024-07-10", dataAiHint: "globe badge" },
];

export default function ProfilePage() {
  const user = {
    name: "Alex Johnson",
    username: "alexj",
    email: "alex.johnson@example.com",
    joinDate: "July 1, 2024",
    avatarUrl: "https://placehold.co/200x200.png",
    currentLanguage: "Spanish",
    learningMode: "Conversational",
    stats: {
      wordsLearned: 250,
      lessonsCompleted: 42,
      currentStreak: 15,
      longestStreak: 28,
      points: 12500,
    },
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-8">
        {/* Profile Header */}
        <Card className="shadow-xl bg-card overflow-hidden">
          <div className="relative h-40 bg-gradient-to-r from-primary to-accent" data-ai-hint="abstract banner">
             <Image src="https://placehold.co/1200x300.png" alt="Profile banner" layout="fill" objectFit="cover" />
          </div>
          <CardContent className="p-6 pt-0">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-12 space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                <AvatarImage src={user.avatarUrl} alt={user.name} data-ai-hint="user avatar" />
                <AvatarFallback>{user.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-3xl font-headline font-bold text-foreground">{user.name}</h1>
                <p className="text-muted-foreground">@{user.username}</p>
                <p className="text-sm text-muted-foreground">Joined: {user.joinDate}</p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/settings" className="flex items-center gap-2">
                  <Edit className="h-4 w-4" /> Edit Profile
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Learning Stats */}
        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Learning Statistics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Words Learned</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{user.stats.wordsLearned}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Lessons Completed</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{user.stats.lessonsCompleted}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Current Streak</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{user.stats.currentStreak} days</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Longest Streak</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{user.stats.longestStreak} days</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">XP Points</CardTitle></CardHeader>
              <CardContent><p className="text-3xl font-bold">{user.stats.points.toLocaleString()}</p></CardContent>
            </Card>
            <Card className="shadow-lg bg-card">
              <CardHeader><CardTitle className="text-lg text-primary">Current Focus</CardTitle></CardHeader>
              <CardContent>
                <p className="text-md font-semibold">{user.currentLanguage}</p>
                <p className="text-sm text-muted-foreground">{user.learningMode} Mode</p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Achievements */}
        <section>
          <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Achievements</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {achievements.map((ach, index) => (
              <Card key={index} className="shadow-md hover:shadow-lg transition-shadow bg-card text-center">
                <CardContent className="p-4">
                  <Image 
                    src={ach.icon} 
                    alt={ach.name} 
                    width={64} 
                    height={64} 
                    className="mx-auto mb-3 rounded-full"
                    data-ai-hint={ach.dataAiHint}
                  />
                  <h3 className="text-md font-semibold text-foreground mb-1">{ach.name}</h3>
                  <p className="text-xs text-muted-foreground">{ach.description}</p>
                  <p className="text-xs text-muted-foreground mt-1">Earned: {ach.date}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-6 text-center">
             <Button variant="link" className="text-primary">View All Achievements</Button>
          </div>
        </section>
        
        {/* Activity Feed (Placeholder) */}
        <section>
            <h2 className="text-2xl font-headline font-semibold text-foreground mb-4">Recent Activity</h2>
            <Card className="shadow-lg bg-card">
                <CardContent className="p-6 space-y-4">
                    {[
                        {icon: <LanguagesIcon className="h-5 w-5 text-green-500"/>, text: "Started learning Spanish", time: "2 days ago"},
                        {icon: <Target className="h-5 w-5 text-blue-500"/>, text: "Completed 'Basic Greetings' vocabulary set", time: "1 day ago"},
                        {icon: <CalendarCheck2 className="h-5 w-5 text-purple-500"/>, text: "Achieved a 15-day learning streak!", time: "Today"},
                    ].map((activity, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 border-b last:border-b-0">
                            {activity.icon}
                            <span className="flex-1 text-sm text-foreground">{activity.text}</span>
                            <span className="text-xs text-muted-foreground">{activity.time}</span>
                        </div>
                    ))}
                     <Button variant="link" className="mt-2 p-0 h-auto text-primary">View Full Activity Log</Button>
                </CardContent>
            </Card>
        </section>

      </div>
    </AuthenticatedLayout>
  );
}
