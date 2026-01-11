'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Loader2,
  Mic,
  Send,
  Bot,
  User,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { expandFAQ } from '@/ai/flows/dynamic-faq-expansion';
import { multilingualAIChatbotResponses } from '@/ai/flows/multilingual-ai-chatbot-responses';
import { useUser } from '@/firebase';
import { useToast } from '@/hooks/use-toast';
import type { User as AppUser } from '@/lib/types';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const predefinedQuestions = [
  'What are common plant diseases?',
  'How do I properly water my plants?',
  'What is the best fertilizer for tomatoes?',
  'How to control pests naturally?',
  'What should I plant in the current season?',
];

// Extend window type for SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatbotPage() {
  const { user } = useUser();
  const appUser = user as AppUser | null;
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [listening, setListening] = useState(false);

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = appUser?.language || 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript);
        setListening(false);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Voice Error',
          description: `Could not process voice input: ${event.error}`,
          variant: 'destructive',
        });
        setListening(false);
      };
      
      recognition.onend = () => {
        setListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [appUser?.language, toast]);


  const handleSend = async (messageContent: string) => {
    if (!messageContent.trim() || !appUser) return;
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      let response;
      let aiResponseMessage: string;
      if (predefinedQuestions.includes(messageContent)) {
        response = await expandFAQ({ question: messageContent });
        aiResponseMessage = response.expandedAnswer;
      } else {
        response = await multilingualAIChatbotResponses({
          userMessage: messageContent,
          language: appUser.language,
        });
        aiResponseMessage = response.aiResponse;
      }
      
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponseMessage,
      };
      setMessages((prev) => [...prev, aiMessage]);
      speak(aiResponseMessage);

    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage =
        'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: errorMessage },
      ]);
      toast({
        title: 'AI Error',
        description: 'Failed to get a response from the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speak = (text: string) => {
    if (!appUser?.voiceEnabled || !window.speechSynthesis) return;
    
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    
    const utterance = new SpeechSynthesisUtterance(text);
    if(appUser.language) {
      utterance.lang = appUser.language;
    }
    if(appUser.voiceSpeed) {
      utterance.rate = appUser.voiceSpeed;
    }
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    speechSynthesis.speak(utterance);
  };
  
  const stopSpeaking = () => {
    if (window.speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Unsupported Browser',
        description:'Your browser does not support voice recognition.',
        variant: 'destructive'
      });
      return;
    }

    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  };


  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot className="h-7 w-7 text-primary" />
            AI Chatbot
          </CardTitle>
          {appUser?.voiceEnabled && (
            isSpeaking ? (
              <Button variant="ghost" size="icon" onClick={stopSpeaking}>
                <VolumeX className="h-6 w-6 text-red-500" />
              </Button>
            ) : (
              <Volume2 className="h-6 w-6 text-muted-foreground" />
            )
          )}
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4">
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={cn(
                    'flex items-start gap-3',
                    message.role === 'user'
                      ? 'justify-end'
                      : 'justify-start'
                  )}
                >
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <Bot />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={cn(
                      'max-w-md rounded-lg px-4 py-2',
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary'
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        <User />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot />
                    </AvatarFallback>
                  </Avatar>
                  <div className="max-w-md rounded-lg px-4 py-2 bg-secondary">
                    <Loader2 className="h-5 w-5 animate-spin" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex flex-wrap gap-2">
            {predefinedQuestions.map((q) => (
              <Button
                key={q}
                variant="outline"
                size="sm"
                onClick={() => handleSend(q)}
                disabled={isLoading}
              >
                {q}
              </Button>
            ))}
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center gap-2">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message or use the microphone..."
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              rows={1}
              className="min-h-0 resize-none"
            />
            <Button
              onClick={() => handleSend(input)}
              disabled={isLoading || !input.trim()}
              size="icon"
            >
              <Send className="h-4 w-4" />
            </Button>
            {appUser?.voiceEnabled && (
              <Button
                onClick={handleVoiceInput}
                disabled={isLoading}
                size="icon"
                variant={listening ? 'destructive' : 'outline'}
              >
                {listening ? <X className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
