'use client';

import { useState, useEffect, useMemo } from 'react';
import {
  onSnapshot,
  doc,
  DocumentData,
  FirestoreError,
  DocumentReference,
  DocumentSnapshot,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

interface UseDoc<T> {
  data: T | null;
  loading: boolean;
  error: FirestoreError | null;
}

export const useDoc = <T extends DocumentData>(
  path: string
): UseDoc<T> => {
  const db = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  const docRef = useMemo(
    () => (db ? (doc(db, path) as DocumentReference<T>) : null),
    [db, path]
  );

  useEffect(() => {
    if (!docRef) {
      return;
    }

    setLoading(true);

    const unsubscribe = onSnapshot(
      docRef,
      (snapshot: DocumentSnapshot<T>) => {
        if (snapshot.exists()) {
          setData({ ...snapshot.data(), id: snapshot.id });
        } else {
          setData(null);
        }
        setLoading(false);
      },
      (err: FirestoreError) => {
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [docRef]);

  const value = useMemo(() => {
    return { data, loading, error };
  }, [data, loading, error]);

  return value;
};
