"use client"
import { Languages } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useLanguage } from '@/context/language-context';

export function LanguageSwitcher() {
  const { setLanguage } = useLanguage();
  return (
    <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Change language</span>
            </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setLanguage('en')}>English</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('es')}>Español</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('hi')}>हिन्दी</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('fr')}>Français</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('pt')}>Português</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('bn')}>বাংলা</DropdownMenuItem>
            <DropdownMenuItem onClick={() => setLanguage('ta')}>தமிழ்</DropdownMenuItem>
        </DropdownMenuContent>
    </DropdownMenu>
  );
}
