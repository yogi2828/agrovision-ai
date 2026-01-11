'use client';

import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  Bot,
  CircleUser,
  History,
  Home,
  Info,
  Languages,
  Leaf,
  LogIn,
  LogOut,
  Menu,
  Moon,
  Settings,
  Sun,
  Thermometer,
} from 'lucide-react';
import { signOut as firebaseSignOut } from 'firebase/auth';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { supportedLanguages } from '@/lib/languages';
import { doc, updateDoc } from 'firebase/firestore';
import { useFirestore, useAuth, useUser } from '@/firebase';
import { useState } from 'react';
import type { User as AppUser } from '@/lib/types';


const navLinks = [
  { href: '/dashboard', label: 'Home', icon: <Home className="h-4 w-4" /> },
  {
    href: '/detector',
    label: 'Disease Detector',
    icon: <Thermometer className="h-4 w-4" />,
  },
  { href: '/chatbot', label: 'AI Chatbot', icon: <Bot className="h-4 w-4" /> },
  { href: '/history', label: 'History', icon: <History className="h-4 w-4" /> },
];

const publicNavLinks = [
  { href: '/about', label: 'About Us', icon: <Info className="h-4 w-4" /> },
  { href: '/#features', label: 'Features', icon: <Info className="h-4 w-4" /> },
];

export default function Navbar() {
  const { user } = useUser();
  const appUser = user as AppUser | null;
  const auth = useAuth();
  const db = useFirestore();
  const { setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLanguageChange = async (langCode: string) => {
    if (user && db) {
      try {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, { language: langCode });
      } catch (error) {
        console.error('Error updating language:', error);
      }
    }
  };

  const handleSignOut = async () => {
    if (auth) {
      await firebaseSignOut(auth);
    }
  };

  const AuthedNavContent = () => (
    <>
      {navLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          asChild
          className="justify-start"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Link href={link.href} className="flex items-center gap-2">
            {link.icon} {link.label}
          </Link>
        </Button>
      ))}
    </>
  );

   const PublicNavContent = () => (
    <>
      {publicNavLinks.map((link) => (
        <Button
          key={link.href}
          variant="ghost"
          asChild
          className="justify-start"
          onClick={() => setMobileMenuOpen(false)}
        >
          <Link href={link.href} className="flex items-center gap-2">
            {link.icon} {link.label}
          </Link>
        </Button>
      ))}
    </>
  );


  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 hidden md:flex">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="text-lg">AgroVision AI</span>
          </Link>
        </div>

        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle Menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[280px]">
            <div className="flex flex-col gap-4 py-6">
              <Link
                href="/"
                className="flex items-center gap-2 font-bold px-4"
                onClick={() => setMobileMenuOpen(false)}
              >
                <Leaf className="h-6 w-6 text-primary" />
                <span className="text-lg">AgroVision AI</span>
              </Link>
              <div className="flex flex-col gap-1 px-2">
                {user ? <AuthedNavContent /> : <PublicNavContent />}
              </div>
            </div>
          </SheetContent>
        </Sheet>
        <div className="md:hidden flex-1 flex justify-center">
           <Link href="/" className="flex items-center gap-2 font-bold">
            <Leaf className="h-6 w-6 text-primary" />
          </Link>
        </div>


        <nav className="hidden md:flex items-center space-x-1 ml-6 text-sm font-medium">
          {user ? <AuthedNavContent /> : <PublicNavContent />}
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-2">
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Languages className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Select Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {supportedLanguages.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onSelect={() => handleLanguageChange(lang.code)}
                    disabled={appUser?.language === lang.code}
                  >
                    {lang.name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setTheme('light')}>
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme('dark')}>
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setTheme('system')}>
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="secondary" size="icon" className="rounded-full">
                  <CircleUser className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <p>My Account</p>
                  <p className="font-normal text-sm text-muted-foreground">
                    {user.email}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <CircleUser className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
             <Button asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
