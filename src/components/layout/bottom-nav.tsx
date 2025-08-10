"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Home, Bot, History, User, ScanLine } from 'lucide-react';
import { motion } from 'framer-motion';

const navItems = [
  { href: '/dashboard', label: 'Home', icon: Home },
  { href: '/diagnose', label: 'Scan', icon: ScanLine },
  { href: '/history', label: 'History', icon: History },
  { href: '/chat', label: 'Chat', icon: Bot },
  { href: '/profile', label: 'Profile', icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <motion.nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/80 backdrop-blur-sm border-t"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
    >
      <div className="grid h-16 grid-cols-5">
        {navItems.map((item) => {
          const isActive = item.href === '/dashboard' ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="flex flex-col items-center justify-center gap-1 text-xs transition-colors text-muted-foreground hover:text-primary">
                <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                  <item.icon className={cn("w-6 h-6", isActive ? 'text-primary' : '')} />
                </motion.div>
                <span className={cn(isActive ? 'text-primary font-semibold' : '')}>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.nav>
  );
}
