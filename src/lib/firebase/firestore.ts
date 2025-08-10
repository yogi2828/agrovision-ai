'use client';
import {
  collection,
  addDoc,
  query,
  getDocs,
  Timestamp,
  doc,
  deleteDoc,
  getFirestore,
  orderBy,
  getDoc,
  where,
  writeBatch,
} from 'firebase/firestore';
import { app } from '@/config/firebase';
import type { DiagnosePlantHealthOutput } from '@/ai/flows/diagnose-plant-health';

const db = getFirestore(app);

export interface DiagnosisHistoryRecord extends DiagnosePlantHealthOutput {
  id: string;
  userId: string;
  createdAt: Timestamp;
}

// Function to save a diagnosis to history
export const saveDiagnosisToHistory = async (
  userId: string,
  diagnosis: DiagnosePlantHealthOutput
) => {
  try {
    if (!userId) {
      throw new Error("User ID is required to save to history.");
    }
    const docRef = await addDoc(collection(db, `users/${userId}/history`), {
      ...diagnosis,
      userId,
      createdAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error saving diagnosis to history:', error);
    throw new Error('Could not save diagnosis.');
  }
};


// Function to get a user's diagnosis history
export const getDiagnosisHistory = async (userId: string): Promise<DiagnosisHistoryRecord[]> => {
  try {
    const q = query(
        collection(db, `users/${userId}/history`), 
        orderBy("createdAt", "desc")
    );
    const querySnapshot = await getDocs(q);
    const history: DiagnosisHistoryRecord[] = [];
    querySnapshot.forEach(doc => {
        history.push({
          id: doc.id,
          ...(doc.data() as Omit<DiagnosisHistoryRecord, 'id'>),
        })
    });
    return history;
  } catch (error) {
    console.error("Error getting diagnosis history: ", error);
     try {
        const q = query(collection(db, `users/${userId}/history`));
        const querySnapshot = await getDocs(q);
        const history: DiagnosisHistoryRecord[] = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...(doc.data() as Omit<DiagnosisHistoryRecord, 'id'>),
        }));
        console.warn("Returned history without sorting. Please create a Firestore index for 'createdAt' descending.");
        return history.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis());
    } catch (fallbackError) {
       console.error("Error getting diagnosis history on fallback: ", fallbackError);
       throw new Error('Could not retrieve diagnosis history.');
    }
  }
};

// Function to get a single diagnosis record
export const getDiagnosisRecord = async (userId: string, recordId: string): Promise<DiagnosisHistoryRecord | null> => {
    try {
        const docRef = doc(db, `users/${userId}/history`, recordId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            return { id: docSnap.id, ...data } as DiagnosisHistoryRecord;
        }
        console.log("No such document!");
        return null;

    } catch (error) {
        console.error("Error getting document:", error);
        throw new Error("Could not retrieve the diagnosis record.");
    }
}


// Function to delete a diagnosis from history
export const deleteDiagnosisRecord = async (userId: string, recordId: string) => {
  try {
    await deleteDoc(doc(db, `users/${userId}/history`, recordId));
  } catch (error) {
    console.error('Error deleting diagnosis record:', error);
    throw new Error('Could not delete diagnosis record.');
  }
};


// Function to delete all of a user's history
export const deleteAllUserHistory = async (userId: string) => {
    try {
        const q = query(collection(db, `users/${userId}/history`));
        const querySnapshot = await getDocs(q);
        const batch = writeBatch(db);
        querySnapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
        })
        await batch.commit();
    } catch (error) {
        console.error("Error deleting all user history:", error);
        throw new Error("Could not delete all user history.");
    }
}
