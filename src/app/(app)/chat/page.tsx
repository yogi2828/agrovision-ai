'use client';
import { useState } from 'react';
import { Bot, Send, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/auth-context';
import { followUpPlantQueries } from '@/ai/flows/follow-up-plant-queries';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useLanguage } from '@/context/language-context';
import { logAnalyticsEvent } from '@/lib/firebase/analytics';
import { motion } from 'framer-motion';

interface Message {
  text: string;
  isUser: boolean;
}

const quickPrompts = [
    'Suggest a good organic fertilizer for tomatoes.',
    'How do I test my soil\'s pH level?',
    'Create a watering schedule for indoor ferns.'
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
  },
};


export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const { language } = useLanguage();

  const handleSend = async (prompt?: string) => {
    const textToSend = prompt || input;
    if (!textToSend.trim()) return;

    const userMessage: Message = { text: textToSend, isUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      logAnalyticsEvent('chat_message', { length: textToSend.length, language });
      const result = await followUpPlantQueries({ 
          diagnosisSummary: 'The user is asking a general agricultural question.',
          followUpQuery: textToSend,
          language: language
      });
      const botMessage: Message = { text: result.answer, isUser: false };
      setMessages(prev => [...prev, botMessage]);
    } catch (e) {
      console.error(e);
      setError("Sorry, the AI chatbot is currently unavailable. Please try again later.");
       logAnalyticsEvent('chat_message_failed', { language });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      className="container mx-auto max-w-3xl h-full flex flex-col"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="flex-1 overflow-y-auto pr-4 space-y-6">
        {messages.length === 0 && (
          <motion.div className="text-center py-8 md:py-16" variants={itemVariants}>
            <Bot className="w-16 h-16 text-muted-foreground mb-4 mx-auto" />
            <h1 className="font-headline text-3xl font-bold tracking-tight">AgroBot</h1>
            <p className="text-muted-foreground mt-2">Your AI agricultural assistant. How can I help?</p>
            <motion.div 
              className="mt-8 grid sm:grid-cols-1 md:grid-cols-3 gap-2"
              variants={containerVariants}
            >
                {quickPrompts.map(prompt => (
                    <motion.div key={prompt} variants={itemVariants}>
                      <Button variant="outline" onClick={() => handleSend(prompt)} className="w-full h-full text-wrap">
                          {prompt}
                      </Button>
                    </motion.div>
                ))}
            </motion.div>
          </motion.div>
        )}
        {messages.map((msg, index) => (
          <motion.div 
            key={index} 
            className={`flex items-start gap-3 ${msg.isUser ? 'justify-end' : ''}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!msg.isUser && (
              <Avatar className="w-8 h-8 border">
                <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
              </Avatar>
            )}
            <Card className={`w-full ${msg.isUser ? 'bg-primary text-primary-foreground' : ''} md:max-w-md lg:max-w-lg`}>
              <CardContent className="p-3">
                <p>{msg.text}</p>
              </CardContent>
            </Card>
            {msg.isUser && (
              <Avatar className="w-8 h-8 border">
                {user?.photoURL && <AvatarImage src={user.photoURL} />}
                <AvatarFallback>{user?.displayName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
            )}
          </motion.div>
        ))}
        {loading && (
             <motion.div 
                className="flex items-start gap-3"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
             >
                <Avatar className="w-8 h-8 border">
                    <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                </Avatar>
                <Card className="max-w-md">
                    <CardContent className="p-3 flex items-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <p>AgroBot is thinking...</p>
                    </CardContent>
                </Card>
            </motion.div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
      </div>
      <motion.div 
        className="mt-4 sticky bottom-20 sm:bottom-0"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: messages.length > 0 ? 0 : 0.5 }}
      >
        <form
          className="flex gap-2"
          onSubmit={e => {
            e.preventDefault();
            handleSend();
          }}
        >
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about fertilizers, pests, and more..."
            className="flex-1"
            disabled={loading}
          />
          <Button type="submit" disabled={loading || !input.trim()}>
            <Send className="w-5 h-5" />
          </Button>
        </form>
      </motion.div>
    </motion.div>
  );
}
