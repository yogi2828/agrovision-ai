
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Bot,
  Thermometer,
  ArrowRight,
} from 'lucide-react';


export default function Home() {
  
  return (
     <div className="flex flex-col min-h-[100dvh]">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
           <div className="container py-8 md:py-12">
            <div className="space-y-4 mb-12 text-center">
              <h1 className="text-3xl md:text-5xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                Welcome to AgroVision AI
              </h1>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                Your AI-powered partner for plant health. Get instant disease detection, expert advice, and multilingual support.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle className="font-headline text-2xl">Get Started</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Link href="/detector">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <Thermometer className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-bold">Disease Detector</h3>
                          <p className="text-sm text-muted-foreground">Analyze a plant image.</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                  <Link href="/chatbot">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                      <div className="flex items-center gap-4">
                        <Bot className="h-8 w-8 text-primary" />
                        <div>
                          <h3 className="font-bold">AI Chatbot</h3>
                          <p className="text-sm text-muted-foreground">Ask for advice or information.</p>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </Link>
                </CardContent>
              </Card>

              <Card className="shadow-lg flex flex-col justify-center items-center text-center p-6">
                 <CardHeader>
                  <CardTitle className="font-headline text-2xl">Your Personal Dashboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground mb-4">
                        Sign in or create an account to track your plant health history and save your preferences.
                    </p>
                    <Link href="/login" className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-11 rounded-md px-8 w-full">
                        Login or Sign Up <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
