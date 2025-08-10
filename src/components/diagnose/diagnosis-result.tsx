import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Leaf, FlaskConical, AlertTriangle, CalendarDays, RefreshCw, Sun, Droplets, HeartPulse, Save, Trees, CircleDollarSign } from "lucide-react";
import type { DiagnosePlantHealthOutput } from "@/ai/flows/diagnose-plant-health";
import Image from 'next/image';
import Link from "next/link";

interface DiagnosisResultProps {
  result: DiagnosePlantHealthOutput;
  image: string | null;
  onReset: () => void;
  onSave: () => void;
  isHistoryView?: boolean;
}

export function DiagnosisResult({ result, image, onReset, onSave, isHistoryView = false }: DiagnosisResultProps) {
  const isHealthy = !result.diseaseName || result.diseaseName.toLowerCase() === 'healthy';

  const TreatmentListItem = ({ name, description, productUrl }: { name: string, description: string, productUrl?: string }) => (
    <li className="mb-2">
      <strong>{name}</strong>: <span dangerouslySetInnerHTML={{ __html: description.replace(/\n/g, '<br />')}}></span>
      {productUrl && (
        <Button variant="link" asChild className="p-1 h-auto -ml-1">
            <Link href={productUrl} target="_blank" rel="noopener noreferrer">
             (Find Product)
            </Link>
        </Button>
      )}
    </li>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <Card>
        <CardHeader className="text-center pb-4">
            {image && <Image src={image} alt="Diagnosed plant" width={200} height={200} className="rounded-lg mx-auto mb-4 shadow-lg object-cover aspect-square" />}
            <Badge variant={isHealthy ? "default" : "destructive"} className="mx-auto text-base px-4 py-1">
                {isHealthy ? <CheckCircle className="mr-2 h-5 w-5" /> : <AlertTriangle className="mr-2 h-5 w-5" />}
                {isHealthy ? "Healthy" : result.diseaseName}
            </Badge>
            <CardTitle className="text-3xl font-headline mt-2">{isHealthy ? "Your Plant appears Healthy!" : result.diseaseName}</CardTitle>
            {!isHealthy && result.stage && <CardDescription>Stage: {result.stage}</CardDescription>}
        </CardHeader>
        <CardContent>
           <p className="text-center text-muted-foreground">{result.summary}</p>
        </CardContent>
      </Card>
      
      <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Trees /> Plant Identification</CardTitle>
          </CardHeader>
          <CardContent>
              {result.plantIdentification?.isPlant ? (
                <>
                  <p><strong>Common Name:</strong> {result.plantIdentification.commonName}</p>
                  <p><strong>Latin Name:</strong> <em>{result.plantIdentification.latinName}</em></p>
                </>
              ) : (
                <p>Our AI could not identify a plant in the image. Please try another photo.</p>
              )}
          </CardContent>
      </Card>


      {!isHealthy && (
        <Card>
            <CardHeader>
                <CardTitle>Diagnosis Details</CardTitle>
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><AlertTriangle className="text-amber-500" /> Symptoms</h3>
                    <p className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: result.symptoms.replace(/\n/g, '<br />') }}></p>
                </div>
                 <div className="space-y-2">
                    <h3 className="font-semibold flex items-center gap-2"><XCircle className="text-red-500" /> Causes</h3>
                    <p className="text-muted-foreground text-sm" dangerouslySetInnerHTML={{ __html: result.causes.replace(/\n/g, '<br />') }}></p>
                </div>
            </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
            <CardTitle>Care Plan</CardTitle>
            <CardDescription>Recommendations to {isHealthy ? 'keep your plant thriving' : 'help your plant recover'}.</CardDescription>
        </CardHeader>
        <CardContent>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
                <Card className="p-4">
                    <Sun className="mx-auto w-8 h-8 text-amber-500 mb-2" />
                    <h4 className="font-semibold">Sunlight</h4>
                    <p className="text-sm text-muted-foreground">{result.careRecommendations.sunlight}</p>
                </Card>
                <Card className="p-4">
                    <Droplets className="mx-auto w-8 h-8 text-blue-500 mb-2" />
                    <h4 className="font-semibold">Watering</h4>
                    <p className="text-sm text-muted-foreground">{result.careRecommendations.watering}</p>
                </Card>
                 <Card className="p-4">
                    <HeartPulse className="mx-auto w-8 h-8 text-emerald-500 mb-2" />
                    <h4 className="font-semibold">Fertilizer</h4>
                    <p className="text-sm text-muted-foreground">{result.careRecommendations.fertilizer}</p>
                </Card>
            </div>
            {!isHealthy && (result.treatmentSuggestions.organic.length > 0 || result.treatmentSuggestions.chemical.length > 0) && (
                <Tabs defaultValue="organic">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="organic"><Leaf className="mr-2" /> Organic</TabsTrigger>
                        <TabsTrigger value="chemical"><FlaskConical className="mr-2" /> Chemical</TabsTrigger>
                    </TabsList>
                    <TabsContent value="organic" className="mt-4">
                        <ul className="pl-1 space-y-2 text-muted-foreground">
                            {result.treatmentSuggestions.organic.map((t, i) => <TreatmentListItem key={`org-${i}`} {...t} />)}
                        </ul>
                    </TabsContent>
                    <TabsContent value="chemical" className="mt-4">
                        <ul className="pl-1 space-y-2 text-muted-foreground">
                             {result.treatmentSuggestions.chemical.map((t, i) => <TreatmentListItem key={`chem-${i}`} {...t} />)}
                        </ul>
                    </TabsContent>
                </Tabs>
            )}
        </CardContent>
      </Card>
      
       {!isHealthy && (
            <Card>
                <CardHeader>
                    <CardTitle>Prognosis</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                        <CalendarDays className="w-8 h-8 text-primary mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold">Estimated Recovery</h4>
                            <p className="text-primary font-bold text-lg">{result.recoveryEstimateDays} days</p>
                        </div>
                    </div>
                     <div className="flex items-start gap-3">
                        <CircleDollarSign className="w-8 h-8 text-primary mt-1 flex-shrink-0"/>
                        <div>
                            <h4 className="font-semibold">Budget Estimate</h4>
                            <p className="text-muted-foreground">{result.budgetEstimate}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>
       )}

      <div className="flex flex-col sm:flex-row justify-end items-center gap-4 p-4 rounded-lg bg-card border">
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Button onClick={onReset} size="lg" className="w-full sm:w-auto" variant="outline">
                {isHistoryView ? "Back to History" : <><RefreshCw className="mr-2 h-5 w-5" /> Scan Another</>}
            </Button>
            {!isHistoryView && (
                <Button onClick={onSave} size="lg" className="w-full sm:w-auto">
                    <Save className="mr-2 h-5 w-5" /> Save to History
                </Button>
            )}
        </div>
      </div>
    </div>
  );
}
