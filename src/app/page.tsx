import Image from 'next/image';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Bot,
  Languages,
  Mic,
  Zap,
  Leaf,
  ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const features = [
  {
    icon: <Zap className="h-8 w-8 text-primary" />,
    title: 'Instant Disease Detection',
    description: 'Quickly identify plant diseases with our advanced AI analysis.',
  },
  {
    icon: <Bot className="h-8 w-8 text-primary" />,
    title: 'AI Chatbot Assistant',
    description:
      'Get expert advice on treatment, prevention, and plant care.',
  },
  {
    icon: <Mic className="h-8 w-8 text-primary" />,
    title: 'Voice-Enabled Queries',
    description: 'Use your voice to ask questions and get instant answers.',
  },
  {
    icon: <Languages className="h-8 w-8 text-primary" />,
    title: 'Multilingual Support',
    description:
      'Interact with the app in multiple Indian languages for ease of use.',
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
    <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    AI Plant Disease Detection with Voice Support
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Empowering farmers and gardeners with cutting-edge AI to protect their crops. Instant diagnosis, multilingual support, and expert advice.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg">
                    <Link href="/dashboard">
                      Get Started
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                </div>
              </div>
              {heroImage && (
              <Image
                src={heroImage.imageUrl}
                width="550"
                height="550"
                alt={heroImage.description}
                data-ai-hint={heroImage.imageHint}
                className="mx-auto aspect-video overflow-hidden rounded-xl object-cover sm:w-full lg:order-last lg:aspect-square"
              />
            )}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Key Features</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Why AgroVision AI?
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Our platform combines powerful AI with user-friendly features to
                  provide the best plant care support.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="grid gap-6">
                {features.slice(0,2).map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className='flex items-start gap-4'>
                        <div className="bg-primary/10 rounded-full p-3">
                          {feature.icon}
                        </div>
                        <div className='space-y-1'>
                          <CardTitle>{feature.title}</CardTitle>
                          <CardDescription>
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              <div className="grid gap-6">
                 {features.slice(2,4).map((feature, index) => (
                  <Card key={index}>
                    <CardHeader>
                      <div className='flex items-start gap-4'>
                        <div className="bg-primary/10 rounded-full p-3">
                          {feature.icon}
                        </div>
                        <div className='space-y-1'>
                          <CardTitle>{feature.title}</CardTitle>
                          <CardDescription>
                            {feature.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </section>


        {/* How It Works Section */}
        <section id="how-it-works" className="w-full py-12 md:py-24 lg:py-32">
           <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                 <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">How It Works</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Simple Steps to Healthy Plants
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get a diagnosis in three easy steps.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 py-12 sm:grid-cols-2 md:gap-12 lg:grid-cols-3">
              {howItWorks.map((item) => (
                <div key={item.step} className="grid gap-4">
                  <div className="flex items-center justify-center w-16 h-16 bg-primary text-primary-foreground rounded-full text-2xl font-bold">
                    {item.step}
                  </div>
                  <div className="grid gap-1">
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supported Languages Section */}
        <section
          id="languages"
          className="w-full py-12 md:py-24 lg:py-32 bg-muted"
        >
          <div className="container mx-auto px-4 text-center">
             <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                 <div className="inline-block rounded-lg bg-secondary px-3 py-1 text-sm">Accessibility</div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
                  Accessible to Everyone
                </h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                   We support a wide range of Indian languages to make our tool
              accessible to all.
                </p>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap justify-center gap-4">
              {supportedLanguages.map((lang) => (
                <Badge
                  key={lang}
                  variant="outline"
                  className="text-lg px-4 py-2"
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
