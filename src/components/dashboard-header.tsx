'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Logo } from './logo';
import { Button } from './ui/button';
import { LanguageSwitcher } from './language-switcher';
import { UserNav } from './user-nav';
import { cn } from '@/lib/utils';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu } from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/detect', label: 'Detect' },
  { href: '/dashboard/chatbot', label: 'Chatbot' },
  { href: '/dashboard/history', label: 'History' },
];

export function DashboardHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-4 md:px-6">
      <nav className="hidden flex-col gap-6 text-lg font-medium md:flex md:flex-row md:items-center md:gap-5 md:text-sm lg:gap-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
          <Logo className="h-6 w-6" />
          <span className="sr-only">AgroVision AI</span>
        </Link>
        {navItems.map(item => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'transition-colors hover:text-foreground',
              pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
            )}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <nav className="grid gap-6 text-lg font-medium">
            <Link href="#" className="flex items-center gap-2 text-lg font-semibold">
              <Logo className="h-6 w-6" />
              <span className="sr-only">AgroVision AI</span>
            </Link>
            {navItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'hover:text-foreground',
                   pathname === item.href ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <div className="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
        <div className="ml-auto flex-1 sm:flex-initial">
          {/* Optional: Add a search bar here if needed in the future */}
        </div>
        <LanguageSwitcher />
        <UserNav />
      </div>
    </header>
  );
}
