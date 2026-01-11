'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { useUser, useFirestore } from '@/firebase';
import type { User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';
import Navbar from '@/components/layout/navbar';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicRoutes = ['/', '/about', '/login', '/signup'];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: firebaseUser, isUserLoading } = useUser();
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
      const unsubSnapshot = onSnapshot(userRef, (docSnap) => {
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
          setUser({
            ...firebaseUser,
            language: 'en',
            voiceEnabled: true,
            voiceSpeed: 1,
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

  const value = { user, loading };

  const showLoader = loading && !publicRoutes.includes(pathname);
  const showRedirectLoader = !user && !publicRoutes.includes(pathname);

  if (showLoader || showRedirectLoader) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const showNav = !loading;

  return (
    <AuthContext.Provider value={value}>
      {showNav && <Navbar />}
      <div className="relative flex min-h-screen flex-col">
        <main className="flex-1">{children}</main>
      </div>
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
