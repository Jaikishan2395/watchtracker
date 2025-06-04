import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as Icons from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";

// Add interfaces for data management
interface ParsedTodo {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category?: string;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

interface ParsedCategory {
  id: string;
  name: string;
  color: string;
  icon?: string;
  description?: string;
  createdAt: string;
}

const DATA_VERSION = '1.0';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    updates: false,
  });
  const [feedback, setFeedback] = useState({
    currentStep: 1,
    challenges: {
      dontFinishGoals: false,
      lackConsistency: false,
      easilyDistracted: false,
      dontKnowFocus: false,
      dontTrackProgress: false,
      feelOverwhelmed: false
    },
    features: {
      smartPlanner: '',
      streakTracker: '',
      focusMode: '',
      todoReminders: '',
      progressCharts: '',
      goalTracker: '',
      aiSuggestions: '',
      focusTimer: '',
      crossDeviceSync: '',
      teamAccountability: '',
      calendarView: '',
      privacyLock: ''
    },
    aiCoachInterest: '',
    planningPreference: '',
    motivation: ''
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

  const handleNextStep = () => {
    setFeedback(prev => ({
      ...prev,
      currentStep: Math.min(prev.currentStep + 1, 4)
    }));
  };

  const handlePrevStep = () => {
    setFeedback(prev => ({
      ...prev,
      currentStep: Math.max(prev.currentStep - 1, 1)
    }));
  };

  const handleFeatureChange = (feature: string, value: string) => {
    setFeedback(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [feature]: value
      }
    }));
  };

  const handleChallengeChange = (challengeId: string) => {
    setFeedback(prev => ({
      ...prev,
      challenges: {
        ...prev.challenges,
        [challengeId]: !prev.challenges[challengeId as keyof typeof prev.challenges]
      }
    }));
  };

  const handleFeedbackSubmit = () => {
    // Validate required fields
    if (feedback.currentStep === 1 && Object.values(feedback.challenges).every(v => !v)) {
      toast.error('Please select at least one challenge');
      return;
    }
    if (feedback.currentStep === 2 && Object.values(feedback.features).some(v => !v)) {
      toast.error('Please rate all features');
      return;
    }
    if (feedback.currentStep === 3 && !feedback.aiCoachInterest) {
      toast.error('Please select your preference for AI coach');
      return;
    }
    if (feedback.currentStep === 4 && (!feedback.planningPreference || !feedback.motivation)) {
      toast.error('Please complete all preference questions');
      return;
    }

    // Submit feedback
    console.log('Feedback submitted:', feedback);
    toast.success('Thank you for your feedback!');
    
    // Reset form
    setFeedback({
      currentStep: 1,
      challenges: {
        dontFinishGoals: false,
        lackConsistency: false,
        easilyDistracted: false,
        dontKnowFocus: false,
        dontTrackProgress: false,
        feelOverwhelmed: false
      },
      features: {
        smartPlanner: '',
        streakTracker: '',
        focusMode: '',
        todoReminders: '',
        progressCharts: '',
        goalTracker: '',
        aiSuggestions: '',
        focusTimer: '',
        crossDeviceSync: '',
        teamAccountability: '',
        calendarView: '',
        privacyLock: ''
      },
      aiCoachInterest: '',
      planningPreference: '',
      motivation: ''
    });
  };

  // Add data management functions
  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.removeItem('todos');
      localStorage.removeItem('categories');
      toast.success('All data has been cleared!');
    }
  };

  const exportData = () => {
    const todos = JSON.parse(localStorage.getItem('todos') || '[]');
    const categories = JSON.parse(localStorage.getItem('categories') || '[]');
    
    const data = {
      version: DATA_VERSION,
      todos,
      categories,
      lastModified: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `todo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully!');
  };

  const importData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.todos && data.categories) {
            const parsedTodos = data.todos.map((todo: ParsedTodo) => ({
              ...todo,
              createdAt: new Date(todo.createdAt),
              updatedAt: new Date(todo.updatedAt),
              dueDate: todo.dueDate ? new Date(todo.dueDate) : undefined
            }));
            const parsedCategories = data.categories.map((category: ParsedCategory) => ({
              ...category,
              createdAt: new Date(category.createdAt)
            }));
            localStorage.setItem('todos', JSON.stringify(parsedTodos));
            localStorage.setItem('categories', JSON.stringify(parsedCategories));
            toast.success('Data imported successfully!');
          }
        } catch (error) {
          toast.error('Error importing data. Please make sure the file is valid.');
        }
      };
      reader.readAsText(file);
    }
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
                  <Icons.Globe className="w-4 h-4" />
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
                  <Icons.Clock className="w-4 h-4" />
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

              <Separator className="my-6" />

              <div className="space-y-6">
                <div className="space-y-2">
                  <Label className="text-2xl font-bold">Feedback</Label>
                  <p className="text-sm text-muted-foreground">Help us improve your experience by sharing your thoughts</p>
                </div>

                <div className="space-y-6">
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Step {feedback.currentStep} of 4</span>
                      <span>{Math.round((feedback.currentStep / 4) * 100)}% Complete</span>
                    </div>
                    <Progress value={(feedback.currentStep / 4) * 100} className="h-2" />
                  </div>

                  {/* Form Content */}
                  <div className="rounded-lg border bg-card p-6 shadow-sm">
                    {feedback.currentStep === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🎯</span>
                            Your Current Challenges
                          </h3>
                          <p className="text-sm text-muted-foreground">What's your biggest struggle with online learning or self-growth? (Choose all that apply)</p>
                        </div>
                        <div className="grid gap-4">
                          {[
                            { id: 'dontFinishGoals', label: 'I start but don\'t finish goals' },
                            { id: 'lackConsistency', label: 'I lack consistency or discipline' },
                            { id: 'easilyDistracted', label: 'I get easily distracted' },
                            { id: 'dontKnowFocus', label: 'I don\'t know what to focus on' },
                            { id: 'dontTrackProgress', label: 'I don\'t track my progress' },
                            { id: 'feelOverwhelmed', label: 'I feel overwhelmed or burned out' }
                          ].map((challenge) => (
                            <div
                              key={challenge.id}
                              className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                feedback.challenges[challenge.id as keyof typeof feedback.challenges]
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <Checkbox
                                id={challenge.id}
                                checked={feedback.challenges[challenge.id as keyof typeof feedback.challenges]}
                                onCheckedChange={(checked) => {
                                  setFeedback(prev => ({
                                    ...prev,
                                    challenges: {
                                      ...prev.challenges,
                                      [challenge.id]: checked
                                    }
                                  }));
                                }}
                                className="h-5 w-5"
                              />
                              <Label
                                htmlFor={challenge.id}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {challenge.label}
                              </Label>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.currentStep === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🧩</span>
                            Helpful Features
                          </h3>
                          <p className="text-sm text-muted-foreground">Would the following help you be more successful?</p>
                        </div>
                        <div className="grid gap-6">
                          {Object.entries(feedback.features).map(([feature, value]) => (
                            <div
                              key={feature}
                              className="rounded-lg border p-4 transition-colors hover:bg-accent"
                            >
                              <div className="space-y-4">
                                <Label className="text-base font-medium flex items-center gap-2">
                                  {feature === 'smartPlanner' && '📅 Smart Daily Planner'}
                                  {feature === 'streakTracker' && '🔥 Streak Tracker'}
                                  {feature === 'focusMode' && '⏰ Focus Mode'}
                                  {feature === 'todoReminders' && '✅ To-Do + Reminders'}
                                  {feature === 'progressCharts' && '📊 Progress Charts'}
                                  {feature === 'goalTracker' && '🎯 Goal Tracker'}
                                  {feature === 'aiSuggestions' && '🧠 AI Suggestions'}
                                  {feature === 'focusTimer' && '🧘 Focus Timer (Pomodoro)'}
                                  {feature === 'crossDeviceSync' && '🌐 Cross-device Sync'}
                                  {feature === 'teamAccountability' && '🤝 Team Accountability'}
                                  {feature === 'calendarView' && '📅 Calendar View'}
                                  {feature === 'privacyLock' && '🔐 Privacy Lock'}
                                </Label>
                                <RadioGroup
                                  value={value}
                                  onValueChange={(val) => {
                                    setFeedback(prev => ({
                                      ...prev,
                                      features: {
                                        ...prev.features,
                                        [feature]: val
                                      }
                                    }));
                                  }}
                                  className="grid grid-cols-3 gap-4"
                                >
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="must-have"
                                      id={`${feature}-must`}
                                      className="peer"
                                    />
                                    <Label
                                      htmlFor={`${feature}-must`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Must Have
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="nice-to-have"
                                      id={`${feature}-nice`}
                                      className="peer"
                                    />
                                    <Label
                                      htmlFor={`${feature}-nice`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Nice to Have
                                    </Label>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <RadioGroupItem
                                      value="not-needed"
                                      id={`${feature}-not`}
                                      className="peer"
                                    />
                                    <Label
                                      htmlFor={`${feature}-not`}
                                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                      Not Needed
                                    </Label>
                                  </div>
                                </RadioGroup>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {feedback.currentStep === 3 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🤖</span>
                            AI Coach Interest
                          </h3>
                          <p className="text-sm text-muted-foreground">Would you use a personal AI that tracks your patterns and gives you feedback?</p>
                        </div>
                        <RadioGroup
                          value={feedback.aiCoachInterest}
                          onValueChange={(value) => setFeedback(prev => ({ ...prev, aiCoachInterest: value }))}
                          className="grid gap-4"
                        >
                          {[
                            { value: 'yes', label: 'Yes! That sounds awesome' },
                            { value: 'maybe', label: 'Maybe — depends on how private it is' },
                            { value: 'no', label: 'No — I don\'t want AI tracking me' }
                          ].map((option) => (
                            <div
                              key={option.value}
                              className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                feedback.aiCoachInterest === option.value
                                  ? 'border-primary bg-primary/5'
                                  : 'hover:bg-accent'
                              }`}
                            >
                              <RadioGroupItem
                                value={option.value}
                                id={`ai-${option.value}`}
                                className="peer"
                              />
                              <Label
                                htmlFor={`ai-${option.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {option.label}
                              </Label>
                            </div>
                          ))}
                        </RadioGroup>
                      </div>
                    )}

                    {feedback.currentStep === 4 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <h3 className="text-xl font-semibold flex items-center gap-2">
                            <span className="text-primary">🧭</span>
                            Your Preferences
                          </h3>
                        </div>
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <Label className="text-base font-medium">How do you prefer to plan your day?</Label>
                            <RadioGroup
                              value={feedback.planningPreference}
                              onValueChange={(value) => setFeedback(prev => ({ ...prev, planningPreference: value }))}
                              className="grid gap-4"
                            >
                              {[
                                { value: 'hourly', label: 'Hour-by-hour timeline' },
                                { value: 'flexible', label: 'Flexible task list' },
                                { value: 'priorities', label: 'Just focus on 1–2 priorities' },
                                { value: 'no-plan', label: 'I don\'t plan my day' }
                              ].map((option) => (
                                <div
                                  key={option.value}
                                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                    feedback.planningPreference === option.value
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:bg-accent'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`plan-${option.value}`}
                                    className="peer"
                                  />
                                  <Label
                                    htmlFor={`plan-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>

                          <div className="space-y-4">
                            <Label className="text-base font-medium">What motivates you the most?</Label>
                            <RadioGroup
                              value={feedback.motivation}
                              onValueChange={(value) => setFeedback(prev => ({ ...prev, motivation: value }))}
                              className="grid gap-4"
                            >
                              {[
                                { value: 'visual', label: 'Visual progress (charts, streaks)' },
                                { value: 'deadlines', label: 'Deadlines and reminders' },
                                { value: 'competition', label: 'Friendly competition or teams' },
                                { value: 'coach', label: 'A coach telling me what to do' },
                                { value: 'rewards', label: 'Rewards and gamification' }
                              ].map((option) => (
                                <div
                                  key={option.value}
                                  className={`flex items-center space-x-3 rounded-lg border p-4 transition-colors ${
                                    feedback.motivation === option.value
                                      ? 'border-primary bg-primary/5'
                                      : 'hover:bg-accent'
                                  }`}
                                >
                                  <RadioGroupItem
                                    value={option.value}
                                    id={`mot-${option.value}`}
                                    className="peer"
                                  />
                                  <Label
                                    htmlFor={`mot-${option.value}`}
                                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                  >
                                    {option.label}
                                  </Label>
                                </div>
                              ))}
                            </RadioGroup>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between pt-6 mt-6 border-t">
                      {feedback.currentStep > 1 && (
                        <Button
                          variant="outline"
                          onClick={handlePrevStep}
                          className="gap-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="m15 18-6-6 6-6" />
                          </svg>
                          Previous
                        </Button>
                      )}
                      {feedback.currentStep < 4 ? (
                        <Button
                          onClick={handleNextStep}
                          className="ml-auto gap-2"
                        >
                          Next
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="m9 18 6-6-6-6" />
                          </svg>
                        </Button>
                      ) : (
                        <Button
                          onClick={handleFeedbackSubmit}
                          className="ml-auto gap-2"
                        >
                          Submit Feedback
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="h-4 w-4"
                          >
                            <path d="M5 12h14" />
                            <path d="m12 5 7 7-7 7" />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize how the application looks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Icons.Monitor className="w-4 h-4" />
                  Theme
                </Label>
                <div className="flex items-center space-x-4">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    onClick={() => setTheme("light")}
                    className="gap-2"
                  >
                    <Icons.Sun className="w-4 h-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    onClick={() => setTheme("dark")}
                    className="gap-2"
                  >
                    <Icons.Moon className="w-4 h-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    onClick={() => setTheme("system")}
                    className="gap-2"
                  >
                    <Icons.Monitor className="w-4 h-4" />
                    System
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Manage how you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications via email
                    </p>
                  </div>
                  <Switch
                    checked={notifications.email}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, email: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Receive notifications in your browser
                    </p>
                  </div>
                  <Switch
                    checked={notifications.push}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, push: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Product Updates
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified about new features and updates
                    </p>
                  </div>
                  <Switch
                    checked={notifications.updates}
                    onCheckedChange={(checked) =>
                      setNotifications((prev) => ({ ...prev, updates: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="social">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Integration</CardTitle>
              <CardDescription>
                Connect your social media accounts to share your progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {Object.entries(socialMedia).map(([platform, data]) => (
                <div key={platform} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {platform === 'twitter' && <Icons.Twitter className="w-5 h-5" />}
                      {platform === 'linkedin' && <Icons.Linkedin className="w-5 h-5" />}
                      {platform === 'github' && <Icons.Github className="w-5 h-5" />}
                      {platform === 'instagram' && <Icons.Instagram className="w-5 h-5" />}
                      {platform === 'facebook' && <Icons.Facebook className="w-5 h-5" />}
                      {platform === 'youtube' && <Icons.Youtube className="w-5 h-5" />}
                      <Label className="text-base font-medium capitalize">
                        {platform}
                      </Label>
                    </div>
                    {data.connected ? (
                      <Button
                        variant="outline"
                        onClick={() => handleDisconnect(platform)}
                        className="gap-2"
                      >
                        <Icons.XCircle className="w-4 h-4" />
                        Disconnect
                      </Button>
                    ) : (
                      <Button
                        onClick={() => setShowProfileInput(prev => ({
                          ...prev,
                          [platform]: true
                        }))}
                        className="gap-2"
                      >
                        <Icons.Link2 className="w-4 h-4" />
                        Connect
                      </Button>
                    )}
                  </div>
                  {showProfileInput[platform as keyof typeof showProfileInput] && (
                    <div className="flex gap-2">
                      <Input
                        placeholder={getProfileUrlPlaceholder(platform)}
                        value={data.username}
                        onChange={(e) =>
                          setSocialMedia(prev => ({
                            ...prev,
                            [platform]: {
                              ...prev[platform as keyof typeof prev],
                              username: e.target.value
                            }
                          }))
                        }
                      />
                      <Button onClick={() => handleConnect(platform)}>
                        Connect
                      </Button>
                    </div>
                  )}
                  {data.connected && (
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${platform}-progress`}
                          checked={data.shareProgress}
                          onCheckedChange={(checked) =>
                            setSocialMedia(prev => ({
                              ...prev,
                              [platform]: {
                                ...prev[platform as keyof typeof prev],
                                shareProgress: checked as boolean
                              }
                            }))
                          }
                        />
                        <Label htmlFor={`${platform}-progress`}>
                          Share progress updates
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id={`${platform}-achievements`}
                          checked={data.shareAchievements}
                          onCheckedChange={(checked) =>
                            setSocialMedia(prev => ({
                              ...prev,
                              [platform]: {
                                ...prev[platform as keyof typeof prev],
                                shareAchievements: checked as boolean
                              }
                            }))
                          }
                        />
                        <Label htmlFor={`${platform}-achievements`}>
                          Share achievements
                        </Label>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="focus">
          <Card>
            <CardHeader>
              <CardTitle>Focus Mode Settings</CardTitle>
              <CardDescription>
                Customize your focus mode experience
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Clock className="w-4 h-4" />
                      Default Focus Duration
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Set your preferred focus session length
                    </p>
                  </div>
                  <Select defaultValue="25">
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="25">25 minutes</SelectItem>
                      <SelectItem value="45">45 minutes</SelectItem>
                      <SelectItem value="60">60 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Bell className="w-4 h-4" />
                      Break Reminders
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Get notified when it's time to take a break
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
                View and customize keyboard shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {[
                  { action: 'Start Focus Session', shortcut: 'Ctrl + F' },
                  { action: 'Pause Session', shortcut: 'Space' },
                  { action: 'End Session', shortcut: 'Esc' },
                  { action: 'Toggle Fullscreen', shortcut: 'F11' },
                  { action: 'Open Settings', shortcut: 'Ctrl + ,' },
                ].map((item) => (
                  <div key={item.action} className="flex items-center justify-between">
                    <Label>{item.action}</Label>
                    <Badge variant="outline" className="font-mono">
                      {item.shortcut}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backup">
          <Card>
            <CardHeader>
              <CardTitle>Backup & Sync</CardTitle>
              <CardDescription>
                Manage your data backup and synchronization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Cloud className="w-4 h-4" />
                      Cloud Backup
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically backup your data
                    </p>
                  </div>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Download className="w-4 h-4" />
                      Export Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Download your data as a backup
                    </p>
                  </div>
                  <Button variant="outline">Export</Button>
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
                Manage your application data
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Database className="w-4 h-4" />
                      Data Usage
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      View your data storage usage
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.round((localStorage.getItem('todos')?.length || 0) / 1024)} KB
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Download className="w-4 h-4" />
                      Export Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Download your data as a backup
                    </p>
                  </div>
                  <Button variant="outline" onClick={exportData}>
                    <Icons.Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Upload className="w-4 h-4" />
                      Import Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Restore from a backup file
                    </p>
                  </div>
                  <label>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importData}
                      style={{ display: 'none' }}
                    />
                    <Button variant="outline" asChild>
                      <span>
                        <Icons.Upload className="w-4 h-4 mr-2" />
                        Import
                      </span>
                    </Button>
                  </label>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Icons.Trash2 className="w-4 h-4" />
                      Clear Data
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Remove all stored data
                    </p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">
                        <Icons.Trash2 className="w-4 h-4 mr-2" />
                        Clear All Data
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete all your data. This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearAllData}>
                          Continue
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