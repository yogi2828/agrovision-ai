'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { useUser, useAuth as useFirebaseAuth, useFirestore } from '@/firebase';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';
import Footer from '@/components/layout/footer';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/', '/about', '/login', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
  const auth = useFirebaseAuth();
  const db = useFirestore();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setLoading(isUserLoading);
    if (isUserLoading || !db) {
      return;
    }

    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const unsubSnapshot = onSnapshot(userRef, async (docSnap) => {
        if (docSnap.exists()) {
          const customData = docSnap.data();
          setUser({
            ...firebaseUser,
            language: customData.language || 'en',
            voiceEnabled: customData.voiceEnabled ?? true,
            voiceSpeed: customData.voiceSpeed ?? 1,
          } as User);
        } else {
          // This case might happen if Firestore doc creation fails after auth creation
           const newUser: Omit<User, keyof FirebaseUser> = {
            language: 'en',
            voiceEnabled: true,
            voiceSpeed: 1,
          };
          await setDoc(userRef, {
            id: firebaseUser.uid,
            name: firebaseUser.displayName,
            email: firebaseUser.email,
            ...newUser
          });
          setUser({
            ...firebaseUser,
            ...newUser,
          } as User);
        }
        if (publicRoutes.includes(pathname)) {
          router.push('/dashboard');
        }
        setLoading(false);
      });
      return () => unsubSnapshot();
    } else {
      setUser(null);
      setLoading(false);
      if (!publicRoutes.includes(pathname)) {
        router.push('/login');
      }
    }
  }, [firebaseUser, isUserLoading, pathname, router, db]);

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user: newUser } = userCredential;
    
    // Update Firebase Auth profile
    await updateProfile(newUser, { displayName });

    // Create user document in Firestore
    const userRef = doc(db, 'users', newUser.uid);
    await setDoc(userRef, {
      id: newUser.uid,
      name: displayName,
      email: newUser.email,
      preferredLanguage: 'en',
      voiceEnabled: true,
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error during Sign-Out: ', error);
    }
  };

  const value = { user, loading, signUpWithEmail, signInWithEmail, signOut };

  const showLoader = loading && !publicRoutes.includes(pathname);
  const showRedirectLoader = !user && !publicRoutes.includes(pathname);

  if (showLoader || showRedirectLoader) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const showNavAndFooter = !loading && user && !publicRoutes.includes(pathname);

  return (
    <AuthContext.Provider value={value}>
      {showNavAndFooter && <Navbar />}
      {children}
      {showNavAndFooter && <Footer />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
