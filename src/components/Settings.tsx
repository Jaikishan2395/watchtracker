import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Settings as SettingsIcon } from 'lucide-react';

interface TimerSettings {
  focusDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  notifications: boolean;
  sound: boolean;
  language: string;
  country: string;
}

interface SettingsProps {
  settings: TimerSettings;
  onSave: (settings: TimerSettings) => void;
}

const INDIAN_LANGUAGES = [
  'Hindi', 'Bengali', 'Telugu', 'Marathi', 'Tamil', 'Urdu', 'Gujarati', 'Kannada', 'Odia', 'Punjabi', 'Malayalam', 'Assamese', 'Maithili', 'Santali', 'Kashmiri', 'Nepali', 'Konkani', 'Sindhi', 'Dogri', 'Manipuri', 'Bodo', 'Santhali', 'Sanskrit', 'English'
];

const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia', 'Singapore', 'UAE', 'Germany', 'France', 'Nepal', 'Bangladesh', 'Sri Lanka', 'Pakistan', 'Other'
];

export function Settings({ settings, onSave }: SettingsProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const newSettings: TimerSettings = {
      focusDuration: Number(formData.get('focusDuration')),
      shortBreakDuration: Number(formData.get('shortBreakDuration')),
      longBreakDuration: Number(formData.get('longBreakDuration')),
      longBreakInterval: Number(formData.get('longBreakInterval')),
      autoStartBreaks: formData.get('autoStartBreaks') === 'on',
      autoStartPomodoros: formData.get('autoStartPomodoros') === 'on',
      notifications: formData.get('notifications') === 'on',
      sound: formData.get('sound') === 'on',
      language: String(formData.get('language')),
      country: String(formData.get('country'))
    };
    onSave(newSettings);
  };

  return (
    <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <SettingsIcon className="h-5 w-5" />
          Timer Settings
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="focusDuration">Focus Duration (minutes)</Label>
              <Input
                id="focusDuration"
                name="focusDuration"
                type="number"
                min="1"
                max="60"
                defaultValue={settings.focusDuration}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shortBreakDuration">Short Break Duration (minutes)</Label>
              <Input
                id="shortBreakDuration"
                name="shortBreakDuration"
                type="number"
                min="1"
                max="30"
                defaultValue={settings.shortBreakDuration}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longBreakDuration">Long Break Duration (minutes)</Label>
              <Input
                id="longBreakDuration"
                name="longBreakDuration"
                type="number"
                min="1"
                max="60"
                defaultValue={settings.longBreakDuration}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="longBreakInterval">Long Break Interval (pomodoros)</Label>
              <Input
                id="longBreakInterval"
                name="longBreakInterval"
                type="number"
                min="1"
                max="10"
                defaultValue={settings.longBreakInterval}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <select
                id="language"
                name="language"
                defaultValue={settings.language}
                className="w-full border rounded px-3 py-2"
                required
              >
                {INDIAN_LANGUAGES.map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <select
                id="country"
                name="country"
                defaultValue={settings.country}
                className="w-full border rounded px-3 py-2"
                required
              >
                {COUNTRIES.map(country => (
                  <option key={country} value={country}>{country}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="autoStartBreaks">Auto-start Breaks</Label>
              <Switch
                id="autoStartBreaks"
                name="autoStartBreaks"
                defaultChecked={settings.autoStartBreaks}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="autoStartPomodoros">Auto-start Pomodoros</Label>
              <Switch
                id="autoStartPomodoros"
                name="autoStartPomodoros"
                defaultChecked={settings.autoStartPomodoros}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="notifications">Enable Notifications</Label>
              <Switch
                id="notifications"
                name="notifications"
                defaultChecked={settings.notifications}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="sound">Enable Sound</Label>
              <Switch
                id="sound"
                name="sound"
                defaultChecked={settings.sound}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit" className="gap-2">
              <SettingsIcon className="h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
} 