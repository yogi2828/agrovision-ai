
'use client';
import { useState } from 'react';
import { ImageInput } from '@/components/diagnose/image-input';
import { DiagnosisResult } from '@/components/diagnose/diagnosis-result';
import { diagnosePlantHealth, type DiagnosePlantHealthOutput } from '@/ai/flows/diagnose-plant-health';
import { Loader2, Terminal, Sparkles } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { saveDiagnosisToHistory, updateDiagnosisFeedback } from '@/lib/firebase/firestore';
import { useAuth } from '@/context/auth-context';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/context/language-context';
import { logAnalyticsEvent } from '@/lib/firebase/analytics';
import { motion, AnimatePresence } from 'framer-motion';


export default function DiagnosePage() {
  const [imageData, setImageData] = useState<string | null>(null);
  const [result, setResult] = useState<DiagnosePlantHealthOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedDiagnosisId, setSavedDiagnosisId] = useState<string | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { language } = useLanguage();

  const handleDiagnose = async (dataUri: string) => {
    setImageData(dataUri);
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      logAnalyticsEvent('analyze_request', { language });
      const diagnosis = await diagnosePlantHealth({ photoDataUri: dataUri, language: language });
      setResult(diagnosis);
    } catch (e) {
      console.error(e);
      setError('Failed to diagnose plant. The AI model might be busy or an error occurred. Please try again.');
       logAnalyticsEvent('analyze_request_failed');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setImageData(null);
    setResult(null);
    setError(null);
    setLoading(false);
  }

  const handleSave = async () => {
    if (!user || !result) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'You must be logged in and have a diagnosis result to save.'
        });
        return;
    }
    try {
        const docRef = await saveDiagnosisToHistory(user.uid, result);
        setSavedDiagnosisId(docRef.id);
        logAnalyticsEvent('save_history', { plant: result.plantIdentification.commonName });
        toast({
            title: 'Saved to My History',
            description: 'You can view your saved diagnoses on the History page.'
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: 'Save Failed',
            description: 'Could not save diagnosis to your history.'
        });
    }
  }

  const handleFeedbackSubmit = async (rating: number) => {
    if (!user || !savedDiagnosisId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Cannot submit feedback without a saved diagnosis.'
      });
      return;
    }
    try {
      // This function will be created in firestore.ts next
      await updateDiagnosisFeedback(user.uid, savedDiagnosisId, rating);
      logAnalyticsEvent('submit_feedback', { rating });
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!'
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Feedback Failed',
        description: 'Could not submit feedback.'
      });
    }
  };

  return (
    <motion.div 
        className="container mx-auto max-w-6xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
    >
       <div className="text-center mb-8">
        <h1 className="font-headline text-3xl md:text-4xl font-bold tracking-tight">Plant Health Diagnosis</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl mx-auto">Upload a photo or use your camera to get an instant AI-powered diagnosis.</p>
      </div>
      
      {error && (
         <Alert variant="destructive" className="mb-4">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
         </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
        <div className="lg:order-1">
          <AnimatePresence mode="wait">
            {!result && !loading && (
              <motion.div
                  key="image-input"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
              >
                  <ImageInput onDiagnose={handleDiagnose} loading={loading} />
              </motion.div>
            )}

            {loading && (
              <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
              >
                  <Card>
                    <CardContent className="flex flex-col items-center justify-center gap-4 text-center p-8 rounded-lg min-h-[400px]">
                        <div className="relative">
                          <Sparkles className="absolute -top-4 -right-4 h-8 w-8 text-primary animate-pulse" />
                          <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">Analyzing Plant...</h2>
                        <p className="text-muted-foreground">Our AI is checking leaf patterns and disease markers. This may take a moment.</p>
                        {imageData && <img src={imageData} alt="Plant for diagnosis" className="mt-4 max-h-64 rounded-lg shadow-md" />}
                    </CardContent>
                  </Card>
              </motion.div>
            )}
          </AnimatePresence>
           {result && (
              <AnimatePresence>
                  <motion.div
                      key="result"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                  >
                      <DiagnosisResult result={result} image={imageData} onReset={handleReset} onSave={handleSave} onFeedbackSubmit={handleFeedbackSubmit} />
                  </motion.div>
              </AnimatePresence>
            )}
        </div>

        <div className="lg:order-2 mt-8 lg:mt-0">
          {!result && !loading && (
              <motion.div
                  key="awaiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-8 lg:mt-0"
              >
                  <Card>
                    <CardContent className="p-6 text-center flex flex-col items-center justify-center min-h-[400px]">
                      <Sparkles className="w-12 h-12 mx-auto text-primary mb-4" />
                      <h3 className="text-xl font-semibold">Awaiting Diagnosis</h3>
                      <p className="text-muted-foreground mt-2">Your plant's health analysis will appear here once you upload an image and start the diagnosis.</p>
                    </CardContent>
                  </Card>
              </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
