'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';
import {
  Loader2,
  Upload,
  HeartPulse,
  Siren,
  Sparkles,
  Stethoscope,
  FileQuestion,
  X,
  ChevronRight,
  Mic,
  VolumeX,
  Volume2,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  imageBasedPlantDiseaseDetection,
  type ImageBasedPlantDiseaseDetectionOutput,
} from '@/ai/flows/image-based-plant-disease-detection';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import type { User as AppUser } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function DetectorPage() {
  const { user } = useUser();
  const appUser = user as AppUser | null;
  const db = useFirestore();
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [voiceQuery, setVoiceQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [result, setResult] = useState<ImageBasedPlantDiseaseDetectionOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setVoiceQuery(transcript);
        handleSubmit(null, transcript);
      };
      recognitionRef.current.onerror = (event: any) => {
        toast({ title: 'Voice Error', description: `Could not process voice: ${event.error}`, variant: 'destructive' });
        setIsListening(false);
      };
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, [toast]);

  const speak = (text: string, lang: string, rate: number) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate || 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };
  
  const stopSpeaking = () => {
    if (window.speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({ title: 'Unsupported Browser', description: 'Voice recognition is not supported.', variant: 'destructive' });
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.lang = appUser?.language || 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
        setVoiceQuery('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setResult(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSubmit = async (e: React.FormEvent | null, voiceText?: string) => {
    e?.preventDefault();
    if (!imagePreview && !voiceText) {
      toast({ title: 'Input Required', description: 'Please upload an image or ask a question by voice.', variant: 'destructive' });
      return;
    }
    if (!appUser || !db) return;

    setIsLoading(true);
    setResult(null);

    try {
      const response = await imageBasedPlantDiseaseDetection({
        photoDataUri: imagePreview || undefined,
        question: voiceText || undefined,
        language: appUser.language || 'en-IN',
      });
      setResult(response);
      
      if(appUser.voiceEnabled){
          const summary = `Plant: ${response.plantName}. Diagnosis: ${response.diseaseName}. ${response.symptoms}`;
          speak(summary, appUser.language, appUser.voiceSpeed);
      }

      await addDoc(collection(db, 'users', appUser.uid, 'diseaseHistory'), {
        plantName: response.plantName,
        diseaseName: response.diseaseName,
        symptoms: response.symptoms,
        causes: response.causes,
        treatment: response.treatment,
        prevention: response.prevention,
        language: appUser.language,
        timestamp: serverTimestamp(),
      });

      toast({
        title: 'Analysis Complete',
        description: `Diagnosis: ${response.diseaseName} on ${response.plantName}.`,
      });
    } catch (error) {
      toast({ title: 'Analysis Failed', description: 'Could not complete the analysis. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
      setVoiceQuery('');
    }
  };

  const AnalysisSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
      <div>
        <h3 className="font-headline text-lg flex items-center gap-2 mb-2">{icon}{title}</h3>
        <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{children}</div>
      </div>
  );

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Plant Disease Detector</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Upload an image or use your voice to ask about a plant. Our AI will analyze it for diseases and provide expert recommendations.</p>
      </div>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle>1. Provide Input</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="plant-image" className="cursor-pointer group">Upload Image (Optional)</Label>
                  <div className={cn("relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-secondary transition-colors", imagePreview && "p-0")}>
                    <Input id="plant-image" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="hidden" />
                    {imagePreview ? (
                      <div className="relative aspect-video">
                        <Image src={imagePreview} alt="Plant preview" fill className="object-contain rounded-md" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleClearImage}><X className="h-4 w-4"/><span className="sr-only">Clear image</span></Button>
                      </div>
                    ) : (
                      <Label htmlFor="plant-image" className="cursor-pointer flex flex-col items-center justify-center gap-2 text-muted-foreground h-48">
                        <Upload className="h-10 w-10" />
                        <span className="font-medium">Click to upload image</span>
                        <span className="text-xs">Images are not stored</span>
                      </Label>
                    )}
                  </div>
                </div>
                <div className="text-center text-muted-foreground font-bold">OR</div>
                <Button type="button" onClick={handleVoiceInput} variant={isListening ? 'destructive' : 'outline'} className="w-full" disabled={isLoading}>
                  <Mic className="mr-2 h-4 w-4" />
                  {isListening ? 'Listening...' : 'Ask by Voice'}
                </Button>
                {voiceQuery && <p className="text-sm text-center text-muted-foreground italic">You asked: "{voiceQuery}"</p>}

                <Button type="submit" className="w-full" disabled={isLoading || (!imagePreview && !voiceQuery)}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                  Analyze Plant
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="shadow-lg min-h-[500px]">
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>2. AI Analysis Result</CardTitle>
                  <CardDescription>The diagnosis from our AI will appear below.</CardDescription>
                </div>
                 {appUser?.voiceEnabled && result && (isSpeaking ? (
                    <Button variant="ghost" size="icon" onClick={stopSpeaking}><VolumeX className="h-6 w-6 text-red-500" /></Button>
                  ) : (
                    <Button variant="ghost" size="icon" onClick={() => { if(result && appUser) { const summary = `Plant: ${result.plantName}. Diagnosis: ${result.diseaseName}. ${result.symptoms}`; speak(summary, appUser.language, appUser.voiceSpeed); } }}><Volume2 className="h-6 w-6 text-muted-foreground" /></Button>
                  ))}
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="font-semibold text-lg">Analyzing...</p>
                  <p className="text-sm text-muted-foreground">This may take a moment.</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="text-center bg-secondary p-4 rounded-lg">
                    <h2 className="text-2xl font-bold font-headline">{result.plantName}</h2>
                    <p className={cn("text-xl font-semibold", result.diseaseName.toLowerCase() === 'healthy' ? "text-green-600" : "text-amber-600")}>{result.diseaseName}</p>
                  </div>
                  <Alert><AlertTitle>Disclaimer</AlertTitle><AlertDescription>This AI-generated diagnosis is for informational purposes only. Always consult a professional for confirmation.</AlertDescription></Alert>
                  <div className="space-y-6">
                    <AnalysisSection icon={<Stethoscope className="w-5 h-5 text-primary" />} title="Symptoms"><p>{result.symptoms}</p></AnalysisSection>
                    <Separator />
                    <AnalysisSection icon={<Siren className="w-5 h-5 text-primary" />} title="Causes"><p>{result.causes}</p></AnalysisSection>
                    <Separator />
                    <AnalysisSection icon={<HeartPulse className="w-5 h-5 text-primary" />} title="Treatment"><p>{result.treatment}</p></AnalysisSection>
                    <Separator />
                    <AnalysisSection icon={<Sparkles className="w-5 h-5 text-primary" />} title="Prevention"><p>{result.prevention}</p></AnalysisSection>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                  <FileQuestion className="h-16 w-16 mb-4" />
                  <p className="font-semibold text-lg">Your analysis will appear here.</p>
                  <p className="text-sm">Upload a plant image or ask a voice question to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
