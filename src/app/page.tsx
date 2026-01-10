import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Camera, Bot, Languages, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const features = [
  {
    icon: <Camera className="h-10 w-10 text-primary" />,
    title: 'Disease Detection',
    description: 'Snap a picture of your plant to instantly identify diseases and get expert treatment advice.',
    image: PlaceHolderImages.find(img => img.id === 'feature-detection'),
  },
  {
    icon: <Bot className="h-10 w-10 text-primary" />,
    title: 'Voice AI Chatbot',
    description: 'Ask our AI assistant for farming tips, crop care, and more, using your own voice in your own language.',
    image: PlaceHolderImages.find(img => img.id === 'feature-chatbot'),
  },
  {
    icon: <Languages className="h-10 w-10 text-primary" />,
    title: 'Indian Language Support',
    description: 'Fully accessible in major Indian languages, with both text and voice support for seamless communication.',
    image: PlaceHolderImages.find(img => img.id === 'feature-language'),
  },
  {
    icon: <History className="h-10 w-10 text-primary" />,
    title: 'Cloud-Based History',
    description: 'Securely store and review all your past disease detections to track your plant health over time.',
    image: PlaceHolderImages.find(img => img.id === 'feature-history'),
  },
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(img => img.id === 'hero');
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <section className="relative w-full py-20 md:py-32 lg:py-40">
          <div className="container mx-auto px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none font-headline">
                    AI-Powered Plant Disease Detection
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Voice-enabled farming support in Indian languages. Get instant diagnostics and expert advice to protect your crops.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/register">Get Started</Link>
                  </Button>
                  <Button asChild size="lg" variant="secondary">
                    <Link href="/login">Login</Link>
                  </Button>
                </div>
              </div>
              <div className="relative">
                {heroImage && (
                  <Image
                    src={heroImage.imageUrl}
                    alt={heroImage.description}
                    width={600}
                    height={400}
                    data-ai-hint={heroImage.imageHint}
                    className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full"
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-muted/40 py-12 md:py-24 lg:py-32">
          <div className="container mx-auto px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Smart Farming at Your Fingertips</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  AgroVision AI combines cutting-edge technology with farmer-friendly design to provide you with the tools you need for a healthier harvest.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:max-w-none lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="h-full transform transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  <CardHeader className="items-center">
                    {feature.icon}
                    <CardTitle className="mt-4 text-center">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground text-center">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}