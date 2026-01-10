'use client';

import { useState, useRef, useEffect } from 'react';
import { Bot, Mic, Send, User, Volume2, Loader2, StopCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { aiChatbot } from '@/ai/flows/voice-enabled-ai-chatbot';
import { languages } from '@/lib/data';

type Message = {
  sender: 'user' | 'bot';
  text: string;
  audio?: string;
};

const language = languages[0].value; // Default to English for now

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        // A hack to make scrollarea scroll to bottom
        const viewport = scrollAreaRef.current.querySelector('div');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSend = async () => {
    if (input.trim() === '' || isLoading) return;

    const userMessage: Message = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const result = await aiChatbot({ language, query: input });
      const botMessage: Message = { sender: 'bot', text: result.response, audio: result.audio };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Message = { sender: 'bot', text: 'Sorry, I encountered an error. Please try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    recognitionRef.current.lang = language + '-IN';
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
  
  const playAudio = (audioDataUri: string) => {
    if (audioDataUri) {
        const audio = new Audio(audioDataUri);
        audio.play();
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)]">
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-headline flex items-center gap-2"><Bot/>AI Chatbot</CardTitle>
          <CardDescription>Ask me anything about crop care, fertilizer, or farming tips.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  {message.sender === 'bot' && (
                    <Avatar>
                      <AvatarFallback><Bot /></AvatarFallback>
                    </Avatar>
                  )}
                  <div className={`rounded-lg p-3 max-w-[80%] ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="text-sm">{message.text}</p>
                    {message.sender === 'bot' && message.audio && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 mt-2" onClick={() => playAudio(message.audio!)}>
                        <Volume2 className="h-4 w-4"/>
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
                  <div className="flex items-start gap-3">
                      <Avatar>
                          <AvatarFallback><Bot /></AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg p-3 bg-muted">
                          <Loader2 className="h-5 w-5 animate-spin"/>
                      </div>
                  </div>
              )}
            </div>
          </ScrollArea>
          <div className="relative">
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
              className="pr-20 min-h-[60px]"
            />
            <div className="absolute top-1/2 right-3 -translate-y-1/2 flex gap-1">
              <Button size="icon" variant="ghost" onClick={isRecording ? stopRecording : startRecording}>
                {isRecording ? <StopCircle className="h-5 w-5 text-destructive" /> : <Mic className="h-5 w-5" />}
              </Button>
              <Button size="icon" onClick={handleSend} disabled={isLoading}>
                <Send className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
