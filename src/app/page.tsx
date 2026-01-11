
import Link from 'next/link';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Bot,
  Thermometer,
   Languages,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === '5');

  const features = [
    {
      icon: <Thermometer className="h-10 w-10 text-primary" />,
      title: "Instant Disease Detection",
      description: "Upload a plant image or describe symptoms with your voice. Our AI provides instant analysis, including symptoms, causes, and treatment options.",
    },
    {
      icon: <Bot className="h-10 w-10 text-primary" />,
      title: "AI-Powered Chatbot",
      description: "Get expert advice on crop management, fertilizers, pest control, and more. Our chatbot is your 24/7 agricultural assistant.",
    },
    {
      icon: <Languages className="h-10 w-10 text-primary" />,
      title: "Multilingual Voice Support",
      description: "Interact with the app entirely in your native language. We support multiple Indian languages for both voice input and output.",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex items-center justify-center text-center text-white">
          {heroImage && (
             <Image
                src={heroImage.imageUrl}
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                fill
                className="object-cover -z-10 brightness-50"
             />
          )}
          <div className="container px-4 md:px-6">
            <div className="max-w-3xl mx-auto space-y-4">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl font-headline">
                Smarter Farming, Healthier Crops
              </h1>
              <p className="text-lg md:text-xl text-primary-foreground/90">
                AgroVision AI empowers farmers with instant plant disease detection and expert advice, all through the power of voice and in your own language.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                 <Button asChild size="lg">
                  <Link href="/login">
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Link>
                </Button>
                <Button asChild size="lg" variant="secondary">
                  <Link href="/signup">
                     <UserPlus className="mr-2 h-5 w-5" />
                    Sign Up
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-20 lg:py-28 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
               <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl font-headline">
                Why Choose AgroVision AI?
              </h2>
              <p className="mt-3 max-w-2xl mx-auto text-muted-foreground md:text-lg">
                The future of agriculture is here. Accessible, intelligent, and built for you.
              </p>
            </div>
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <Card key={feature.title} className="shadow-md hover:shadow-xl transition-shadow">
                  <CardHeader className="items-center text-center">
                    {feature.icon}
                    <CardTitle className="mt-4 font-headline">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <CardDescription>{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
