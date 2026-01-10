'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import {
  onSnapshot,
  Query,
  DocumentData,
  FirestoreError,
  QuerySnapshot,
  queryEqual,
} from 'firebase/firestore';
import { useUser } from '../auth/use-user';

interface UseCollection<T> {
  data: T[] | null;
  loading: boolean;
  error: FirestoreError | null;
}

// Custom hook to compare queries and avoid re-renders
const useMemoizedQuery = <T extends DocumentData>(q: Query<T> | null) => {
    const previousQueryRef = useRef<Query<T> | null>(null);
  
    if (q && (!previousQueryRef.current || !queryEqual(previousQueryRef.current, q))) {
      previousQueryRef.current = q;
    }
  
    return previousQueryRef.current;
}


export const useCollection = <T extends DocumentData>(
  query: Query<T> | null
): UseCollection<T> => {
  const { user, loading: userLoading } = useUser();
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const memoizedQuery = useMemoizedQuery(query);


  useEffect(() => {
    // We are not ready to query if the user is loading or the query is not yet available
    if (userLoading || !memoizedQuery) {
      setLoading(true);
      return;
    }
    
    // If there's no user, there's nothing to query.
    if (!user) {
        setLoading(false);
        setData([]);
        return;
    }
    
    setLoading(true);

    const unsubscribe = onSnapshot(
      memoizedQuery,
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
  }, [memoizedQuery, user, userLoading]);

  const value = useMemo(() => {
    return { data, loading, error };
  }, [data, loading, error]);

  return value;
};
