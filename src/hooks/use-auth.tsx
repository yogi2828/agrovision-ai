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
import { usePathname, useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/', '/about', '/login'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
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
            const newUser: Omit<User, keyof FirebaseUser> = {
              language: 'en',
              voiceEnabled: true,
              voiceSpeed: 1,
            };
             await setDoc(userRef, {
              name: firebaseUser.displayName,
              email: firebaseUser.email,
              ...newUser
            });
             setUser({
              ...firebaseUser,
              ...newUser,
            } as User);
          }
           if (pathname === '/login') {
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
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error during Google Sign-In: ', error);
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      router.push('/login');
    } catch (error) {
      console.error('Error during Sign-Out: ', error);
    }
  };

  const value = { user, loading, signInWithGoogle, signOut };
  
  if (loading && !publicRoutes.includes(pathname)) {
    return (
       <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  if (!user && !publicRoutes.includes(pathname)) {
     return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }


  return (
    <AuthContext.Provider value={value}>
        {!loading && user && !publicRoutes.includes(pathname) && <Navbar />}
        {children}
        {!loading && user && !publicRoutes.includes(pathname) && <Footer />}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
