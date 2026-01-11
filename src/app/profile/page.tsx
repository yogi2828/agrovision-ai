'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Languages, Settings } from 'lucide-react';
import { useAuth, useUser } from '@/firebase';
import { signOut as firebaseSignOut } from 'firebase/auth';
import type { User as AppUser } from '@/lib/types';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const router = useRouter();
  const appUser = user as AppUser | null;

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handleSignOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
      router.push('/login');
    }
  };

  if (isUserLoading || !appUser) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-12 flex justify-center">
      <Card className="w-full max-w-2xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-24 w-24 border-4 border-primary">
              <AvatarImage src={appUser.photoURL || ''} alt={appUser.displayName || 'User'} />
              <AvatarFallback className="text-3xl bg-secondary">
                {appUser.displayName?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="font-headline text-3xl">{appUser.displayName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <Mail className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-semibold">{appUser.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <Languages className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Preferred Language</p>
              <p className="font-semibold">{appUser.language ? appUser.language.toUpperCase() : 'Not Set'}</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-semibold text-xs">{appUser.uid}</p>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between gap-4">
           <Button asChild variant="outline">
            <Link href="/settings">
              <Settings className="mr-2 h-4 w-4" />
              Manage Preferences
            </Link>
          </Button>
          <Button variant="destructive" onClick={handleSignOut}>
            Log Out
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
