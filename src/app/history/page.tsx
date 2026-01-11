'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Loader2,
  Bot,
  Thermometer,
  Calendar,
  MessageSquare,
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  type Timestamp,
} from 'firebase/firestore';
import { useFirestore } from '@/firebase';
import { format } from 'date-fns';

type DetectionHistory = {
  id: string;
  plantName: string;
  disease: string;
  treatment: string;
  timestamp: Timestamp;
};

type ChatHistory = {
  id: string;
  userMessage: string;
  aiResponse: string;
  language: string;
  timestamp: Timestamp;
};

export default function HistoryPage() {
  const { user } = useAuth();
  const db = useFirestore();
  const [detections, setDetections] = useState<DetectionHistory[]>([]);
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user || !db) return;
      setIsLoading(true);
      try {
        const detectionQuery = query(
          collection(db, 'users', user.uid, 'diseaseRecords'),
          orderBy('timestamp', 'desc')
        );
        const chatQuery = query(
          collection(db, 'users', user.uid, 'chatRecords'),
          orderBy('timestamp', 'desc')
        );

        const [detectionSnapshot, chatSnapshot] = await Promise.all([
          getDocs(detectionQuery),
          getDocs(chatQuery),
        ]);

        setDetections(
          detectionSnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as DetectionHistory)
          )
        );
        setChats(
          chatSnapshot.docs.map(
            (doc) => ({ id: doc.id, ...doc.data() } as ChatHistory)
          )
        );
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchHistory();
  }, [user, db]);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  const renderEmptyState = (type: string) => (
    <div className="text-center py-16 text-muted-foreground">
      <p>No {type} history found.</p>
      <p className="text-sm">Your past {type} will appear here.</p>
    </div>
  );

  return (
    <div className="container py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold font-headline">Interaction History</h1>
        <p className="text-muted-foreground mt-2">
          Review your past disease detections and chatbot conversations.
        </p>
      </div>

      <Tabs defaultValue="detections" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="detections">
            <Thermometer className="mr-2 h-4 w-4" />
            Disease Detections
          </TabsTrigger>
          <TabsTrigger value="chats">
            <Bot className="mr-2 h-4 w-4" />
            Chatbot Conversations
          </TabsTrigger>
        </TabsList>
        <TabsContent value="detections">
          <Card>
            <CardHeader>
              <CardTitle>Detection History</CardTitle>
              <CardDescription>
                A log of all your plant disease analyses.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </div>
              ) : detections.length === 0 ? (
                renderEmptyState('detection')
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {detections.map((item) => (
                    <AccordionItem value={item.id} key={item.id}>
                      <AccordionTrigger>
                        <div className="flex justify-between w-full pr-4">
                          <span className="font-semibold">
                            {item.disease} on {item.plantName}
                          </span>
                          <span className="text-sm text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(
                              item.timestamp.toDate(),
                              'MMM d, yyyy, h:mm a'
                            )}
                          </span>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="space-y-4 px-4">
                        <div>
                          <h4 className="font-semibold">Treatment</h4>
                          <p className="text-muted-foreground">{item.treatment}</p>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="chats">
          <Card>
            <CardHeader>
              <CardTitle>Chat History</CardTitle>
              <CardDescription>
                A log of all your conversations with the AI assistant.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="mx-auto h-8 w-8 animate-spin" />
                </div>
              ) : chats.length === 0 ? (
                renderEmptyState('chat')
              ) : (
                <div className="space-y-4">
                  {chats.map((chat) => (
                    <div key={chat.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Chat in {chat.language.toUpperCase()}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {format(
                            chat.timestamp.toDate(),
                            'MMM d, yyyy, h:mm a'
                          )}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <p><strong>You:</strong> {chat.userMessage}</p>
                        <p><strong>AI:</strong> {chat.aiResponse}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
