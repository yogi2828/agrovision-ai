'use client';
import Header from "@/components/layout/header";
import Link from "next/link";
import { motion } from 'framer-motion';

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main 
          className="flex-1 p-4 pt-20 pb-24 md:p-6 md:pt-24 lg:p-8 lg:pt-28"
        >
          <div className="mx-auto max-w-7xl w-full">
            {children}
          </div>
        </main>
        <footer 
          className="border-t py-8"
        >
            <div className="container mx-auto px-4 text-center text-muted-foreground">
                <div className="flex justify-center gap-4 mb-4">
                    <Link href="/terms-of-use" className="hover:text-primary text-sm">Terms of Use</Link>
                    <Link href="/privacy-policy" className="hover:text-primary text-sm">Privacy Policy</Link>
                </div>
                <p className="text-sm">&copy; {new Date().getFullYear()} AgroVision AI. All rights reserved.</p>
            </div>
        </footer>
      </div>
  );
}
