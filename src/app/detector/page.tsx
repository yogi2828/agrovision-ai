'use client';

import { useState, useRef } from 'react';
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
  CardFooter,
} from '@/components/ui/card';
import {
  Loader2,
  Upload,
  HeartPulse,
  Siren,
  Sparkles,
  Stethoscope,
  FileQuestion,
  Leaf,
  FlaskConical,
  X,
  ExternalLink,
  ChevronRight,
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
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function DetectorPage() {
  const { user } = useUser();
  const appUser = user as AppUser | null;
  const db = useFirestore();
  const { toast } = useToast();

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] =
    useState<ImageBasedPlantDiseaseDetectionOutput | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setResult(null); // Clear previous results
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setImagePreview(null);
    setResult(null);
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  }

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
      
      const isHealthy = response.diseaseName.toLowerCase() === 'healthy';

      if (!isHealthy) {
        await addDoc(collection(db, 'users', appUser.uid, 'diseaseRecords'), {
          plantName: response.plantName,
          disease: response.diseaseName,
          treatment: `Organic: ${response.organicTreatments.map(t => t.name).join(', ')}. Chemical: ${response.chemicalTreatments.map(t => t.name).join(', ')}`,
          symptoms: response.symptoms,
          causes: response.causes,
          preventionTips: response.preventionTips,
          confidenceLevel: response.confidenceLevel,
          timestamp: serverTimestamp(),
        });
      }

      toast({
        title: 'Analysis Complete',
        description: isHealthy ? `${response.plantName} looks healthy!` : `Detected ${response.diseaseName} on ${response.plantName}.`,
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

  const AnalysisSection = ({ icon, title, children, defaultOpen = false }: { icon: React.ReactNode, title: string, children: React.ReactNode, defaultOpen?: boolean }) => (
      <div>
        <h3 className="font-headline text-lg flex items-center gap-2 mb-2">
            {icon}
            {title}
        </h3>
        <div className="text-sm text-muted-foreground prose prose-sm max-w-none">
            {children}
        </div>
    </div>
  );
  
  const isHealthy = result?.diseaseName.toLowerCase() === 'healthy';

  return (
    <div className="container py-8 md:py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline tracking-tight">
          Plant Disease Detector
        </h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">
          Upload an image of a plant leaf, and our AI will analyze it for diseases and provide expert recommendations.
        </p>
      </div>
      <div className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-2">
            <Card className="shadow-lg sticky top-24">
                <CardHeader>
                    <CardTitle>1. Upload Plant Image</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                            id="plant-image"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                            ref={fileInputRef}
                            className="hidden"
                            />
                            <Label
                            htmlFor="plant-image"
                            className="cursor-pointer group"
                            >
                            <div className={cn("relative border-2 border-dashed border-muted-foreground/50 rounded-lg p-4 text-center hover:bg-secondary transition-colors", imagePreview && "p-0")}>
                                {imagePreview ? (
                                <div className="relative aspect-video">
                                    <Image
                                    src={imagePreview}
                                    alt="Plant preview"
                                    fill
                                    className="object-contain rounded-md"
                                    />
                                    <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={handleClearImage}>
                                        <X className="h-4 w-4"/>
                                        <span className="sr-only">Clear image</span>
                                    </Button>
                                </div>
                                ) : (
                                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground h-48">
                                    <Upload className="h-10 w-10" />
                                    <span className="font-medium">Click to upload image</span>
                                    <span className="text-xs">PNG, JPG, or WEBP</span>
                                </div>
                                )}
                            </div>
                            </Label>
                        </div>

                        <Button type="submit" className="w-full" disabled={isLoading || !imagePreview}>
                            {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                            <ChevronRight className="mr-2 h-4 w-4" />
                            )}
                            Analyze Plant
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
        <div className="lg:col-span-3">
          <Card className="shadow-lg min-h-[500px]">
            <CardHeader>
              <CardTitle>2. AI Analysis Result</CardTitle>
              <CardDescription>
                The diagnosis from our AI will appear below.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-16">
                  <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
                  <p className="font-semibold text-lg">Analyzing image...</p>
                  <p className="text-sm text-muted-foreground">This may take a moment. Please wait.</p>
                </div>
              ) : result ? (
                <div className="space-y-6">
                  <div className="text-center bg-secondary p-4 rounded-lg">
                    <h2 className="text-2xl font-bold font-headline">{result.plantName}</h2>
                    <p className={cn("text-xl font-semibold", isHealthy ? "text-green-600" : "text-amber-600")}>{result.diseaseName}</p>
                     {!isHealthy && (
                        <div>
                        <Label className="text-xs">Confidence Level</Label>
                        <TooltipProvider>
                            <Tooltip>
                            <TooltipTrigger asChild>
                                <Progress value={result.confidenceLevel * 100} className="w-full max-w-xs mx-auto mt-1" />
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>{(result.confidenceLevel * 100).toFixed(0)}% Confident</p>
                            </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                        </div>
                     )}
                  </div>
                  
                  {isHealthy ? (
                     <AnalysisSection icon={<Sparkles className="w-5 h-5 text-primary" />} title="Care Tips">
                        <p>{result.preventionTips}</p>
                    </AnalysisSection>
                  ) : (
                    <div className="space-y-6">
                        <AnalysisSection icon={<Stethoscope className="w-5 h-5 text-primary" />} title="Symptoms">
                            <p>{result.symptoms}</p>
                        </AnalysisSection>
                        <Separator/>
                        <AnalysisSection icon={<Siren className="w-5 h-5 text-primary" />} title="Causes">
                            <p>{result.causes}</p>
                        </AnalysisSection>
                        <Separator/>
                        <div>
                            <h3 className="font-headline text-lg flex items-center gap-2 mb-4"><HeartPulse className="w-5 h-5 text-primary" />Treatment Options</h3>
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2"><Leaf className="w-4 h-4 text-green-600"/>Organic Treatments</h4>
                                    {result.organicTreatments.map((t, i) => (
                                        <Card key={`org-${i}`} className="bg-background">
                                            <CardHeader className='p-4'>
                                                <CardTitle className="text-base">{t.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 text-sm">
                                                <p className="text-muted-foreground mb-3">{t.description}</p>
                                            </CardContent>
                                             <CardFooter className="p-4 pt-0">
                                                <a href={t.link} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({variant: 'outline', size:'sm'}), "w-full")}>
                                                    Find Product <ExternalLink className="ml-2 h-3 w-3" />
                                                </a>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                               <div className="space-y-3">
                                    <h4 className="font-semibold flex items-center gap-2"><FlaskConical className="w-4 h-4 text-orange-600"/>Chemical Treatments</h4>
                                    {result.chemicalTreatments.map((t, i) => (
                                        <Card key={`chem-${i}`} className="bg-background">
                                            <CardHeader className='p-4'>
                                                <CardTitle className="text-base">{t.name}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-4 pt-0 text-sm">
                                                <p className="text-muted-foreground mb-3">{t.description}</p>
                                            </CardContent>
                                            <CardFooter className="p-4 pt-0">
                                                <a href={t.link} target="_blank" rel="noopener noreferrer" className={cn(buttonVariants({variant: 'outline', size:'sm'}), "w-full")}>
                                                    Find Product <ExternalLink className="ml-2 h-3 w-3" />
                                                </a>
                                            </CardFooter>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <Separator/>
                         <AnalysisSection icon={<Sparkles className="w-5 h-5 text-primary" />} title="Prevention Tips">
                            <p>{result.preventionTips}</p>
                        </AnalysisSection>
                    </div>
                  )}

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground py-16">
                  <FileQuestion className="h-16 w-16 mb-4" />
                  <p className="font-semibold text-lg">Your analysis will appear here.</p>
                  <p className="text-sm">Upload a plant image to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
