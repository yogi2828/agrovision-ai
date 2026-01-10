'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { languages } from '@/lib/data';
import Image from 'next/image';
import { useUser, useFirestore } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const firestore = useFirestore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (user && firestore) {
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.name || user.displayName || '');
            setEmail(data.email || user.email || '');
            setLanguage(data.preferredLanguage || 'en');
            setAvatarUrl(user.photoURL || '/default-avatar.png');
          } else {
            setName(user.displayName || '');
            setEmail(user.email || '');
            setLanguage('en');
            setAvatarUrl(user.photoURL || '/default-avatar.png');
          }
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, firestore, userLoading]);

  const handleSaveChanges = async () => {
    if (!user || !firestore) return;
    setSaving(true);
    try {
      await updateProfile(user, { displayName: name });
      await setDoc(
        doc(firestore, 'users', user.uid),
        {
          name,
          preferredLanguage: language,
        },
        { merge: true }
      );
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to update profile.',
      });
    }
    setSaving(false);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    const file = e.target.files[0];
    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${user.uid}`);
    setSaving(true);
    uploadBytes(storageRef, file).then((snapshot) => {
      getDownloadURL(snapshot.ref).then(async (downloadURL) => {
        await updateProfile(user, { photoURL: downloadURL });
        setAvatarUrl(downloadURL);
        setSaving(false);
        toast({ title: 'Profile picture updated.' });
      });
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">
        User Profile
      </h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Update your profile details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Image
              alt="User avatar"
              className="rounded-full"
              height="80"
              src={avatarUrl}
              style={{
                aspectRatio: '80/80',
                objectFit: 'cover',
              }}
              width="80"
            />
            <Button asChild variant="outline">
              <label htmlFor="picture-upload">
                Change Picture
                <input
                  id="picture-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handlePictureChange}
                />
              </label>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((lang) => (
                  <SelectItem key={lang.value} value={lang.value}>
                    {lang.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button onClick={handleSaveChanges} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </div>
          <div className="border-t pt-6 mt-6 border-destructive/50">
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>
            <Button variant="destructive" className="mt-4">
              Delete My Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}