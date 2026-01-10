'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { detectDisease, DetectDiseaseOutput } from '@/ai/ai-disease-detection';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';

export default function DetectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Select an image');
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setLoading(true);
        setStatus('Reading file...');
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          const photoDataUri = e.target?.result as string;

          try {
            setStatus('Analyzing with AI...');
            const result = await detectDisease({ photoDataUri });

            if (!user || !firestore) {
              // Not logged in, so just show result
              const encodedResult = encodeURIComponent(JSON.stringify(result));
              const encodedUrl = encodeURIComponent(photoDataUri);
              router.push(
                `/dashboard/detect/result?imageUrl=${encodedUrl}&result=${encodedResult}`
              );
              return;
            }

            // Logged in, so save to Firestore
            setStatus('Saving results...');
            const storage = getStorage();
            const storageRef = ref(
              storage,
              `detections/${user.uid}/${Date.now()}`
            );

            const snapshot = await uploadString(
              storageRef,
              photoDataUri,
              'data_url'
            );
            const imageUrl = await getDownloadURL(snapshot.ref);

            const docRef = await addDoc(collection(firestore, 'detections'), {
              ...result,
              userId: user.uid,
              createdAt: new Date(),
              imageUrl: imageUrl,
            });

            const encodedResult = encodeURIComponent(JSON.stringify(result));
            router.push(
              `/dashboard/detect/result?imageUrl=${encodeURIComponent(
                imageUrl
              )}&result=${encodedResult}&id=${docRef.id}`
            );
          } catch (error) {
            console.error('Detection failed:', error);
            setLoading(false);
            toast({
              variant: 'destructive',
              title: 'AI Analysis Failed',
              description:
                'There was a problem analyzing your image. Please try again.',
            });
          }
        };
        reader.onerror = () => {
          setLoading(false);
          toast({
            variant: 'destructive',
            title: 'Error reading file',
            description: 'There was a problem reading the selected image.',
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [router, toast, user, firestore]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">
        Detect Plant Disease
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload or drag and drop an image of the affected plant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {loading ? (
              <div className="flex flex-col items-center text-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">{status}</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4">
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-muted-foreground">Drop the image here ...</p>
                ) : (
                  <p className="text-muted-foreground">
                    Drag & drop an image here, or click to select a file
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ImageIcon className="h-4 w-4" />
                  <span>JPEG, PNG, JPG, WEBP accepted</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
