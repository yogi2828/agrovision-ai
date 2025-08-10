'use client';
import BottomNav from "@/components/layout/bottom-nav";
import Header from "@/components/layout/header";
import { AuthGuard } from "@/components/auth/auth-guard";
import Link from "next/link";
import { motion } from 'framer-motion';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
        <div className="flex min-h-screen flex-col">
          <Header />
          <motion.main 
            className="flex-1 p-4 pt-20 pb-24 md:p-6 md:pt-24 lg:p-8 lg:pt-28"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="mx-auto max-w-7xl w-full">
              {children}
            </div>
          </motion.main>
          <motion.footer 
            className="border-t py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
              <div className="container mx-auto px-4 text-center text-muted-foreground">
                  <div className="flex justify-center gap-4 mb-4">
                      <Link href="/terms-of-use" className="hover:text-primary text-sm">Terms of Use</Link>
                      <Link href="/privacy-policy" className="hover:text-primary text-sm">Privacy Policy</Link>
                  </div>
                  <p className="text-sm">&copy; {new Date().getFullYear()} AgroVision AI. All rights reserved.</p>
              </div>
          </motion.footer>
          <BottomNav />
        </div>
    </AuthGuard>
  );
}
