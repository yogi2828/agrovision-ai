'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export default function LoginPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  
  const loginImage = PlaceHolderImages.find(p => p.id === '6');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignIn = async () => {
    if (!auth || !db) return;
    setIsSigningIn(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { user: newUser } = result;

      // Check if user document already exists
      const userRef = doc(db, 'users', newUser.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        // Create user document in Firestore on first sign-in
        await setDoc(userRef, {
          id: newUser.uid,
          name: newUser.displayName,
          email: newUser.email,
          language: 'en-IN',
          voiceEnabled: true,
          voiceSpeed: 1,
        });
      }
      
      router.push('/dashboard');

    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Sign In Failed',
        description: "Could not sign in with Google. Please try again.",
        variant: 'destructive',
      });
      setIsSigningIn(false);
    }
  };

  if (isUserLoading || user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2 xl:min-h-screen">
      <div className="flex items-center justify-center py-12">
        <Card className="mx-auto max-w-sm w-full shadow-xl">
          <CardHeader className="text-center space-y-2">
            <div className="flex justify-center items-center gap-2">
              <Leaf className="h-8 w-8 text-primary"/>
              <CardTitle className="text-3xl font-bold font-headline">Welcome!</CardTitle>
            </div>
            <CardDescription>
              Sign in or sign up with Google to continue.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <Button onClick={handleGoogleSignIn} className="w-full" disabled={isSigningIn}>
                {isSigningIn ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Continue with Google'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="hidden bg-muted lg:block">
        {loginImage && (
          <Image
            src={loginImage.imageUrl}
            alt={loginImage.description}
            data-ai-hint={loginImage.imageHint}
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.3]"
          />
        )}
      </div>
    </div>
  );
}
