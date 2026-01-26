
'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  VolumeX,
  Volume2,
  Camera,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  imageBasedPlantDiseaseDetection,
  type ImageBasedPlantDiseaseDetectionOutput,
} from '@/ai/flows/image-based-plant-disease-detection';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { useAppUser } from '@/hooks/use-app-user';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { supportedLanguages } from '@/lib/languages';

export default function DetectorPage() {
  const { user: appUser } = useAppUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [result, setResult] = useState<ImageBasedPlantDiseaseDetectionOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Camera state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const currentLanguageCode = appUser?.language || 'en-IN';
  const currentLanguageName = supportedLanguages.find(l => l.code === currentLanguageCode)?.name || currentLanguageCode;

  // Effect to handle camera stream activation and cleanup
  useEffect(() => {
    if (!isCameraOpen) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      return;
    }

    let isCancelled = false;

    const enableCamera = async () => {
      setHasCameraPermission(null); // Reset on open
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (isCancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        setHasCameraPermission(true);
      } catch (err) {
        if (!isCancelled) {
          console.error("Error accessing camera:", err);
          setHasCameraPermission(false);
          toast({
            title: 'Camera Access Denied',
            description: 'Please grant camera permission in your browser settings.',
            variant: 'destructive',
          });
        }
      }
    };

    enableCamera();

    return () => {
      isCancelled = true;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [isCameraOpen, toast]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUrl);
        setResult(null);
        setIsCameraOpen(false); // Close the dialog
      }
    }
  };


  const speak = (text: string, lang: string, rate: number) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate || 1;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
        setIsSpeaking(false);
        toast({
            title: "Voice Error",
            description: "Could not play audio response.",
            variant: "destructive",
        });
    }
    speechSynthesis.speak(utterance);
  };
  
  const stopSpeaking = () => {
    if (window.speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setResult(null);
    if(fileInputRef.current) fileInputRef.current.value = '';
    stopSpeaking();
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imagePreview) {
      toast({ title: 'Input Required', description: 'Please upload an image to analyze.', variant: 'destructive' });
      return;
    }
    if (!appUser || !db) return;

    setIsLoading(true);
    setResult(null);
    stopSpeaking();

    try {
      const response = await imageBasedPlantDiseaseDetection({
        photoDataUri: imagePreview,
        language: currentLanguageCode,
      });
      setResult(response);
      
      if(appUser.voiceEnabled){
          const summary = `Plant: ${response.plantName}. Diagnosis: ${response.diseaseName}. ${response.symptoms}`;
          speak(summary, currentLanguageCode, appUser.voiceSpeed);
      }

      await addDoc(collection(db, 'users', appUser.uid, 'diseaseHistory'), {
        plantName: response.plantName,
        diseaseName: response.diseaseName,
        symptoms: response.symptoms,
        causes: response.causes,
        treatment: JSON.stringify({ organic: response.organicTreatments, chemical: response.chemicalTreatments }),
        prevention: response.prevention,
        language: currentLanguageCode,
        timestamp: serverTimestamp(),
      });

      toast({
        title: 'Analysis Complete',
        description: `Diagnosis: ${response.diseaseName} on ${response.plantName}.`,
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Analysis Failed', description: 'Could not complete the analysis. Please try again.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const AnalysisSection = ({ icon, title, children }: { icon: React.ReactNode, title: string, children: React.ReactNode }) => (
      <div>
        <h3 className="font-headline text-lg flex items-center gap-2 mb-2">{icon}{title}</h3>
        <div className="text-sm text-muted-foreground prose prose-sm max-w-none">{children}</div>
      </div>
  );

  const TreatmentList = ({ treatments, title }: { treatments: { productName: string; instructions: string; link: string; }[], title: string }) => (
    <div>
        <h4 className="font-semibold text-md mb-2">{title}</h4>
        {treatments.length > 0 ? (
           <ul className="space-y-2">
              {treatments.map((treatment, index) => (
                  <li key={index} className="text-sm border-l-2 border-primary pl-3">
                      <strong className="font-medium">{treatment.productName}</strong>
                      <p className="text-xs">{treatment.instructions}</p>
                      <a href={treatment.link} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline">
                          View Product
                      </a>
                  </li>
              ))}
          </ul>
        ) : <p className="text-xs text-muted-foreground">No {title.toLowerCase()} suggested.</p>}
    </div>
);


  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">Plant Disease Detector</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Upload an image of a plant. Our AI will analyze it for diseases and provide expert recommendations.</p>
        {appUser && <p className="text-sm text-muted-foreground mt-1">Analysis will be in: <span className="font-bold text-primary">{currentLanguageName}</span></p>}
      </div>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
          <Card className="shadow-lg sticky top-24">
            <CardHeader>
              <CardTitle>1. Provide Image</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className={cn("relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-secondary transition-colors", imagePreview && "p-0")}>
                    <Input id="plant-image" type="file" accept="image/*" onChange={handleImageChange} ref={fileInputRef} className="sr-only" />
                    {imagePreview ? (
                      <div className="relative aspect-video">
                        <Image src={imagePreview} alt="Plant preview" fill className="object-contain rounded-md" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7 z-10" onClick={handleClearImage}><X className="h-4 w-4"/><span className="sr-only">Clear image</span></Button>
                      </div>
                    ) : (
                       <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-48">
                        <Label htmlFor="plant-image" className="cursor-pointer flex flex-col items-center justify-center gap-2 p-4 rounded-lg hover:bg-accent w-full">
                          <Upload className="h-10 w-10" />
                          <span className="font-medium">Click to upload image</span>
                          <span className="text-xs">PNG, JPG, etc.</span>
                        </Label>
                        <div className="flex items-center gap-2 w-full px-4">
                            <div className="flex-grow border-t"></div>
                            <span className="text-xs uppercase">Or</span>
                            <div className="flex-grow border-t"></div>
                        </div>
                        <Button type="button" variant="outline" className="w-full" onClick={() => setIsCameraOpen(true)}>
                          <Camera className="mr-2 h-4 w-4" />
                          Use Camera
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <Button type="submit" className="w-full" disabled={isLoading || !imagePreview}>
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ChevronRight className="mr-2 h-4 w-4" />}
                  Analyze Plant
                </Button>
              </form>
            </CardContent>
            <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                <DialogContent className="sm:max-w-[625px]">
                    <DialogHeader>
                        <DialogTitle>Live Camera</DialogTitle>
                        <DialogDescription>
                            Position your plant in the frame and click capture.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="relative aspect-video bg-secondary rounded-lg overflow-hidden flex items-center justify-center">
                        <video ref={videoRef} className="w-full h-full object-cover" autoPlay playsInline muted />
                        {hasCameraPermission !== true && (
                             <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                                 <Alert variant="destructive" className="w-auto">
                                    <Camera className="h-4 w-4" />
                                    <AlertTitle>Camera Access Required</AlertTitle>
                                    <AlertDescription>
                                    Please allow camera access to use this feature.
                                    </AlertDescription>
                                </Alert>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCapture} disabled={hasCameraPermission !== true}>
                            <Camera className="mr-2 h-4 w-4" /> Capture Photo
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
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
                    <Button variant="ghost" size="icon" onClick={() => { if(result && appUser) { const summary = `Plant: ${result.plantName}. Diagnosis: ${result.diseaseName}. ${result.symptoms}`; speak(summary, currentLanguageCode, appUser.voiceSpeed); } }}><Volume2 className="h-6 w-6 text-muted-foreground" /></Button>
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
                    <AnalysisSection icon={<HeartPulse className="w-5 h-5 text-primary" />} title="Treatment">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <TreatmentList treatments={result.organicTreatments} title="Organic Treatments" />
                           <TreatmentList treatments={result.chemicalTreatments} title="Chemical Treatments" />
                        </div>
                    </AnalysisSection>
                    <Separator />
                    <AnalysisSection icon={<Sparkles className="w-5 h-5 text-primary" />} title="Prevention"><p>{result.prevention}</p></AnalysisSection>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                  <FileQuestion className="h-16 w-16 mb-4" />
                  <p className="font-semibold text-lg">Your analysis will appear here.</p>
                  <p className="text-sm">Upload an image or use your camera to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
