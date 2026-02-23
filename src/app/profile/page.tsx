'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, User, Mail, Languages, Settings, Phone } from 'lucide-react';
import { useAuth } from '@/firebase';
import { useAppUser } from '@/hooks/use-app-user';
import { signOut as firebaseSignOut } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { supportedLanguages } from '@/lib/languages';

export default function ProfilePage() {
  const { user: appUser, isLoading: isUserLoading } = useAppUser();
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isUserLoading && !appUser) {
      router.push('/login');
    }
  }, [appUser, isUserLoading, router]);

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

  const currentLanguageName =
    supportedLanguages.find(l => l.code === appUser.language)?.name || appUser.language;

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
          <CardTitle className="font-headline text-3xl">
            {appUser.displayName}
          </CardTitle>
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
              <p className="font-semibold">{currentLanguageName}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <User className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="font-semibold text-xs">{appUser.uid}</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-3 bg-secondary rounded-lg">
            <Phone className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Helpline Number</p>
              <a
                href="tel:9325516590"
                className="font-semibold text-lg flex items-center gap-2 text-primary hover:underline transition-all"
              >
                 9325516590
              </a>
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
