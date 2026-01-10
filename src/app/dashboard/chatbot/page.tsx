'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Bot, Mic, Send, User, Volume2, Loader2, StopCircle, CornerDownLeft, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { aiChatbot } from '@/ai/flows/voice-enabled-ai-chatbot';
import { languages } from '@/lib/data';
import { cn } from '@/lib/utils';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';

type Message = {
  sender: 'user' | 'bot';
  text: string;
  audio?: string;
};

const predefinedQuestions = [
    "What's the best fertilizer for tomato plants?",
    "How do I treat powdery mildew on my crops?",
    "When is the best time to plant rice in North India?",
    "Tell me about organic pest control methods.",
]

export default function ChatbotPage() {
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!user || !firestore) return null;
    return doc(firestore, 'users', user.uid);
  }, [user, firestore]);
  
  const { data: userData } = useDoc<{ preferredLanguage: string }>(userDocRef);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('div');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages, isLoading]);
  
  const getLanguage = () => {
    return userData?.preferredLanguage || languages[0].value;
  }

  const processQuery = useCallback(async (query: string) => {
    if (query.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const language = getLanguage();
      const result = await aiChatbot({ language, query });
      const botMessage: Message = { sender: 'bot', text: result.response, audio: result.audio };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error("Chatbot Error:", error);
      const errorMessage: Message = { sender: 'bot', text: 'Sorry, I had trouble connecting to my knowledge base. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, userData]);

  const handleSend = () => {
    processQuery(input);
  };

  const handlePredefinedQuestion = (question: string) => {
    setInput(question);
    processQuery(question);
  }

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    
    stopAudio(); // Stop any currently playing audio

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = getLanguage() + '-IN';
    recognitionRef.current.interimResults = true;

    recognitionRef.current.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0])
        .map((result) => result.transcript)
        .join('');
      setInput(transcript);
    };

    recognitionRef.current.onend = () => {
      setIsRecording(false);
    };

    recognitionRef.current.start();
    setIsRecording(true);
  };
  
  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };
  
  const stopAudio = () => {
    if(audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }
  
  const playAudio = (audioDataUri: string) => {
    stopAudio();
    if (audioDataUri) {
        audioRef.current = new Audio(audioDataUri);
        audioRef.current.play();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] w-full max-w-4xl mx-auto">
      <Card className="h-full flex flex-col shadow-2xl shadow-primary/5">
        <CardHeader className="border-b">
          <CardTitle className="text-2xl font-headline flex items-center gap-3 text-primary"><Sparkles className="h-6 w-6"/>AI Farming Assistant</CardTitle>
          <CardDescription>Ask me anything about crop care, fertilizer, or get seasonal farming tips.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 p-2 sm:p-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-6 p-2">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''} animate-fade-in-up`}>
                  {message.sender === 'bot' && (
                    <Avatar className="bg-primary/10 border-2 border-primary/20">
                      <AvatarFallback><Bot className="text-primary"/></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={cn('rounded-xl p-3 max-w-[85%] sm:max-w-[75%]', message.sender === 'user' ? 'bg-primary text-primary-foreground shadow-md' : 'bg-muted shadow-sm')}>
                    <p className="text-sm whitespace-pre-wrap">{message.text}</p>
                    {message.sender === 'bot' && message.audio && (
                      <Button variant="ghost" size="icon" className="h-8 w-8 mt-2" onClick={() => playAudio(message.audio!)}>
                        <Volume2 className="h-4 w-4"/>
                        <span className="sr-only">Play audio response</span>
                      </Button>
                    )}
                  </div>
                  {message.sender === 'user' && (
                    <Avatar>
                      <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                  <div className="flex items-start gap-3 animate-fade-in-up">
                      <Avatar className="bg-primary/10 border-2 border-primary/20">
                          <AvatarFallback><Bot className="text-primary"/></AvatarFallback>
                      </Avatar>
                      <div className="rounded-xl p-3 bg-muted shadow-sm flex items-center space-x-2">
                          <Loader2 className="h-5 w-5 animate-spin text-primary"/>
                          <span className="text-sm text-muted-foreground">Thinking...</span>
                      </div>
                  </div>
              )}
            </div>
          </ScrollArea>

          {messages.length === 0 && !isLoading && (
            <div className="p-4 pt-0 space-y-4 animate-fade-in">
                <p className="text-sm text-center text-muted-foreground">Try asking one of these questions:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {predefinedQuestions.map((q, i) => (
                        <button key={i} onClick={() => handlePredefinedQuestion(q)} className="p-3 bg-muted hover:bg-primary/5 rounded-lg text-left text-sm text-foreground transition-colors">
                            {q}
                        </button>
                    ))}
                </div>
            </div>
          )}

          <div className="relative p-2">
            <Textarea
              placeholder="Type your message or use the microphone..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="pr-24 min-h-[60px] rounded-xl shadow-sm focus-visible:ring-primary/50"
              rows={1}
            />
            <div className="absolute top-1/2 right-4 -translate-y-1/2 flex gap-1">
              <Button size="icon" variant="ghost" onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}>
                {isRecording ? <StopCircle className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
                <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
              </Button>
              <Button size="icon" onClick={handleSend} disabled={isLoading || !input.trim()} className="rounded-full w-10 h-10 shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-transform duration-200">
                <Send className="h-5 w-5" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </div>
           <p className="text-xs text-center text-muted-foreground px-2">Press <CornerDownLeft className="inline h-3 w-3"/> to send, <kbd className="font-sans">Shift</kbd> + <CornerDownLeft className="inline h-3 w-3"/> for a new line.</p>
        </CardContent>
      </Card>
    </div>
  );
}
