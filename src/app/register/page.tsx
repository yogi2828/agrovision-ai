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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/data';
import { Logo } from '@/components/logo';
import { useState } from 'react';
import { useAuth, useFirestore } from '@/firebase';
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { FirebaseError } from 'firebase/app';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [language, setLanguage] = useState('');
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const handleRegister = async () => {
    if (!auth || !firestore) return;
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;
      await updateProfile(user, { displayName: fullName });
      // The fix is here: Adding id: user.uid to the document
      await setDoc(doc(firestore, 'users', user.uid), {
        id: user.uid,
        fullName: fullName,
        email: user.email,
        userType: 'Farmer',
        preferredLanguage: language || 'en',
        createdAt: serverTimestamp(),
        profileImageURL: user.photoURL,
      });
      router.push('/dashboard');
    } catch (e: unknown) {
      if (e instanceof FirebaseError) {
        toast({
          variant: 'destructive',
          title: 'Registration failed',
          description: e.message,
        });
      }
    }
  };

  const handleGoogleLogin = async () => {
    if (!auth || !firestore) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Firebase is not ready. Please try again in a moment.',
      });
      return;
    }
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userDocRef = doc(firestore, 'users', user.uid);
      const docSnap = await getDoc(userDocRef);

      // Create a new user document ONLY if one doesn't already exist.
      if (!docSnap.exists()) {
        await setDoc(userDocRef, {
          id: user.uid,
          fullName: user.displayName,
          email: user.email,
          userType: 'Farmer',
          createdAt: serverTimestamp(),
          profileImageURL: user.photoURL,
          preferredLanguage: language || 'en', // Default language
        });
      }
      
      toast({
        title: 'Sign Up Successful',
        description: `Welcome, ${user.displayName}!`,
      });
      router.push('/dashboard');
    } catch (e: unknown) {
      console.error("Google sign up error:", e);
      if (e instanceof FirebaseError) {
        toast({
          variant: 'destructive',
          title: 'Google sign up failed',
          description: e.message,
        });
      }
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-muted/40 py-12">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="inline-block mx-auto mb-4">
            <Logo className="h-10 w-10" />
          </div>
          <CardTitle className="text-2xl font-headline">
            Create an Account
          </CardTitle>
          <CardDescription>
            Join AgroVision AI to start protecting your crops
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={handleGoogleLogin}
            >
              Sign up with Google
            </Button>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                    </span>
                </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="full-name">Full Name</Label>
              <Input
                id="full-name"
                placeholder="Suresh Kumar"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
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
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="language">Preferred Language</Label>
              <Select onValueChange={setLanguage} value={language}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleRegister} className="w-full">
              Create an account
            </Button>
          </div>
          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
