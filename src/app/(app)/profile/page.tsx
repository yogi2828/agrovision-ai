'use client';
import { useAuth } from '@/context/auth-context';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Mail, FileDown, Languages, AlertTriangle, LogOut } from 'lucide-react';
import { getDiagnosisHistory, deleteAllUserHistory } from '@/lib/firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { useLanguage } from '@/context/language-context';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';

export default function ProfilePage() {
    const { user, logout, loading } = useAuth();
    const router = useRouter();
    const { toast } = useToast();
    const { language, setLanguage } = useLanguage();

    const handleLogout = async () => {
        await logout();
        router.push('/login');
    };
    
    const handleExport = async () => {
        if (!user) return;
        try {
            const history = await getDiagnosisHistory(user.uid);
            const dataStr = JSON.stringify(history.map(r => ({...r, createdAt: r.createdAt.toDate()})), null, 2);
            const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
            
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', `agrovision_history_${user.uid}.json`);
            linkElement.click();

            toast({
                title: 'Export successful',
                description: 'Your data is being downloaded.'
            });

        } catch (error) {
            console.error(error);
             toast({
                variant: 'destructive',
                title: 'Export Failed',
                description: 'Could not export your data.'
            });
        }
    }

    const handleDeleteAccount = async () => {
        if (!user) return;
        try {
            await deleteAllUserHistory(user.uid);
            // Note: In a real app, you would also delete the Firebase Auth user.
            // This requires an admin SDK on a backend.
            // For now, we just delete their data and log them out.
            toast({
                title: 'Account Data Deleted',
                description: 'All your history has been removed.'
            });
            await handleLogout();

        } catch (error) {
             console.error(error);
             toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete your account data.'
            });
        }
    }


    if (loading) {
        return (
             <div className="container mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <Skeleton className="w-20 h-20 rounded-full" />
                            <div>
                                <Skeleton className="h-8 w-48 mb-2" />
                                <Skeleton className="h-4 w-64" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                    </CardContent>
                     <CardFooter>
                        <Skeleton className="h-10 w-24" />
                    </CardFooter>
                </Card>
            </div>
        )
    }

    if (!user) {
        return null;
    }

    return (
        <motion.div 
            className="container mx-auto max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <Card>
                <CardHeader>
                    <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                        <Avatar className="w-20 h-20">
                            <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || 'User'} />
                            <AvatarFallback>
                                <User className="w-10 h-10" />
                            </AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-3xl font-headline">{user.displayName || 'User Profile'}</CardTitle>
                            <CardDescription>Manage your account settings and data.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><Mail className="w-5 h-5" /> Email</h3>
                        <p className="text-muted-foreground break-all">{user.email}</p>
                    </div>

                     <div className="space-y-2">
                        <Label htmlFor="language-select" className="font-semibold flex items-center gap-2"><Languages className="w-5 h-5" /> Language</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger id="language-select" className="w-full sm:w-[200px]">
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="en">English</SelectItem>
                                <SelectItem value="es">Español</SelectItem>
                                <SelectItem value="hi">हिन्दी</SelectItem>
                                <SelectItem value="fr">Français</SelectItem>
                                <SelectItem value="pt">Português</SelectItem>
                                <SelectItem value="bn">বাংলা</SelectItem>
                                <SelectItem value="ta">தமிழ்</SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-muted-foreground">Change the language for the app and AI responses.</p>
                    </div>

                    <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2"><FileDown className="w-5 h-5" /> Data Export</h3>
                        <p className="text-muted-foreground text-sm">Download a copy of all your diagnosis history.</p>
                        <Button variant="secondary" onClick={handleExport}>
                           Download My Data
                        </Button>
                    </div>
                </CardContent>
                <CardFooter className="flex-col items-start gap-4 bg-destructive/10 p-4 rounded-b-lg">
                     <div className="space-y-2">
                        <h3 className="font-semibold flex items-center gap-2 text-destructive"><AlertTriangle className="w-5 h-5" /> Danger Zone</h3>
                         <div className="flex flex-wrap gap-2">
                            <Button variant="outline" onClick={handleLogout} className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                                <LogOut className="mr-2 h-4 w-4" />
                                Logout
                            </Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                   <Button variant="destructive">Delete Account & Data</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      This action cannot be undone. This will permanently delete all your diagnosis history. Your account will not be deleted, but all data associated with it will be removed.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">Yes, delete my data</AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                         </div>
                        <p className="text-xs text-muted-foreground">Logout or permanently delete all your data.</p>
                    </div>
                </CardFooter>
            </Card>
        </motion.div>
    )
}
