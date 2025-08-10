'use client';
import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, Camera, X, ScanSearch, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useToast } from '@/hooks/use-toast';

interface ImageInputProps {
  onDiagnose: (dataUri: string) => void;
  loading: boolean;
}

export function ImageInput({ onDiagnose, loading }: ImageInputProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const startCamera = async () => {
    setShowCamera(true);
  };
  
  useEffect(() => {
    if (!showCamera) {
        return;
    }
    const getCameraPermission = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access. Try uploading a file instead.',
        });
        setShowCamera(false);
        setHasCameraPermission(false);
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings.',
        });
        setShowCamera(false);
      }
    };

    getCameraPermission();
    
    // Cleanup function
    return () => {
       if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
       }
    }

  }, [showCamera, toast]);


  const stopCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  }, []);

  const takePicture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUri = canvas.toDataURL('image/jpeg');
        setImagePreview(dataUri);
      }
      stopCamera();
    }
  };

  const handleDiagnoseClick = () => {
    if (imagePreview) {
      onDiagnose(imagePreview);
    }
  };

  const resetPreview = () => {
    setImagePreview(null);
  };
  
  if (showCamera) {
    return (
      <Card>
        <CardContent className="p-4 text-center">
            <video ref={videoRef} autoPlay playsInline muted className="w-full rounded-md aspect-video object-cover bg-muted"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="flex justify-center gap-4 mt-4">
                <Button onClick={takePicture}><Camera className="mr-2 h-4 w-4" /> Capture</Button>
                <Button variant="outline" onClick={stopCamera}><X className="mr-2 h-4 w-4" /> Cancel</Button>
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-2 border-dashed border-primary/50">
      <CardContent className="p-4 text-center flex flex-col items-center justify-center min-h-[400px]">
        {imagePreview ? (
          <div className="relative w-full flex flex-col items-center">
            <img src={imagePreview} alt="Plant preview" className="max-h-80 rounded-lg shadow-md" />
            <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 rounded-full h-8 w-8 z-10" onClick={resetPreview}>
              <X className="h-4 w-4" />
            </Button>
            <Button onClick={handleDiagnoseClick} disabled={loading} size="lg" className="mt-6 w-full max-w-xs">
              <ScanSearch className="mr-2"/>
              Analyze Plant - Get Treatment
            </Button>
          </div>
        ) : (
          <div className="space-y-6 max-w-md">
            <h2 className="text-2xl font-semibold font-headline">Get Started</h2>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild className="flex-1 cursor-pointer" size="lg">
                <label>
                  <Upload className="mr-2" />
                  Upload from Gallery
                  <input type="file" accept="image/*" className="sr-only" onChange={handleFileChange} />
                </label>
              </Button>
              <Button onClick={startCamera} className="flex-1" size="lg" variant="secondary">
                <Camera className="mr-2" />
                Use Camera
              </Button>
            </div>
            <p className="text-xs text-muted-foreground px-4">For best results, use a clear, well-lit photo of the affected area. Ensure the leaf or symptom is in focus.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
