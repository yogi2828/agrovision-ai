'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { supportedLanguages } from '@/lib/languages';
import { useTheme } from 'next-themes';

type SettingsFormValues = {
  language: string;
  voiceEnabled: boolean;
  voiceSpeed: number;
  theme: string;
};

export default function SettingsPage() {
  const { user, loading: authLoading } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const { toast } = useToast();
  
  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isSubmitting, isDirty },
  } = useForm<SettingsFormValues>();
  
  const voiceEnabled = watch('voiceEnabled');


  useEffect(() => {
    if (user) {
      reset({
        language: user.language || 'en',
        voiceEnabled: user.voiceEnabled ?? true,
        voiceSpeed: user.voiceSpeed ?? 1,
        theme: theme || 'system',
      });
    }
  }, [user, theme, reset]);

  const onSubmit = async (data: SettingsFormValues) => {
    if (!user) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        language: data.language,
        voiceEnabled: data.voiceEnabled,
        voiceSpeed: data.voiceSpeed,
      });
      setTheme(data.theme);
      toast({
        title: 'Settings Saved',
        description: 'Your preferences have been updated successfully.',
      });
       reset(data); // Resets the form state to the newly saved data
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-3xl">Settings</CardTitle>
          <CardDescription>
            Manage your application preferences here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="space-y-2">
              <Label>Language</Label>
              <Controller
                name="language"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="space-y-2">
              <Label>Theme</Label>
               <Controller
                name="theme"
                control={control}
                render={({ field }) => (
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a theme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label>Enable Voice Features</Label>
                <CardDescription>
                  Enable or disable voice input and output across the app.
                </CardDescription>
              </div>
              <Controller
                name="voiceEnabled"
                control={control}
                render={({ field }) => (
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                )}
              />
            </div>

             {voiceEnabled && (
                <div className="space-y-3">
                  <Label>Voice Speed</Label>
                  <Controller
                    name="voiceSpeed"
                    control={control}
                    render={({ field }) => (
                      <>
                      <Slider
                        value={[field.value]}
                        min={0.5}
                        max={2}
                        step={0.1}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                      <div className="text-xs text-muted-foreground text-center">
                        Speed: {field.value.toFixed(1)}x
                      </div>
                      </>
                    )}
                  />
                </div>
              )}

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !isDirty}
            >
              {isSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save Changes
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
