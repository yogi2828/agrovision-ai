'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sprout } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/firebase';
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async () => {
    if (!auth) return;
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/dashboard');
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        toast({
          variant: 'destructive',
          title: 'Login failed',
          description: e.message,
        });
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth) return;
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      router.push('/dashboard');
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        toast({
          variant: 'destructive',
          title: 'Google login failed',
          description: e.message,
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4">
            <Sprout className="h-10 w-10 text-primary" />
          </div>
          <CardTitle className="text-2xl font-headline">Welcome Back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Forgot your password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button onClick={handleLogin} className="w-full">
              Login
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              Login with Google
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Don&apos;t have an account?{' '}
            <Link href="/register" className="underline">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}