import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Languages,
  Mic,
  ShieldCheck,
  Zap,
  Leaf,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Instant Disease Detection',
    description: 'Quickly identify plant diseases with our advanced AI analysis.',
    image: PlaceHolderImages.find(p => p.id === "1"),
    hint: 'plant analysis',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Chatbot Assistant',
    description:
      'Get expert advice on treatment, prevention, and plant care.',
    image: PlaceHolderImages.find(p => p.id === "2"),
    hint: 'chatbot agriculture',
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: 'Voice-Enabled Queries',
    description: 'Use your voice to ask questions and get instant answers.',
    image: PlaceHolderImages.find(p => p.id === "3"),
    hint: 'voice technology',
  },
  {
    icon: <Languages className="h-8 w-8 text-primary" />,
    title: 'Multilingual Support',
    description:
      'Interact with the app in multiple Indian languages for ease of use.',
    image: PlaceHolderImages.find(p => p.id === "4"),
    hint: 'language diversity',
  },
];

const howItWorks = [
  {
    step: 1,
    title: 'Upload or Describe',
    description:
      'Upload an image of the affected plant or describe the symptoms using your voice.',
  },
  {
    step: 2,
    title: 'Get AI Analysis',
    description:
      'Our AI provides a detailed report with the disease name, symptoms, and causes.',
  },
  {
    step: 3,
    title: 'Follow Guidance',
    description:
      'Receive expert-backed treatment and prevention tips to save your plants.',
  },
];

const supportedLanguages = [
  'English',
  'Hindi',
  'Telugu',
  'Tamil',
  'Kannada',
  'Malayalam',
  'Marathi',
  'Bengali',
];

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === "5");
  
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[80vh]">
          {heroImage && (
            <Image
              src={heroImage.imageUrl}
              alt={heroImage.description}
              fill
              className="object-cover"
              data-ai-hint={heroImage.imageHint}
              priority
            />
          )}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-primary-foreground bg-black bg-opacity-40 p-4">
            <h1 className="text-4xl font-headline font-bold md:text-6xl text-white">
              AI Plant Disease Detection with Voice Support
            </h1>
            <p className="mt-4 max-w-2xl text-lg md:text-xl text-gray-200">
              Empowering farmers and gardeners with cutting-edge AI to protect
              their crops.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/dashboard">Get Started</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-16 md:py-24 bg-background">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center font-headline">
              Why AgroVision AI?
            </h2>
            <p className="mt-4 max-w-3xl mx-auto text-center text-muted-foreground">
              Our platform combines powerful AI with user-friendly features to
              provide the best plant care support.
            </p>
            <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {features.map((feature, index) => (
                <Card key={index} className="text-center shadow-lg hover:shadow-xl transition-shadow duration-300">
                  <CardHeader>
                    <div className="mx-auto bg-primary/10 rounded-full p-3 w-fit">
                      {feature.icon}
                    </div>
                    <CardTitle className="font-headline pt-4">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className="py-16 md:py-24 bg-secondary/50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center font-headline">
              Simple Steps to Healthy Plants
            </h2>
            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className="text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto bg-primary text-primary-foreground rounded-full text-2xl font-bold">
                    {item.step}
                  </div>
                  <h3 className="mt-6 text-xl font-bold font-headline">{item.title}</h3>
                  <p className="mt-2 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Languages Section */}
        <section
          id="languages"
          className="py-16 md:py-24 bg-background"
        >
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold font-headline">
              Accessible to Everyone
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-muted-foreground">
              We support a wide range of Indian languages to make our tool
              accessible to all.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {supportedLanguages.map((lang) => (
                <Badge
                  key={lang}
                  variant="secondary"
                  className="text-lg px-4 py-2 rounded-full"
                >
                  {lang}
                </Badge>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
