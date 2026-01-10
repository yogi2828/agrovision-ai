
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Target, Users } from 'lucide-react';
import { Logo } from '@/components/logo';

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-4xl py-16 px-4 md:px-6">
          <div className="space-y-8">
            <div className="text-center">
              <Logo className="mx-auto h-16 w-16" />
              <h1 className="mt-4 text-4xl font-bold tracking-tight font-headline sm:text-5xl">About AgroVision AI</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Empowering Indian farmers with the technology of tomorrow.
              </p>
            </div>
            
            <div className="space-y-12">
              <div className="flex flex-col items-center text-center">
                <Target className="h-12 w-12 text-accent" />
                <h2 className="mt-4 text-3xl font-bold font-headline">Our Mission</h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  Our mission is to bridge the technology gap in Indian agriculture. We aim to provide accessible, affordable, and easy-to-use tools that leverage artificial intelligence to help farmers protect their crops, increase their yield, and secure their livelihood. We believe that by putting the power of AI into the hands of every farmer, we can cultivate a more sustainable and prosperous future for Indian agriculture.
                </p>
              </div>

              <div className="flex flex-col items-center text-center">
                <Users className="h-12 w-12 text-accent" />
                <h2 className="mt-4 text-3xl font-bold font-headline">Our Vision</h2>
                <p className="mt-2 max-w-2xl text-muted-foreground">
                  We envision a future where every farmer in India, regardless of their location or the size of their land, has a trusted digital assistant. AgroVision AI strives to be that assistant, offering real-time, data-driven insights and support in the farmer's own language. From disease detection to market trends, we are committed to building a comprehensive platform that grows with the needs of our farmers.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
