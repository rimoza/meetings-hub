"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  User,
  Bell,
  Shield,
  Palette,
  Globe,
  Smartphone,
  Mail,
  Calendar,
  Clock,
  Volume2,
  Wifi,
  Database,
  Key,
  Camera,
  Save,
  AlertCircle,
  Check,
  ChevronRight,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useTheme } from "next-themes";
import { toast } from "sonner";

export function SettingsClient() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "",
    bio: "",
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    pushNotifications: false,
    meetingReminders: true,
    taskDeadlines: true,
    weeklyReport: false,
    soundEnabled: true,
  });

  const [preferences, setPreferences] = useState({
    language: "en",
    timezone: "UTC",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    startOfWeek: "monday",
  });

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Profile updated successfully");
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success("Notification preferences saved");
    } catch (error) {
      toast.error("Failed to save preferences");
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { icon: <Database className="h-4 w-4" />, label: "Export Data", action: "export" },
    { icon: <Key className="h-4 w-4" />, label: "Change Password", action: "password" },
    { icon: <Shield className="h-4 w-4" />, label: "Privacy Settings", action: "privacy" },
    { icon: <Wifi className="h-4 w-4" />, label: "API Settings", action: "api" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-4">
        {quickActions.map((action, index) => (
          <Card 
            key={index}
            className="cursor-pointer border-muted/50 hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 group"
          >
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <div className="text-primary">{action.icon}</div>
                </div>
                <span className="font-medium text-sm">{action.label}</span>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Settings Tabs */}
      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4 lg:w-[400px] bg-muted/50">
          <TabsTrigger value="profile" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Profile
          </TabsTrigger>
          <TabsTrigger value="notifications" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Notifications
          </TabsTrigger>
          <TabsTrigger value="appearance" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Appearance
          </TabsTrigger>
          <TabsTrigger value="preferences" className="data-[state=active]:bg-background data-[state=active]:shadow-sm">
            Preferences
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-4">
          <Card className="border-muted/50 shadow-sm">
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account profile information and email address
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Avatar Section */}
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-background shadow-lg">
                  {user?.photoURL ? (
                    <AvatarImage src={user.photoURL} />
                  ) : (
                    <AvatarFallback className="bg-gradient-to-br from-primary to-primary/60 text-primary-foreground text-xl">
                      {user?.name?.charAt(0) || "U"}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline" size="sm" className="gap-2">
                    <Camera className="h-4 w-4" />
                    Change Photo
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    JPG, GIF or PNG. Max size of 5MB.
                  </p>
                </div>
              </div>

              <Separator />

              {/* Form Fields */}
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="bg-muted/40 border-muted focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="bg-muted/40 border-muted focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    placeholder="+1 (555) 000-0000"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="bg-muted/40 border-muted focus:bg-background transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input
                    id="bio"
                    placeholder="Tell us about yourself"
                    value={profileData.bio}
                    onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                    className="bg-muted/40 border-muted focus:bg-background transition-colors"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Cancel</Button>
                <Button 
                  onClick={handleSaveProfile}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-muted/50 shadow-sm">
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Choose how you want to be notified about updates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {Object.entries({
                  emailNotifications: { icon: <Mail className="h-4 w-4" />, label: "Email Notifications", description: "Receive updates via email" },
                  pushNotifications: { icon: <Bell className="h-4 w-4" />, label: "Push Notifications", description: "Browser push notifications" },
                  meetingReminders: { icon: <Calendar className="h-4 w-4" />, label: "Meeting Reminders", description: "Get notified before meetings" },
                  taskDeadlines: { icon: <Clock className="h-4 w-4" />, label: "Task Deadlines", description: "Reminders for upcoming deadlines" },
                  weeklyReport: { icon: <AlertCircle className="h-4 w-4" />, label: "Weekly Reports", description: "Summary of your weekly activity" },
                  soundEnabled: { icon: <Volume2 className="h-4 w-4" />, label: "Sound Effects", description: "Play sounds for notifications" },
                }).map(([key, config]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-md bg-primary/10 text-primary">
                        {config.icon}
                      </div>
                      <div>
                        <p className="font-medium">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </div>
                    <Switch
                      checked={notifications[key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications({ ...notifications, [key]: checked })
                      }
                    />
                  </div>
                ))}
              </div>

              <Separator />

              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <div className="flex gap-3">
                  <Bell className="h-5 w-5 text-primary mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-medium text-sm">Notification Schedule</p>
                    <p className="text-sm text-muted-foreground">
                      Set quiet hours to pause non-urgent notifications
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Select defaultValue="9am">
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="9am">9:00 AM</SelectItem>
                          <SelectItem value="10am">10:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className="text-sm self-center">to</span>
                      <Select defaultValue="6pm">
                        <SelectTrigger className="w-[100px] h-8">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5pm">5:00 PM</SelectItem>
                          <SelectItem value="6pm">6:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset to Default</Button>
                <Button 
                  onClick={handleSaveNotifications}
                  disabled={loading}
                  className="gap-2"
                >
                  {loading ? (
                    <>Saving...</>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      Save Preferences
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Tab */}
        <TabsContent value="appearance" className="space-y-4">
          <Card className="border-muted/50 shadow-sm">
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks on your device
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Theme Selection */}
              <div className="space-y-3">
                <Label>Theme</Label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: "light", icon: <Sun className="h-4 w-4" />, label: "Light" },
                    { value: "dark", icon: <Moon className="h-4 w-4" />, label: "Dark" },
                    { value: "system", icon: <Monitor className="h-4 w-4" />, label: "System" },
                  ].map((option) => (
                    <Card
                      key={option.value}
                      className={`cursor-pointer transition-all ${
                        theme === option.value
                          ? "border-primary shadow-md"
                          : "border-muted/50 hover:border-muted"
                      }`}
                      onClick={() => setTheme(option.value)}
                    >
                      <CardContent className="p-4 flex flex-col items-center gap-2">
                        <div className={`p-2 rounded-md ${
                          theme === option.value ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}>
                          {option.icon}
                        </div>
                        <span className="text-sm font-medium">{option.label}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Color Customization */}
              <div className="space-y-3">
                <Label>Accent Color</Label>
                <div className="flex gap-2">
                  {[
                    { name: "blue", color: "#3b82f6" },
                    { name: "green", color: "#10b981" },
                    { name: "purple", color: "#8b5cf6" },
                    { name: "orange", color: "#f59e0b" },
                    { name: "red", color: "#ef4444" }
                  ].map((color) => (
                    <button
                      key={color.name}
                      className={`h-10 w-10 rounded-lg border-2 transition-all hover:scale-110 border-muted`}
                      style={{ backgroundColor: color.color }}
                    />
                  ))}
                </div>
              </div>

              <Separator />

              {/* Font Size */}
              <div className="space-y-3">
                <Label>Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Compact Mode */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div>
                  <p className="font-medium">Compact Mode</p>
                  <p className="text-sm text-muted-foreground">Reduce spacing between elements</p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences" className="space-y-4">
          <Card className="border-muted/50 shadow-sm">
            <CardHeader>
              <CardTitle>Regional Preferences</CardTitle>
              <CardDescription>
                Set your language, timezone, and date format preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select
                    value={preferences.language}
                    onValueChange={(value) => setPreferences({ ...preferences, language: value })}
                  >
                    <SelectTrigger id="language">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select
                    value={preferences.timezone}
                    onValueChange={(value) => setPreferences({ ...preferences, timezone: value })}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UTC">UTC</SelectItem>
                      <SelectItem value="EST">Eastern Time</SelectItem>
                      <SelectItem value="PST">Pacific Time</SelectItem>
                      <SelectItem value="CST">Central Time</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Date Format</Label>
                  <Select
                    value={preferences.dateFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, dateFormat: value })}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                      <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select
                    value={preferences.timeFormat}
                    onValueChange={(value) => setPreferences({ ...preferences, timeFormat: value })}
                  >
                    <SelectTrigger id="timeFormat">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="startOfWeek">Week Starts On</Label>
                <Select
                  value={preferences.startOfWeek}
                  onValueChange={(value) => setPreferences({ ...preferences, startOfWeek: value })}
                >
                  <SelectTrigger id="startOfWeek">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sunday">Sunday</SelectItem>
                    <SelectItem value="monday">Monday</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button variant="outline">Reset</Button>
                <Button className="gap-2">
                  <Globe className="h-4 w-4" />
                  Save Preferences
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Danger Zone */}
      <Card className="border-red-200 dark:border-red-900 bg-red-50/50 dark:bg-red-950/20">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
          <CardDescription>
            Irreversible actions that affect your account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Delete Account</p>
              <p className="text-sm text-muted-foreground">
                Permanently delete your account and all data
              </p>
            </div>
            <Button variant="destructive" size="sm">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}