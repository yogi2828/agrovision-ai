'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CircleSlash } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { DiagnosisHistoryRecord, getDiagnosisHistory } from "@/lib/firebase/firestore";
import { Skeleton } from "../ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "../ui/badge";

export function RecentDiagnoses() {
  const { user } = useAuth();
  const [diagnoses, setDiagnoses] = useState<DiagnosisHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      getDiagnosisHistory(user.uid)
        .then(history => {
          setDiagnoses(history.slice(0, 3)); // Get latest 3
        })
        .catch(err => {
          console.error(err);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Could not load recent diagnoses."
          });
        })
        .finally(() => setLoading(false));
    } else {
        setLoading(false);
    }
  }, [user, toast]);

  const DiagnosisSkeleton = () => (
    <div className="flex items-center gap-4 p-2">
      <Skeleton className="h-16 w-16 rounded-md" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-9 w-20 rounded-md" />
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
            <div>
                <CardTitle>Recent Diagnoses</CardTitle>
                <CardDescription>Your latest plant health scans.</CardDescription>
            </div>
            <Button variant="ghost" asChild>
                <Link href="/history">View all <ArrowRight className="ml-2 w-4 h-4"/></Link>
            </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
            {loading ? (
                <>
                    <DiagnosisSkeleton />
                    <DiagnosisSkeleton />
                    <DiagnosisSkeleton />
                </>
            ) : diagnoses.length > 0 ? (
                diagnoses.map(d => {
                  const placeholderImage = `https://placehold.co/64x64.png?text=${encodeURIComponent(d.plantIdentification.commonName.split(' ').join('\\n'))}`;
                  return (
                    <Link key={d.id} href={`/history/${d.id}`} className="flex items-center gap-4 p-2 rounded-lg hover:bg-accent/50 cursor-pointer">
                        <Image src={placeholderImage} alt={d.plantIdentification.commonName} width={64} height={64} className="rounded-md object-cover" />
                        <div className="flex-1">
                            <p className="font-semibold">{d.plantIdentification.commonName}</p>
                            <p className="text-sm text-muted-foreground">{d.createdAt.toDate().toLocaleDateString()}</p>
                        </div>
                        <Badge variant={d.diseaseName.toLowerCase() === 'healthy' ? 'default' : 'destructive'}>{d.diseaseName}</Badge>
                    </Link>
                  )
                })
            ) : (
                <div className="text-center py-8 flex flex-col items-center gap-2">
                    <CircleSlash className="w-8 h-8 text-muted-foreground" />
                    <p className="text-muted-foreground">No diagnoses found yet.</p>
                    <Button variant="secondary" asChild>
                        <Link href="/diagnose">Scan your first plant</Link>
                    </Button>
                </div>
            )}
        </div>
      </CardContent>
    </Card>
  )
}
