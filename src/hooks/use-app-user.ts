
'use client';

import { useMemo } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User as AppUserType } from '@/lib/types';

// The data from useDoc will be the firestore part
type UserProfileData = Omit<AppUserType, keyof FirebaseUser>;

/**
 * Hook to get the fully enriched user object, combining Firebase Auth
 * user with the user's profile from Firestore.
 */
export function useAppUser() {
  const { user: firebaseUser, isUserLoading: isAuthLoading, userError: authError } = useUser();
  const db = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firebaseUser?.uid || !db) return null;
    return doc(db, 'users', firebaseUser.uid);
  }, [firebaseUser?.uid, db]);

  const { data: profileData, isLoading: isProfileLoading, error: profileError } = useDoc<UserProfileData>(userDocRef);

  const user = useMemo<AppUserType | null>(() => {
    if (!firebaseUser) return null;

    // If we have profile data, merge it.
    if (profileData) {
      return { ...firebaseUser, ...profileData };
    }

    // If we are authenticated but profile data is still loading or missing,
    // return the auth user with default app settings to avoid breaking the UI.
    // This handles the brief period after login before the Firestore doc is fetched.
    return {
      ...firebaseUser,
      language: 'en-IN',
      voiceEnabled: true,
      voiceSpeed: 1.0,
    };
  }, [firebaseUser, profileData]);

  return {
    user,
    // Loading is true if auth is loading, or if we have a user but their profile is still loading.
    isLoading: isAuthLoading || (!!firebaseUser && isProfileLoading),
    error: authError || profileError,
  };
}
