
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { app } from '@/lib/firebase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const auth = getAuth(app);
      await createUserWithEmailAndPassword(auth, email, password);
      // User signed up successfully.
      // Firebase auth state change might trigger redirect if listeners are set up elsewhere (e.g., in a layout).
      // For now, direct redirect after signup is fine for MVP.
      router.push('/dashboard');
    } catch (err: any) {
      console.error('Signup error:', err);
      let errorMessage = 'An unexpected error occurred. Please try again.';
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = 'This email address is already in use. Please log in or use a different email.';
      } else if (err.code === 'auth/weak-password') {
        errorMessage = 'Password should be at least 6 characters long.';
      } else if (err.message) {
        // Fallback to Firebase's error message if it's somewhat user-friendly
        errorMessage = err.message;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-headline">Create your LinguaScape Account</CardTitle>
          <CardDescription className="pt-2">
            Start your language learning journey today!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="•••••••• (min. 6 characters)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                autoComplete="new-password"
              />
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive text-center bg-destructive/10 p-3 rounded-md">
                {error}
              </p>
            )}
            <Button type="submit" className="w-full text-base py-3" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up Free'}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Already have an account?{' '}</span>
            <Link href="/login" className="font-medium text-primary hover:text-primary/80 hover:underline">
              Log In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
