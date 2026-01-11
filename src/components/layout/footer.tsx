import Link from 'next/link';
import { Leaf } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold font-headline text-lg">AgroVision AI</span>
          </div>
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">
              About Us
            </Link>
            <Link href="/#features" className="hover:text-primary">
              Features
            </Link>
            <Link href="/#languages" className="hover:text-primary">
              Languages
            </Link>
          </nav>
          <div className="mt-4 md:mt-0">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AgroVision AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
