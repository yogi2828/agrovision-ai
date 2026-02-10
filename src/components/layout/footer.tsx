import Link from 'next/link';
import { Leaf, Phone } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="h-6 w-6 text-primary" />
            <span className="font-bold text-lg">AgroVision AI</span>
          </div>
          
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary">
              About Us
            </Link>
            <Link href="/#features" className="hover:text-primary">
              Features
            </Link>
            <div className="flex items-center gap-2 text-primary font-medium">
              <Phone className="h-4 w-4" />
              <a href="tel:9322436971">Helpline: 9322436971</a>
            </div>
          </nav>
          
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} AgroVision AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}