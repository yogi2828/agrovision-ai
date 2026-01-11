'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Loader2,
  Thermometer,
  Upload,
  HeartPulse,
  Siren,
  Sparkles,
  Stethoscope,
  FileQuestion,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  imageBasedPlantDiseaseDetection,
  type ImageBasedPlantDiseaseDetectionOutput,
} from '@/ai/flows/image-based-plant-disease-detection';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { User as AppUser } from '@/lib/types';


export default function DetectorPage() {
  const { user } = useUser();
  const appUser = user as AppUser | null;
  const db = useFirestore();
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] =
    useState<ImageBasedPlantDiseaseDetectionOutput | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview || !appUser || !db) {
      toast({
        title: 'Input Required',
        description: 'Please upload an image of the plant.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await imageBasedPlantDiseaseDetection({
        photoDataUri: imagePreview,
        language: appUser.language || 'en',
      });
      setResult(response);
      await addDoc(collection(db, 'users', appUser.uid, 'diseaseRecords'), {
        plantName: response.plantName,
        disease: response.diseaseName,
        treatment: response.treatment,
        symptoms: response.symptoms,
        causes: response.causes,
        preventionTips: response.preventionTips,
        confidenceLevel: response.confidenceLevel,
        timestamp: serverTimestamp(),
      });
      toast({
        title: 'Analysis Complete',
        description: `Detected ${response.diseaseName} on ${response.plantName}.`,
      });
    } catch (error) {
      console.error('AI detection error:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not complete the disease detection. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Plant Disease Detector</h1>
        <p className="text-muted-foreground mt-2">
          Upload an image for an AI-powered diagnosis.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>1. Upload Plant Image</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center gap-4">
                  <Input
                    id="plant-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Label
                    htmlFor="plant-image"
                    className="flex-1 cursor-pointer"
                  >
                    <div className="border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-secondary transition-colors">
                      {imagePreview ? (
                        <div className="relative aspect-video">
                          <Image
                            src={imagePreview}
                            alt="Plant preview"
                            fill
                            className="object-contain rounded-md"
                          />
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                          <Upload className="h-8 w-8" />
                          <span>Click to upload image</span>
                        </div>
                      )}
                    </div>
                  </Label>
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading || !imagePreview}>
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Thermometer className="mr-2 h-4 w-4" />
                )}
                Analyze Plant
              </Button>
            </form>
          </CardContent>
        </Card>
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>2. AI Analysis Result</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                <p className="font-semibold">Analyzing image...</p>
                <p className="text-sm text-muted-foreground">Please wait a moment.</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold font-headline">{result.plantName}</h2>
                  <p className="text-xl text-primary">{result.diseaseName}</p>
                </div>
                <div>
                  <Label>Confidence Level</Label>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Progress value={result.confidenceLevel * 100} className="w-full" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{(result.confidenceLevel * 100).toFixed(0)}% Confident</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2"><Stethoscope className="h-5 w-5 text-primary" />Symptoms</h4>
                    <p className="text-muted-foreground">{result.symptoms}</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-semibold flex items-center gap-2"><Siren className="h-5 w-5 text-primary" />Causes</h4>
                    <p className="text-muted-foreground">{result.causes}</p>
                  </div>
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h4 className="font-semibold flex items-center gap-2"><HeartPulse className="h-5 w-5 text-primary" />Treatment</h4>
                    <p className="text-muted-foreground">{result.treatment}</p>
                  </div>
                  <div className="space-y-4 col-span-1 md:col-span-2">
                    <h4 className="font-semibold flex items-center gap-2"><Sparkles className="h-5 w-5 text-primary" />Prevention Tips</h4>
                    <p className="text-muted-foreground">{result.preventionTips}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <FileQuestion className="h-12 w-12 mb-4" />
                <p className="font-semibold">Your analysis results will appear here.</p>
                <p className="text-sm">Upload a plant image to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
