import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Bell, Globe, Clock, RotateCcw, Database, Shield, Lock, Eye, Server } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
  });

  const resetAllData = () => {
    localStorage.removeItem('youtubePlaylists');
    toast.success('All data has been reset!');
    navigate('/');
  };

  const languages = [
    { code: "en", name: "English" },
    { code: "es", name: "Español" },
    { code: "fr", name: "Français" },
    { code: "de", name: "Deutsch" },
  ];

  const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "EST", label: "Eastern Time (EST)" },
    { value: "CST", label: "Central Time (CST)" },
    { value: "PST", label: "Pacific Time (PST)" },
    { value: "GMT", label: "Greenwich Mean Time (GMT)" },
  ];

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="privacy">Privacy</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Manage your general application preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  Language
                </Label>
                <Select defaultValue="en">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timezone
                </Label>
                <Select defaultValue="UTC">
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {timezones.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-4">
                  <button
                    onClick={() => setTheme("light")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                      theme === "light"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Sun className="w-4 h-4" />
                    Light
                  </button>
                  <button
                    onClick={() => setTheme("dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                      theme === "dark"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Moon className="w-4 h-4" />
                    Dark
                  </button>
                  <button
                    onClick={() => setTheme("system")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
                      theme === "system"
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    <Monitor className="w-4 h-4" />
                    System
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>
                Configure your notification preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Email Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, email: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Push Notifications
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Receive push notifications in your browser
                  </p>
                </div>
                <Switch
                  checked={notifications.push}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, push: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Bell className="w-4 h-4" />
                    Updates & Announcements
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified about new features and updates
                  </p>
                </div>
                <Switch
                  checked={notifications.updates}
                  onCheckedChange={(checked) =>
                    setNotifications({ ...notifications, updates: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Data Management</CardTitle>
              <CardDescription>
                Manage your application data and storage
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Reset All Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Permanently delete all playlists and their progress. This action cannot be undone.
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-900/30"
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="dark:bg-slate-800 dark:border-slate-700">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="dark:text-white">Reset All Data</AlertDialogTitle>
                        <AlertDialogDescription className="dark:text-slate-300">
                          Are you sure you want to reset all data? This will permanently delete all playlists and their progress. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="dark:bg-slate-700 dark:text-slate-200 dark:border-slate-600">Cancel</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={resetAllData} 
                          className="bg-red-600 hover:bg-red-700 dark:bg-red-900 dark:hover:bg-red-800"
                        >
                          Reset All Data
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy">
          <Card>
            <CardHeader>
              <CardTitle>Privacy & Data Storage</CardTitle>
              <CardDescription>
                Learn about how your data is stored and protected
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Data Storage Section */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-blue-100/80 dark:bg-blue-900/30 p-2.5 rounded-lg">
                    <Server className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Data Storage</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                      <p>All your data is stored locally in your browser using localStorage. This means:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Your data never leaves your device</li>
                        <li>No data is sent to external servers</li>
                        <li>Data persists between browser sessions</li>
                        <li>Data is cleared when you clear browser data</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Stored Data Types */}
                <div className="flex items-start gap-3">
                  <div className="bg-purple-100/80 dark:bg-purple-900/30 p-2.5 rounded-lg">
                    <Database className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Types of Data Stored</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                      <p>The following data is stored locally:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Playlists and video information</li>
                        <li>Watch progress and timestamps</li>
                        <li>Watch time statistics</li>
                        <li>User preferences and settings</li>
                        <li>Coding problem solutions and progress</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Privacy Protection */}
                <div className="flex items-start gap-3">
                  <div className="bg-green-100/80 dark:bg-green-900/30 p-2.5 rounded-lg">
                    <Shield className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Privacy Protection</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                      <p>Your privacy is our priority:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>No data is shared with third parties</li>
                        <li>No analytics or tracking</li>
                        <li>No user accounts required</li>
                        <li>Complete control over your data</li>
                        <li>Easy data reset option available</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Data Usage */}
                <div className="flex items-start gap-3">
                  <div className="bg-orange-100/80 dark:bg-orange-900/30 p-2.5 rounded-lg">
                    <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">How Your Data is Used</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                      <p>Your data is used exclusively to:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Track your learning progress</li>
                        <li>Save your watch history and timestamps</li>
                        <li>Remember your preferences</li>
                        <li>Provide personalized statistics</li>
                        <li>Enable offline functionality</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-4" />

                {/* Data Control */}
                <div className="flex items-start gap-3">
                  <div className="bg-red-100/80 dark:bg-red-900/30 p-2.5 rounded-lg">
                    <Lock className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Your Control</h3>
                    <div className="space-y-3 text-sm text-gray-600 dark:text-slate-300">
                      <p>You have complete control over your data:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Reset all data at any time</li>
                        <li>Clear individual playlists</li>
                        <li>Export your data (coming soon)</li>
                        <li>Manage watch history</li>
                        <li>Control notification preferences</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Privacy Note */}
              <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm">
                  <strong className="text-blue-900 dark:text-blue-200 font-semibold">Note:</strong>
                  <span className="text-blue-800 dark:text-blue-100 ml-1">
                    While we take privacy seriously, please be aware that this is a client-side application. 
                    Your data is stored in your browser's localStorage, which means it's accessible to any JavaScript 
                    running on this domain. We recommend not storing sensitive personal information in the application.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 