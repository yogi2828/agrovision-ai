'use client';
import { FirebaseApp } from 'firebase/app';
import { Auth } from 'firebase/auth';
import { Firestore } from 'firebase/firestore';
import React, { createContext, useContext, ReactNode } from 'react';

// Define the shape of the context value
interface FirebaseContextValue {
  firebaseApp: FirebaseApp;
  auth: Auth;
  firestore: Firestore;
}

// Create the context with a default null value
const FirebaseContext = createContext<FirebaseContextValue | null>(null);

// Custom hook to use the Firebase context
export const useFirebase = (): FirebaseContextValue => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

// Custom hook to get just the FirebaseApp instance
export const useFirebaseApp = (): FirebaseApp => {
  return useFirebase().firebaseApp;
};

// Custom hook to get just the Auth instance
export const useAuth = (): Auth => {
  return useFirebase().auth;
};

// Custom hook to get just the Firestore instance
export const useFirestore = (): Firestore => {
  return useFirebase().firestore;
};

// Define the props for the provider component
interface FirebaseProviderProps extends FirebaseContextValue {
  children: ReactNode;
}

// The provider component that makes the Firebase instances available
export const FirebaseProvider: React.FC<FirebaseProviderProps> = ({
  children,
  firebaseApp,
  auth,
  firestore,
}) => {
  return (
    <FirebaseContext.Provider value={{ firebaseApp, auth, firestore }}>
      {children}
    </FirebaseContext.Provider>
  );
};
