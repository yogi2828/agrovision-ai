'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/auth-context';
import { getDiagnosisRecord } from '@/lib/firebase/firestore';
import type { DiagnosisHistoryRecord } from '@/lib/firebase/firestore';
import { DiagnosisResult } from '@/components/diagnose/diagnosis-result';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export default function HistoryDetailPage() {
  const { user, loading: authLoading } = useAuth();
  const params = useParams();
  const router = useRouter();
  const recordId = params.id as string;

  const [record, setRecord] = useState<DiagnosisHistoryRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    if (recordId) {
      getDiagnosisRecord(user.uid, recordId)
        .then(data => {
          if (data) {
            setRecord(data);
          } else {
            // Handle case where record is not found
            console.error("Record not found");
          }
        })
        .catch(err => {
          console.error(err);
          // Handle error (e.g., show toast)
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user, recordId, authLoading, router]);

  if (loading || authLoading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!record) {
    return (
      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-xl font-semibold">Record not found</h2>
        <p className="text-muted-foreground">This diagnosis record could not be found or you don't have permission to view it.</p>
        <Button onClick={() => router.push('/history')} className="mt-4">Back to History</Button>
      </motion.div>
    );
  }
  
  // We don't need onSave for a historical record viewing
  // onReset will act as a "back to history" button
  const handleBack = () => {
      router.push('/history');
  }

  const placeholderImage = `https://placehold.co/600x400.png?text=${encodeURIComponent(record.plantIdentification.commonName)}`;

  return (
    <motion.div 
      className="container mx-auto max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <DiagnosisResult
        result={record}
        image={placeholderImage}
        onReset={handleBack}
        onSave={() => {}}
        isHistoryView={true}
      />
    </motion.div>
  );
}
