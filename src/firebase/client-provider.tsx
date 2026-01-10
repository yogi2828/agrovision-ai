'use client';

import React, { ReactNode, useMemo } from 'react';
import { FirebaseProvider } from './provider';
import { initializeFirebase } from './index';

// This provider is responsible for initializing Firebase on the client side.
// It should be used as a wrapper around the root of your application.
export const FirebaseClientProvider = ({ children }: { children: ReactNode }) => {
  const firebaseApp = useMemo(() => initializeFirebase(), []);

  return <FirebaseProvider {...firebaseApp}>{children}</FirebaseProvider>;
};
