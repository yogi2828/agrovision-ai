'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, FlaskConical, Bot, FileDown, Volume2, ShieldCheck, Loader2 } from 'lucide-react';
import type { DetectDiseaseOutput } from '@/ai/ai-disease-detection';

// Extend the output type to include the optional imageUrl from our logic
type ResultData = DetectDiseaseOutput & { imageUrl?: string };

function ResultContent() {
  const searchParams = useSearchParams();
  // We can get all data from just the result param now
  const resultString = searchParams.get('result');

  let result: ResultData | null = null;
  if (resultString) {
    try {
      result = JSON.parse(decodeURIComponent(resultString));
    } catch (error) {
      console.error("Failed to parse result:", error);
    }
  }
  
  const imageUrl = result?.imageUrl || searchParams.get('imageUrl');


  if (!result) {
    return (
        <div className="flex justify-center items-center h-64">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <p className="ml-4 text-muted-foreground">Loading results...</p>
        </div>
    )
  }

  if (!imageUrl) {
    return (
      <div className="text-center">
        <CardTitle>No Image Found</CardTitle>
        <p className="text-muted-foreground mt-2">Please go back and upload an image to see the detection result.</p>
      </div>
    );
  }

  const handlePrint = () => {
    window.print();
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Image</CardTitle>
          </CardHeader>
          <CardContent>
            <Image
              src={imageUrl}
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
                <p><strong>Plant:</strong> {result.plantName}</p>
                <p><strong>Disease:</strong> {result.diseaseName}</p>
                <p className="flex items-center"><strong>Confidence:</strong>&nbsp;<span className="font-semibold text-primary">{ (result.confidenceLevel * 100).toFixed(1) }%</span></p>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-headline">Disease Report: {result.diseaseName}</CardTitle>
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
              <p className="text-muted-foreground text-sm">{result.symptoms}</p>
            </div>
             <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><Droplets className="text-blue-500 h-5 w-5"/>Causes</h3>
              <p className="text-muted-foreground text-sm">
                {result.causes}
              </p>
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><FlaskConical className="text-green-600 h-5 w-5"/>Treatment</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                    <h4 className="font-medium">Organic</h4>
                     <p className="text-muted-foreground text-sm mt-1">{result.treatment.organic}</p>
                </div>
                <div>
                    <h4 className="font-medium">Chemical</h4>
                    <p className="text-muted-foreground text-sm mt-1">{result.treatment.chemical}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResultPage() {
    return (
        <Suspense fallback={
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
        }>
            <ResultContent/>
        </Suspense>
    )
}
