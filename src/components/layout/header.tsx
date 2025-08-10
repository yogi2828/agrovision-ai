'use client';
import Link from 'next/link';
import { Leaf, User } from 'lucide-react';
import { ThemeToggle } from '@/components/theme-toggle';
import { LanguageSwitcher } from '@/components/language-switcher';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/auth-context';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Header() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  }

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between h-16 px-4 bg-background/80 backdrop-blur-sm border-b md:px-6"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <Link href="/dashboard" className="flex items-center gap-2 font-headline text-lg font-bold">
        <Leaf className="w-6 h-6 text-primary" />
        <span>AgroVision AI</span>
      </Link>
      <nav className="hidden md:flex items-center gap-2">
        <Button variant="ghost" asChild><Link href="/dashboard">Home</Link></Button>
        <Button variant="ghost" asChild><Link href="/diagnose">Diagnose Plant</Link></Button>
        <Button variant="ghost" asChild><Link href="/chat">AI Chatbot</Link></Button>
        <Button variant="ghost" asChild><Link href="/history">History</Link></Button>
      </nav>
      <div className="flex items-center gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        {!loading && (
          <>
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                          <Avatar className="h-8 w-8">
                              <AvatarImage src={user.photoURL || undefined} alt={user.displayName || 'User'} />
                              <AvatarFallback>
                                  <User className="h-4 w-4"/>
                              </AvatarFallback>
                          </Avatar>
                      </Button>
                    </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/profile">Profile</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/privacy-policy">Privacy Policy</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/terms-of-use">Terms of Use</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
                <div className='hidden sm:flex gap-2'>
                    <Button variant="ghost" asChild><Link href="/login">Login</Link></Button>
                    <Button asChild><Link href="/signup">Sign up</Link></Button>
                </div>
            )}
          </>
        )}
      </div>
    </motion.header>
  );
}
