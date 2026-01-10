'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  UploadCloud,
  Image as ImageIcon,
  Loader2,
  Thermometer,
  Droplets,
  FlaskConical,
  FileDown,
  Bot,
  Volume2,
  ArrowLeft,
} from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { detectDisease, type DetectDiseaseOutput } from '@/ai/ai-disease-detection';
import { useUser, useFirestore } from '@/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadString,
  getDownloadURL,
} from 'firebase/storage';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { Button } from '@/components/ui/button';


// Combine the output with what we'll actually use for display
type ResultData = Omit<DetectDiseaseOutput, 'treatment'> & { 
  imageURL: string;
  treatmentOrganic: string;
  treatmentChemical: string;
};


export default function DetectPage() {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Select an image');
  const [detectionResult, setDetectionResult] = useState<ResultData | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const firestore = useFirestore();

  const handleBackToDetection = () => {
    setDetectionResult(null);
    setImagePreview(null);
  };

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        setLoading(true);
        setStatus('Reading file...');
        const file = acceptedFiles[0];
        const reader = new FileReader();
        reader.onload = async (e) => {
          const photoDataUri = e.target?.result as string;
          setImagePreview(photoDataUri);

          try {
            setStatus('Analyzing with AI...');
            const result = await detectDisease({ photoDataUri });
            
            // This is the data we'll save and show
            const finalResultData: Omit<ResultData, 'imageURL'> = {
              plantName: result.plantName,
              diseaseName: result.diseaseName,
              confidenceLevel: result.confidenceLevel,
              symptoms: result.symptoms,
              causes: result.causes,
              treatmentOrganic: result.treatment.organic,
              treatmentChemical: result.treatment.chemical,
            };

            if (!user || !firestore) {
              // For guests, use the local data URI for the image
              setDetectionResult({ ...finalResultData, imageURL: photoDataUri });
              setLoading(false);
              return;
            }

            // For logged-in users, upload the image to Firebase Storage
            setStatus('Saving results...');
            const storage = getStorage();
            const storageRef = ref(storage, `detections/${user.uid}/${Date.now()}`);
            const snapshot = await uploadString(storageRef, photoDataUri, 'data_url');
            const imageURL = await getDownloadURL(snapshot.ref);
            
            const docData = {
              ...finalResultData,
              userId: user.uid,
              imageURL,
              detectionDate: new Date().toISOString(),
              createdAt: serverTimestamp(),
            };
            
            const detectionsCol = collection(firestore, 'users', user.uid, 'detections');
            
            addDoc(detectionsCol, docData).then(() => {
                setDetectionResult({ ...finalResultData, imageURL });
                setLoading(false);
            }).catch(error => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                    path: detectionsCol.path,
                    operation: 'create',
                    requestResourceData: docData,
                }));
                setLoading(false);
                toast({
                  variant: 'destructive',
                  title: 'Save Failed',
                  description: 'Could not save detection to your history.',
                });
            });

          } catch (error) {
            console.error('Detection failed:', error);
            setLoading(false);
            setImagePreview(null);
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
          setImagePreview(null);
          toast({
            variant: 'destructive',
            title: 'Error reading file',
            description: 'There was a problem reading the selected image.',
          });
        };
        reader.readAsDataURL(file);
      }
    },
    [toast, user, firestore]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
    disabled: loading,
  });

  const handlePrint = () => {
    window.print();
  }

  // If we have a result, show the result view
  if (detectionResult && imagePreview) {
    return (
        <div>
            <Button variant="outline" className="mb-4" onClick={handleBackToDetection}><ArrowLeft className="mr-2 h-4 w-4"/>Back to Detection</Button>
            <div className="grid gap-8 md:grid-cols-3">
                <div className="md:col-span-1 space-y-4">
                    <Card>
                    <CardHeader>
                        <CardTitle>Uploaded Image</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Image
                        src={imagePreview}
                        alt="Uploaded plant"
                        width={400}
                        height={300}
                        className="rounded-lg object-cover w-full aspect-video"
                        />
                    </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Detection Result</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <p><strong>Plant:</strong> {detectionResult.plantName}</p>
                            <p><strong>Disease:</strong> {detectionResult.diseaseName}</p>
                            <p className="flex items-center"><strong>Confidence:</strong>&nbsp;<span className="font-semibold text-primary">{ (detectionResult.confidenceLevel * 100).toFixed(1) }%</span></p>
                        </CardContent>
                    </Card>
                </div>

                <div className="md:col-span-2">
                    <Card className="print:shadow-none print:border-none">
                    <CardHeader className="flex flex-row justify-between items-start">
                        <div>
                        <CardTitle className="text-2xl font-headline">Disease Report: {detectionResult.diseaseName}</CardTitle>
                        <p className="text-muted-foreground">Detailed analysis and treatment plan</p>
                        </div>
                        <div className="flex gap-2 print:hidden">
                        <Button variant="outline" size="icon"><Volume2 className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon"><Bot className="h-4 w-4" /></Button>
                        <Button variant="outline" size="icon" onClick={handlePrint}><FileDown className="h-4 w-4" /></Button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Thermometer className="text-destructive h-5 w-5"/>Symptoms</h3>
                        <p className="text-muted-foreground text-sm">{detectionResult.symptoms}</p>
                        </div>
                        <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><Droplets className="text-blue-500 h-5 w-5"/>Causes</h3>
                        <p className="text-muted-foreground text-sm">
                            {detectionResult.causes}
                        </p>
                        </div>
                        <div>
                        <h3 className="font-semibold flex items-center gap-2 mb-2"><FlaskConical className="text-green-600 h-5 w-5"/>Treatment</h3>
                        <div className="grid gap-4 sm:grid-cols-2 text-sm">
                            <div>
                                <h4 className="font-medium">Organic</h4>
                                <p className="text-muted-foreground text-sm mt-1">{detectionResult.treatmentOrganic}</p>
                            </div>
                            <div>
                                <h4 className="font-medium">Chemical</h4>
                                <p className="text-muted-foreground text-sm mt-1">{detectionResult.treatmentChemical}</p>
                            </div>
                        </div>
                        </div>
                    </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
  }

  // Otherwise, show the uploader view
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
            } ${loading ? 'cursor-wait' : ''}`}
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
