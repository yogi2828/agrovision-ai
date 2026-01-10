'use client';

import { usePathname } from 'next/navigation';
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from '@/components/ui/sidebar';
import { LayoutDashboard, Bot, Leaf, History, User, Settings } from 'lucide-react';
import Link from 'next/link';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
  { href: '/dashboard/detect', label: 'Detect Disease', icon: <Leaf /> },
  { href: '/dashboard/chatbot', label: 'AI Chatbot', icon: <Bot /> },
  { href: '/dashboard/history', label: 'History', icon: <History /> },
  { href: '/dashboard/profile', label: 'Profile', icon: <User /> },
  { href: '/dashboard/settings', label: 'Settings', icon: <Settings /> },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map(item => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton
            asChild
            isActive={pathname === item.href}
          >
            <Link href={item.href}>
              {item.icon}
              <span>{item.label}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
