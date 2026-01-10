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
import { useUser, useFirestore, useAuth } from '@/firebase';
import { useEffect, useState } from 'react';
import { doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';
import { updateProfile, deleteUser } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { useRouter } from 'next/navigation';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function ProfilePage() {
  const { user, loading: userLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [language, setLanguage] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const avatarPlaceholder = PlaceHolderImages.find(
    (img) => img.id === 'profile-avatar'
  )?.imageUrl;

  useEffect(() => {
    if (user && firestore) {
      setLoading(true);
      const userDocRef = doc(firestore, 'users', user.uid);
      getDoc(userDocRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            setName(data.fullName || user.displayName || '');
            setLanguage(data.preferredLanguage || 'en');
            setAvatarUrl(data.profileImageURL || user.photoURL || avatarPlaceholder || '');
          } else {
            // If no doc, use auth data and prepare to create one on save
            setName(user.displayName || '');
            setLanguage('en');
            setAvatarUrl(user.photoURL || avatarPlaceholder || '');
          }
          setEmail(user.email || '');
        })
        .catch(() => {
          // Fallback on error
          setName(user.displayName || '');
          setEmail(user.email || '');
          setLanguage('en');
          setAvatarUrl(user.photoURL || avatarPlaceholder || '');
        })
        .finally(() => {
            setLoading(false);
        });
    } else if (!userLoading) {
      setLoading(false);
    }
  }, [user, firestore, userLoading, avatarPlaceholder]);

  const handleSaveChanges = async () => {
    if (!user || !firestore || !auth?.currentUser) return;
    setSaving(true);
    try {
      // Create a task for updating the auth profile
      const authUpdatePromise = updateProfile(auth.currentUser, { displayName: name });
  
      // Create a task for updating the Firestore document
      const firestoreUpdatePromise = setDoc(
        doc(firestore, 'users', user.uid),
        {
          fullName: name,
          email: user.email, // ensure email is saved
          preferredLanguage: language,
        },
        { merge: true }
      );
  
      // Run both tasks in parallel
      await Promise.all([authUpdatePromise, firestoreUpdatePromise]);
  
      toast({
        title: 'Profile updated',
        description: 'Your changes have been saved.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to update profile.',
      });
    }
    setSaving(false);
  };

  const handlePictureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user || !auth?.currentUser) return;
    const file = e.target.files[0];
    if (!file) return;

    const storage = getStorage();
    const storageRef = ref(storage, `avatars/${user.uid}`);
    setSaving(true);
    uploadBytes(storageRef, file)
      .then((snapshot) => {
        return getDownloadURL(snapshot.ref);
      })
      .then(async (downloadURL) => {
        await updateProfile(auth.currentUser!, { photoURL: downloadURL });
        await setDoc(
          doc(firestore, 'users', user.uid),
          { profileImageURL: downloadURL },
          { merge: true }
        );
        setAvatarUrl(downloadURL);
        toast({ title: 'Profile picture updated.' });
      })
      .catch((error: any) => {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: error.message || 'Could not upload new profile picture.',
        });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleDeleteAccount = async () => {
    if (!user || !firestore || !auth?.currentUser) return;
    try {
      // First delete user data from Firestore
      await deleteDoc(doc(firestore, 'users', user.uid));
      
      // Then delete the user from Authentication
      await deleteUser(auth.currentUser);

      toast({
        title: 'Account Deleted',
        description: 'Your account has been permanently deleted.',
      });
      router.push('/');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: error.message || 'Could not delete your account. You may need to sign in again to complete this action.',
      });
    }
  };

  if (loading || userLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="grid gap-6">
       <div className="space-y-0.5">
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Profile</h1>
          <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
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
              src={avatarUrl || avatarPlaceholder || ''}
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
                  disabled={saving}
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
                disabled={saving}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select value={language} onValueChange={setLanguage} disabled={saving}>
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
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" className="mt-4">
                  Delete My Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your
                    account and remove your data from our servers.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive hover:bg-destructive/90"
                    onClick={handleDeleteAccount}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

