import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Moon, Sun, Monitor, Bell, Globe, Clock, RotateCcw, Database, Shield, Lock, Eye, Server, Twitter, Linkedin, Github, Instagram, Facebook, Youtube, Link2, Share2, CheckCircle2, XCircle, ExternalLink, BarChart, Book, FileText, Calendar } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PrivacySection } from "@/components/PrivacySection";
import { Checkbox } from "@/components/ui/checkbox";

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
  });

  const [socialMedia, setSocialMedia] = useState<{
    [key: string]: {
      connected: boolean;
      username: string;
      shareProgress: boolean;
      shareAchievements: boolean;
    };
  }>({
    twitter: { connected: false, username: '', shareProgress: true, shareAchievements: true },
    linkedin: { connected: false, username: '', shareProgress: true, shareAchievements: true },
    github: { connected: false, username: '', shareProgress: true, shareAchievements: true },
    instagram: { connected: false, username: '', shareProgress: true, shareAchievements: false },
    facebook: { connected: false, username: '', shareProgress: true, shareAchievements: false },
    youtube: { connected: false, username: '', shareProgress: true, shareAchievements: true },
  });

  const [showProfileInput, setShowProfileInput] = useState({
    twitter: false,
    linkedin: false,
    github: false,
    instagram: false,
    facebook: false,
    youtube: false,
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

  const validateProfileUrl = (platform: string, url: string): boolean => {
    const urlPatterns = {
      twitter: /^https?:\/\/(www\.)?twitter\.com\/[A-Za-z0-9_]+$/,
      linkedin: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[A-Za-z0-9-]+$/,
      github: /^https?:\/\/(www\.)?github\.com\/[A-Za-z0-9-]+$/,
      instagram: /^https?:\/\/(www\.)?instagram\.com\/[A-Za-z0-9_]+$/,
      facebook: /^https?:\/\/(www\.)?facebook\.com\/[A-Za-z0-9.]+$/,
      youtube: /^https?:\/\/(www\.)?youtube\.com\/(@|channel\/)[A-Za-z0-9-]+$/,
    };

    return urlPatterns[platform as keyof typeof urlPatterns].test(url);
  };

  const handleConnect = (platform: string) => {
    const profileUrl = socialMedia[platform as keyof typeof socialMedia].username;
    
    if (!profileUrl) {
      toast.error(`Please enter a valid ${platform} profile URL`);
      return;
    }

    if (!validateProfileUrl(platform, profileUrl)) {
      toast.error(`Please enter a valid ${platform} profile URL`);
      return;
    }

    setSocialMedia(prev => ({
      ...prev,
      [platform]: { ...prev[platform as keyof typeof prev], connected: true }
    }));
    setShowProfileInput(prev => ({
      ...prev,
      [platform]: false
    }));
    toast.success(`Successfully connected to ${platform}`);
  };

  const handleDisconnect = (platform: string) => {
    setSocialMedia(prev => ({
      ...prev,
      [platform]: { ...prev[platform as keyof typeof prev], connected: false, username: '' }
    }));
    toast.success(`Disconnected from ${platform}`);
  };

  const getProfileUrlPlaceholder = (platform: string): string => {
    const placeholders = {
      twitter: "https://twitter.com/username",
      linkedin: "https://linkedin.com/in/username",
      github: "https://github.com/username",
      instagram: "https://instagram.com/username",
      facebook: "https://facebook.com/username",
      youtube: "https://youtube.com/@channelname",
    };
    return placeholders[platform as keyof typeof placeholders];
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="focus">Focus Mode</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="learning">Learning</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
          <TabsTrigger value="statistics">Statistics</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="backup">Backup & Sync</TabsTrigger>
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

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Integration</CardTitle>
              <CardDescription>
                Connect your social media accounts to share your progress and achievements
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Twitter */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Twitter className="w-4 h-4 text-blue-400" />
                      Twitter
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share your learning progress on Twitter
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {socialMedia.twitter.connected ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </Badge>
                    )}
                    <Switch
                      checked={socialMedia.twitter.connected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowProfileInput(prev => ({ ...prev, twitter: true }));
                        } else {
                          handleDisconnect('twitter');
                        }
                      }}
                    />
                  </div>
                </div>

                {showProfileInput.twitter && (
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Label>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getProfileUrlPlaceholder('twitter')}
                          value={socialMedia.twitter.username}
                          onChange={(e) => setSocialMedia(prev => ({
                            ...prev,
                            twitter: { ...prev.twitter, username: e.target.value }
                          }))}
                        />
                        <Button onClick={() => handleConnect('twitter')}>
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter your Twitter profile URL (e.g., https://twitter.com/username)
                      </p>
                    </div>
                  </div>
                )}

                {socialMedia.twitter.connected && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={socialMedia.twitter.shareProgress}
                          onCheckedChange={(checked) => setSocialMedia(prev => ({
                            ...prev,
                            twitter: { ...prev.twitter, shareProgress: checked }
                          }))}
                        />
                        <Label>Share learning progress</Label>
                      </div>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <ExternalLink className="w-4 h-4 text-muted-foreground" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>View profile</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.twitter.shareAchievements}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          twitter: { ...prev.twitter, shareAchievements: checked }
                        }))}
                      />
                      <Label>Share achievements</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* LinkedIn */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Linkedin className="w-4 h-4 text-blue-600" />
                      LinkedIn
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share your achievements on LinkedIn
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {socialMedia.linkedin.connected ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </Badge>
                    )}
                    <Switch
                      checked={socialMedia.linkedin.connected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowProfileInput(prev => ({ ...prev, linkedin: true }));
                        } else {
                          handleDisconnect('linkedin');
                        }
                      }}
                    />
                  </div>
                </div>

                {showProfileInput.linkedin && (
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Label>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getProfileUrlPlaceholder('linkedin')}
                          value={socialMedia.linkedin.username}
                          onChange={(e) => setSocialMedia(prev => ({
                            ...prev,
                            linkedin: { ...prev.linkedin, username: e.target.value }
                          }))}
                        />
                        <Button onClick={() => handleConnect('linkedin')}>
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter your LinkedIn profile URL (e.g., https://linkedin.com/in/username)
                      </p>
                    </div>
                  </div>
                )}

                {socialMedia.linkedin.connected && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.linkedin.shareProgress}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          linkedin: { ...prev.linkedin, shareProgress: checked }
                        }))}
                      />
                      <Label>Share learning progress</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.linkedin.shareAchievements}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          linkedin: { ...prev.linkedin, shareAchievements: checked }
                        }))}
                      />
                      <Label>Share achievements</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* GitHub */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Github className="w-4 h-4" />
                      GitHub
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Connect your GitHub account to track coding progress
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {socialMedia.github.connected ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </Badge>
                    )}
                    <Switch
                      checked={socialMedia.github.connected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowProfileInput(prev => ({ ...prev, github: true }));
                        } else {
                          handleDisconnect('github');
                        }
                      }}
                    />
                  </div>
                </div>

                {showProfileInput.github && (
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Label>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getProfileUrlPlaceholder('github')}
                          value={socialMedia.github.username}
                          onChange={(e) => setSocialMedia(prev => ({
                            ...prev,
                            github: { ...prev.github, username: e.target.value }
                          }))}
                        />
                        <Button onClick={() => handleConnect('github')}>
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter your GitHub profile URL (e.g., https://github.com/username)
                      </p>
                    </div>
                  </div>
                )}

                {socialMedia.github.connected && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.github.shareProgress}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          github: { ...prev.github, shareProgress: checked }
                        }))}
                      />
                      <Label>Share coding progress</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.github.shareAchievements}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          github: { ...prev.github, shareAchievements: checked }
                        }))}
                      />
                      <Label>Share achievements</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Instagram */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Instagram className="w-4 h-4 text-pink-500" />
                      Instagram
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share your learning journey on Instagram
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {socialMedia.instagram.connected ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </Badge>
                    )}
                    <Switch
                      checked={socialMedia.instagram.connected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowProfileInput(prev => ({ ...prev, instagram: true }));
                        } else {
                          handleDisconnect('instagram');
                        }
                      }}
                    />
                  </div>
                </div>

                {showProfileInput.instagram && (
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Label>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getProfileUrlPlaceholder('instagram')}
                          value={socialMedia.instagram.username}
                          onChange={(e) => setSocialMedia(prev => ({
                            ...prev,
                            instagram: { ...prev.instagram, username: e.target.value }
                          }))}
                        />
                        <Button onClick={() => handleConnect('instagram')}>
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter your Instagram profile URL (e.g., https://instagram.com/username)
                      </p>
                    </div>
                  </div>
                )}

                {socialMedia.instagram.connected && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.instagram.shareProgress}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          instagram: { ...prev.instagram, shareProgress: checked }
                        }))}
                      />
                      <Label>Share learning progress</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* Facebook */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Facebook className="w-4 h-4 text-blue-600" />
                      Facebook
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share your learning journey on Facebook
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {socialMedia.facebook.connected ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </Badge>
                    )}
                    <Switch
                      checked={socialMedia.facebook.connected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowProfileInput(prev => ({ ...prev, facebook: true }));
                        } else {
                          handleDisconnect('facebook');
                        }
                      }}
                    />
                  </div>
                </div>

                {showProfileInput.facebook && (
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Label>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getProfileUrlPlaceholder('facebook')}
                          value={socialMedia.facebook.username}
                          onChange={(e) => setSocialMedia(prev => ({
                            ...prev,
                            facebook: { ...prev.facebook, username: e.target.value }
                          }))}
                        />
                        <Button onClick={() => handleConnect('facebook')}>
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter your Facebook profile URL (e.g., https://facebook.com/username)
                      </p>
                    </div>
                  </div>
                )}

                {socialMedia.facebook.connected && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.facebook.shareProgress}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          facebook: { ...prev.facebook, shareProgress: checked }
                        }))}
                      />
                      <Label>Share learning progress</Label>
                    </div>
                  </div>
                )}
              </div>

              {/* YouTube */}
              <div className="space-y-4 p-4 rounded-lg border">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Youtube className="w-4 h-4 text-red-600" />
                      YouTube
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Share your learning journey on YouTube
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    {socialMedia.youtube.connected ? (
                      <Badge variant="default" className="flex items-center gap-1 bg-green-500 text-white">
                        <CheckCircle2 className="w-3 h-3" />
                        Connected
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Disconnected
                      </Badge>
                    )}
                    <Switch
                      checked={socialMedia.youtube.connected}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setShowProfileInput(prev => ({ ...prev, youtube: true }));
                        } else {
                          handleDisconnect('youtube');
                        }
                      }}
                    />
                  </div>
                </div>

                {showProfileInput.youtube && (
                  <div className="space-y-4 mt-4">
                    <div className="flex flex-col gap-2">
                      <Label>Profile URL</Label>
                      <div className="flex gap-2">
                        <Input
                          placeholder={getProfileUrlPlaceholder('youtube')}
                          value={socialMedia.youtube.username}
                          onChange={(e) => setSocialMedia(prev => ({
                            ...prev,
                            youtube: { ...prev.youtube, username: e.target.value }
                          }))}
                        />
                        <Button onClick={() => handleConnect('youtube')}>
                          Connect
                        </Button>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Enter your YouTube channel URL (e.g., https://youtube.com/@channelname)
                      </p>
                    </div>
                  </div>
                )}

                {socialMedia.youtube.connected && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.youtube.shareProgress}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          youtube: { ...prev.youtube, shareProgress: checked }
                        }))}
                      />
                      <Label>Share learning progress</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={socialMedia.youtube.shareAchievements}
                        onCheckedChange={(checked) => setSocialMedia(prev => ({
                          ...prev,
                          youtube: { ...prev.youtube, shareAchievements: checked }
                        }))}
                      />
                      <Label>Share achievements</Label>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  <strong>Note:</strong> Connecting social media accounts allows you to share your learning progress and achievements. 
                  You can disconnect any account at any time. We only request the necessary permissions to share your progress.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>Focus Mode Settings</CardTitle>
              <CardDescription>
                Configure your focus session preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Focus Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get reminded to stay focused during sessions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Focus Session Duration</Label>
                  <Select defaultValue="25">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Break Duration</Label>
                  <Select defaultValue="5">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">3 minutes</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Auto-start Breaks
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically start break timer after focus session
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Block Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Block browser notifications during focus sessions
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shortcuts">
          <Card>
            <CardHeader>
              <CardTitle>Keyboard Shortcuts</CardTitle>
              <CardDescription>
                Customize keyboard shortcuts for quick actions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Start Focus Session</Label>
                      <p className="text-sm text-muted-foreground">
                        Start a new focus session
                      </p>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl + Shift + F
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Pause Session</Label>
                      <p className="text-sm text-muted-foreground">
                        Pause current focus session
                      </p>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl + Shift + P
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>End Session</Label>
                      <p className="text-sm text-muted-foreground">
                        End current focus session
                      </p>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      Ctrl + Shift + E
                    </kbd>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Toggle Fullscreen</Label>
                      <p className="text-sm text-muted-foreground">
                        Toggle fullscreen mode
                      </p>
                    </div>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded-lg dark:bg-gray-700 dark:text-gray-100 dark:border-gray-600">
                      F11
                    </kbd>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Keyboard shortcuts are currently not customizable. This feature will be available in a future update.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="learning">
          <Card>
            <CardHeader>
              <CardTitle>Learning Preferences</CardTitle>
              <CardDescription>
                Customize your learning experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Learning Style</Label>
                  <Select defaultValue="visual">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select learning style" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="visual">Visual</SelectItem>
                      <SelectItem value="auditory">Auditory</SelectItem>
                      <SelectItem value="reading">Reading/Writing</SelectItem>
                      <SelectItem value="kinesthetic">Kinesthetic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty Level</Label>
                  <Select defaultValue="intermediate">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                      <SelectItem value="expert">Expert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      Auto-Review
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically review completed content
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Review Frequency</Label>
                  <Select defaultValue="weekly">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select review frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="biweekly">Bi-weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Book className="w-4 h-4" />
                      Spaced Repetition
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Use spaced repetition for better retention
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Content Categories</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="tutorials" defaultChecked />
                      <Label htmlFor="tutorials">Tutorials</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="exercises" defaultChecked />
                      <Label htmlFor="exercises">Exercises</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="projects" defaultChecked />
                      <Label htmlFor="projects">Projects</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox id="quizzes" defaultChecked />
                      <Label htmlFor="quizzes">Quizzes</Label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations">
          <Card>
            <CardHeader>
              <CardTitle>Integration Settings</CardTitle>
              <CardDescription>
                Connect with other learning platforms and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {/* YouTube Integration */}
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Youtube className="w-4 h-4 text-red-600" />
                        YouTube
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Import playlists and track progress
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input type="password" placeholder="Enter YouTube API key" />
                  </div>
                </div>

                {/* GitHub Integration */}
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Github className="w-4 h-4" />
                        GitHub
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Track coding progress and projects
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Personal Access Token</Label>
                    <Input type="password" placeholder="Enter GitHub token" />
                  </div>
                </div>

                {/* Notion Integration */}
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <FileText className="w-4 h-4" />
                        Notion
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Sync notes and progress
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Integration Token</Label>
                    <Input type="password" placeholder="Enter Notion token" />
                  </div>
                </div>

                {/* Calendar Integration */}
                <div className="space-y-4 p-4 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        Calendar
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        Sync learning schedule
                      </p>
                    </div>
                    <Switch />
                  </div>
                  <div className="space-y-2">
                    <Label>Calendar URL</Label>
                    <Input placeholder="Enter calendar URL" />
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> API keys and tokens are stored securely and never shared. You can revoke access at any time.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accessibility">
          <Card>
            <CardHeader>
              <CardTitle>Accessibility Settings</CardTitle>
              <CardDescription>
                Customize the app to better suit your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Text Size</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select text size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="small">Small</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="large">Large</SelectItem>
                      <SelectItem value="xlarge">Extra Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      High Contrast Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Sound Effects
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable sound notifications
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="w-4 h-4" />
                      Screen Reader Support
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enhanced screen reader compatibility
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Animation Speed</Label>
                  <Select defaultValue="normal">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select animation speed" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="slow">Slow</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="fast">Fast</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="statistics">
          <Card>
            <CardHeader>
              <CardTitle>Statistics & Analytics</CardTitle>
              <CardDescription>
                View and manage your learning statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <BarChart className="w-4 h-4" />
                      Track Progress
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable progress tracking and statistics
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Statistics Display</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select display period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <BarChart className="w-4 h-4" />
                      Achievement Tracking
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Track and display achievements
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <BarChart className="w-4 h-4" />
                      Streak Counter
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Track your daily learning streak
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <BarChart className="w-4 h-4 mr-2" />
                      Export Statistics
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <BarChart className="w-4 h-4 mr-2" />
                      View Detailed Reports
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Cache Management</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select cache policy" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Automatic</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="none">No Cache</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Offline Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable offline functionality
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Performance Mode</Label>
                  <Select defaultValue="balanced">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select performance mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="power">Power Saving</SelectItem>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="performance">High Performance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      Debug Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Enable detailed logging and debugging
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <Server className="w-4 h-4 mr-2" />
                      Clear Cache
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <Server className="w-4 h-4 mr-2" />
                      Reset Settings
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Advanced settings should only be modified if you understand their impact on the application.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Sync</CardTitle>
              <CardDescription>
                Manage your data backup and synchronization settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Auto Backup
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label>Backup Frequency</Label>
                  <Select defaultValue="daily">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every hour</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Database className="w-4 h-4" />
                      Cloud Sync
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Sync your data across devices
                    </p>
                  </div>
                  <Switch />
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <Database className="w-4 h-4 mr-2" />
                      Export Data
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <Button variant="outline" className="w-full">
                      <Database className="w-4 h-4 mr-2" />
                      Import Data
                    </Button>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-lg border border-blue-200/50 dark:border-blue-800/50">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    <strong>Note:</strong> Cloud sync requires a WatchTrack account. Your data will be encrypted before syncing.
                  </p>
                </div>
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
          <PrivacySection />
        </TabsContent>
      </Tabs>
    </div>
  );
} 