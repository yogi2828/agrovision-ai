'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
} from 'firebase/firestore';

interface UseCollection<T> {
  data: T[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

export const useCollection = <T extends DocumentData>(
  query: Query<T> | null
): UseCollection<T> => {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    if (!query) {
      setLoading(false);
      setData(null);
      return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      query,
      (snapshot: QuerySnapshot<T>) => {
        const docs = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        }));
        setData(docs);
        setLoading(false);
      },
      (err: FirestoreError) => {
        console.error(`Error fetching collection:`, err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [query]);

  const value = useMemo(() => {
    return { data, loading, error };
  }, [data, loading, error]);

  return value;
};
