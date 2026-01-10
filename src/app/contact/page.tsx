
import { PublicHeader } from '@/components/public-header';
import { Footer } from '@/components/footer';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const faqs = [
  {
    question: "How accurate is the disease detection?",
    answer: "Our AI model is trained on a vast dataset of plant images and achieves high accuracy. However, it should be used as a primary diagnostic tool, and for critical cases, consulting a local agricultural expert is recommended."
  },
  {
    question: "Which languages does the voice assistant support?",
    answer: "We support English and several major Indian languages including Hindi, Telugu, Tamil, Kannada, Malayalam, Marathi, and Bengali. We are continuously working to add more languages."
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use Firebase services for authentication and data storage, which provides robust security for all your data. Your images and detection history are private to your account."
  },
  {
    question: "Can I use AgroVision AI offline?",
    answer: "Currently, AgroVision AI requires an active internet connection for AI processing and to access your history. We are exploring options for limited offline functionality in future updates."
  }
]

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1">
        <div className="container mx-auto max-w-5xl py-16 px-4 md:px-6">
          <div className="grid gap-12 md:grid-cols-2">
            <div>
              <h1 className="text-4xl font-bold tracking-tight font-headline sm:text-5xl">Get in Touch</h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Have questions or feedback? We'd love to hear from you.
              </p>
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Send us a message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" placeholder="Your Name" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" placeholder="your@email.com" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input id="subject" placeholder="Question about detection" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea id="message" placeholder="Your message..." />
                    </div>
                    <Button type="submit" className="w-full">Send Message</Button>
                  </form>
                </CardContent>
              </Card>
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight font-headline">Frequently Asked Questions</h2>
              <Accordion type="single" collapsible className="w-full mt-4">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger>{faq.question}</AccordionTrigger>
                    <AccordionContent>{faq.answer}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
