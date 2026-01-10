
import Link from "next/link";
import { Logo } from "./logo";

export function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-12 px-4 md:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-start space-y-2">
            <Link href="/" className="flex items-center space-x-2">
              <Logo className="h-6 w-6" />
              <span className="text-lg font-bold">AgroVision AI</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Smart Plant Disease Detection & AI Farming Assistant.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:col-span-2 md:grid-cols-3">
            <div className="space-y-2">
              <h4 className="font-semibold">Quick Links</h4>
              <ul className="space-y-1">
                <li><Link href="#features" className="text-sm text-muted-foreground hover:text-foreground">Features</Link></li>
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-foreground">About Us</Link></li>
                <li><Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Legal</h4>
              <ul className="space-y-1">
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</Link></li>
                <li><Link href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</Link></li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold">Account</h4>
              <ul className="space-y-1">
                <li><Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">Login</Link></li>
                <li><Link href="/register" className="text-sm text-muted-foreground hover:text-foreground">Register</Link></li>
                <li><Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">Dashboard</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} AgroVision AI. All Rights Reserved.
        </div>
      </div>
    </footer>
  );
}
