'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useCollection, useUser, useFirestore, useMemoFirebase } from '@/firebase';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { FileDown, Loader2, Info } from 'lucide-react';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { cropTypes } from '@/lib/data';

export default function HistoryPage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();

  const detectionsQuery = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    // Correctly query the subcollection within the user's document
    return query(
      collection(firestore, 'users', user.uid, 'detections'),
      orderBy('detectionDate', 'desc')
    );
  }, [user, firestore]);

  const { data: detectionHistory, isLoading: detectionsLoading } =
    useCollection(detectionsQuery);

  const loading = userLoading || detectionsLoading;

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Detection History
      </h1>
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <div>
            <CardTitle>Your Detections</CardTitle>
            <CardDescription>
              A log of all plant disease detections you have performed.
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by crop" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Crops</SelectItem>
                {cropTypes.map((crop) => (
                  <SelectItem key={crop} value={crop.toLowerCase()}>
                    {crop}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : !detectionHistory || detectionHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground">
                <Info className="h-8 w-8 mb-2"/>
                <p>You haven&apos;t performed any detections yet.</p>
                <p className="text-sm">Uploaded plant images will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden w-[100px] sm:table-cell">
                    Image
                  </TableHead>
                  <TableHead>Crop</TableHead>
                  <TableHead>Disease</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>
                    <span className="sr-only">Actions</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {detectionHistory?.map((detection: any) => {
                  const placeholder = PlaceHolderImages.find(
                    (img) => img.id === 'plant-disease-1'
                  );
                  return (
                    <TableRow key={detection.id}>
                      <TableCell className="hidden sm:table-cell">
                        {detection.imageURL && (
                          <Image
                            alt="Plant image"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={detection.imageURL}
                            width="64"
                          />
                        )}
                        {!detection.imageURL && placeholder && (
                          <Image
                            alt="Plant image"
                            className="aspect-square rounded-md object-cover"
                            height="64"
                            src={placeholder.imageUrl}
                            width="64"
                            data-ai-hint={placeholder.imageHint}
                          />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">
                        {detection.plantName}
                      </TableCell>
                      <TableCell>{detection.diseaseName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            detection.confidenceLevel * 100 > 95
                              ? 'default'
                              : 'secondary'
                          }
                          className={
                            detection.confidenceLevel * 100 > 95
                              ? 'bg-green-600/20 text-green-800 dark:bg-green-400/20 dark:text-green-300'
                              : ''
                          }
                        >
                          {(detection.confidenceLevel * 100).toFixed(1)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {detection.detectionDate
                          ? new Date(detection.detectionDate)
                              .toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                          : 'Just now'}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">
                          <FileDown className="h-4 w-4 mr-2" />
                          Report
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
