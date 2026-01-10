'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDropzone } from 'react-dropzone';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UploadCloud, Image as ImageIcon, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export default function DetectPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setLoading(true);
      const file = acceptedFiles[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        // Simulate AI processing
        setTimeout(() => {
          // In a real app, you would upload the file and get an ID from the backend.
          // Here we pass the image data URL via query params for demonstration.
          const encodedUrl = encodeURIComponent(imageUrl);
          router.push(`/dashboard/detect/result?imageUrl=${encodedUrl}`);
        }, 2000);
      };
      reader.onerror = () => {
        setLoading(false);
        toast({
          variant: "destructive",
          title: "Error reading file",
          description: "There was a problem reading the selected image.",
        });
      };
      reader.readAsDataURL(file);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg', '.webp'] },
    maxFiles: 1,
  });

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">Detect Plant Disease</h1>
      <Card>
        <CardHeader>
          <CardTitle>Upload Image</CardTitle>
          <CardDescription>
            Upload or drag and drop an image of the affected plant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/10' : 'hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            {loading ? (
              <div className="flex flex-col items-center text-center gap-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
                <p className="text-muted-foreground">Analyzing your image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center text-center gap-4">
                <UploadCloud className="h-12 w-12 text-muted-foreground" />
                {isDragActive ? (
                  <p className="text-muted-foreground">Drop the image here ...</p>
                ) : (
                  <p className="text-muted-foreground">
                    Drag & drop an image here, or click to select a file
                  </p>
                )}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <ImageIcon className="h-4 w-4"/>
                    <span>JPEG, PNG, JPG, WEBP accepted</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
