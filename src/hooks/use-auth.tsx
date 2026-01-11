'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as firebaseSignOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userRef = doc(db, 'users', firebaseUser.uid);
        
        // Set up a real-time listener for the user document
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
            // If user doc doesn't exist, create it
            const newUser: Omit<User, keyof FirebaseUser> = {
              language: 'en',
              voiceEnabled: true,
              voiceSpeed: 1,
            };
            await setDoc(userRef, {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              ...newUser,
            });
            setUser({
              ...firebaseUser,
              ...newUser,
            } as User);
          }
          setLoading(false);
        });

        return () => unsubSnapshot(); // Cleanup the snapshot listener
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => unsubscribe(); // Cleanup the auth state listener
  }, []);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error during Google Sign-In: ', error);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Error during Sign-Out: ', error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
