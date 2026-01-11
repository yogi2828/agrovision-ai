'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Loader2,
  Bot,
  Thermometer,
  History,
  ArrowRight,
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';
import { formatDistanceToNow } from 'date-fns';
import type { User as AppUser } from '@/lib/types';

type ActivityItem = {
  id: string;
  type: 'detection' | 'chat';
  content: string;
  timestamp: Date;
};

export default function DashboardPage() {
  const { user } = useUser();
  const appUser = user as AppUser | null;
  const db = useFirestore();
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>([]);
  const [activityLoading, setActivityLoading] = useState(true);
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hours = new Date().getHours();
    if (hours < 12) setGreeting('Good Morning');
    else if (hours < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');
  }, []);

  useEffect(() => {
    if (user && db) {
      const fetchRecentActivity = async () => {
        setActivityLoading(true);
        try {
          const detectionQuery = query(
            collection(db, 'users', user.uid, 'diseaseRecords'),
            orderBy('timestamp', 'desc'),
            limit(2)
          );
          const chatQuery = query(
            collection(db, 'users', user.uid, 'chatRecords'),
            orderBy('timestamp', 'desc'),
            limit(2)
          );

          const [detectionSnapshot, chatSnapshot] = await Promise.all([
            getDocs(detectionQuery),
            getDocs(chatQuery),
          ]);

          const activities: ActivityItem[] = [];

          detectionSnapshot.forEach((doc) => {
            const data = doc.data();
            activities.push({
              id: doc.id,
              type: 'detection',
              content: `Detected ${data.disease} on ${data.plantName}`,
              timestamp: (data.timestamp as Timestamp).toDate(),
            });
          });

          chatSnapshot.forEach((doc) => {
            const data = doc.data();
            activities.push({
              id: doc.id,
              type: 'chat',
              content: `Chat: "${data.userMessage.substring(0, 30)}..."`,
              timestamp: (data.timestamp as Timestamp).toDate(),
            });
          });

          activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
          setRecentActivity(activities.slice(0, 3));
        } catch (error) {
          console.error('Failed to fetch recent activity:', error);
        } finally {
          setActivityLoading(false);
        }
      };

      fetchRecentActivity();
    } else if (!user) {
      setActivityLoading(false);
    }
  }, [user, db]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="space-y-4 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold font-headline">
          {greeting}, {user.displayName?.split(' ')[0]}!
        </h1>
        <p className="text-lg text-muted-foreground">
          Welcome back to your AgroVision dashboard. Ready to check on your plants?
        </p>
        {appUser?.language && (
            <p className="text-sm text-muted-foreground">
            Current language: <span className="font-semibold text-primary">{appUser.language.toUpperCase()}</span>
            </p>
        )}
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Quick Actions */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/detector">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-secondary/80 transition-colors">
                <div className="flex items-center gap-4">
                  <Thermometer className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-bold">Disease Detector</h3>
                    <p className="text-sm text-muted-foreground">Analyze a new plant image or voice query.</p>
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

        {/* Recent Activity */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-2xl">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activityLoading ? (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : recentActivity.length > 0 ? (
              <div className="space-y-4">
                {recentActivity.map((item) => (
                  <div key={item.id} className="flex items-center gap-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      {item.type === 'detection' ? (
                        <Thermometer className="h-5 w-5 text-primary" />
                      ) : (
                        <Bot className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-semibold">{item.content}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                ))}
                 <Button variant="outline" asChild className="mt-4 w-full">
                    <Link href="/history">
                        <History className="mr-2 h-4 w-4" /> View All History
                    </Link>
                 </Button>
              </div>
            ) : (
              <div className="text-center text-muted-foreground py-8">
                <p>No recent activity.</p>
                <p className="text-sm">Start by detecting a disease or chatting with the AI.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
