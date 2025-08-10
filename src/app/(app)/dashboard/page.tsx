'use client';

import { Button } from "@/components/ui/button";
import { RecentDiagnoses } from "@/components/dashboard/recent-diagnoses";
import { WeatherCard } from "@/components/dashboard/weather-card";
import { ScanLine, Leaf, Bot, BookCheck, History } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 100
    }
  },
};

export default function DashboardPage() {
  return (
    <motion.div 
      className="space-y-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >

      <motion.section 
        className="text-center bg-card p-8 rounded-lg shadow-md"
        variants={itemVariants}
      >
          <h1 className="font-headline text-3xl md:text-5xl font-bold tracking-tight">Diagnose. Treat. Grow Better.</h1>
          <p className="text-muted-foreground mt-4 max-w-2xl mx-auto">Welcome to AgroVision AI, your personal plant health assistant. Get instant diagnoses and expert treatment plans to keep your plants thriving.</p>
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md hover:shadow-lg transition-shadow w-full sm:w-auto">
                  <Link href="/diagnose">
                    <ScanLine className="mr-2 h-6 w-6" />
                    Scan New Plant
                  </Link>
                </Button>
              </motion.div>
               <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                 <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                  <Link href="/history">
                    <History className="mr-2 h-6 w-6" />
                    View History
                  </Link>
                </Button>
               </motion.div>
          </motion.div>
      </motion.section>

      <motion.div variants={itemVariants}>
        <WeatherCard />
      </motion.div>

      <motion.section variants={itemVariants}>
        <h2 className="text-2xl font-bold text-center mb-6 font-headline">Features</h2>
        <motion.div 
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-6"
          variants={containerVariants}
        >
            <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}>
              <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Leaf className="w-12 h-12 mx-auto text-primary"/>
                  <CardTitle>Plant Disease Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Snap a photo to instantly identify plant diseases.</p>
                </CardContent>
              </Card>
            </motion.div>
            <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}>
               <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <BookCheck className="w-12 h-12 mx-auto text-primary"/>
                  <CardTitle>Organic & Chemical Treatments</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Get tailored treatment plans for your specific plant.</p>
                </CardContent>
              </Card>
            </motion.div>
             <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}>
               <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <Bot className="w-12 h-12 mx-auto text-primary"/>
                  <CardTitle>AI Chatbot</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Ask our AI assistant any agricultural question.</p>
                </CardContent>
              </Card>
             </motion.div>
             <motion.div variants={itemVariants} whileHover={{ y: -5, transition: { type: 'spring', stiffness: 300 } }}>
               <Card className="text-center h-full hover:shadow-lg transition-shadow">
                <CardHeader>
                  <History className="w-12 h-12 mx-auto text-primary"/>
                  <CardTitle>History Tracker</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Keep a record of all your past diagnoses.</p>
                </CardContent>
              </Card>
             </motion.div>
        </motion.div>
      </motion.section>


      <motion.div variants={itemVariants}>
        <RecentDiagnoses />
      </motion.div>
    </motion.div>
  )
}
