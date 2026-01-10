'use client';

import { useState, useEffect, useMemo } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { useAuth } from '../provider';

interface UseUser {
  user: User | null;
  loading: boolean;
  error: Error | null;
}

export const useUser = (): UseUser => {
  const auth = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        setUser(user);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [auth]);

  const value = useMemo(() => {
    return { user, loading, error };
  }, [user, loading, error]);

  return value;
};
