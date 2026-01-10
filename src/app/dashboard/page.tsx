'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Leaf, Bot, History, Lightbulb } from 'lucide-react';
import Link from 'next/link';
import { DailyFarmingTip } from '@/components/daily-farming-tip';
import { useUser } from '@/firebase';

export default function Dashboard() {
  const { user } = useUser();
  const userName = user?.displayName?.split(' ')[0] || 'Farmer';
  return (
    <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
      <div className="space-y-4 xl:col-span-3">
        <h1 className="text-3xl font-bold tracking-tight font-headline">
          Welcome, {userName}!
        </h1>
        <p className="text-muted-foreground">
          Here&apos;s a quick overview of your farm assistant.
        </p>
      </div>

      <div className="xl:col-span-2 grid gap-4 md:grid-cols-2 md:gap-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Detect Plant Disease
            </CardTitle>
            <Leaf className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Upload an image to get an instant diagnosis of plant diseases.
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/dashboard/detect">Start Detection</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Chatbot</CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Ask our AI assistant for farming advice and information.
            </CardDescription>
            <Button asChild className="mt-4">
              <Link href="/dashboard/chatbot">Open Chatbot</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Detection History
            </CardTitle>
            <History className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <CardDescription>
              Review all your past disease detections and reports.
            </CardDescription>
            <Button asChild className="mt-4" variant="secondary">
              <Link href="/dashboard/history">View History</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="xl:col-span-1">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-6 w-6 text-yellow-400" />
            <CardTitle>Daily Farming Tip</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <DailyFarmingTip />
        </CardContent>
      </Card>
    </div>
  );
}