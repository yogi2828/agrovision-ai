'use client';

import {
  signInWithPopup,
  GoogleAuthProvider,
} from 'firebase/auth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Leaf, Loader2, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function SignUpPage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const signupImage = PlaceHolderImages.find(p => p.id === '7');

  useEffect(() => {
    if (!isUserLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router]);

  const handleGoogleSignUp = async () => {
    if (!auth || !db) return;
    setIsSigningUp(true);
    setAuthError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const { user: newUser } = result;

      const userRef = doc(db, 'users', newUser.uid);
      await setDoc(userRef, {
        id: newUser.uid,
        name: newUser.displayName,
        email: newUser.email,
        language: 'en-IN',
        voiceEnabled: true,
        voiceSpeed: 1.0,
      });

      router.push('/dashboard');

    } catch (error: any) {
      console.error("Sign-up error:", error);
      let errorMessage = "Could not sign up with Google. Please try again.";

      if (error.code === 'auth/unauthorized-domain') {
        errorMessage = "This domain is not authorized for Firebase Auth. Please add this domain to 'Authorized domains' in the Firebase Console (Authentication > Settings).";
        setAuthError(errorMessage);
      } else if (error.code === 'auth/popup-blocked') {
        errorMessage = "Sign-up popup was blocked by your browser. Please enable popups for this site.";
      }

      toast({
        title: 'Sign Up Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      setIsSigningUp(false);
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
        <div className="mx-auto max-w-sm w-full px-4">
          <Card className="shadow-xl">
            <CardHeader className="text-center space-y-2">
              <div className="flex justify-center items-center gap-2">
                <Leaf className="h-8 w-8 text-primary"/>
                <CardTitle className="text-3xl font-bold font-headline">Create an Account</CardTitle>
              </div>
              <CardDescription>
                Sign up with Google to get started.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {authError && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Configuration Error</AlertTitle>
                    <AlertDescription className="text-xs">
                      {authError}
                    </AlertDescription>
                  </Alert>
                )}
                <Button onClick={handleGoogleSignUp} className="w-full" disabled={isSigningUp}>
                  {isSigningUp ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : 'Sign Up with Google'}
                </Button>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href="/login" className="underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        {signupImage && (
          <Image
            src={signupImage.imageUrl}
            alt={signupImage.description}
            data-ai-hint={signupImage.imageHint}
            width="1920"
            height="1080"
            className="h-full w-full object-cover dark:brightness-[0.3]"
          />
        )}
      </div>
    </div>
  );
}
