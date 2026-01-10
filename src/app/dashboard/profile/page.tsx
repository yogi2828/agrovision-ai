import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { languages } from "@/lib/data"
import { PlaceHolderImages } from "@/lib/placeholder-images"
import Image from "next/image"

export default function ProfilePage() {
  const avatarImage = PlaceHolderImages.find(img => img.id === 'profile-avatar');
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold tracking-tight font-headline mb-4">User Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            Update your profile details and preferences.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            {avatarImage && (
              <Image
                alt="User avatar"
                className="rounded-full"
                height="80"
                src={avatarImage.imageUrl}
                style={{
                  aspectRatio: "80/80",
                  objectFit: "cover",
                }}
                width="80"
                data-ai-hint={avatarImage.imageHint}
              />
            )}
            <Button variant="outline">Change Picture</Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" defaultValue="Suresh Kumar" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="suresh.k@example.com" disabled />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="language">Preferred Language</Label>
            <Select defaultValue="en">
              <SelectTrigger>
                <SelectValue placeholder="Select a language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map(lang => (
                  <SelectItem key={lang.value} value={lang.value}>{lang.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline">Cancel</Button>
            <Button>Save Changes</Button>
          </div>
          <div className="border-t pt-6 mt-6 border-destructive/50">
            <h3 className="font-semibold text-destructive">Delete Account</h3>
            <p className="text-sm text-muted-foreground mt-1">
                Once you delete your account, there is no going back. Please be certain.
            </p>
            <Button variant="destructive" className="mt-4">Delete My Account</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
