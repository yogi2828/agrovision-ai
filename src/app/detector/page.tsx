'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
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
  Mic,
  Thermometer,
  Upload,
  HeartPulse,
  Siren,
  Sparkles,
  Stethoscope,
  X,
  FileQuestion,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  voiceQueryPlantDiseaseDetection,
  type VoiceQueryPlantDiseaseDetectionOutput,
} from '@/ai/flows/voice-query-plant-disease-detection';
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
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] =
    useState<VoiceQueryPlantDiseaseDetectionOutput | null>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      toast({
        title: 'Image Uploaded',
        description:
          "Note: Image analysis is not yet implemented. Please use a voice query to describe the plant's symptoms.",
        duration: 7000,
      });
    }
  };

  const handleVoiceInput = () => {
     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: 'Unsupported Browser',
        description: 'Your browser does not support voice recognition.',
        variant: 'destructive',
      });
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = appUser?.language || 'en-US';
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event) => {
      let transcript = '';
      for (let i = 0; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      setVoiceQuery(transcript);
    };
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
      toast({
        title: 'Voice Error',
        description: 'Could not understand audio. Please try again.',
        variant: 'destructive',
      });
    };

    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voiceQuery.trim() || !appUser || !db) {
      toast({
        title: 'Input Required',
        description: 'Please provide a voice query describing the symptoms.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await voiceQueryPlantDiseaseDetection({
        voiceQuery,
        language: appUser.language || 'en',
      });
      setResult(response);
      await addDoc(collection(db, 'users', appUser.uid, 'diseaseRecords'), {
        plantName: response.plantName,
        disease: response.diseaseName,
        treatment: response.treatment,
        timestamp: serverTimestamp(),
        // Spread the rest of the response, which might contain more fields than the type
        ...response,
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
          Upload an image and use your voice to describe symptoms for an AI-powered diagnosis.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle>1. Provide Plant Info</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="plant-image">Upload Plant Image</Label>
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
              <div className="space-y-2">
                <Label htmlFor="voice-query">Voice Query</Label>
                <div className="relative">
                  <Textarea
                    id="voice-query"
                    placeholder="Describe the symptoms: 'The tomato leaves have yellow spots and are curling...'"
                    value={voiceQuery}
                    onChange={(e) => setVoiceQuery(e.target.value)}
                    rows={4}
                  />
                  <Button
                    type="button"
                    variant={isRecording ? 'destructive' : 'outline'}
                    size="icon"
                    onClick={handleVoiceInput}
                    className="absolute bottom-2 right-2"
                  >
                    {isRecording ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
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
                <p className="font-semibold">Analyzing symptoms...</p>
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
                <p className="text-sm">Provide a voice query to get started.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
