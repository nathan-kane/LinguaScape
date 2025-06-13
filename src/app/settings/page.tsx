import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { User, Mail, Bell, Palette, ShieldCheck, Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"


export default function SettingsPage() {
  return (
    <AuthenticatedLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        <section>
          <h1 className="text-3xl font-headline font-bold text-foreground mb-1">
            Settings
          </h1>
          <p className="text-lg text-muted-foreground">
            Manage your account, preferences, and notification settings.
          </p>
        </section>

        {/* Profile Settings */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><User className="h-6 w-6 text-primary" /> Profile Information</CardTitle>
            <CardDescription>Update your personal details.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" defaultValue="Alex Johnson" placeholder="Your full name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" defaultValue="alexj" placeholder="Your username" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" defaultValue="alex.johnson@example.com" placeholder="Your email address" />
            </div>
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">Save Profile Changes</Button>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Bell className="h-6 w-6 text-primary" /> Notification Preferences</CardTitle>
            <CardDescription>Choose how you want to be notified.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label htmlFor="email-notifications" className="font-medium">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Receive updates and reminders via email.</p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label htmlFor="push-notifications" className="font-medium">Push Notifications</Label>
                <p className="text-sm text-muted-foreground">Get instant alerts on your device.</p>
              </div>
              <Switch id="push-notifications" />
            </div>
            <div className="flex items-center justify-between p-3 border rounded-md">
              <div>
                <Label htmlFor="streak-reminders" className="font-medium">Streak Reminders</Label>
                <p className="text-sm text-muted-foreground">Reminders to maintain your learning streak.</p>
              </div>
              <Switch id="streak-reminders" defaultChecked />
            </div>
            <Button variant="outline">Save Notification Settings</Button>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Palette className="h-6 w-6 text-primary" /> Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the app.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="theme">Theme</Label>
              <Select defaultValue="system">
                <SelectTrigger id="theme" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">Light</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="system">System Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button variant="outline">Apply Theme</Button>
          </CardContent>
        </Card>
        
        {/* Account Security */}
        <Card className="shadow-lg bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><ShieldCheck className="h-6 w-6 text-primary" /> Account Security</CardTitle>
            <CardDescription>Manage your account security settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button variant="outline">Change Password</Button>
            <Button variant="outline">Enable Two-Factor Authentication</Button>
          </CardContent>
        </Card>

        {/* Delete Account */}
        <Card className="shadow-lg bg-card border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive"><Trash2 className="h-6 w-6" /> Delete Account</CardTitle>
            <CardDescription className="text-destructive/80">Permanently delete your account and all associated data. This action cannot be undone.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="destructive" className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">
              Delete My Account
            </Button>
          </CardContent>
        </Card>

      </div>
    </AuthenticatedLayout>
  );
}
