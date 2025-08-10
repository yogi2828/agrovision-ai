
'use client';

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/auth-context";
import { getDiagnosisHistory, deleteDiagnosisRecord, DiagnosisHistoryRecord } from "@/lib/firebase/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2, CircleSlash } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};


export default function HistoryPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [history, setHistory] = useState<DiagnosisHistoryRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    const fetchHistory = useCallback(async () => {
      if (!user) return;
      try {
        setLoading(true);
        const historyData = await getDiagnosisHistory(user.uid);
        setHistory(historyData);
      } catch (err) {
        console.error(err);
        toast({
          variant: 'destructive',
          title: "Error",
          description: "Failed to load diagnosis history."
        });
      } finally {
        setLoading(false);
      }
    }, [user, toast]);

    useEffect(() => {
        if (!authLoading) {
          fetchHistory();
        }
    }, [user, authLoading, fetchHistory]);
    
    const handleDelete = async (recordId: string) => {
        if (!user) return;
        try {
            await deleteDiagnosisRecord(user.uid, recordId);
            setHistory(prev => prev.filter(item => item.id !== recordId));
            toast({
                title: "Deleted",
                description: "Diagnosis record has been removed."
            });
        } catch (error) {
            console.error(error);
            toast({
                variant: 'destructive',
                title: "Error",
                description: "Failed to delete the record."
            })
        }
    }

    if (loading || authLoading) {
        return (
            <div className="flex justify-center items-center h-full">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        )
    }

    return (
      <motion.div 
        className="container mx-auto max-w-5xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="mb-8 text-center md:text-left">
          <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Diagnosis History</h1>
          <p className="text-muted-foreground mt-2">Review your past plant health scans and their outcomes.</p>
        </div>
        
        {history.length > 0 ? (
          <motion.div 
            className="grid gap-6"
            variants={containerVariants}
          >
            {history.map(item => (
              <motion.div key={item.id} variants={itemVariants}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <CardTitle className="text-2xl font-headline">{item.plantIdentification.commonName} - {item.diseaseName}</CardTitle>
                        <CardDescription className="text-base">{item.createdAt.toDate().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</CardDescription>
                      </div>
                       <Badge variant={item.diseaseName.toLowerCase() === 'healthy' ? 'default' : 'destructive'} className="self-start md:self-center">{item.diseaseName}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground line-clamp-2">{item.summary}</p>
                  </CardContent>
                  <CardFooter className="flex flex-col sm:flex-row justify-between items-center gap-4">
                     <Link href={`/history/${item.id}`} className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full">View Details</Button>
                    </Link>
                    <div className="flex gap-2">
                      <AlertDialog>
                          <AlertDialogTrigger asChild>
                             <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this diagnosis record.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(item.id)}>Delete</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div 
            className="text-center py-16 border-2 border-dashed rounded-lg flex flex-col items-center gap-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
          >
              <CircleSlash className="w-12 h-12 text-muted-foreground"/>
              <h2 className="text-xl font-semibold">No History Yet</h2>
              <p className="text-muted-foreground mt-2">Start by scanning a plant to see your history here.</p>
              <Button asChild>
                  <Link href="/diagnose">Scan a Plant</Link>
              </Button>
          </motion.div>
        )}
      </motion.div>
    );
}
