'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Thermometer, Droplets, FlaskConical, Bot, FileDown, Volume2, ShieldCheck } from 'lucide-react';

function ResultContent() {
  const searchParams = useSearchParams();
  const imageUrl = searchParams.get('imageUrl');

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
                <p><strong>Plant:</strong> Tomato</p>
                <p><strong>Disease:</strong> Late Blight</p>
                <p className="flex items-center"><strong>Confidence:</strong>&nbsp;<span className="font-semibold text-primary">95.2%</span></p>
            </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card className="print:shadow-none print:border-none">
          <CardHeader className="flex flex-row justify-between items-start">
            <div>
              <CardTitle className="text-2xl font-headline">Disease Report: Late Blight</CardTitle>
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
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>Dark, water-soaked spots on leaves, often with a pale green border.</li>
                <li>White, fuzzy mold may appear on the underside of leaves in humid conditions.</li>
                <li>Stems can develop dark, greasy-looking lesions.</li>
                <li>Fruits develop large, firm, brown, rough-skinned spots.</li>
              </ul>
            </div>
             <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><Droplets className="text-blue-500 h-5 w-5"/>Causes</h3>
              <p className="text-muted-foreground text-sm">
                Caused by the oomycete Phytophthora infestans. It thrives in cool, moist conditions (60-70°F / 15-21°C) with high humidity or rainfall. Spores are spread by wind and rain.
              </p>
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><FlaskConical className="text-green-600 h-5 w-5"/>Treatment</h3>
              <div className="grid gap-4 sm:grid-cols-2 text-sm">
                <div>
                    <h4 className="font-medium">Organic</h4>
                     <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                        <li>Remove and destroy infected plant parts immediately.</li>
                        <li>Apply copper-based fungicides as a preventive measure.</li>
                        <li>Improve air circulation by pruning and spacing plants.</li>
                     </ul>
                </div>
                <div>
                    <h4 className="font-medium">Chemical</h4>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1 mt-1">
                        <li>Apply fungicides containing chlorothalonil or mancozeb.</li>
                        <li>Follow label instructions carefully, especially for harvest intervals.</li>
                        <li>Alternate fungicides to prevent resistance.</li>
                    </ul>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold flex items-center gap-2 mb-2"><ShieldCheck className="text-primary h-5 w-5"/>Prevention</h3>
              <ul className="list-disc list-inside text-muted-foreground space-y-1 text-sm">
                <li>Plant disease-resistant tomato varieties.</li>
                <li>Water at the base of plants to keep foliage dry.</li>
                <li>Ensure good spacing for air circulation.</li>
                <li>Rotate crops; avoid planting tomatoes/potatoes in the same spot for 2-3 years.</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ResultPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResultContent/>
        </Suspense>
    )
}
