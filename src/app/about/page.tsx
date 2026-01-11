import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Eye, Rocket, Leaf } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="container py-12 md:py-20">
      <div className="text-center">
        <h1 className="text-4xl font-bold font-headline tracking-tight lg:text-5xl">
          About AgroVision AI
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
          Revolutionizing agriculture through the power of artificial intelligence and voice technology.
        </p>
      </div>

      <div className="mt-16 grid gap-8 md:grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Target className="w-8 h-8 text-primary" />
              <span className="font-headline text-2xl">Our Vision</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              To empower every farmer and gardener with accessible, intelligent tools to ensure crop health and food security. We envision a world where technology bridges the gap between agricultural challenges and sustainable solutions.
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-primary" />
              <span className="font-headline text-2xl">The Problem</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Plant diseases are a major threat to global food production, causing significant yield losses. Many farmers, especially in remote areas, lack timely access to expert advice, leading to incorrect diagnoses and ineffective treatments.
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Rocket className="w-8 h-8 text-accent" />
              <span className="font-headline text-2xl">The AgroVision AI Mission</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Our mission is to democratize agricultural expertise. By leveraging state-of-the-art AI and multilingual voice technology, we provide instant, accurate, and actionable insights for plant disease management.
            </p>
            <p className="flex items-start gap-3">
              <Leaf className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
              <span>
                We are committed to breaking down language barriers and making complex information simple and understandable for everyone involved in agriculture. AgroVision AI is more than just an app; it's a partner in cultivation.
              </span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
