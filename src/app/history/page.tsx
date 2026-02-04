
'use client';

import { useState, useEffect } from 'react';
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
  Trash2,
} from 'lucide-react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  deleteDoc,
  doc,
  type Timestamp,
} from 'firebase/firestore';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useFirestore, useUser } from '@/firebase';
import { format } from 'date-fns';
import Markdown from 'react-markdown';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

type Treatment = {
  productName: string;
  instructions: string;
  link: string;
};

type TreatmentData = {
  organic: Treatment[];
  chemical: Treatment[];
}

type DetectionHistory = {
  id: string;
  plantName: string;
  diseaseName: string;
  symptoms: string;
  causes: string;
  treatment: string; // This is a JSON string
  prevention: string;
  language: string;
  timestamp: Timestamp;
};

type ChatHistory = {
  id: string;
  userMessage: string;
  aiResponse: string;
  language: string;
  timestamp: Timestamp;
};

const TreatmentList = ({ treatments, title }: { treatments: Treatment[], title: string }) => {
    if (!treatments || treatments.length === 0) return null;
    return (
        <div className="mt-2">
            <h5 className="font-semibold text-sm">{title}</h5>
            <ul className="space-y-2 mt-1">
                {treatments.map((t, index) => (
                    <li key={index} className="text-xs border-l-2 border-primary pl-3">
                        <strong className="font-medium">{t.productName}</strong>
                        <p>{t.instructions}</p>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default function HistoryPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const [detections, setDetections] = useState<DetectionHistory[]>([]);
  const [chats, setChats] = useState<ChatHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHistory = async () => {
    if (!user || !db) return;
    setIsLoading(true);
    try {
      const detectionQuery = query(
        collection(db, 'users', user.uid, 'diseaseHistory'),
        orderBy('timestamp', 'desc')
      );
      const chatQuery = query(
        collection(db, 'users', user.uid, 'chatHistory'),
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

  useEffect(() => {
    fetchHistory();
  }, [user, db]);

  const handleDelete = async (id: string, type: 'detection' | 'chat') => {
    if (!user || !db) return;
    try {
      const path = type === 'detection' ? 'diseaseHistory' : 'chatHistory';
      await deleteDoc(doc(db, 'users', user.uid, path, id));
      toast({
        title: 'Item Deleted',
        description: 'The history record has been removed.',
      });
      fetchHistory(); // Refresh the list
    } catch (error) {
      console.error('Delete failed:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the item. Please try again.',
        variant: 'destructive',
      });
    }
  };

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
                        <div className="flex items-center">
                            <AccordionTrigger className="flex-1">
                                <div className="flex justify-between w-full pr-4">
                                    <span className="font-semibold text-left">
                                        {item.diseaseName} on {item.plantName}
                                    </span>
                                    <span className="text-sm text-muted-foreground flex items-center gap-2 flex-shrink-0 ml-4">
                                        <Calendar className="h-4 w-4" />
                                        {format(item.timestamp.toDate(), 'MMM d, yyyy')}
                                    </span>
                                </div>
                            </AccordionTrigger>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive ml-2">
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This action cannot be undone. This will permanently delete your detection record.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(item.id, 'detection')}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      <AccordionContent className="space-y-4 px-4 pt-2">
                        <div>
                            <h4 className="font-semibold">Symptoms</h4>
                            <p className="text-muted-foreground text-sm">{item.symptoms}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold">Treatment</h4>
                            <div className="text-muted-foreground text-sm prose prose-sm max-w-none">
                                {item.treatment}
                            </div>
                        </div>
                         <div className="text-xs text-muted-foreground">Language: {item.language}</div>
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
                    <div key={chat.id} className="p-4 border rounded-lg relative group">
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Chat in {chat.language}
                        </p>
                        <div className="flex items-center gap-2">
                            <p className="text-xs text-muted-foreground flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            {format(chat.timestamp.toDate(), 'MMM d, yyyy')}
                            </p>
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Delete Chat?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            This will remove this conversation from your history forever.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                        <AlertDialogAction onClick={() => handleDelete(chat.id, 'chat')}>Delete</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <p><strong>You:</strong> {chat.userMessage}</p>
                        <div className="prose prose-sm max-w-none">
                            <Markdown>{chat.aiResponse}</Markdown>
                        </div>
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
