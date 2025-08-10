'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function TermsOfUsePage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);

  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Terms of Use</CardTitle>
          {lastUpdated && <CardDescription>Last Updated: {lastUpdated}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By using our application, AgroVision AI, you agree to be bound by these Terms of Use. If you do not agree to these terms, do not use the application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Disclaimer</h2>
            <p className="text-muted-foreground">
              The diagnoses and recommendations provided by AgroVision AI are for informational purposes only. They are not a substitute for professional agricultural advice. We do not guarantee the accuracy or efficacy of the information provided. Always consult with a qualified professional before making any decisions about your plant health.
            </p>
          </section>
          
           <section>
            <h2 className="text-xl font-semibold mb-2">3. User Conduct</h2>
            <p className="text-muted-foreground">
             You agree not to use the application for any unlawful purpose or any purpose prohibited under this clause. You agree not to use the Application in any way that could damage the Application, the services or the general business of AgroVision AI.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Intellectual Property</h2>
            <p className="text-muted-foreground">
              All content, trademarks, and data on this application, including software, databases, text, graphics, icons, hyperlinks, private information, and designs are the property of or licensed to AgroVision AI, and as such, are protected from infringement by domestic and international legislation and treaties.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
