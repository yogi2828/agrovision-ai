'use client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function PrivacyPolicyPage() {
  const [lastUpdated, setLastUpdated] = useState('');

  useEffect(() => {
    setLastUpdated(new Date().toLocaleDateString());
  }, []);


  return (
    <div className="container mx-auto max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-headline">Privacy Policy</CardTitle>
          {lastUpdated && <CardDescription>Last Updated: {lastUpdated}</CardDescription>}
        </CardHeader>
        <CardContent className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-2">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to AgroVision AI. We are committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">2. Information We Collect</h2>
            <div className="text-muted-foreground">
              We may collect information about you in a variety of ways. The information we may collect via the Application includes:
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li><strong>Personal Data:</strong> Personally identifiable information, such as your name and email address, that you voluntarily give to us when you register with the Application.</li>
                <li><strong>Image Data:</strong> Images of plants you upload or capture for diagnosis. These images are processed for analysis and are not stored permanently on our servers.</li>
                <li><strong>Derivative Data:</strong> Information our servers automatically collect when you access the Application, such as your IP address, your browser type, and your access times.</li>
                <li><strong>Data From Social Networks:</strong> User information from social networking sites, such as Google, if you connect your account to such social networks.</li>
              </ul>
            </div>
          </section>
          
           <section>
            <h2 className="text-xl font-semibold mb-2">3. Use of Your Information</h2>
            <div className="text-muted-foreground">
             Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the Application to:
              <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Create and manage your account.</li>
                  <li>Provide you with the core service of plant disease diagnosis.</li>
                  <li>Email you regarding your account or order.</li>
                  <li>Increase the efficiency and operation of the Application.</li>
                  <li>Anonymously analyze data and trends to improve our AI models and user experience.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">4. Data Deletion</h2>
            <p className="text-muted-foreground">
              You have the right to delete your account and all associated data. You can do this from your profile page within the application. Deleting your account will permanently remove your diagnosis history and personal information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-2">5. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions or comments about this Privacy Policy, please contact us at <Link href="mailto:privacy@agrovision.ai" className="text-primary underline">privacy@agrovision.ai</Link>.
            </p>
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
