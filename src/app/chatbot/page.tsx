'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
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
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { expandFAQ } from '@/ai/flows/dynamic-faq-expansion';
import { multilingualAIChatbotResponses } from '@/ai/flows/multilingual-ai-chatbot-responses';
import { useFirestore } from '@/firebase';
import { useAppUser } from '@/hooks/use-app-user';
import { useToast } from '@/hooks/use-toast';
import { supportedLanguages } from '@/lib/languages';
import Markdown from 'react-markdown';

type Message = {
  role: 'user' | 'assistant';
  content: string;
};

const predefinedQuestions = [
  'Common diseases in tomato',
  'How to prevent fungal disease',
  'Best organic fertilizer',
  'How often to water crops',
  'How to control pests',
];

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function ChatbotPage() {
  const { user: appUser } = useAppUser();
  const db = useFirestore();
  const { toast } = useToast();

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessage, setSpeakingMessage] = useState<string | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  const recognitionRef = useRef<any>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const currentLanguageCode = appUser?.language || 'en-IN';
  const currentLanguageName = supportedLanguages.find(l => l.code === currentLanguageCode)?.name || currentLanguageCode;

  useEffect(() => {
    const loadVoices = () => {
      setVoices(window.speechSynthesis.getVoices());
    };
    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = currentLanguageCode;

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        handleSend(transcript); // Automatically send after successful recognition
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: 'Voice Error',
          description: `Could not process voice input: ${event.error}`,
          variant: 'destructive',
        });
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [toast, currentLanguageCode]);
  
  const stopSpeaking = () => {
    if (window.speechSynthesis && speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingMessage(null);
  };

  const speak = useCallback((text: string, lang: string, rate: number) => {
    if (!window.speechSynthesis) return;
    stopSpeaking();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    let voice = voices.find(v => v.lang === lang);
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith(lang.split('-')[0]));
    }
    
    // If we have a list of voices from the browser, and none of them match the desired language,
    // we can predict that speech will fail. We inform the user and stop.
    if (voices.length > 0 && !voice) {
        toast({
            title: "Voice Not Available",
            description: `Your browser does not have a voice for the language: ${supportedLanguages.find(l => l.code === lang)?.name || lang}.`,
            variant: "destructive",
        });
        return; // Prevent calling speechSynthesis.speak() which would cause an error
    }

    if(voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = lang;
    utterance.rate = rate || 1;
    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingMessage(text);
    };
    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingMessage(null);
    };
    utterance.onerror = (e) => {
      console.error("Speech synthesis error", e);
      setIsSpeaking(false);
      setSpeakingMessage(null);
      toast({
        title: "Voice Error",
        description: "Could not play audio response. This can happen if the selected language voice is not supported by your browser.",
        variant: "destructive",
      });
    };
    speechSynthesis.speak(utterance);
  }, [voices, toast]);

  const handleSend = useCallback(async (messageContent: string) => {
    if (!messageContent.trim() || !appUser || !db) return;
    const userMessage: Message = { role: 'user', content: messageContent };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setInput('');

    try {
      const userLanguage = appUser.language || 'en-IN';
      let aiResponseMessage: string;

      if (predefinedQuestions.includes(messageContent)) {
        const response = await expandFAQ({ question: messageContent, language: userLanguage });
        aiResponseMessage = response.expandedAnswer;
      } else {
        const response = await multilingualAIChatbotResponses({
          userMessage: messageContent,
          language: userLanguage,
        });
        aiResponseMessage = response.aiResponse;
      }
      
      const aiMessage: Message = {
        role: 'assistant',
        content: aiResponseMessage,
      };
      setMessages((prev) => [...prev, aiMessage]);
      
      if (appUser.voiceEnabled) {
        speak(aiResponseMessage, userLanguage, appUser.voiceSpeed);
      }
      
      await addDoc(collection(db, 'users', appUser.uid, 'chatHistory'), {
        userMessage: messageContent,
        aiResponse: aiResponseMessage,
        language: userLanguage,
        timestamp: serverTimestamp(),
      });

    } catch (error) {
      console.error('AI response error:', error);
      const errorMessage = 'Sorry, I encountered an error. Please try again.';
      setMessages((prev) => [...prev, { role: 'assistant', content: errorMessage }]);
      toast({
        title: 'AI Error',
        description: 'Failed to get a response from the AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [appUser, db, toast, speak]);

  const handleVoiceInput = () => {
    if (!recognitionRef.current) {
      toast({
        title: 'Unsupported Browser',
        description: 'Your browser does not support voice recognition.',
        variant: 'destructive',
      });
      return;
    }
    
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      stopSpeaking(); // Stop any ongoing speech synthesis
      recognitionRef.current.lang = appUser?.language || 'en-IN';
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollEl = scrollAreaRef.current.querySelector('div');
      if (scrollEl) {
        scrollEl.scrollTo({
            top: scrollEl.scrollHeight,
            behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  return (
    <div className="container py-8 flex justify-center">
      <Card className="w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        <CardHeader>
            <div className="flex items-center gap-3">
              <Bot className="h-8 w-8 text-primary" />
              <div>
                <CardTitle className="font-headline text-2xl">AI Chatbot</CardTitle>
                <CardDescription>Using language: <span className="font-bold text-primary">{currentLanguageName}</span></CardDescription>
              </div>
            </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
          <ScrollArea className="flex-1 pr-4 -mr-4" ref={scrollAreaRef}>
            <div className="space-y-4">
              {messages.map((message, index) => (
                <div key={index} className={cn('flex items-start gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {message.role === 'assistant' && (
                    <Avatar className="h-8 w-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                  )}
                  <div className={cn('max-w-xl rounded-lg px-4 py-2 relative group', message.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary')}>
                    <div className="prose prose-sm max-w-none">
                        <Markdown>{message.content}</Markdown>
                    </div>
                     {message.role === 'assistant' && appUser?.voiceEnabled && (
                      <div className="absolute -bottom-3 -right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {isSpeaking && speakingMessage === message.content ? (
                           <Button variant="ghost" size="icon" onClick={stopSpeaking}>
                              <VolumeX className="h-4 w-4 text-red-500" />
                            </Button>
                        ) : (
                          <Button variant="ghost" size="icon" onClick={() => appUser && speak(message.content, appUser.language, appUser.voiceSpeed)}>
                            <Volume2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                  {message.role === 'user' && (
                    <Avatar className="h-8 w-8"><AvatarFallback><User /></AvatarFallback></Avatar>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3 justify-start">
                  <Avatar className="h-8 w-8"><AvatarFallback><Bot /></AvatarFallback></Avatar>
                  <div className="max-w-md rounded-lg px-4 py-2 bg-secondary"><Loader2 className="h-5 w-5 animate-spin" /></div>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex flex-wrap gap-2">
            {predefinedQuestions.map((q) => (
              <Button key={q} variant="outline" size="sm" onClick={() => handleSend(q)} disabled={isLoading}>
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
              placeholder={isListening ? "Listening..." : "Type or click the mic..."}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend(input);
                }
              }}
              rows={1}
              className="min-h-0 resize-none"
              disabled={isLoading}
            />
            <Button onClick={() => handleSend(input)} disabled={isLoading || !input.trim()} size="icon">
              <Send className="h-4 w-4" />
            </Button>
            {appUser?.voiceEnabled && (
               <Button onClick={handleVoiceInput} disabled={isLoading} size="icon" variant={isListening ? 'destructive' : 'outline'}>
                <Mic className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
